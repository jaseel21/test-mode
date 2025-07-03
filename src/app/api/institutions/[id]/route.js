// app/api/institutions/[id]/route.js
import connectToDatabase from '../../../../lib/db';
import Institution from '../../../../models/Institution';
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseInstitution';
import { v4 as uuidv4 } from 'uuid';
// GET for fetching a single institution
export async function GET(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
    }

    const institution = await Institution.findById(id).lean();
    if (!institution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    // No need to convert Buffer to base64 anymore
    return NextResponse.json(institution, { status: 200 });
  } catch (error) {
    console.error('Error fetching institution:', error);
    return NextResponse.json(
      { error: 'Error fetching institution', details: error.message },
      { status: 500 }
    );
  }
}

// Add DELETE for completeness
export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
    }

    const deletedInstitution = await Institution.findByIdAndDelete(id);
    if (!deletedInstitution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Institution deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting institution:', error);
    return NextResponse.json(
      { error: 'Error deleting institution', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Institution ID is required' }, { status: 400 });
    }

    // Find the existing institution to get the current image URL
    const existingInstitution = await Institution.findById(id);
    if (!existingInstitution) {
      return NextResponse.json({ error: 'Institution not found' }, { status: 404 });
    }

    // Check if the request is form data or JSON
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data
      const formData = await request.formData();
      
      const name = formData.get('name');
      const description = formData.get('description');
      const established = formData.get('established');
      const location = formData.get('location');
      const category = formData.get('category');
      const factsJson = formData.get('facts');
      const facts = factsJson ? JSON.parse(factsJson) : [];
      const featuredImageFile = formData.get('featuredImage');
      const currentImageUrl = formData.get('currentImageUrl');

      // Validate required fields
      const requiredFields = ['name', 'description', 'established', 'location', 'category'];
      for (const field of requiredFields) {
        if (!formData.get(field)) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }   
          );
        }
      }

      let imageUrl = currentImageUrl || existingInstitution.featuredImage;

      // Upload image to Supabase if a new image is provided
      if (featuredImageFile && featuredImageFile.size > 0) {
        try {
          // Create a unique filename
          const fileExt = featuredImageFile.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;
          const filePath = `institutions/${fileName}`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabase.storage
            .from('frames')
            .upload(filePath, featuredImageFile, {
              cacheControl: '3600',
              upsert: false,
              contentType: featuredImageFile.type
            });

          if (uploadError) {
            throw new Error(uploadError.message);
          }

          // Get the public URL for the uploaded file
          const { data: { publicUrl } } = supabase.storage
            .from('frames')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;

          // Delete the old image if it exists
          if (existingInstitution.featuredImage) {
            // Extract filename from URL
            const oldFilePath = existingInstitution.featuredImage.split('/').pop();
            if (oldFilePath) {
              try {
                await supabase.storage
                  .from('frames')
                  .remove([`institutions/${oldFilePath}`]);
              } catch (deleteError) {
                console.error('Error deleting old image:', deleteError);
              }
            }
          }
        } catch (uploadError) {
          console.error('Error uploading to Supabase:', uploadError);
          return NextResponse.json(
            { error: 'Error uploading image', details: uploadError.message },
            { status: 500 }
          );
        }
      }

      const institutionData = {
        name,
        description,
        established,
        location,
        category,
        facts,
        featuredImage: imageUrl
      };

      const updatedInstitution = await Institution.findByIdAndUpdate(
        id,
        institutionData,
        { new: true, runValidators: true }
      );

      return NextResponse.json(updatedInstitution, { status: 200 });
    } else {
      // Handle JSON data
      const institutionData = await request.json();

      // Validate required fields
      const requiredFields = ['name', 'description', 'established', 'location', 'category'];
      for (const field of requiredFields) {
        if (!institutionData[field]) {
          return NextResponse.json(
            { error: `Missing required field: ${field}` },
            { status: 400 }   
          );
        }
      }

      // Keep the existing image URL if a new one is not provided
      if (!institutionData.featuredImage) {
        institutionData.featuredImage = existingInstitution.featuredImage;
      }

      const updatedInstitution = await Institution.findByIdAndUpdate(
        id,
        institutionData,
        { new: true, runValidators: true }
      );

      return NextResponse.json(updatedInstitution, { status: 200 });
    }
  } catch (error) {
    console.error('Error updating institution:', error);
    return NextResponse.json(
      { error: 'Error updating institution', details: error.message },
      { status: 500 }
    );
  }
}