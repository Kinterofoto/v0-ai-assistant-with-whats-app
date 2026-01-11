import { scrape } from "@/lib/firecrawl";
import { extractContent } from "@/lib/openai";

scrape("pokemon").then((data) => {
    extractContent(data, "pokemon").then(console.log).catch(console.error)
}).catch(console.error)