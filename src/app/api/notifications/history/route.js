import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import NotificationHistory from "../../../../models/notificationHistory";

// Validate API Key middleware
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d'; // In production, this should be stored in environment variables
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  
  return true;
}

// GET handler to fetch notification history
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
    const search = searchParams.get('search') || '';
    const channel = searchParams.get('channel') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'sentAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { body: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (channel) {
      query.channel = channel;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Date range filter
    if (dateFrom || dateTo) {
      query.sentAt = {};
      
      if (dateFrom) {
        query.sentAt.$gte = new Date(dateFrom);
      }
      
      if (dateTo) {
        // Set time to end of day
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.sentAt.$lte = endDate;
      }
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Set sort order
    const sort = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1
    };
    
    // Count total matching documents
    const totalItems = await NotificationHistory.countDocuments(query);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);
    
    // Fetch notifications with pagination and sorting
    const notifications = await NotificationHistory.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Add formatted date for display
    const formattedNotifications = notifications.map(notification => {
      const displayDate = notification.sentAt 
        ? new Date(notification.sentAt).toLocaleString() 
        : notification.scheduledFor 
          ? `Scheduled for ${new Date(notification.scheduledFor).toLocaleString()}`
          : 'Not sent';
          
      return {
        ...notification,
        displayDate
      };
    });
    
    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      totalItems,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}