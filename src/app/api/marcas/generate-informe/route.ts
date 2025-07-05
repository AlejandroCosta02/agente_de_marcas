import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { marcaId, includeAnotaciones, includeOposiciones } = await request.json();

    if (!marcaId) {
      return NextResponse.json({ error: 'ID de marca requerido' }, { status: 400 });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Get marca data
    const marca = await prisma.marca.findUnique({
      where: { id: marcaId }
    });

    if (!marca) {
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 });
    }

    // Verify user owns this marca
    if (marca.user_email !== session.user.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Generate PDF content
    const pdfContent = generatePDFContent(marca, user, includeAnotaciones, includeOposiciones);

    // Return PDF as blob
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="informe-marca-${marca.nombre}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating informe:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

function generatePDFContent(marca: any, user: any, includeAnotaciones: boolean, includeOposiciones: boolean): Buffer {
  // Simple text-based PDF generation
  const currentDate = new Date().toLocaleDateString('es-AR');
  
  const content = `
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
>>
endobj

4 0 obj
<<
/Length 1500
>>
stream
BT
/F1 16 Tf
50 750 Td
(INFORME DE MARCA) Tj
0 -25 Td
/F1 12 Tf
(Generado por gestionatusmarcas.com) Tj
0 -20 Td
(Generado el ${currentDate}) Tj
0 -40 Td
/F1 14 Tf
(DATOS DEL AGENTE:) Tj
0 -20 Td
/F1 12 Tf
(Nombre: ${user.name || 'No especificado'}) Tj
0 -15 Td
(Teléfono: ${user.contact_number || 'No especificado'}) Tj
0 -15 Td
(Número de Agente: ${user.agent_number || 'No especificado'}) Tj
0 -15 Td
(Provincia: ${user.province || 'No especificada'}) Tj
0 -15 Td
(Código Postal: ${user.zip_code || 'No especificado'}) Tj
0 -40 Td
/F1 14 Tf
(DATOS DE LA MARCA:) Tj
0 -20 Td
/F1 12 Tf
(Marca: ${marca.nombre}) Tj
0 -15 Td
(Clase: ${marca.clase || 'No especificada'}) Tj
0 -15 Td
(Fecha de Renovación: ${marca.renovar ? new Date(marca.renovar).toLocaleDateString('es-AR') : 'No especificada'}) Tj
0 -15 Td
(Fecha de Vencimiento: ${marca.vencimiento ? new Date(marca.vencimiento).toLocaleDateString('es-AR') : 'No especificada'}) Tj
0 -15 Td
(Estado: ${marca.estado || 'No especificado'}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000250 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
450
%%EOF
`;

  return Buffer.from(content, 'utf8');
} 