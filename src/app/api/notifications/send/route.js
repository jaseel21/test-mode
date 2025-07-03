import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "../../../../lib/db";
// import NotificationTemplate from "../../../../models/notificationTemplate";
import NotificationHistory from "../../../../models/notificationHistory";
import { Expo } from "expo-server-sdk";
import twilio from 'twilio';
import nodemailer from 'nodemailer';

// Environment variables
// Environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
// const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true'; // convert to boolean if needed


// Validate API Key middleware
function validateApiKey(request) {
    const apiKey = request.headers.get('x-api-key');
    const validApiKey = '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d'; // In production, this should be stored in environment variables

    if (!apiKey || apiKey !== validApiKey) {
        return false;
    }

    return true;
}

// POST handler to send a notification
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
        if (!body.channel || !body.userGroup || !body.body) {
            return NextResponse.json(
                { success: false, message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Validate channel-specific fields
        if (body.channel === 'push' && !body.title) {
            return NextResponse.json(
                { success: false, message: "Push notifications require a title" },
                { status: 400 }
            );
        }

        if (body.channel === 'email' && !body.subject) {
            return NextResponse.json(
                { success: false, message: "Email notifications require a subject" },
                { status: 400 }
            );
        }

        // Initialize notification data
        let notificationData = {
            channel: body.channel,
            userGroup: body.userGroup,
            body: body.body,
            status: body.scheduledFor ? 'Scheduled' : 'Pending',
            templateId: body.templateId || null
        };

        // Add channel-specific fields
        if (body.channel === 'push') {
            notificationData.title = body.title;
            notificationData.imageUrl = body.imageUrl;
        } else if (body.channel === 'email') {
            notificationData.subject = body.subject;
        }

        // Add scheduling information if provided
        if (body.scheduledFor) {
            notificationData.scheduledFor = new Date(body.scheduledFor);
        } else {
            notificationData.sentAt = new Date();
        }

        // Create notification history record
        const notificationHistory = new NotificationHistory(notificationData);
        await notificationHistory.save();

        // If scheduled for later, return success and don't send now
        if (body.scheduledFor) {
            return NextResponse.json({
                success: true,
                message: "Notification scheduled successfully",
                notification: notificationHistory
            });
        }

        // Process notification based on channel
        let result = null;

        if (body.channel === 'push') {
            result = await sendPushNotification(body, notificationHistory);
        } else if (body.channel === 'whatsapp') {
            result = await sendWhatsAppNotification(body, notificationHistory);
        } else if (body.channel === 'email') {
            result = await sendEmailNotification(body, notificationHistory);
        } else {
            return NextResponse.json(
                { success: false, message: "Invalid notification channel" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Notification sent successfully",
            notification: notificationHistory,
            result
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

// Function to send push notifications
async function sendPushNotification(data, notificationRecord) {
    try {
        // Update notification status to sending
        notificationRecord.status = 'Sending';
        await notificationRecord.save();

        // Fetch push tokens based on user group
        let pushTokens = [];
        const db = mongoose.connection.db;

        if (data.userGroup === 'all') {
            // Fetch all tokens from PushTokens collection
            const tokenDocs = await db.collection("PushTokens")
                .find({}, { projection: { expoPushToken: 1, _id: 0 } })
                .toArray();

            pushTokens = tokenDocs
                .map(doc => doc.expoPushToken)
                .filter(token => token && Expo.isExpoPushToken(token));
        } else if (data.userGroup === 'subscribers') {
            // Fetch tokens from SubscriberTokens collection
            const tokenDocs = await db.collection("SubscriberTokens")
                .find({}, { projection: { expoPushToken: 1, _id: 0 } })
                .toArray();

            pushTokens = tokenDocs
                .map(doc => doc.expoPushToken)
                .filter(token => token && Expo.isExpoPushToken(token));
        } else if (data.userGroup === 'boxholders') {
            // Fetch tokens from BoxHoldersTokens collection
            const tokenDocs = await db.collection("BoxHoldersTokens")
                .find({}, { projection: { expoPushToken: 1, _id: 0 } })
                .toArray();

            pushTokens = tokenDocs
                .map(doc => doc.expoPushToken)
                .filter(token => token && Expo.isExpoPushToken(token));
        } else if (data.userGroup === 'custom' && data.customData?.phones) {
            // Use custom list of tokens
            pushTokens = data.customData.phones.filter(token => token && Expo.isExpoPushToken(token));
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
        notificationRecord.recipients = pushTokens;
        await notificationRecord.save();

        // Initialize Expo SDK
        const expo = new Expo();

        // Create messages
        const messages = pushTokens.map(token => ({
            to: token,
            sound: "default",
            title: data.title,
            body: data.body,
            data: { screen: "Notification", notificationId: notificationRecord._id.toString() },
            priority: "high",
            channelId: "default",
            ...(data.imageUrl && { image: data.imageUrl })
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
            failed: failedCount,
            tickets
        };
    } catch (error) {
        // Update notification record on error
        notificationRecord.status = 'Failed';
        notificationRecord.failedCount = notificationRecord.sentCount;
        notificationRecord.metaData = { error: error.message };
        await notificationRecord.save();

        throw error;
    }
}

// Function to send WhatsApp notifications
async function sendWhatsAppNotification(data, notificationRecord) {
    try {
        // Update notification status to sending
        notificationRecord.status = 'Sending';
        await notificationRecord.save();

        // Get recipient phone numbers
        let phoneNumbers = [];

        if (data.userGroup === 'custom' && data.customData?.phones) {
            // Use custom list of phone numbers
            phoneNumbers = data.customData.phones.filter(phone => phone && phone.trim());
        }

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
        notificationRecord.recipients = phoneNumbers;
        await notificationRecord.save();

        // Initialize Twilio client
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
        
        // Send WhatsApp messages
        const results = await Promise.all(
            phoneNumbers.map(async (phone) => {
                try {
                    const formattedPhone = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;
                    const message = await client.messages.create({
                        from: TWILIO_WHATSAPP_NUMBER,
                        to: formattedPhone,
                        body: data.body
                    });
                    return { success: true, sid: message.sid };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            })
        );

        const successCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;

        // Update notification record with delivery status
        notificationRecord.status = successCount > 0 ? 'Delivered' : 'Failed';
        notificationRecord.deliveredCount = successCount;
        notificationRecord.failedCount = failedCount;
        notificationRecord.metaData = { results };
        await notificationRecord.save();

        return {
            success: true,
            sent: phoneNumbers.length,
            delivered: successCount,
            failed: failedCount,
            results
        };
    } catch (error) {
        // Update notification record on error
        notificationRecord.status = 'Failed';
        notificationRecord.failedCount = notificationRecord.sentCount;
        notificationRecord.metaData = { error: error.message };
        await notificationRecord.save();

        throw error;
    }
}

// Function to send Email notifications
async function sendEmailNotification(data, notificationRecord) {
    try {
        // Update notification status to sending
        notificationRecord.status = 'Sending';
        await notificationRecord.save();

        // Get recipient email addresses
        let emailAddresses = [];

        if (data.userGroup === 'custom' && data.customData?.emails) {
            // Use custom list of email addresses
            emailAddresses = data.customData.emails.filter(email => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return email && emailRegex.test(email.trim());
            });
        }

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
        notificationRecord.recipients = emailAddresses;
        await notificationRecord.save();

        // Initialize Nodemailer transporter
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST,
            port: EMAIL_PORT,
            secure: EMAIL_SECURE,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASSWORD
            }
        });

        // Send emails
        const results = await Promise.all(
            emailAddresses.map(async (email) => {
                try {
                    const info = await transporter.sendMail({
                        from: EMAIL_USER,
                        to: email,
                        subject: data.subject,
                        text: data.body
                    });
                    return { success: true, messageId: info.messageId };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            })
        );

        const successCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;

        // Update notification record with delivery status
        notificationRecord.status = successCount > 0 ? 'Delivered' : 'Failed';
        notificationRecord.deliveredCount = successCount;
        notificationRecord.failedCount = failedCount;
        notificationRecord.metaData = { results };
        await notificationRecord.save();

        return {
            success: true,
            sent: emailAddresses.length,
            delivered: successCount,
            failed: failedCount,
            results
        };
    } catch (error) {
        // Update notification record on error
        notificationRecord.status = 'Failed';
        notificationRecord.failedCount = notificationRecord.sentCount;
        notificationRecord.metaData = { error: error.message };
        await notificationRecord.save();

        throw error;
    }
}