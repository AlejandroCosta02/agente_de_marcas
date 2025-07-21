import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPool } from '@vercel/postgres';
import similarity from 'string-similarity-js';
import jsPDF from 'jspdf';
import fetch from 'node-fetch';
import FormData from 'form-data';

interface MarcaEntry {
  tipo: 'D' | 'M';
  marca: string;
  clase?: string;
  solicitante?: string;
  numero?: string;
  imagen?: string;
  pageIndex?: number;
  imageIndex?: number;
}

interface AnalysisResult {
  marca: string;
  clase?: string;
  solicitante?: string;
  numero?: string;
  similitud: number;
  sugerencias: string[];
  tipoSimilitud: 'fonetica' | 'visual' | 'ambos';
  userMarca: string;
}

// Simple phonetic similarity function
function simplePhoneticSimilarity(str1: string, str2: string): number {
  const normalize = (str: string) => str.toLowerCase()
    .replace(/[aeiou]/g, '')
    .replace(/[^a-z]/g, '')
    .substring(0, 3);
  
  const phonetic1 = normalize(str1);
  const phonetic2 = normalize(str2);
  
  return phonetic1 === phonetic2 ? 0.7 : 0;
}

export async function POST(request: NextRequest) {
  try {
    console.log('--- /api/boletin/scan called ---');
    console.log('🔍 Starting boletin scan API...');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('❌ No session or user email found');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log('✅ Session validated for user:', session.user.email);

    const pool = createPool();
    
    // Get user and subscription
    console.log('🔍 Fetching user data...');
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [session.user.email]
    );

    if (userResult.rows.length === 0) {
      console.log('❌ User not found in database');
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = userResult.rows[0];
    console.log('✅ User found:', user.id);

    // Check subscription
    console.log('🔍 Checking subscription...');
    const subscriptionResult = await pool.query(
      'SELECT * FROM "UserSubscription" WHERE "userId" = $1',
      [user.id]
    );

    const subscription = subscriptionResult.rows[0];
    const userPlan = subscription?.tier || 'free';
    console.log('📋 User plan:', userPlan);
    
    // Only allow premium users
    if (userPlan !== 'premium') {
      console.log('❌ User not premium, plan:', userPlan);
      return NextResponse.json({ 
        error: 'Esta función está disponible solo para usuarios premium' 
      }, { status: 403 });
    }

    // Get all marcas for comparison
    console.log('🔍 Fetching all marcas...');
    const marcasResult = await pool.query('SELECT marca FROM marcas WHERE user_email = $1', [session.user.email]);
    const userMarcas = marcasResult.rows.map(row => row.marca.toLowerCase().trim());
    console.log('📋 Total marcas for user:', userMarcas.length);

    console.log('🔍 Processing uploaded file...');
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    console.log('formData keys:', Array.from(formData.keys()));
    if (file) {
      console.log('File info:', {
        name: file.name,
        type: file.type,
        size: file.size,
        hasArrayBuffer: typeof file.arrayBuffer === 'function'
      });
    } else {
      console.log('No file found in formData!');
    }
    
    if (!file || typeof file.arrayBuffer !== 'function') {
      console.log('❌ Invalid file uploaded');
      return NextResponse.json({ error: 'Archivo no válido o no se pudo leer.' }, { status: 400 });
    }

    // Check file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      console.log('❌ Invalid file type:', file.type, file.name);
      return NextResponse.json({ error: 'Solo se permiten archivos PDF.' }, { status: 400 });
    }

    console.log('📁 File received:', file.name, 'Size:', file.size);

    // Check file size (Vercel has 4.5MB limit for serverless functions)
    const MAX_FILE_SIZE = 4.4 * 1024 * 1024; // 4.4MB, just under Vercel's 4.5MB limit
    if (file.size > MAX_FILE_SIZE) {
      console.log('❌ File too large:', file.size, 'bytes');
      return NextResponse.json({ 
        error: `El archivo es demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB). El tamaño máximo permitido es 4.4MB.` 
      }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('📄 Buffer created, size:', buffer.length);

    // Before sending to microservice
    console.log('Preparing to send file to microservice...');

    // Parse PDF (using Python microservice)
    console.log('🔍 Sending PDF to Python microservice...');
    let pdfText: string;
    let pdfImages: unknown[] = [];
    try {
      const form = new FormData();
      form.append('file', buffer, { filename: file.name || 'boletin.pdf' });
      const microserviceUrl = process.env.PDF_EXTRACT_SERVICE_URL || 'http://localhost:5001/extract-text';
      const response = await fetch(microserviceUrl, {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
      });
      console.log('Microservice response status:', response.status);
      if (!response.ok) {
        throw new Error('Python microservice error: ' + (await response.text()));
      }
      const data = await response.json() as { pages: string[], images: unknown[] };
      pdfText = (data.pages || []).join('\n');
      pdfImages = data.images || [];
      console.log('✅ PDF text received from Python, length:', pdfText.length);
      console.log('✅ PDF images received from Python, pages with images:', pdfImages.length);
      console.log('📄 PDF text sample:', pdfText.substring(0, 200));
    } catch (pdfError) {
      console.error('❌ PDF parsing error (Python microservice):', pdfError);
      return NextResponse.json({ 
        error: 'Error al procesar el PDF. Asegúrate de que sea un archivo PDF válido.' 
      }, { status: 400 });
    }

    // Extract and classify marca entries
    console.log('🔍 Extracting marca entries...');
    try {
      const marcaEntries = extractMarcaEntries(pdfText, pdfImages);
      console.log('📋 Found', marcaEntries.length, 'marca entries');
      
      // Separate denominative and mixed marks
      const marcasDenominativas = marcaEntries.filter(entry => entry.tipo === 'D');
      const marcasMixtas = marcaEntries.filter(entry => entry.tipo === 'M');
      console.log('📊 Denominativas:', marcasDenominativas.length, 'Mixtas:', marcasMixtas.length);

      // Analyze denominative marks against user's marcas
      console.log('🔍 Analyzing marcas...');
      const analysisResults = analyzeMarcas(marcasDenominativas, userMarcas);
      console.log('📊 Analysis results:', analysisResults.length, 'matches found');

      // Generate PDFs
      console.log('🔍 Generating PDFs...');
      try {
        const analysisPdf = generateAnalysisPdf(analysisResults, user.name || 'Usuario');
        console.log('✅ PDFs generated successfully');

        console.log('✅ Boletin scan completed successfully');

        // Create a simple response with base64 encoded PDF for denominativas only
        return NextResponse.json({
          success: true,
          message: 'Análisis completado exitosamente',
          data: {
            denominativas: {
              count: marcasDenominativas.length,
              matches: analysisResults.filter(r => r.similitud > 30).length,
              pdf: analysisPdf
            },
            mixtas: {
              count: marcasMixtas.length,
              message: 'Nuestro equipo está trabajando para mejorar la experiencia en la búsqueda y análisis de marcas mixtas, debido a que el INPI no proporciona una base de datos clara y concisa.'
            }
          }
        });
      } catch (pdfGenError) {
        console.error('❌ PDF generation error:', pdfGenError);
        return NextResponse.json({ 
          error: 'Error al generar los informes PDF.' 
        }, { status: 500 });
      }
    } catch (extractionError) {
      console.error('❌ Marca extraction error:', extractionError);
      return NextResponse.json({ 
        error: 'Error al extraer información del boletín.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Unexpected error in boletin scan:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Error interno del servidor al procesar el boletín. Inténtalo de nuevo.' 
    }, { status: 500 });
  }
}

function extractMarcaEntries(pdfText: string, pdfImages: unknown[] = []): MarcaEntry[] {
  const entries: MarcaEntry[] = [];
  const lines = pdfText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentEntry: Partial<MarcaEntry> = {};
  const currentPageIndex = 0;
  let currentImageIndex = 0;
  
  for (const line of lines) {
    // Look for Acta pattern (21) Acta 4510769 - (51) Clase 21
    if (line.match(/\(21\) Acta \d+ - \(51\) Clase \d+/)) {
      // Save previous entry if exists
      if (currentEntry.marca) {
        entries.push(currentEntry as MarcaEntry);
      }
      
      // Start new entry
      const actaMatch = line.match(/\(21\) Acta (\d+) - \(51\) Clase (\d+)/);
      if (actaMatch) {
        currentEntry = {
          numero: actaMatch[1],
          clase: actaMatch[2],
          tipo: 'D' // Default to denominative
        };
      }
    }
    
    // Look for marca type and name: (40) D (54) THERMACELL or (40) M (54)
    if (currentEntry.numero && line.match(/\(40\) [DM] \(54\)/)) {
      const marcaMatch = line.match(/\(40\) ([DM]) \(54\) (.+)/);
      if (marcaMatch) {
        currentEntry.tipo = marcaMatch[1] as 'D' | 'M';
        currentEntry.marca = marcaMatch[2].trim();
      } else {
        // For mixed marks without text: (40) M (54)
        const mixedMatch = line.match(/\(40\) M \(54\)/);
        if (mixedMatch) {
          currentEntry.tipo = 'M';
          currentEntry.marca = 'MARCA MIXTA';
          // Assign image if available
          const imagesByPage = pdfImages as Array<Array<{ data: string }>>;
          if (imagesByPage[currentPageIndex] && imagesByPage[currentPageIndex][currentImageIndex]) {
            currentEntry.imagen = imagesByPage[currentPageIndex][currentImageIndex].data;
            currentEntry.pageIndex = currentPageIndex;
            currentEntry.imageIndex = currentImageIndex;
            currentImageIndex++;
          }
        }
      }
    }
    
    // Extract applicant: (73) THERMACELL REPELLENTS, INC.
    if (currentEntry.marca && !currentEntry.solicitante && line.match(/\(73\)/)) {
      const solicitanteMatch = line.match(/\(73\) (.+)/);
      if (solicitanteMatch) {
        currentEntry.solicitante = solicitanteMatch[1].trim();
      }
    }
  }
  
  // Add last entry
  if (currentEntry.marca) {
    entries.push(currentEntry as MarcaEntry);
  }
  
  return entries;
}

function analyzeMarcas(marcasDenominativas: MarcaEntry[], userMarcas: string[]): AnalysisResult[] {
  const results: AnalysisResult[] = [];
  
  for (const marca of marcasDenominativas) {
    const marcaText = marca.marca.toLowerCase().trim();
    let maxSimilitud = 0;
    let mejorCoincidencia = '';
    let tipoSimilitud: 'fonetica' | 'visual' | 'ambos' = 'visual';
    
    for (const userMarca of userMarcas) {
      // String similarity
      const similitudVisual = similarity(marcaText, userMarca);
      
      // Simple phonetic similarity
      const similitudFonetica = simplePhoneticSimilarity(marcaText, userMarca);
      
      const similitudTotal = Math.max(similitudVisual, similitudFonetica);
      
      if (similitudTotal > maxSimilitud) {
        maxSimilitud = similitudTotal;
        mejorCoincidencia = userMarca;
        tipoSimilitud = similitudVisual > similitudFonetica ? 'visual' : 
                       similitudFonetica > similitudVisual ? 'fonetica' : 'ambos';
      }
    }
    
    if (maxSimilitud > 0.2) { // Only include relevant matches
      const sugerencias = generateSugerencias(marcaText, mejorCoincidencia, maxSimilitud);
      
      results.push({
        marca: marca.marca,
        clase: marca.clase,
        solicitante: marca.solicitante,
        numero: marca.numero,
        similitud: Math.round(maxSimilitud * 100),
        sugerencias,
        tipoSimilitud,
        userMarca: mejorCoincidencia
      });
    }
  }
  
  // Sort by similarity (highest first)
  return results.sort((a, b) => b.similitud - a.similitud);
}

function generateSugerencias(marcaText: string, userMarca: string, similitud: number): string[] {
  const sugerencias: string[] = [];
  
  if (similitud > 0.8) {
    sugerencias.push('Alta similitud - Revisión urgente recomendada');
  } else if (similitud > 0.6) {
    sugerencias.push('Similitud moderada - Considerar oposición');
  } else if (similitud > 0.4) {
    sugerencias.push('Similitud baja - Monitorear desarrollo');
  }
  
  if (marcaText.includes(userMarca) || userMarca.includes(marcaText)) {
    sugerencias.push('Contención de términos detectada');
  }
  
  return sugerencias;
}

function generateAnalysisPdf(results: AnalysisResult[], userName: string): string {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('Análisis de Boletín INPI', 20, 20);
  doc.setFontSize(12);
  doc.text(`Usuario: ${userName}`, 20, 30);
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 20, 40);
  doc.text(`Marcas analizadas: ${results.length}`, 20, 50);
  
  let yPosition = 70;
  
  // Results
  doc.setFontSize(14);
  doc.text('Resultados del Análisis:', 20, yPosition);
  yPosition += 10;
  
  for (const result of results) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${result.marca} (${result.similitud}% similitud)`, 20, yPosition);
    yPosition += 7;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    if (result.userMarca) {
      doc.text(`Coincidencia con tu marca: ${result.userMarca}`, 25, yPosition);
      yPosition += 5;
    }
    if (result.clase) {
      doc.text(`Clase: ${result.clase}`, 25, yPosition);
      yPosition += 5;
    }
    if (result.solicitante) {
      doc.text(`Solicitante: ${result.solicitante}`, 25, yPosition);
      yPosition += 5;
    }
    doc.text(`Tipo de similitud: ${result.tipoSimilitud}`, 25, yPosition);
    yPosition += 5;
    
    // Suggestions
    doc.setFont('helvetica', 'italic');
    result.sugerencias.forEach(sugerencia => {
      doc.text(`• ${sugerencia}`, 30, yPosition);
      yPosition += 5;
    });
    
    yPosition += 10;
  }
  
  return doc.output('datauristring');
} 