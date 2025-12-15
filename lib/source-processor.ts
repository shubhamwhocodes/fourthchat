import * as cheerio from "cheerio"
import pdf from "pdf-parse"

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer)
    return data.text
}

export async function extractTextFromUrl(url: string): Promise<string> {
    const res = await fetch(url)
    const html = await res.text()
    const $ = cheerio.load(html)

    // Remove scripts, styles, etc
    $('script').remove()
    $('style').remove()
    $('nav').remove()
    $('footer').remove()

    return $('body').text().replace(/\s+/g, ' ').trim()
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = []
    let start = 0

    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length)
        chunks.push(text.slice(start, end))
        start += chunkSize - overlap
    }

    return chunks
}
