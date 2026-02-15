import { NextResponse } from 'next/server';

/**
 * Simple test endpoint
 */
export async function GET() {
  const apiKey = process.env.CLIMATIQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'CLIMATIQ_API_KEY not found' },
      { status: 500 }
    );
  }

  console.log("apiKey", apiKey);

  return NextResponse.json({
    success: true,
    message: 'API key found',
    apiKeyLength: apiKey.length
  });
}
