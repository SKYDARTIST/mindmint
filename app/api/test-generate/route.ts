import { NextRequest, NextResponse } from 'next/server';
import { generateContentAction } from '../../actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, inputText, layout } = body;

    if (!mode || !inputText) {
      return NextResponse.json(
        { error: 'Missing required fields: mode and inputText' },
        { status: 400 }
      );
    }

    // Use the same server action with rate limiting
    const result = await generateContentAction(mode, inputText, layout);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}