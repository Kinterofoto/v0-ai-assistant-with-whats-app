import { NextRequest, NextResponse } from 'next/server';
import { scrape } from '@/lib/firecrawl';
import { extractContent } from '@/lib/openai';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('output_busqueda');

    if (!query) {
      return NextResponse.json(
        { error: 'Missing output_busqueda parameter' },
        { status: 400 }
      );
    }

    // Scrape the content
    const scrapeResult = await scrape(query);

    // Extract products from the scraped content
    const products = await extractContent(scrapeResult, query);

    return NextResponse.json({
      success: true,
      query,
      products,
      count: products.length
    });
  } catch (error) {
    console.error('Error in scrape endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to scrape and extract products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
