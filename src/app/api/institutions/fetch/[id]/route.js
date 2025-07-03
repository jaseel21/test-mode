// app/api/institutions/[id]/route.js
import connectToDatabase from '../../../../../lib/db'; // Adjust path as needed
import Institution from '../../../../../models/Institution'; // Adjust path as needed
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    await connectToDatabase();

    const { id } = params; // Get the id from the dynamic route parameter

    if (!id) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    // Fetch the institution by ID
    const institution = await Institution.findById(id).lean();
    
    if (!institution) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 }
      );
    }

    // // Convert featuredImage Buffer to Base64 data URL
    // let imageUrl = null;
    // if (institution.featuredImage) {
    //   const base64Image = institution.featuredImage.toString('base64');
    //   imageUrl = `data:image/jpeg;base64,${base64Image}`; // Assuming JPEG, adjust if needed
    // }

    // // Prepare the response data
    // const formattedInstitution = {
    //   ...institution,
    //   featuredImage: imageUrl,
    // };

    return NextResponse.json(institution, { status: 200 });
  } catch (error) {
    console.error('Error fetching institution:', error);
    return NextResponse.json(
      { error: 'Error fetching institution', details: error.message },
      { status: 500 }
    );
  }
}