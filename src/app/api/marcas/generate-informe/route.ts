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

    // Procesar detalles de clase (removed as not used in jsPDF version)

    // Datos para el informe
    const fechaGeneracion = new Date().toLocaleDateString('es-AR');
    const marcaClases = Array.isArray(marca.clases) ? marca.clases.join(', ') : 'No especificadas';
    const titulares = Array.isArray(marca.titulares) && marca.titulares.length > 0
      ? marca.titulares
      : [{ fullName: marca.titular_nombre, email: marca.titular_email, phone: marca.titular_telefono }];

    // Generar PDF con jsPDF - Versión profesional
    try {
      console.log('Starting PDF generation...');
      
      const doc = new jsPDF();
      console.log('jsPDF instance created');
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 32;
      const contentWidth = pageWidth - (margin * 2);
      
      console.log('Page dimensions:', { pageWidth, pageHeight, margin, contentWidth });
      
      let yPosition = 32;
      
      // Header con logo y título
      console.log('Creating header...');
      doc.setFillColor(37, 99, 235); // #2563eb
      doc.rect(0, 0, pageWidth, 80, 'F');
      
      // Logo placeholder (rectángulo azul)
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, 16, 56, 56, 'F');
      
      // Título del informe
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Informe de Marca', margin + 80, 40);
      
      // Información del header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Agente: ${user.name || ''}`, margin + 80, 50);
      doc.text(`Fecha: ${fechaGeneracion}`, margin + 80, 58);
      doc.text(`Marca: ${marca.marca || ''}`, margin + 80, 66);
      
      yPosition = 100;
      console.log('Header completed, yPosition:', yPosition);
      
      // Resumen Ejecutivo
      doc.setTextColor(37, 99, 235);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen Ejecutivo', margin, yPosition);
      
      // Línea debajo del título
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(2);
      doc.line(margin, yPosition + 2, margin + 80, yPosition + 2);
      
      yPosition += 20;
      doc.setTextColor(34, 34, 34);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const resumenText = 'Este informe contiene un resumen profesional de la marca seleccionada, sus titulares y los datos clave para la gestión y protección de tu cartera marcaria.';
      const resumenLines = doc.splitTextToSize(resumenText, contentWidth);
      doc.text(resumenLines, margin, yPosition);
      
      yPosition += (resumenLines.length * 8) + 20;
      console.log('Resumen completed, yPosition:', yPosition);
      
      // Datos de la Marca
      doc.setTextColor(37, 99, 235);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Datos de la Marca', margin, yPosition);
      
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(2);
      doc.line(margin, yPosition + 2, margin + 100, yPosition + 2);
      
      yPosition += 20;
      doc.setTextColor(34, 34, 34);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // Información de la marca
      const marcaInfo = [
        { label: 'Nombre:', value: marca.marca || '' },
        { label: 'Clases:', value: marcaClases },
        { label: 'Renovación:', value: marca.renovar ? new Date(marca.renovar).toLocaleDateString('es-AR') : 'No especificada' },
        { label: 'Vencimiento:', value: marca.vencimiento ? new Date(marca.vencimiento).toLocaleDateString('es-AR') : 'No especificada' },
        { label: 'Estado:', value: marca.djumt || 'No especificado' }
      ];
      
      console.log('Processing marca info:', marcaInfo);
      
      for (const info of marcaInfo) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(35, 64, 153);
        doc.text(info.label, margin, yPosition);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(34, 34, 34);
        const valueX = margin + doc.getTextWidth(info.label) + 5;
        doc.text(info.value, valueX, yPosition);
        
        yPosition += 12;
      }
      
      yPosition += 10;
      console.log('Marca info completed, yPosition:', yPosition);
      
      // Titulares
      doc.setTextColor(37, 99, 235);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Titulares', margin, yPosition);
      
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(2);
      doc.line(margin, yPosition + 2, margin + 60, yPosition + 2);
      
      yPosition += 20;
      
      console.log('Processing titulares:', titulares);
      
      for (const titular of titulares) {
        if (!titular || (!titular.fullName && !titular.email && !titular.phone)) continue;
        
        if (yPosition > 220) {
          console.log('Adding new page for titular');
          doc.addPage();
          yPosition = 32;
        }
        
        // Línea vertical azul para titular
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(3);
        doc.line(margin, yPosition - 5, margin, yPosition + 15);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(35, 64, 153);
        doc.text('Nombre:', margin + 10, yPosition);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(34, 34, 34);
        doc.text(titular.fullName || '', margin + 35, yPosition);
        yPosition += 8;
        
        if (titular.email) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(35, 64, 153);
          doc.text('Email:', margin + 10, yPosition);
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(34, 34, 34);
          doc.text(titular.email, margin + 35, yPosition);
          yPosition += 8;
        }
        
        if (titular.phone) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(35, 64, 153);
          doc.text('Teléfono:', margin + 10, yPosition);
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(34, 34, 34);
          doc.text(titular.phone, margin + 35, yPosition);
          yPosition += 8;
        }
        
        yPosition += 10;
      }
      
      console.log('Titulares completed, yPosition:', yPosition);
      
      // Datos del Agente
      if (yPosition > 180) {
        console.log('Adding new page for agent data');
        doc.addPage();
        yPosition = 32;
      }
      
      doc.setTextColor(37, 99, 235);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Datos del Agente', margin, yPosition);
      
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(2);
      doc.line(margin, yPosition + 2, margin + 100, yPosition + 2);
      
      yPosition += 20;
      doc.setTextColor(34, 34, 34);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const agenteInfo = [
        { label: 'Nombre:', value: user.name || '' },
        { label: 'Teléfono:', value: user.contact_number || '' },
        { label: 'Matrícula:', value: user.agent_number || '' },
        { label: 'Provincia:', value: user.province || '' },
        { label: 'CP:', value: user.zip_code || '' }
      ];
      
      console.log('Processing agent info:', agenteInfo);
      
      for (const info of agenteInfo) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(35, 64, 153);
        doc.text(info.label, margin, yPosition);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(34, 34, 34);
        const valueX = margin + doc.getTextWidth(info.label) + 5;
        doc.text(info.value, valueX, yPosition);
        
        yPosition += 12;
      }
      
      console.log('Agent info completed, yPosition:', yPosition);
      
      // Footer profesional
      console.log('Creating footer...');
      doc.setFillColor(35, 64, 153); // #234099
      doc.rect(0, pageHeight - 40, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Informe generado por Gestionatusmarcas.com', margin, pageHeight - 25);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Fecha de generación: ${fechaGeneracion} | Este documento es confidencial y sólo para uso informativo.`, margin, pageHeight - 15);
      doc.text('Gestión inteligente de tu cartera marcaria. Protección con visión profesional.', margin, pageHeight - 8);
      
      console.log('Generating PDF buffer...');
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