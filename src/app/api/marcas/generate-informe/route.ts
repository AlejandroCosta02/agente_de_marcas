import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';
import path from 'path';
import fs from 'fs/promises';
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

    // Procesar detalles de clase
    let classDetailsTable = '';
    if (marca.class_details) {
      let details = marca.class_details;
      if (typeof details === 'string') {
        try { details = JSON.parse(details); } catch { details = {}; }
      }
      const clases = Object.keys(details).sort((a, b) => Number(a) - Number(b));
      if (clases.length > 0) {
        classDetailsTable = `<table style="border-collapse:collapse;margin-bottom:18px;font-size:0.98rem;">
          <tr style="background:#f4f6fa;color:#234099;font-weight:600;">
            <td style="border:1px solid #2563eb;padding:4px 10px;">Clase</td>
            <td style="border:1px solid #2563eb;padding:4px 10px;">N° de acta</td>
            <td style="border:1px solid #2563eb;padding:4px 10px;">Resolución</td>
          </tr>`;
        for (const clase of clases) {
          const d = details[clase] || {};
          classDetailsTable += `<tr>
            <td style="border:1px solid #2563eb;padding:4px 10px;">${clase}</td>
            <td style="border:1px solid #2563eb;padding:4px 10px;">${d.acta || '-'}</td>
            <td style="border:1px solid #2563eb;padding:4px 10px;">${d.resolucion || '-'}</td>
          </tr>`;
        }
        classDetailsTable += '</table>';
      }
    }

    // Datos para el informe
    const fechaGeneracion = new Date().toLocaleDateString('es-AR');
    const marcaClases = Array.isArray(marca.clases) ? marca.clases.join(', ') : 'No especificadas';
    const titulares = Array.isArray(marca.titulares) && marca.titulares.length > 0
      ? marca.titulares
      : [{ fullName: marca.titular_nombre, email: marca.titular_email, phone: marca.titular_telefono }];

    // Generar PDF con jsPDF
    try {
      const doc = new jsPDF();
      
      // Configurar fuente y tamaño
      doc.setFont('helvetica');
      doc.setFontSize(12);
      
      let yPosition = 20;
      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - (margin * 2);
      
      // Título
      doc.setFontSize(18);
      doc.setTextColor(35, 64, 153); // #234099
      doc.text('Informe de Marca', margin, yPosition);
      yPosition += 15;
      
      // Información del agente
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Agente: ${user.name || ''}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Teléfono: ${user.contact_number || ''}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Matrícula: ${user.agent_number || ''}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Provincia: ${user.province || ''}`, margin, yPosition);
      yPosition += 8;
      doc.text(`CP: ${user.zip_code || ''}`, margin, yPosition);
      yPosition += 15;
      
      // Datos de la marca
      doc.setFontSize(14);
      doc.setTextColor(35, 64, 153);
      doc.text('Datos de la Marca', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Nombre: ${marca.marca || ''}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Clases: ${marcaClases}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Renovación: ${marca.renovar ? new Date(marca.renovar).toLocaleDateString('es-AR') : 'No especificada'}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Vencimiento: ${marca.vencimiento ? new Date(marca.vencimiento).toLocaleDateString('es-AR') : 'No especificada'}`, margin, yPosition);
      yPosition += 8;
      doc.text(`Estado: ${marca.djumt || 'No especificado'}`, margin, yPosition);
      yPosition += 15;
      
      // Titulares
      doc.setFontSize(14);
      doc.setTextColor(35, 64, 153);
      doc.text('Titulares', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      for (const titular of titulares) {
        if (!titular || (!titular.fullName && !titular.email && !titular.phone)) continue;
        
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(`Nombre: ${titular.fullName || ''}`, margin, yPosition);
        yPosition += 8;
        if (titular.email) {
          doc.text(`Email: ${titular.email}`, margin, yPosition);
          yPosition += 8;
        }
        if (titular.phone) {
          doc.text(`Teléfono: ${titular.phone}`, margin, yPosition);
          yPosition += 8;
        }
        yPosition += 5;
      }
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      const footerText = `Informe generado por Gestionatusmarcas.com | Fecha: ${fechaGeneracion}`;
      const footerWidth = doc.getTextWidth(footerText);
      const footerX = (pageWidth - footerWidth) / 2;
      doc.text(footerText, footerX, 280);
      
      const pdfBuffer = doc.output('arraybuffer');
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="informe-marca-${marca.marca}.pdf"`,
        },
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      return NextResponse.json({ error: 'Error al generar el PDF' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error generating informe:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 