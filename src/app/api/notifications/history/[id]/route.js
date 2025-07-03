import { NextResponse } from "next/server";
import connectToDatabase from "../../../../../lib/db";
import NotificationHistory from "../../../../../models/notificationHistory";

// Validate API Key middleware
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d'; // In production, this should be stored in environment variables
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  
  return true;
}

// GET handler to fetch a specific notification
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
    
    // Get notification ID from params
    const { id } = params;
    
    // Fetch notification
    const notification = await NotificationHistory.findById(id).lean();
    
    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }
    
    // Add formatted date for display
    const displayDate = notification.sentAt 
      ? new Date(notification.sentAt).toLocaleString() 
      : notification.scheduledFor 
        ? `Scheduled for ${new Date(notification.scheduledFor).toLocaleString()}`
        : 'Not sent';
        
    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        displayDate
      }
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a notification
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
    
    // Get notification ID from params
    const { id } = params;
    
    // Delete notification
    const deletedNotification = await NotificationHistory.findByIdAndDelete(id);
    
    if (!deletedNotification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}