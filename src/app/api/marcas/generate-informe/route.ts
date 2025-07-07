import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

const pool = createPool();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { marcaId } = await request.json();

    if (!marcaId) {
      return NextResponse.json({ error: 'ID de marca requerido' }, { status: 400 });
    }

    // Get user data
    const userResult = await pool.query(`
      SELECT name, contact_number, agent_number, province, zip_code, email
      FROM users 
      WHERE email = $1
    `, [session.user.email]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Get marca data
    const marcaResult = await pool.query(`
      SELECT id, marca, renovar, vencimiento, djumt, clases, titulares, anotaciones, oposicion, titular_nombre, titular_email, titular_telefono, class_details, tipo_marca
      FROM marcas 
      WHERE id = $1 AND user_email = $2
    `, [marcaId, session.user.email]);

    if (marcaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 });
    }

    const marca = marcaResult.rows[0];

    // Prepare data for Totalum API
    const agent = {
      nombre: user.name || '',
      direccion: `${user.province || ''} ${user.zip_code || ''}`.trim(),
      provincia: user.province || '',
      cp: user.zip_code || '',
      numero: user.agent_number || '',
      mail: user.email || '',
      telefono: user.contact_number || '',
      logo: 'https://www.gestionatusmarcas.com/logo.png'
    };

    // Build marca object for PDF template
    type ClassDetails = { acta?: string; resolucion?: string };
    type Titular = { nombre?: string; fullName?: string; mail?: string; email?: string; telefono?: string; phone?: string };
    const marcaForPdf = {
      nombre: marca.marca || '',
      tipo: marca.tipo_marca || 'Desconocido',
      clases: marca.class_details ? Object.entries(marca.class_details).map(([clase, details]: [string, unknown]) => {
        const d = details as ClassDetails;
        return {
          clase,
          acta: d.acta || '',
          resolucion: d.resolucion || ''
        };
      }) : [],
      titulares: Array.isArray(marca.titulares) ? marca.titulares.map((titular: Titular) => ({
        nombre: titular.nombre || titular.fullName || '',
        mail: titular.mail || titular.email || '',
        telefono: titular.telefono || titular.phone || ''
      })) : []
    };

    // Prepare variables for PDF microservice
    const fecha = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Log variables for debugging
    console.log('Variables sent to PDF microservice:', JSON.stringify({ agent, marca: marcaForPdf, fecha }, null, 2));

    // Call PDF microservice
    try {
      const response = await fetch('https://pdf-microservice-old-snowflake-7040.fly.dev/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent, marca: marcaForPdf, fecha }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('PDF service error:', errorData);
        throw new Error(`PDF service returned ${response.status}: ${errorData}`);
      }

      const pdfBuffer = Buffer.from(await response.arrayBuffer());

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="informe-marca.pdf"`,
        },
      });
    } catch (error) {
      console.error('Error calling PDF service:', error);
      return NextResponse.json({ error: 'Error generando el PDF profesional.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating informe:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 