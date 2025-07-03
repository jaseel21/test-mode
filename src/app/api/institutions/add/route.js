// app/api/institutions/add/route.js
import connectToDatabase from '../../../../lib/db';
import Institution from '../../../../models/Institution';
import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseInstitution';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const formData = await req.formData();
    
    // Parse JSON data
    const name = formData.get('name');
    const description = formData.get('description');
    const established = formData.get('established');
    const location = formData.get('location');
    const category = formData.get('category');
    const factsJson = formData.get('facts');
    const facts = factsJson ? JSON.parse(factsJson) : [];
    
    // Get image file
    const featuredImageFile = formData.get('featuredImage');

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

    let imageUrl = null;

    // Upload image to Supabase if provided
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

    const institution = new Institution(institutionData);
    const savedInstitution = await institution.save();

    return NextResponse.json(savedInstitution, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creating institution', details: error.message },
      { status: 500 }
    );
  }
}