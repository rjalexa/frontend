// app/api/files/route.ts
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), '..', 'data')
    console.log('Looking for files in:', dataDir)  // Debug log
    
    const files = await readdir(dataDir)
    console.log('Found files:', files)  // Debug log
    
    const articles = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const filePath = path.join(dataDir, file)
          console.log('Reading file:', filePath)  // Debug log
          const content = await readFile(filePath, 'utf8')
          const parsed = JSON.parse(content)
          articles.push(...parsed)
        } catch (fileError) {
          console.error(`Error processing file ${file}:`, fileError)
        }
      }
    }

    if (articles.length === 0) {
      console.log('No articles found')  // Debug log
      return NextResponse.json({ error: 'No articles found' }, { status: 404 })
    }

    console.log(`Found ${articles.length} articles`)  // Debug log
    return NextResponse.json(articles)
    
  } catch (error) {
    console.error('API Error:', error)  // Debug log
    return NextResponse.json(
      { error: 'Failed to read articles', details: error.message }, 
      { status: 500 }
    )
  }
}
