const fetch = require('node-fetch');

async function testPDFGeneration() {
  const LAMBDA_FUNCTION_URL = 'https://8swsobd5c2.execute-api.us-east-1.amazonaws.com/dev/generate-pdf';
  
  const testData = {
    marcaData: {
      marca: "TEST MARCA",
      clases: ["Clase 9", "Clase 42"],
      renovar: "2025-12-31",
      vencimiento: "2026-12-31",
      djumt: "Activa",
      anotaciones: "Esta es una marca de prueba para verificar el formato profesional del PDF.",
      oposicion: "No hay oposiciones registradas.",
      titulares: [
        {
          fullName: "Juan Pérez",
          email: "juan.perez@email.com",
          phone: "+54 11 1234-5678"
        },
        {
          fullName: "María García",
          email: "maria.garcia@email.com",
          phone: "+54 11 9876-5432"
        }
      ]
    },
    userData: {
      name: "Dr. Carlos Rodríguez",
      agent_number: "A-12345",
      contact_number: "+54 11 5555-1234",
      province: "Buenos Aires"
    }
  };

  try {
    console.log('🔄 Testing PDF generation...');
    
    const response = await fetch(LAMBDA_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`Lambda function returned ${response.status}: ${response.statusText}`);
    }

    const pdfBuffer = await response.arrayBuffer();
    
    console.log('✅ PDF generated successfully!');
    console.log(`📄 PDF size: ${pdfBuffer.byteLength} bytes`);
    console.log(`📊 PDF size: ${(pdfBuffer.byteLength / 1024).toFixed(2)} KB`);
    
    // Save the PDF for inspection
    const fs = require('fs');
    fs.writeFileSync('test-informe.pdf', Buffer.from(pdfBuffer));
    console.log('💾 PDF saved as test-informe.pdf');
    
  } catch (error) {
    console.error('❌ Error testing PDF generation:', error);
  }
}

testPDFGeneration(); 