import Firecrawl from '@mendable/firecrawl-js';

const firecrawl = new Firecrawl({ apiKey: "fc-a1bf0485126640c7b3322538f0ef0ca2" });


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