import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';
import { jsPDF } from 'jspdf';

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
      SELECT name, contact_number, agent_number, province, zip_code
      FROM users 
      WHERE email = $1
    `, [session.user.email]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = userResult.rows[0];

    // Get marca data
    const marcaResult = await pool.query(`
      SELECT id, marca, renovar, vencimiento, djumt, clases, titulares, anotaciones, oposicion, titular_nombre, titular_email, titular_telefono, class_details
      FROM marcas 
      WHERE id = $1 AND user_email = $2
    `, [marcaId, session.user.email]);

    if (marcaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 });
    }

    const marca = marcaResult.rows[0];

    // Datos para el informe
    const fechaGeneracion = new Date().toLocaleDateString('es-AR');
    const marcaClases = Array.isArray(marca.clases) ? marca.clases.join(', ') : 'No especificadas';
    const titulares = Array.isArray(marca.titulares) && marca.titulares.length > 0
      ? marca.titulares
      : [{ fullName: marca.titular_nombre, email: marca.titular_email, phone: marca.titular_telefono }];

    // Helper function to safely convert dates to strings
    const safeDateToString = (dateValue: unknown): string => {
      if (!dateValue) return 'No especificado';
      if (dateValue instanceof Date) return dateValue.toLocaleDateString('es-AR');
      if (typeof dateValue === 'string') return dateValue;
      return String(dateValue);
    };

    // Generar PDF con jsPDF - Versión simple y segura
    try {
      console.log('Starting safe PDF generation...');
      
      const doc = new jsPDF();
      console.log('jsPDF instance created');
      
      // Simple test PDF
      doc.setFontSize(16);
      doc.text('Informe de Marca', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Agente: ${user.name || ''}`, 20, 40);
      doc.text(`Marca: ${marca.marca || ''}`, 20, 50);
      doc.text(`Fecha: ${fechaGeneracion}`, 20, 60);
      
      // Add some basic content
      doc.text('Datos de la Marca:', 20, 80);
      doc.text(`Nombre: ${marca.marca || ''}`, 20, 90);
      doc.text(`Clases: ${marcaClases}`, 20, 100);
      doc.text(`Renovación: ${safeDateToString(marca.renovar)}`, 20, 110);
      doc.text(`Vencimiento: ${safeDateToString(marca.vencimiento)}`, 20, 120);
      doc.text(`Estado: ${safeDateToString(marca.djumt)}`, 20, 130);
      
      // Add titulares
      doc.text('Titulares:', 20, 140);
      let yPos = 150;
      for (const titular of titulares) {
        if (!titular || (!titular.fullName && !titular.email && !titular.phone)) continue;
        
        doc.text(`Nombre: ${titular.fullName || ''}`, 20, yPos);
        yPos += 10;
        if (titular.email) {
          doc.text(`Email: ${titular.email}`, 20, yPos);
          yPos += 10;
        }
        if (titular.phone) {
          doc.text(`Teléfono: ${titular.phone}`, 20, yPos);
          yPos += 10;
        }
        yPos += 5;
      }
      
      console.log('Safe PDF content added');
      
      const pdfBuffer = doc.output('arraybuffer');
      console.log('PDF buffer generated, size:', pdfBuffer.byteLength);
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="informe-marca-${marca.marca}.pdf"`,
        },
      });
    } catch (error: unknown) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        name: error instanceof Error ? error.name : 'Unknown'
      });
      return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error generating informe:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 