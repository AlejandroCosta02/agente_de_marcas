import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import jsPDF from 'jspdf';

interface TrademarkMatch {
  detectedTrademark: string;
  detectedClass: string;
  matchedTrademark: string;
  matchedClass: string;
  similarityPercentage: number;
  suggestedAction: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { matches } = await request.json() as { matches: TrademarkMatch[] };

    if (!matches || !Array.isArray(matches)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Create PDF
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Informe de Escaneo de Boletín', 20, 30);
    
    // Add subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-AR')}`, 20, 40);
    doc.text(`Usuario: ${session.user.name || session.user.email}`, 20, 50);
    
    // Add summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen', 20, 70);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total de coincidencias encontradas: ${matches.length}`, 20, 80);
    doc.text(`Alto riesgo (≥80%): ${matches.filter(m => m.similarityPercentage >= 80).length}`, 20, 90);
    doc.text(`Medio riesgo (60-79%): ${matches.filter(m => m.similarityPercentage >= 60 && m.similarityPercentage < 80).length}`, 20, 100);
    doc.text(`Bajo riesgo (<60%): ${matches.filter(m => m.similarityPercentage < 60).length}`, 20, 110);

    // Add table header
    let yPosition = 130;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Marca Detectada', 20, yPosition);
    doc.text('Clase', 70, yPosition);
    doc.text('Coincide con', 90, yPosition);
    doc.text('Similitud', 140, yPosition);
    doc.text('Acción', 170, yPosition);

    // Add table content
    yPosition += 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    for (const match of matches) {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      // Truncate text if too long
      const detectedTrademark = match.detectedTrademark.length > 20 
        ? match.detectedTrademark.substring(0, 17) + '...' 
        : match.detectedTrademark;
      
      const matchedTrademark = match.matchedTrademark.length > 20 
        ? match.matchedTrademark.substring(0, 17) + '...' 
        : match.matchedTrademark;

      doc.text(detectedTrademark, 20, yPosition);
      doc.text(match.detectedClass, 70, yPosition);
      doc.text(matchedTrademark, 90, yPosition);
      doc.text(`${match.similarityPercentage}%`, 140, yPosition);
      
      // Color code the action based on similarity
      if (match.similarityPercentage >= 80) {
        doc.setTextColor(255, 0, 0); // Red
      } else if (match.similarityPercentage >= 60) {
        doc.setTextColor(255, 165, 0); // Orange
      } else {
        doc.setTextColor(0, 128, 0); // Green
      }
      
      doc.text(match.suggestedAction.replace(/[⚠️🔍✅]/g, '').trim(), 170, yPosition);
      doc.setTextColor(0, 0, 0); // Reset to black
      
      yPosition += 8;
    }

    // Add footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Informe generado automáticamente por Agente de Marcas', 20, 280);

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="informe-boletin-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 