import { NextRequest } from 'next/server';
import { scrape } from '@/lib/firecrawl';
import { streamExtraction } from '@/lib/openai';


export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json();

        if (!query) {
            return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400 });
        }

        // Scrape the content (this is still the slow part)
        const scrapeResult = await scrape(query);

        // Extract products from the scraped content with streaming
        const result = await streamExtraction(scrapeResult, query);

        return result.toTextStreamResponse();
    } catch (error) {
        console.error('Error in stream endpoint:', error);
        return new Response(JSON.stringify({
            error: 'Failed to stream extraction',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), { status: 500 });
    }
}
