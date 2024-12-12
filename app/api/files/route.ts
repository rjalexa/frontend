// app/api/files/route.ts
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

function generateSlug(headline: string): string {
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'data')
    console.log('Looking for files in:', dataDir)
    
    const files = await readdir(dataDir)
    console.log('Found files:', files)
    
    const articles = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(dataDir, file)
          console.log('Reading file:', filePath)
          const content = await readFile(filePath, 'utf8')
          const parsed = JSON.parse(content)
          
          // Map the array of strings to the highlights structure
          const articlesWithRequiredFields = parsed.map((article: any) => {
            return {
              ...article,
              datePublished: article.date_created,
              slug: generateSlug(article.headline),
              highlights: article.mema_highlights?.map((text: string, index: number) => ({
                highlight_text: text,
                highlight_sequence_number: index + 1
              })) || []
            };
          });
          
          articles.push(...articlesWithRequiredFields)
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError)
        }
      }
    }

    if (articles.length === 0) {
      console.log('No articles found')
      return NextResponse.json({ error: 'No articles found' }, { status: 404 })
    }

    console.log(`Found ${articles.length} articles`)
    return NextResponse.json(articles)
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to read articles', details: errorMessage },
      { status: 500 }
    );
  }
}