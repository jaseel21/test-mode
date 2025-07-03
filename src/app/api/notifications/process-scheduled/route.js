import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/db";
import NotificationHistory from "../../../../models/notificationHistory";
import { Expo } from "expo-server-sdk";
import mongoose from "mongoose";

// Validate API Key middleware
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d'; // In production, this should be stored in environment variables
  
  if (!apiKey || apiKey !== validApiKey) {
    return false;
  }
  
  return true;
}

// GET handler to process scheduled notifications
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
    
    // Current time
    const now = new Date();
    
    // Find scheduled notifications that are due to be sent
    const scheduledNotifications = await NotificationHistory.find({
      status: 'Scheduled',
      scheduledFor: { $lte: now }
    }).lean();
    
    if (scheduledNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No scheduled notifications to process",
        processed: 0
      });
    }
    
    // Process each scheduled notification
    const results = [];
    
    for (const notification of scheduledNotifications) {
      try {
        // Update status to pending
        await NotificationHistory.findByIdAndUpdate(
          notification._id,
          { $set: { status: 'Pending', sentAt: now } }
        );
        
        // Process notification based on channel
        let result = null;
        
        if (notification.channel === 'push') {
          result = await processPushNotification(notification);
        } else if (notification.channel === 'whatsapp') {
          result = await processWhatsAppNotification(notification);
        } else if (notification.channel === 'email') {
          result = await processEmailNotification(notification);
        }
        
        results.push({
          id: notification._id,
          channel: notification.channel,
          result
        });
      } catch (error) {
        // Update status to failed on error
        await NotificationHistory.findByIdAndUpdate(
          notification._id,
          { 
            $set: { 
              status: 'Failed',
              failedCount: notification.sentCount || 0,
              metaData: { error: error.message }
            } 
          }
        );
        
        results.push({
          id: notification._id,
          channel: notification.channel,
          error: error.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processed ${scheduledNotifications.length} scheduled notifications`,
      processed: scheduledNotifications.length,
      results
    });
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// Function to process push notifications
async function processPushNotification(notification) {
  // Find the notification record
  const notificationRecord = await NotificationHistory.findById(notification._id);
  
  // Update notification status to sending
  notificationRecord.status = 'Sending';
  await notificationRecord.save();
  
  // Fetch push tokens based on user group
  let pushTokens = [];
  const db = mongoose.connection.db;
  
  if (notification.userGroup === 'all') {
    // Fetch all tokens from PushTokens collection
    const tokenDocs = await db.collection("PushTokens")
      .find({}, { projection: { expoPushToken: 1, _id: 0 } })
      .toArray();
    
    pushTokens = tokenDocs
      .map(doc => doc.expoPushToken)
      .filter(token => token && Expo.isExpoPushToken(token));
  } else if (notification.userGroup === 'subscribers') {
    // Fetch tokens from SubscriberTokens collection
    const tokenDocs = await db.collection("SubscriberTokens")
      .find({}, { projection: { expoPushToken: 1, _id: 0 } })
      .toArray();
    
    pushTokens = tokenDocs
      .map(doc => doc.expoPushToken)
      .filter(token => token && Expo.isExpoPushToken(token));
  } else if (notification.userGroup === 'boxholders') {
    // Fetch tokens from BoxHoldersTokens collection
    const tokenDocs = await db.collection("BoxHoldersTokens")
      .find({}, { projection: { expoPushToken: 1, _id: 0 } })
      .toArray();
    
    pushTokens = tokenDocs
      .map(doc => doc.expoPushToken)
      .filter(token => token && Expo.isExpoPushToken(token));
  } else if (notification.userGroup === 'custom' && notification.recipients?.length) {
    // Use stored list of tokens
    pushTokens = notification.recipients.filter(token => token && Expo.isExpoPushToken(token));
  }
  
  // If no valid tokens found, update record and return
  if (!pushTokens.length) {
    notificationRecord.status = 'Failed';
    notificationRecord.sentCount = 0;
    notificationRecord.failedCount = 0;
    notificationRecord.deliveredCount = 0;
    await notificationRecord.save();
    
    return {
      success: false,
      message: "No valid push tokens found"
    };
  }
  
  // Update notification record with recipients count
  notificationRecord.sentCount = pushTokens.length;
  if (!notificationRecord.recipients || notificationRecord.recipients.length === 0) {
    notificationRecord.recipients = pushTokens;
  }
  await notificationRecord.save();
  
  // Initialize Expo SDK
  const expo = new Expo();
  
  // Create messages
  const messages = pushTokens.map(token => ({
    to: token,
    sound: "default",
    title: notification.title,
    body: notification.body,
    data: { screen: "Notification", notificationId: notification._id.toString() },
    priority: "high",
    channelId: "default",
    ...(notification.imageUrl && { image: notification.imageUrl })
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
  notificationRecord.metaData = { tickets };
  await notificationRecord.save();
  
  return {
    success: true,
    sent: pushTokens.length,
    delivered: successCount,
    failed: failedCount
  };
}

// Function to process WhatsApp notifications
async function processWhatsAppNotification(notification) {
  // Find the notification record
  const notificationRecord = await NotificationHistory.findById(notification._id);
  
  // Update notification status to sending
  notificationRecord.status = 'Sending';
  await notificationRecord.save();
  
  // Get recipient phone numbers
  let phoneNumbers = notification.recipients || [];
  
  // If no valid phone numbers found, update record and return
  if (!phoneNumbers.length) {
    notificationRecord.status = 'Failed';
    notificationRecord.sentCount = 0;
    notificationRecord.failedCount = 0;
    notificationRecord.deliveredCount = 0;
    await notificationRecord.save();
    
    return {
      success: false,
      message: "No valid phone numbers found"
    };
  }
  
  // Update notification record with recipients count
  notificationRecord.sentCount = phoneNumbers.length;
  await notificationRecord.save();
  
  // This is a placeholder for actual WhatsApp API integration
  // In a real application, you would integrate with Twilio or another WhatsApp Business API provider
  console.log(`Sending scheduled WhatsApp message to ${phoneNumbers.length} recipients`);
  console.log("Message content:", notification.body);
  
  // Simulate a partial success scenario for demonstration
  const successCount = Math.floor(phoneNumbers.length * 0.9); // 90% success rate for demonstration
  const failedCount = phoneNumbers.length - successCount;
  
  // Update notification record with delivery status
  notificationRecord.status = successCount > 0 ? 'Delivered' : 'Failed';
  notificationRecord.deliveredCount = successCount;
  notificationRecord.failedCount = failedCount;
  notificationRecord.metaData = { simulation: true };
  await notificationRecord.save();
  
  return {
    success: true,
    sent: phoneNumbers.length,
    delivered: successCount,
    failed: failedCount,
    simulation: true
  };
}

// Function to process Email notifications
async function processEmailNotification(notification) {
  // Find the notification record
  const notificationRecord = await NotificationHistory.findById(notification._id);
  
  // Update notification status to sending
  notificationRecord.status = 'Sending';
  await notificationRecord.save();
  
  // Get recipient email addresses
  let emailAddresses = notification.recipients || [];
  
  // If no valid email addresses found, update record and return
  if (!emailAddresses.length) {
    notificationRecord.status = 'Failed';
    notificationRecord.sentCount = 0;
    notificationRecord.failedCount = 0;
    notificationRecord.deliveredCount = 0;
    await notificationRecord.save();
    
    return {
      success: false,
      message: "No valid email addresses found"
    };
  }
  
  // Update notification record with recipients count
  notificationRecord.sentCount = emailAddresses.length;
  await notificationRecord.save();
  
  // This is a placeholder for actual Email sending integration
  // In a real application, you would integrate with a service like SendGrid, Mailgun, etc.
  console.log(`Sending scheduled email to ${emailAddresses.length} recipients`);
  console.log("Subject:", notification.subject);
  console.log("Message content:", notification.body);
  
  // Simulate a partial success scenario for demonstration
  const successCount = Math.floor(emailAddresses.length * 0.95); // 95% success rate for demonstration
  const failedCount = emailAddresses.length - successCount;
  
  // Update notification record with delivery status
  notificationRecord.status = successCount > 0 ? 'Delivered' : 'Failed';
  notificationRecord.deliveredCount = successCount;
  notificationRecord.failedCount = failedCount;
  notificationRecord.metaData = { simulation: true };
  await notificationRecord.save();
  
  return {
    success: true,
    sent: emailAddresses.length,
    delivered: successCount,
    failed: failedCount,
    simulation: true
  };
}