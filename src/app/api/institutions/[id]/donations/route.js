// app/api/institutions/[id]/donations/route.js
import connectToDatabase from '../../../../../lib/db'; // Adjust path
import Donation from '../../../../../models/Donation'; // Adjust path
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params; // Get institution ID from URL
    if (!id) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
    }

    const donations = await Donation.find({ instituteId: id }).lean();
    console.log(`Fetched donations for instituteId ${id}:`, donations);

    if (!donations || donations.length === 0) {
      return NextResponse.json({ message: 'No donations found for this institution' }, { status: 200 });
    }

    return NextResponse.json(donations, { status: 200 });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Error fetching donations', details: error.message },
      { status: 500 }
    );
  }
}