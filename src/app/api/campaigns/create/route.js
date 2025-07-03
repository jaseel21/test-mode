// src/app/api/campaigns/create/route.js - UPDATED
import { NextResponse } from 'next/server';
import connectToDatabase from '../../../../lib/db';
import Campaign from '../../../../models/Campaign';
import { getServerSession } from 'next-auth';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    console.log('Starting campaign creation...');
    
    await connectToDatabase();
    console.log('Database connected successfully');

    // Get session (authentication check)
    const session = await getServerSession();
    console.log('Session:', session);

    const fallbackUserId = '65844ea588d90515b80e0dfb';
    console.log('Fallback User ID for testing:', fallbackUserId);

    if (!session || !session.user || !session.user.id) {
      console.warn('No valid session found, using fallback user ID for testing');
    }

    // Handle form data
    const formData = await req.formData();
    console.log('Received FormData:', Array.from(formData.entries()).map(([k, v]) => `${k}: ${v}`));

    // Extract fields
    const fields = {
      name: formData.get('name'),
      type: formData.get('type'),
      goal: formData.get('goal'),
      area: formData.get('area'),
      rate: formData.get('rate'),
      isInfinite: formData.get('isInfinite') === 'true',
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      notes: formData.get('notes'),
    };

    console.log('Extracted Fields:', fields);

    // Validate required fields
    if (!fields.name || !fields.type || 
        (!fields.goal && !fields.isInfinite) || !fields.description || 
        !fields.startDate || !fields.endDate) {
      console.error('Validation failed - Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert and validate goal if not infinite
    if (!fields.isInfinite) {
      fields.goal = parseInt(fields.goal, 10);
      if (isNaN(fields.goal) || fields.goal < 1) {
        console.error('Validation failed - Invalid goal value');
        return NextResponse.json(
          { error: 'Invalid goal value' },
          { status: 400 }
        );
      }
    } else {
      fields.goal = undefined; // Clear goal if infinite
    }

    // Convert and validate rate and area for fixedamount
    if (fields.type === 'fixedamount') {
      if (!fields.area || fields.area.trim() === '') {
        console.error('Validation failed - Area is required for fixed amount campaigns');
        return NextResponse.json(
          { error: 'Area is required for fixed amount campaigns' },
          { status: 400 }
        );
      }
      fields.rate = parseInt(fields.rate, 10);
      if (isNaN(fields.rate) || fields.rate < 1) {
        console.error('Validation failed - Invalid rate value');
        return NextResponse.json(
          { error: 'Invalid rate value' },
          { status: 400 }
        );
      }
    } else {
      fields.area = undefined; // Clear if not fixedamount
      fields.rate = undefined; // Clear if not fixedamount
    }

    // Validate dates
    fields.startDate = new Date(fields.startDate);
    fields.endDate = new Date(fields.endDate);
    if (fields.startDate >= fields.endDate) {
      console.error('Validation failed - End date must be after start date');
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Handle image upload to Supabase Storage
    const featuredImage = formData.get('featuredImage');
    let imageUrl = null;

    if (featuredImage && featuredImage instanceof Blob) {
      console.log('Processing image upload to Supabase...');
      
      try {
        // Create a unique filename
        const fileExt = featuredImage.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `campaigns/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('frames')
          .upload(filePath, featuredImage, {
            cacheControl: '3600',
            upsert: false,
            contentType: featuredImage.type
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('frames')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
        console.log('Image uploaded to Supabase:', imageUrl);
      } catch (uploadError) {
        console.error('Error uploading to Supabase:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image', details: uploadError.message },
          { status: 500 }
        );
      }
    }

    // Create campaign object with all fields
    const campaign = new Campaign({
      ...fields,
      featuredImageUrl: imageUrl, // Store the URL instead of the binary data
      createdBy: session?.user?.id || fallbackUserId,
      currentAmount: 0,
      status: formData.get('status') || 'draft',
    });

    console.log('Saving campaign to database...');
    await campaign.save();
    console.log('Campaign saved successfully:', campaign._id);

    return NextResponse.json(
      {
        message: 'Campaign created successfully',
        campaignId: campaign._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating campaign:', error, error.stack);
    return NextResponse.json(
      {
        error: 'Failed to create campaign',
        details: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN'
      },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};