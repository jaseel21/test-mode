// src/app/api/statuses/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StatusCategory from '@/models/StatusCategory';
import Status from '@/models/Status';

// GET all categories with counts
export async function GET() {
    try {
        await dbConnect();

        // Get all categories
        const categories = await StatusCategory.find().sort({ name: 1 });

        // Get count of statuses in each category
        const categoryCounts = await Status.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Create a map of category name to count
        const countMap = new Map();
        categoryCounts.forEach(item => {
            countMap.set(item._id, item.count);
        });

        // Add count to each category
        const categoriesWithCount = categories.map(category => {
            const categoryObj = category.toObject();
            categoryObj.count = countMap.get(category.name) || 0;
            return categoryObj;
        });

        return NextResponse.json({
            success: true,
            data: categoriesWithCount,
            message: 'Categories fetched successfully'
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch categories",
                error: error instanceof Error ? error.message : "An unknown error occurred"
            },
            { status: 500 }
        );
    }
}

// POST create a new category
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, isActive } = body;

        if (!name) {
            return NextResponse.json({
                success: false,
                message: "Category name is required"
            }, { status: 400 });
        }

        await dbConnect();

        // Check if category already exists
        const existingCategory = await StatusCategory.findOne({ name });
        if (existingCategory) {
            return NextResponse.json({
                success: false,
                message: "A category with this name already exists"
            }, { status: 409 });
        }

        const category = await StatusCategory.create({
            name,
            description,
            isActive: isActive !== undefined ? isActive : true
        });

        return NextResponse.json({
            success: true,
            data: category,
            message: 'Category created successfully'
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create category",
                error: error instanceof Error ? error.message : "An unknown error occurred"
            },
            { status: 500 }
        );
    }
}