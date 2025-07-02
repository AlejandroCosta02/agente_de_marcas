import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

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

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Generate HTML content
    const htmlContent = generateEmailHTML(matches, session.user.name || session.user.email);

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: session.user.email,
      subject: `Informe de Escaneo de Boletín - ${new Date().toLocaleDateString('es-AR')}`,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

function generateEmailHTML(matches: TrademarkMatch[], userName: string): string {
  const highRiskCount = matches.filter(m => m.similarityPercentage >= 80).length;
  const mediumRiskCount = matches.filter(m => m.similarityPercentage >= 60 && m.similarityPercentage < 80).length;
  const lowRiskCount = matches.filter(m => m.similarityPercentage < 60).length;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px; }
        .summary-item { text-align: center; padding: 15px; border-radius: 8px; }
        .high-risk { background: #fee; color: #c53030; }
        .medium-risk { background: #fef5e7; color: #d69e2e; }
        .low-risk { background: #f0fff4; color: #38a169; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background: #f8f9fa; font-weight: bold; }
        .similarity-high { color: #c53030; font-weight: bold; }
        .similarity-medium { color: #d69e2e; font-weight: bold; }
        .similarity-low { color: #38a169; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔍 Informe de Escaneo de Boletín</h1>
          <p>Detectamos posibles conflictos con tus marcas registradas</p>
        </div>
        
        <div class="content">
          <p>Hola ${userName},</p>
          
          <p>Hemos completado el análisis del boletín del INPI y encontramos <strong>${matches.length} coincidencias</strong> con tus marcas registradas.</p>
          
          <div class="summary">
            <h3>📊 Resumen del Escaneo</h3>
            <div class="summary-grid">
              <div class="summary-item high-risk">
                <div style="font-size: 24px; font-weight: bold;">${highRiskCount}</div>
                <div>Alto Riesgo</div>
                <div style="font-size: 12px;">≥80% similitud</div>
              </div>
              <div class="summary-item medium-risk">
                <div style="font-size: 24px; font-weight: bold;">${mediumRiskCount}</div>
                <div>Medio Riesgo</div>
                <div style="font-size: 12px;">60-79% similitud</div>
              </div>
              <div class="summary-item low-risk">
                <div style="font-size: 24px; font-weight: bold;">${lowRiskCount}</div>
                <div>Bajo Riesgo</div>
                <div style="font-size: 12px;"><60% similitud</div>
              </div>
            </div>
          </div>

          ${matches.length > 0 ? `
            <h3>📋 Detalle de Coincidencias</h3>
            <table class="table">
              <thead>
                <tr>
                  <th>Marca Detectada</th>
                  <th>Clase</th>
                  <th>Coincide con</th>
                  <th>Similitud</th>
                  <th>Acción Sugerida</th>
                </tr>
              </thead>
              <tbody>
                ${matches.map(match => `
                  <tr>
                    <td>${match.detectedTrademark}</td>
                    <td>${match.detectedClass}</td>
                    <td>${match.matchedTrademark}</td>
                    <td class="similarity-${match.similarityPercentage >= 80 ? 'high' : match.similarityPercentage >= 60 ? 'medium' : 'low'}">
                      ${match.similarityPercentage}%
                    </td>
                    <td>${match.suggestedAction}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div style="text-align: center; padding: 40px; background: #f0fff4; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #38a169; margin-bottom: 10px;">✅ ¡Excelente!</h3>
              <p style="color: #38a169;">No se encontraron conflictos significativos en el boletín analizado.</p>
            </div>
          `}

          <div style="background: #e6f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #2b6cb0;">💡 Recomendaciones</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Revisa las coincidencias de alto riesgo con prioridad</li>
              <li>Considera consultar con un abogado especializado en propiedad intelectual</li>
              <li>Monitorea regularmente los boletines del INPI</li>
              <li>Mantén actualizada tu información de contacto</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Este informe fue generado automáticamente por <strong>Agente de Marcas</strong></p>
          <p>Fecha: ${new Date().toLocaleDateString('es-AR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
} 