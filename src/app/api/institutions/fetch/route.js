// app/api/institutions/fetch/route.js
import connectToDatabase from '../../../../lib/db';
import Institution from '../../../../models/Institution';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectToDatabase();
    
    const institutions = await Institution.find({}).lean();

    // No need to convert Buffer to Base64 anymore as we're storing URLs
    // Just return the institutions as they are
    return NextResponse.json(institutions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching institutions', details: error.message },
      { status: 500 }
    );
  }
}