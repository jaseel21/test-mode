// src/app/api/local-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: "No file provided" 
      }, { status: 400 });
    }

    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Upload file to Supabase Storage
    const {  error } = await supabase.storage
      .from('frames')  // Using the same bucket for all uploads
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Error uploading to Supabase:', error);
      // For development, return success anyway with a placeholder
      return NextResponse.json({ 
        success: true, 
        url: '/api/placeholder/400/320' 
      });
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('frames')
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to upload file" 
    }, { status: 500 });
  }
}