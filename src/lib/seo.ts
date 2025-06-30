/**
 * SEO utility functions for consistent metadata handling
 */

export const SITE_URL = 'https://gestionatusmarcas.com';

/**
 * Generate canonical URL for a page
 */
export function getCanonicalUrl(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Generate structured data for organization
 */
export function getOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gestiona tus Marcas",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo-d.svg`,
    "description": "Plataforma profesional para la gestión, seguimiento y protección de marcas en Argentina",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "AR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Spanish"
    },
    "sameAs": [
      "https://twitter.com/gestionatusmarcas"
    ]
  };
}

/**
 * Generate structured data for website
 */
export function getWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Gestiona tus Marcas",
    "url": SITE_URL,
    "description": "Plataforma profesional para la gestión, seguimiento y protección de marcas en Argentina",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate breadcrumb structured data
 */
export function getBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

/**
 * Clean URL for SEO purposes
 */
export function cleanUrl(url: string): string {
  return url
    .replace(/\/+/g, '/') // Remove multiple slashes
    .replace(/\/$/, '') // Remove trailing slash (except for root)
    .replace(/\/$/, '/'); // Keep root slash
}

/**
 * Validate if a URL is canonical
 */
export function isCanonicalUrl(url: string): boolean {
  const clean = cleanUrl(url);
  return clean === SITE_URL || clean.startsWith(SITE_URL);
} 