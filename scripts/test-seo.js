#!/usr/bin/env node

/**
 * SEO Test Script
 * Tests for common SEO issues like redirects, canonical tags, and proper status codes
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const BASE_URL = 'https://gestionatusmarcas.com';
const TEST_PATHS = [
  '/',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/sitemap',
  '/dashboard', // Should redirect or return 404
  '/api/marcas', // Should be noindex
  '/nonexistent-page', // Should return 404
];

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'SEO-Test-Bot/1.0',
        ...options.headers,
      },
      ...options,
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          url: url,
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

function extractCanonicalUrl(html) {
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return canonicalMatch ? canonicalMatch[1] : null;
}

function extractRobotsTag(html) {
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  return robotsMatch ? robotsMatch[1] : null;
}

function checkRedirect(response) {
  const location = response.headers.location;
  if (location) {
    return {
      isRedirect: true,
      statusCode: response.statusCode,
      location: location,
      isPermanent: response.statusCode === 301,
    };
  }
  return { isRedirect: false };
}

async function testPath(path) {
  console.log(`\n🔍 Testing: ${path}`);
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest(`${BASE_URL}${path}`);
    const redirect = checkRedirect(response);
    
    console.log(`Status Code: ${response.statusCode}`);
    
    if (redirect.isRedirect) {
      console.log(`⚠️  REDIRECT DETECTED: ${redirect.statusCode} → ${redirect.location}`);
      console.log(`   ${redirect.isPermanent ? '✅ Permanent (301)' : '⚠️  Temporary (302)'}`);
      
      // Follow redirect
      if (redirect.location) {
        console.log(`   Following redirect to: ${redirect.location}`);
        const redirectResponse = await makeRequest(redirect.location);
        console.log(`   Final Status: ${redirectResponse.statusCode}`);
      }
    } else {
      const canonical = extractCanonicalUrl(response.data);
      const robots = extractRobotsTag(response.data);
      
      console.log(`Canonical URL: ${canonical || '❌ Not found'}`);
      console.log(`Robots Tag: ${robots || '❌ Not found'}`);
      
      if (path === '/') {
        if (canonical === BASE_URL || canonical === `${BASE_URL}/`) {
          console.log('✅ Homepage canonical is correct');
        } else {
          console.log('❌ Homepage canonical is incorrect');
        }
      }
      
      if (path.startsWith('/dashboard') || path.startsWith('/api/')) {
        if (robots && robots.includes('noindex')) {
          console.log('✅ Private page correctly marked as noindex');
        } else {
          console.log('❌ Private page should be noindex');
        }
      }
      
      if (response.statusCode === 404) {
        console.log('✅ 404 page returned correctly');
      }
    }
    
  } catch (error) {
    console.log(`❌ Error testing ${path}: ${error.message}`);
  }
}

async function testSitemap() {
  console.log('\n🗺️  Testing Sitemap');
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest(`${BASE_URL}/sitemap.xml`);
    
    if (response.statusCode === 200) {
      console.log('✅ Sitemap accessible');
      
      // Check if it's valid XML
      if (response.data.includes('<?xml') && response.data.includes('<urlset')) {
        console.log('✅ Sitemap is valid XML');
        
        // Count URLs
        const urlMatches = response.data.match(/<url>/g);
        console.log(`📊 Sitemap contains ${urlMatches ? urlMatches.length : 0} URLs`);
      } else {
        console.log('❌ Sitemap is not valid XML');
      }
    } else {
      console.log(`❌ Sitemap returned status ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Error testing sitemap: ${error.message}`);
  }
}

async function testRobotsTxt() {
  console.log('\n🤖 Testing Robots.txt');
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest(`${BASE_URL}/robots.txt`);
    
    if (response.statusCode === 200) {
      console.log('✅ Robots.txt accessible');
      
      if (response.data.includes('Sitemap:')) {
        console.log('✅ Sitemap reference found in robots.txt');
      } else {
        console.log('❌ Sitemap reference missing in robots.txt');
      }
      
      if (response.data.includes('Disallow: /api/')) {
        console.log('✅ API routes properly disallowed');
      } else {
        console.log('❌ API routes not disallowed');
      }
    } else {
      console.log(`❌ Robots.txt returned status ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Error testing robots.txt: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting SEO Tests for Gestiona tus Marcas');
  console.log('='.repeat(60));
  
  for (const path of TEST_PATHS) {
    await testPath(path);
  }
  
  await testSitemap();
  await testRobotsTxt();
  
  console.log('\n✅ SEO Tests completed!');
  console.log('\n📋 Summary of fixes implemented:');
  console.log('• Custom 404 page with proper status codes');
  console.log('• Global error handling page');
  console.log('• Proper canonical tags on all pages');
  console.log('• Robots.txt with appropriate directives');
  console.log('• Enhanced sitemap with priorities and change frequencies');
  console.log('• Middleware for redirect handling and security headers');
  console.log('• Structured data for better search engine understanding');
  console.log('• SEO utility functions for consistency');
}

runTests().catch(console.error); 