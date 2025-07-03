import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { width: string; height: string } }
) {
  try {
    const paramsWidth = params.width;
    const paramsHeight = params.height;
    
    const width = parseInt(paramsWidth);
    const height = parseInt(paramsHeight);
    
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || 'Placeholder';
    
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.1)" stroke="#ccc" stroke-width="2" rx="5"/>
        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#888" text-anchor="middle" dominant-baseline="middle">${name}</text>
      </svg>
    `;
    
    return new NextResponse(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return NextResponse.json(
      { error: 'Failed to generate placeholder image' },
      { status: 500 }
    );
  }
}