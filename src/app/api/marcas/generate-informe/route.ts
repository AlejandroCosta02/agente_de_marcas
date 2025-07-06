import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';

const pool = createPool();

const PDF_SERVER_URL = 'https://pdf-server-gtm.onrender.com/generate-pdf';

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
      SELECT id, marca, renovar, vencimiento, djumt, clases, titulares, anotaciones, oposicion, titular_nombre, titular_email, titular_telefono, class_details
      FROM marcas 
      WHERE id = $1 AND user_email = $2
    `, [marcaId, session.user.email]);

    if (marcaResult.rows.length === 0) {
      return NextResponse.json({ error: 'Marca no encontrada' }, { status: 404 });
    }

    const marca = marcaResult.rows[0];

    // Call local PDF server for professional PDF generation
    try {
      const response = await fetch(PDF_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          marca,
          user
        })
      });

      if (!response.ok) {
        throw new Error(`PDF server returned ${response.status}`);
      }

      const pdfBuffer = await response.arrayBuffer();

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="informe-marca-${marca.marca}.pdf"`,
        },
      });
    } catch (error) {
      console.error('Error calling PDF server:', error);
      return NextResponse.json({ error: 'Error generando el PDF profesional.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating informe:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 