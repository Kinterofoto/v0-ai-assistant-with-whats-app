import { Output, generateText, streamObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export interface Product {
    name: string;
    url: string;
}

const productSchema = z.object({
    products: z.array(
        z.object({
            name: z.string().describe('The name or title of the product'),
            url: z.string().describe('The URL link to the product page')
        })
    )
});

export async function extractContent(data: string, keyword: string): Promise<Product[]> {
    //console.log(data);

    const { output } = await generateText({
        model: openai('gpt-4o'),

        prompt: `Extract the top 10 related products with their URLs from the following content related to the keyword: ${keyword}.
        For each product, provide its name and the full URL in a list.

        Content:
        ${data}`,
        output: Output.object({
            schema: productSchema,
        }),
    });

    return output.products;
}

export async function streamExtraction(data: string, keyword: string) {
    return streamObject({
        model: openai('gpt-4o'),
        schema: productSchema,
        prompt: `Extract the top 10 related products with their URLs from the following content related to the keyword: ${keyword}.
        For each product, provide its name and the full URL in a list.

        Content:
        ${data}`,
    });
}