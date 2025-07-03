import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../lib/db";
import NotificationTemplate from "../../../../../models/notificationTemplate";

// Validate API Key middleware
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d'; // In production, this should be stored in environment variables
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  
  return true;
}

// GET handler to fetch a specific template
export async function GET(request, { params }) {
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
    
    // Get template ID from params
    const { id } = params;
    
    // Fetch template
    const template = await NotificationTemplate.findById(id).lean();
    
    if (!template) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PUT handler to update a template
export async function PUT(request, { params }) {
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
    
    // Get template ID from params
    const { id } = params;
    
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
    
    // Update template
    const updatedTemplate = await NotificationTemplate.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );
    
    if (!updatedTemplate) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Template updated successfully",
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a template
export async function DELETE(request, { params }) {
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
    
    // Get template ID from params
    const { id } = params;
    
    // Delete template
    const deletedTemplate = await NotificationTemplate.findByIdAndDelete(id);
    
    if (!deletedTemplate) {
      return NextResponse.json(
        { success: false, message: "Template not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Template deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}