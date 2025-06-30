import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://gestionatusmarcas.com';
  const currentDate = new Date().toISOString();
  
  const pages = [
    {
      path: '',
      priority: '1.0',
      changefreq: 'weekly',
      lastmod: currentDate,
    },
    {
      path: 'about',
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: currentDate,
    },
    {
      path: 'contact',
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: currentDate,
    },
    {
      path: 'privacy',
      priority: '0.5',
      changefreq: 'yearly',
      lastmod: currentDate,
    },
    {
      path: 'terms',
      priority: '0.5',
      changefreq: 'yearly',
      lastmod: currentDate,
    },
    {
      path: 'sitemap',
      priority: '0.3',
      changefreq: 'monthly',
      lastmod: currentDate,
    },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
    <url>
      <loc>${baseUrl}/${page.path}</loc>
      <lastmod>${page.lastmod}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `
    )
    .join('')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
} 