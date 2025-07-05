import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';
import path from 'path';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';

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

    // Leer plantilla HTML
    const templatePath = path.resolve(process.cwd(), 'src/templates/informe-template.html');
    let html = await fs.readFile(templatePath, 'utf8');

    // Leer logo real y convertir a base64
    const logoPath = path.resolve(process.cwd(), 'public/logo.png');
    const logoBuffer = await fs.readFile(logoPath);
    const logoBase64 = logoBuffer.toString('base64');
    const logoUrl = `data:image/png;base64,${logoBase64}`;

    // Datos para la plantilla
    const fechaGeneracion = new Date().toLocaleDateString('es-AR');
    const resumenEjecutivo = `Este informe contiene un resumen profesional de la marca seleccionada, sus titulares y los datos clave para la gestión y protección de tu cartera marcaria.`;
    const marcaClases = Array.isArray(marca.clases) ? marca.clases.join(', ') : 'No especificadas';
    const titulares = Array.isArray(marca.titulares) && marca.titulares.length > 0
      ? marca.titulares
      : [{ fullName: marca.titular_nombre, email: marca.titular_email, phone: marca.titular_telefono }];

    // Rellenar plantilla
    html = html
      .replace(/{{logoUrl}}/g, logoUrl)
      .replace(/{{agenteNombre}}/g, user.name || '')
      .replace(/{{agenteTelefono}}/g, user.contact_number || '')
      .replace(/{{agenteMatricula}}/g, user.agent_number || '')
      .replace(/{{agenteProvincia}}/g, user.province || '')
      .replace(/{{agenteCP}}/g, user.zip_code || '')
      .replace(/{{fechaGeneracion}}/g, fechaGeneracion)
      .replace(/{{marcaNombre}}/g, marca.marca || '')
      .replace(/{{marcaClases}}/g, marcaClases)
      .replace(/{{marcaRenovar}}/g, marca.renovar ? new Date(marca.renovar).toLocaleDateString('es-AR') : 'No especificada')
      .replace(/{{marcaVencimiento}}/g, marca.vencimiento ? new Date(marca.vencimiento).toLocaleDateString('es-AR') : 'No especificada')
      .replace(/{{marcaEstado}}/g, marca.djumt || 'No especificado')
      .replace(/{{resumenEjecutivo}}/g, resumenEjecutivo)
      .replace(/{{classDetailsTable}}/g, classDetailsTable);

    // Renderizar titulares (simple, sin handlebars)
    let titularesHtml = '';
    for (const t of titulares) {
      if (!t || (!t.fullName && !t.email && !t.phone)) continue;
      titularesHtml += `<div class="titular">
        <span class="info-label">Nombre:</span>${t.fullName || ''}<br/>
        ${t.email ? `<span class="info-label">Email:</span>${t.email}<br/>` : ''}
        ${t.phone ? `<span class="info-label">Teléfono:</span>${t.phone}` : ''}
      </div>`;
    }
    html = html.replace(/{{#each titulares}}([\s\S]*?){{\/each}}/, titularesHtml);

    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--font-render-hinting=none'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: 0, bottom: 0, left: 0, right: 0 } });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="informe-marca-${marca.marca}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating informe:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 