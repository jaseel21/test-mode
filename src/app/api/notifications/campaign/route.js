import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "../../../../lib/db";
import NotificationHistory from "../../../../models/notificationHistory";
import { Expo } from "expo-server-sdk";

// Validate API Key middleware
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d'; // In production, this should be stored in environment variables
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  
  return true;
}

// POST handler to send campaign notifications
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
    if (!body.campaignName || !body.title || !body.body || !body.userGroups) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // User groups must be an array
    if (!Array.isArray(body.userGroups) || body.userGroups.length === 0) {
      return NextResponse.json(
        { success: false, message: "userGroups must be a non-empty array" },
        { status: 400 }
      );
    }
    
    // Create campaign notification data
    const campaignData = {
      title: body.title,
      body: body.body,
      imageUrl: body.imageUrl || null,
      channel: 'push', // Campaign notifications are push notifications
      status: body.scheduledFor ? 'Scheduled' : 'Pending',
      templateId: body.templateId || null,
      metaData: {
        campaignName: body.campaignName,
        campaignId: body.campaignId || null,
        deepLink: body.deepLink || null,
        screen: body.screen || 'Campaign',
        additionalData: body.additionalData || {}
      }
    };
    
    // Add scheduling information if provided
    if (body.scheduledFor) {
      campaignData.scheduledFor = new Date(body.scheduledFor);
    } else {
      campaignData.sentAt = new Date();
    }
    
    // Create notification records for each user group
    const notificationRecords = [];
    const sendResults = [];
    
    for (const userGroup of body.userGroups) {
      // Create notification history record for this user group
      const notificationData = { ...campaignData, userGroup };
      const notificationHistory = new NotificationHistory(notificationData);
      await notificationHistory.save();
      
      notificationRecords.push(notificationHistory);
      
      // If scheduled for later, continue to next group
      if (body.scheduledFor) {
        continue;
      }
      
      // Send push notification to this user group
      const result = await sendCampaignPushNotification(notificationHistory, body);
      sendResults.push(result);
    }
    
    // If scheduled, return success response
    if (body.scheduledFor) {
      return NextResponse.json({
        success: true,
        message: `Campaign scheduled successfully for ${body.userGroups.length} user groups`,
        scheduledFor: body.scheduledFor,
        notifications: notificationRecords
      });
    }
    
    return NextResponse.json({
      success: true,
      message: `Campaign notifications sent to ${body.userGroups.length} user groups`,
      notifications: notificationRecords,
      results: sendResults
    });
  } catch (error) {
    console.error('Error sending campaign notifications:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Function to send campaign push notifications
async function sendCampaignPushNotification(notificationRecord, campaignData) {
  try {
    // Update notification status to sending
    notificationRecord.status = 'Sending';
    await notificationRecord.save();
    
    // Fetch push tokens based on user group
    let pushTokens = [];
    const db = mongoose.connection.db;
    
    if (notificationRecord.userGroup === 'all') {
      // Fetch all tokens from PushTokens collection
      // Fetch all tokens from PushTokens collection
      const tokenDocs = await db.collection("PushTokens")
        .find({}, { projection: { expoPushToken: 1, _id: 0 } })
        .toArray();
      
      pushTokens = tokenDocs
        .map(doc => doc.expoPushToken)
        .filter(token => token && Expo.isExpoPushToken(token));
    } else if (notificationRecord.userGroup === 'subscribers') {
      // Fetch tokens from SubscriberTokens collection
      const tokenDocs = await db.collection("SubscriberTokens")
        .find({}, { projection: { expoPushToken: 1, _id: 0 } })
        .toArray();
      
      pushTokens = tokenDocs
        .map(doc => doc.expoPushToken)
        .filter(token => token && Expo.isExpoPushToken(token));
    } else if (notificationRecord.userGroup === 'boxholders') {
      // Fetch tokens from BoxHoldersTokens collection
      const tokenDocs = await db.collection("BoxHoldersTokens")
        .find({}, { projection: { expoPushToken: 1, _id: 0 } })
        .toArray();
      
      pushTokens = tokenDocs
        .map(doc => doc.expoPushToken)
        .filter(token => token && Expo.isExpoPushToken(token));
    } else if (notificationRecord.userGroup === 'custom' && campaignData.customTokens) {
      // Use custom list of tokens
      pushTokens = campaignData.customTokens.filter(token => token && Expo.isExpoPushToken(token));
    }
    
    // If no valid tokens found, update record and return
    if (!pushTokens.length) {
      notificationRecord.status = 'Failed';
      notificationRecord.sentCount = 0;
      notificationRecord.failedCount = 0;
      notificationRecord.deliveredCount = 0;
      await notificationRecord.save();
      
      return {
        userGroup: notificationRecord.userGroup,
        success: false,
        message: "No valid push tokens found"
      };
    }
    
    // Update notification record with recipients count
    notificationRecord.sentCount = pushTokens.length;
    notificationRecord.recipients = pushTokens;
    await notificationRecord.save();
    
    // Initialize Expo SDK
    const expo = new Expo();
    
    // Create messages
    const messages = pushTokens.map(token => ({
      to: token,
      sound: "default",
      title: notificationRecord.title,
      body: notificationRecord.body,
      data: { 
        screen: campaignData.metaData?.screen || "Campaign", 
        campaignId: campaignData.metaData?.campaignId,
        deepLink: campaignData.metaData?.deepLink,
        notificationId: notificationRecord._id.toString(),
        ...campaignData.metaData?.additionalData
      },
      priority: "high",
      channelId: "default",
      ...(notificationRecord.imageUrl && { image: notificationRecord.imageUrl })
    }));
    
    // Chunk and send notifications
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending push notification chunk:", error);
      }
    }
    
    // Count successful and failed deliveries
    const successCount = tickets.filter(ticket => !ticket.error).length;
    const failedCount = tickets.filter(ticket => ticket.error).length;
    
    // Update notification record with delivery status
    notificationRecord.status = successCount > 0 ? 'Delivered' : 'Failed';
    notificationRecord.deliveredCount = successCount;
    notificationRecord.failedCount = failedCount;
    notificationRecord.metaData = { 
      ...notificationRecord.metaData,
      tickets
    };
    await notificationRecord.save();
    
    return {
      userGroup: notificationRecord.userGroup,
      success: true,
      sent: pushTokens.length,
      delivered: successCount,
      failed: failedCount
    };
  } catch (error) {
    // Update notification record on error
    notificationRecord.status = 'Failed';
    notificationRecord.failedCount = notificationRecord.sentCount || 0;
    notificationRecord.metaData = { 
      ...notificationRecord.metaData,
      error: error.message
    };
    await notificationRecord.save();
    
    return {
      userGroup: notificationRecord.userGroup,
      success: false,
      error: error.message
    };
  }
}