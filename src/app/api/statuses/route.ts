import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Status from '@/models/Status';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Status as StatusType } from '@/lib/types';
import { FilterQuery } from 'mongoose';

// GET all statuses with optional filters
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('activeOnly') === 'true';
        const category = searchParams.get('category');
        const tag = searchParams.get('tag');
        const featured = searchParams.get('featured') === 'true';
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 0;

        // Construct the query based on parameters
        const query: FilterQuery<StatusType> = {};

        if (activeOnly) query.isActive = true;
        if (category) query.category = category;
        if (tag) query.tags = tag;
        if (featured) query.featured = true;

        let statusQuery = Status.find(query).sort({ createdAt: -1 });

        if (limit > 0) {
            statusQuery = statusQuery.limit(limit);
        }

        const statuses = await statusQuery;

        return NextResponse.json({
            success: true,
            data: statuses,
            message: 'Statuses fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching statuses:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch statuses',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}

// POST create a new status
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const content = formData.get('content') as string;
        const type = formData.get('type') as 'text' | 'image' | 'video';
        const category = formData.get('category') as string;
        const tags = JSON.parse(formData.get('tags') as string || '[]');
        const backgroundColor = formData.get('backgroundColor') as string;
        const textColor = formData.get('textColor') as string;
        const fontFamily = formData.get('fontFamily') as string;
        const fontSize = parseInt(formData.get('fontSize') as string || '24');
        const mediaFile = formData.get('mediaFile') as File | null;
        const featured = formData.get('featured') === 'true';
        const isActive = formData.get('isActive') === 'true';

        if (!content || !category) {
            return NextResponse.json({
                success: false,
                message: 'Content and category are required'
            }, { status: 400 });
        }

        let mediaUrl = '';
        let thumbnailUrl = '';

        // Handle file upload to Supabase if it's an image or video type
        if (mediaFile && (type === 'image' || type === 'video')) {
            try {
                // Create a unique filename
                const fileExt = mediaFile.name.split('.').pop();
                const fileName = `${uuidv4()}.${fileExt}`;
                const filePath = `statuses/${type}s/${fileName}`;

                // Upload to Supabase Storage
                const { error: uploadError } = await supabase.storage
                    .from('frames')
                    .upload(filePath, mediaFile, {
                        cacheControl: '3600',
                        upsert: false,
                        contentType: mediaFile.type
                    });

                if (uploadError) {
                    throw new Error(uploadError.message);
                }

                // Get the public URL for the uploaded file
                const { data: { publicUrl } } = supabase.storage
                    .from('frames')
                    .getPublicUrl(filePath);

                mediaUrl = publicUrl;

                // For videos, create a thumbnail
                if (type === 'video') {
                    // In a real app, you would generate a thumbnail here
                    // For this example, we'll just use a placeholder
                    thumbnailUrl = `/api/placeholder/400/300`;
                }
            } catch (uploadError) {
                console.error('Error uploading file to Supabase:', uploadError);
                return NextResponse.json({
                    success: false,
                    message: 'Failed to upload media to Supabase',
                    error: uploadError instanceof Error ? uploadError.message : 'An unknown error occurred'
                }, { status: 500 });
            }
        }

        // Save status data to MongoDB
        await dbConnect();

        const newStatus: Partial<StatusType> = {
            content,
            type,
            category,
            tags,
            backgroundColor,
            textColor,
            fontFamily,
            fontSize,
            featured: featured !== undefined ? featured : false,
            isActive: isActive !== undefined ? isActive : true
        };

        if (mediaUrl) {
            newStatus.mediaUrl = mediaUrl;
        }

        if (thumbnailUrl) {
            newStatus.thumbnailUrl = thumbnailUrl;
        }

        const status = await Status.create(newStatus);

        return NextResponse.json({
            success: true,
            data: status,
            message: 'Status created successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating status:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to create status',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}