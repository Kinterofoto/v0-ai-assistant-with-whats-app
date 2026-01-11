import Firecrawl from '@mendable/firecrawl-js';

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

export async function scrape(input: string): Promise<string> {
  const response = await firecrawl.scrape(`https://listado.mercadolibre.com.pe/${input}`, {
      onlyMainContent: true,
      maxAge: 172800000,
      proxy: 'stealth',
      parsers: ['pdf'],
      formats: ['markdown'],
      waitFor: 3000
    });

  return response.markdown!;
}