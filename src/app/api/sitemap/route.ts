// app/api/sitemap/route.ts
import { NextResponse } from 'next/server';
import { query } from '../../../../lib/neon';

export async function GET() {
  try {
    // Fetch all product IDs
    const products = await query('SELECT id FROM products');

    // Base static URLs
    const urls = [
      { loc: 'https://shophousealain.com/', changefreq: 'weekly', priority: 1.0 },
      { loc: 'https://shophousealain.com/products', changefreq: 'weekly', priority: 0.9 },
      { loc: 'https://shophousealain.com/about', changefreq: 'monthly', priority: 0.8 },
      // Add other static pages if needed
    ];

    // Add each product dynamically
    const productUrls = products.rows.map((p: any) => ({
      loc: `https://shophousealain.com/products/${p.id}`,
      changefreq: 'weekly',
      priority: 0.7,
    }));

    const allUrls = [...urls, ...productUrls];

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `
  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('')}
</urlset>`;

    return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } });
  } catch (error) {
    console.error('Failed to generate sitemap:', error);
    return NextResponse.json({ error: 'Failed to generate sitemap' }, { status: 500 });
  }
}
