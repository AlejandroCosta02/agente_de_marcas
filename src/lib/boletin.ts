import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const INPI_BOLETINES_URL = 'https://portaltramites.inpi.gob.ar/Boletines';
const INPI_BASE_URL = 'https://portaltramites.inpi.gob.ar';

/**
 * Fetches and parses the latest Boletín de Marcas PDF URL from INPI.
 * @returns {Promise<string>} The absolute URL to the latest Boletín de Marcas PDF.
 */
export async function getLatestBoletinUrl(): Promise<string> {
  const res = await fetch(INPI_BOLETINES_URL);
  if (!res.ok) throw new Error('No se pudo acceder a la página de boletines de INPI');
  const html = await res.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find the boletines table
  const rows = Array.from(document.querySelectorAll('table tr')) as HTMLTableRowElement[];
  for (const row of rows) {
    const cells = row.querySelectorAll('td');
    if (cells.length < 6) continue;
    const tipo = cells[1].textContent?.trim();
    const sector = cells[2].textContent?.trim();
    const archivoLink = cells[4].querySelector('a')?.getAttribute('href') || '';
    if (
      tipo === 'Boletines' &&
      sector === 'Marcas' &&
      archivoLink.endsWith('.pdf')
    ) {
      return INPI_BASE_URL + archivoLink;
    }
  }
  throw new Error('No se encontró el último boletín de marcas.');
} 