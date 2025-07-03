import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import NotificationTemplate from "../../../../models/notificationTemplate";

// Validate API Key middleware
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d'; // In production, this should be stored in environment variables
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  
  return true;
}

// GET handler to fetch templates
export async function GET(request) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid API key" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    
    // Build query
    const query = {};
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
      
      // Add title and subject search if search query exists
      if (type === 'push' || !type) {
        query.$or.push({ title: { $regex: search, $options: 'i' } });
      }
      
      if (type === 'email' || !type) {
        query.$or.push({ subject: { $regex: search, $options: 'i' } });
      }
    }
    
    // Fetch templates
    const templates = await NotificationTemplate.find(query)
      .sort({ updatedAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// POST handler to create a new template
export async function POST(request) {
  try {
    // Validate API key
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid API key" },
        { status: 401 }
      );
    }

    // Connect to MongoDB
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.type || !body.body) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Validate type-specific fields
    if (body.type === 'push' && !body.title) {
      return NextResponse.json(
        { success: false, message: "Push notifications require a title" },
        { status: 400 }
      );
    }
    
    if (body.type === 'email' && !body.subject) {
      return NextResponse.json(
        { success: false, message: "Email notifications require a subject" },
        { status: 400 }
      );
    }
    
    // Create a new template
    const template = new NotificationTemplate(body);
    await template.save();
    
    return NextResponse.json({
      success: true,
      message: "Template created successfully",
      template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}