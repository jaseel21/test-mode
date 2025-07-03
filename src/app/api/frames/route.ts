import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Frame from '@/models/Frame';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Frame as FrameType } from '@/lib/types';

// GET all frames with optional active filter
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        
        // Check if there's a query parameter for active frames
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';

        // Construct the query based on the activeOnly parameter
        const query = activeOnly ? { isActive: true } : {};

        const frames = await Frame.find(query).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: frames,
            message: 'Frames fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching frames:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch frames',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}

// POST create a new frame
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const frameImage = formData.get('frameImage') as File;
        const name = formData.get('name') as string;
        const dimensions = JSON.parse(formData.get('dimensions') as string);
        const placementCoords = JSON.parse(formData.get('placementCoords') as string);
        const textSettings = JSON.parse(formData.get('textSettings') as string);
        const isActive = formData.get('isActive') === 'true'; // Optional active status

        if (!frameImage || !name) {
            return NextResponse.json({
                success: false,
                message: 'Frame image and name are required'
            }, { status: 400 });
        }

        // Handle file upload to Supabase
        let imageUrl = '';

        try {
            // Create a unique filename
            const fileExt = frameImage.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `frames/${fileName}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('frames')
                .upload(filePath, frameImage, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: frameImage.type
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
            console.error('Error uploading file to Supabase:', uploadError);
            return NextResponse.json({
                success: false,
                message: 'Failed to upload image to Supabase',
                error: uploadError instanceof Error ? uploadError.message : 'An unknown error occurred'
            }, { status: 500 });
        }

        // Save frame data to MongoDB
        await dbConnect();

        const newFrame: FrameType = {
            name,
            imageUrl,
            dimensions,
            placementCoords,
            textSettings,
            isActive: isActive !== undefined ? isActive : true // Default to true if not specified
        };

        const frame = await Frame.create(newFrame);

        return NextResponse.json({
            success: true,
            data: frame,
            message: 'Frame created successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating frame:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to create frame',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}