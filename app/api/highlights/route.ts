// frontend/app/api/highlights/route.ts
import { NextRequest, NextResponse } from 'next/server';

const WEAVIATE_HOST = 'localhost';
const WEAVIATE_PORT = '8080';
const COLLECTION_NAME = 'Delta_highlights';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const articleId = searchParams.get('articleId');

  if (!articleId) {
    return NextResponse.json({ error: 'articleId is required' }, { status: 400 });
  }

  try {
    const query = {
      query: {
        class: COLLECTION_NAME,
        fields: ['highlight_text', 'highlight_sequence_number'],
        where: {
          operator: 'Equal',
          path: ['highlight_article_mema_id'],
          valueString: articleId
        },
        sort: [{ path: ['highlight_sequence_number'], order: 'asc' }]
      }
    };

    const response = await fetch(`http://${WEAVIATE_HOST}:${WEAVIATE_PORT}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      throw new Error(`Weaviate query failed: ${response.statusText}`);
    }

    const data = await response.json();
    const highlights = data.data[COLLECTION_NAME] || [];

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json(
      { error: `Failed to fetch highlights: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}