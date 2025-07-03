import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Status from '@/models/Status';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Status as StatusType } from '@/lib/types';

const getFilenameFromUrl = (url: string): string | null => {
    try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/');
        return pathParts[pathParts.length - 1];
    } catch (error) {
        console.error('Error extracting filename from URL:', error);
        return null;
    }
};

// GET a single status by ID
export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        await dbConnect();

        // Resolve params safely
        const resolvedParams = 'params' in context && context.params instanceof Promise
            ? await context.params
            : context.params as { id: string };

        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'Status ID is required'
            }, { status: 400 });
        }

        const status = await Status.findById(id);

        if (!status) {
            return NextResponse.json({
                success: false,
                message: 'Status not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: status,
            message: 'Status fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching status:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch status',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}

// PUT update a status by ID
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        await dbConnect();

        // Resolve params safely
        const resolvedParams = 'params' in context && context.params instanceof Promise
            ? await context.params
            : context.params as { id: string };

        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'Status ID is required'
            }, { status: 400 });
        }

        const existingStatus = await Status.findById(id);

        if (!existingStatus) {
            return NextResponse.json({
                success: false,
                message: 'Status not found'
            }, { status: 404 });
        }

        // Check content type to determine how to handle the request
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('multipart/form-data')) {
            // Handle form data update (for media files)
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
            const currentMediaUrl = formData.get('currentMediaUrl') as string;
            const featured = formData.get('featured') === 'true';
            const isActive = formData.get('isActive') === 'true';

            if (!content || !category) {
                return NextResponse.json({
                    success: false,
                    message: 'Content and category are required'
                }, { status: 400 });
            }

            let mediaUrl = currentMediaUrl;
            let thumbnailUrl = existingStatus.thumbnailUrl || '';

            // Handle file upload if a new file is provided
            if (mediaFile && (type === 'image' || type === 'video')) {
                try {
                    const fileExt = mediaFile.name.split('.').pop();
                    const fileName = `${uuidv4()}.${fileExt}`;
                    const filePath = `statuses/${type}s/${fileName}`;

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

                    const { data: { publicUrl } } = supabase.storage
                        .from('frames')
                        .getPublicUrl(filePath);

                    mediaUrl = publicUrl;

                    // For videos, create a thumbnail
                    if (type === 'video') {
                        // In a real app, generate a thumbnail here
                        thumbnailUrl = `/api/placeholder/400/300`;
                    }

                    // Delete old file if there was one
                    if (currentMediaUrl) {
                        const oldMediaType = existingStatus.type;
                        const fileName = getFilenameFromUrl(currentMediaUrl);
                        if (fileName) {
                            const { error: deleteError } = await supabase.storage
                                .from('frames')
                                .remove([`statuses/${oldMediaType}s/${fileName}`]);
                            if (deleteError) {
                                console.error('Error deleting old file:', deleteError);
                            }
                        }
                    }
                } catch (uploadError) {
                    console.error('Error updating file:', uploadError);
                    return NextResponse.json({
                        success: false,
                        message: 'Failed to update media',
                        error: uploadError instanceof Error ? uploadError.message : 'Unknown error'
                    }, { status: 500 });
                }
            }

            const updateData: Partial<StatusType> = {
                content,
                type,
                category,
                tags,
                backgroundColor,
                textColor,
                fontFamily,
                fontSize,
                featured,
                isActive
            };

            if (mediaUrl) {
                updateData.mediaUrl = mediaUrl;
            }

            if (thumbnailUrl) {
                updateData.thumbnailUrl = thumbnailUrl;
            }

            const updatedStatus = await Status.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            return NextResponse.json({
                success: true,
                data: updatedStatus,
                message: 'Status updated successfully'
            });
        } else {
            // Handle JSON request for simple updates
            const body = await request.json();

            // Check if this is a usage increment
            if (body.incrementUsage) {
                const updatedStatus = await Status.findByIdAndUpdate(
                    id,
                    { $inc: { usageCount: 1 } },
                    { new: true }
                );

                return NextResponse.json({
                    success: true,
                    data: updatedStatus,
                    message: 'Status usage incremented successfully'
                });
            }

            // Regular update (without media changes)
            const { content, type, category, tags, backgroundColor, textColor,
                fontFamily, fontSize, featured, isActive } = body;

            if (!content || !category) {
                return NextResponse.json({
                    success: false,
                    message: 'Content and category are required'
                }, { status: 400 });
            }

            const updatedStatus = await Status.findByIdAndUpdate(
                id,
                {
                    content,
                    type,
                    category,
                    tags,
                    backgroundColor,
                    textColor,
                    fontFamily,
                    fontSize,
                    featured,
                    isActive
                },
                { new: true }
            );

            return NextResponse.json({
                success: true,
                data: updatedStatus,
                message: 'Status updated successfully'
            });
        }
    } catch (error) {
        console.error('Error updating status:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update status',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}

// DELETE a status by ID
export async function DELETE(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        await dbConnect();

        // Resolve params safely
        const resolvedParams = 'params' in context && context.params instanceof Promise
            ? await context.params
            : context.params as { id: string };

        const id = resolvedParams.id;

        if (!id) {
            return NextResponse.json({
                success: false,
                message: 'Status ID is required'
            }, { status: 400 });
        }

        const status = await Status.findById(id);

        if (!status) {
            return NextResponse.json({
                success: false,
                message: 'Status not found'
            }, { status: 404 });
        }

        // Delete associated media file from Supabase if it exists
        if (status.mediaUrl) {
            try {
                const type = status.type;
                const fileName = getFilenameFromUrl(status.mediaUrl);
                if (fileName) {
                    const { error: deleteError } = await supabase.storage
                        .from('frames')
                        .remove([`statuses/${type}s/${fileName}`]);
                    if (deleteError) {
                        console.error('Error deleting file:', deleteError);
                    }
                }
            } catch (deleteError) {
                console.error('Error processing file deletion:', deleteError);
            }
        }

        await Status.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Status deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting status:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete status',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}