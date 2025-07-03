// src/app/api/statuses/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StatusCategory from '@/models/StatusCategory';
import Status from '@/models/Status';

// GET a single category by ID
export async function GET(
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
                message: 'Category ID is required'
            }, { status: 400 });
        }

        const category = await StatusCategory.findById(id);

        if (!category) {
            return NextResponse.json({
                success: false,
                message: 'Category not found'
            }, { status: 404 });
        }

        // Get count of statuses in this category
        const count = await Status.countDocuments({ category: category.name });

        const categoryWithCount = category.toObject();
        categoryWithCount.count = count;

        return NextResponse.json({
            success: true,
            data: categoryWithCount,
            message: 'Category fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch category',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}

// PUT update a category by ID
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
                message: 'Category ID is required'
            }, { status: 400 });
        }

        const body = await request.json();
        const { name, description, isActive } = body;

        if (!name) {
            return NextResponse.json({
                success: false,
                message: 'Category name is required'
            }, { status: 400 });
        }

        // Check if the category exists
        const existingCategory = await StatusCategory.findById(id);
        if (!existingCategory) {
            return NextResponse.json({
                success: false,
                message: 'Category not found'
            }, { status: 404 });
        }

        // Check if we're renaming and if the new name already exists
        if (name !== existingCategory.name) {
            const nameExists = await StatusCategory.findOne({ name });
            if (nameExists) {
                return NextResponse.json({
                    success: false,
                    message: 'A category with this name already exists'
                }, { status: 409 });
            }
        }

        // Update the category
        const updatedCategory = await StatusCategory.findByIdAndUpdate(
            id,
            { name, description, isActive },
            { new: true }
        );

        // If the name was changed, update all statuses with the old category name
        if (name !== existingCategory.name) {
            await Status.updateMany(
                { category: existingCategory.name },
                { category: name }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedCategory,
            message: 'Category updated successfully'
        });
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to update category',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}

// DELETE a category by ID
export async function DELETE(
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
                message: 'Category ID is required'
            }, { status: 400 });
        }

        // Check if the category exists
        const category = await StatusCategory.findById(id);
        if (!category) {
            return NextResponse.json({
                success: false,
                message: 'Category not found'
            }, { status: 404 });
        }

        // Check if the category is being used by any statuses
        const statusCount = await Status.countDocuments({ category: category.name });
        if (statusCount > 0) {
            return NextResponse.json({
                success: false,
                message: `Cannot delete category "${category.name}" because it is used by ${statusCount} status(es). Please reassign or delete these statuses first.`
            }, { status: 400 });
        }

        // Delete the category
        await StatusCategory.findByIdAndDelete(id);

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to delete category',
            error: error instanceof Error ? error.message : 'An unknown error occurred'
        }, { status: 500 });
    }
}