const puppeteer = require('puppeteer');

exports.handler = async (event) => {
  try {
    const { marcaData, userData } = JSON.parse(event.body);
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Generate professional HTML template
    const htmlContent = generateHTMLTemplate(marcaData, userData);
    
    await page.setContent(htmlContent);
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="informe-marca-${marcaData.marca}.pdf"`
      },
      body: pdf.toString('base64'),
      isBase64Encoded: true
    };
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error generating PDF' })
    };
  }
};

function generateHTMLTemplate(marca, user) {
  const fechaGeneracion = new Date().toLocaleDateString('es-AR');
  const marcaClases = Array.isArray(marca.clases) ? marca.clases.join(', ') : 'No especificadas';
  const titulares = Array.isArray(marca.titulares) && marca.titulares.length > 0
    ? marca.titulares
    : [{ fullName: marca.titular_nombre, email: marca.titular_email, phone: marca.titular_telefono }];

  const safeDateToString = (dateValue) => {
    if (!dateValue) return 'No especificado';
    if (dateValue instanceof Date) return dateValue.toLocaleDateString('es-AR');
    if (typeof dateValue === 'string') return dateValue;
    return String(dateValue);
  };

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Informe de Marca - ${marca.marca}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; color: #222; }
        .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: 700; color: #3b82f6; }
        .title { font-size: 24px; font-weight: 600; margin-top: 10px; }
        .section { margin-top: 32px; }
        .section-title { color: #3b82f6; font-size: 18px; font-weight: 600; border-bottom: 1px solid #eee; margin-bottom: 12px; }
        .info-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .info-table td { padding: 8px 0; }
        .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 16px; }
        .titulares-list { margin-top: 10px; }
        .titular-item { background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; }
        .titular-name { font-weight: 600; color: #1f2937; }
        .titular-details { font-size: 13px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Agente de Marcas</div>
        <div class="title">Informe de Marca</div>
        <div style="font-size:13px; color:#888; margin-top:8px;">Generado el ${fechaGeneracion}</div>
      </div>
      <div class="section">
        <div class="section-title">Datos del Agente</div>
        <table class="info-table">
          <tr><td>Nombre:</td><td>${user.name || 'No especificado'}</td></tr>
          <tr><td>Número de Agente:</td><td>${user.agent_number || 'No especificado'}</td></tr>
          <tr><td>Teléfono:</td><td>${user.contact_number || 'No especificado'}</td></tr>
          <tr><td>Provincia:</td><td>${user.province || 'No especificado'}</td></tr>
        </table>
      </div>
      <div class="section">
        <div class="section-title">Datos de la Marca</div>
        <table class="info-table">
          <tr><td>Nombre de la Marca:</td><td>${marca.marca || 'No especificado'}</td></tr>
          <tr><td>Clases:</td><td>${marcaClases}</td></tr>
          <tr><td>Fecha de Renovación:</td><td>${safeDateToString(marca.renovar)}</td></tr>
          <tr><td>Fecha de Vencimiento:</td><td>${safeDateToString(marca.vencimiento)}</td></tr>
          <tr><td>Estado:</td><td>${safeDateToString(marca.djumt)}</td></tr>
        </table>
      </div>
      ${marca.anotaciones ? `
      <div class="section">
        <div class="section-title">Anotaciones</div>
        <div>${marca.anotaciones}</div>
      </div>
      ` : ''}
      ${marca.oposicion ? `
      <div class="section">
        <div class="section-title">Oposición</div>
        <div>${marca.oposicion}</div>
      </div>
      ` : ''}
      <div class="section">
        <div class="section-title">Titulares</div>
        <div class="titulares-list">
          ${titulares.map(titular => `
            <div class="titular-item">
              <div class="titular-name">${titular.fullName || 'No especificado'}</div>
              <div class="titular-details">
                ${titular.email ? `Email: ${titular.email}<br>` : ''}
                ${titular.phone ? `Teléfono: ${titular.phone}` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="footer">
        Este informe fue generado automáticamente por el sistema Agente de Marcas
      </div>
    </body>
    </html>
  `;
} 