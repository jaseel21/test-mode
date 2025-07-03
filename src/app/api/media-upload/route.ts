// src/app/api/media-upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as 'image' | 'video' || 'image';

        if (!file) {
            return NextResponse.json({
                success: false,
                message: "No file provided"
            }, { status: 400 });
        }

        // Generate a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const folderPath = type === 'video' ? 'statuses/videos' : 'statuses/images';
        const filePath = `${folderPath}/${fileName}`;

        // Upload file to Supabase Storage
        const { error } = await supabase.storage
            .from('frames')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            });

        if (error) {
            console.error('Error uploading to Supabase:', error);
            // For development, return success anyway with a placeholder
            return NextResponse.json({
                success: false,
                message: "Failed to upload file",
                error: error.message
            }, { status: 500 });
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('frames')
            .getPublicUrl(filePath);

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: fileName
        });
    } catch (error) {
        console.error('Error handling upload:', error);
        return NextResponse.json({
            success: false,
            message: "Failed to upload file",
            error: error instanceof Error ? error.message : "An unknown error occurred"
        }, { status: 500 });
    }
}