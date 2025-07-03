import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Donation from '@/models/Donation';
import twilio from 'twilio';

// Define the Donation interface
interface DonationType {
  _id: string; // String after .lean()
  name?: string;
  phone: string; // Required by query
  amount?: string | number; // Can be string or number
  type?: string;
  createdAt?: string | Date; // Can be string or Date
  razorpayOrderId?: string;
  messageHistory?: Array<{
    type: string;
    message: string;
    status: string;
    timestamp: Date;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Parse request body
    const body = await request.json();
    const { donationIds, message } = body;
    
    if (!donationIds || !Array.isArray(donationIds) || donationIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or missing donation IDs' },
        { status: 400 }
      );
    }
    
    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message text is required' },
        { status: 400 }
      );
    }
    
    // Fetch donations
    const donations = await Donation.find({
      _id: { $in: donationIds },
      phone: { $nin: [null, "", "N/A"] } // Only get donations with valid phone numbers
    }).lean() as unknown as DonationType[];
    
    if (donations.length === 0) {
      return NextResponse.json(
        { error: 'No donations found with valid phone numbers' },
        { status: 404 }
      );
    }
    
    // Initialize Twilio client
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    // Track success and failures
    let sentCount = 0;
    let failedCount = 0;
    const results: { id: string; status: string; reason?: string; messageId?: string }[] = [];
    
    // Send WhatsApp messages
    for (const donation of donations) {
      try {
        // Format the phone number for WhatsApp
        const formattedPhone = formatPhoneNumber(donation.phone);
        
        if (!formattedPhone) {
          failedCount++;
          results.push({
            id: donation._id,
            status: 'failed',
            reason: 'Invalid phone number format'
          });
          continue;
        }
        
        // Process message with donation data
        const personalizedMessage = formatMessageContent(message, donation);
        
        // Send message through Twilio
        const twilioMessage = await client.messages.create({
          body: personalizedMessage,
          from: process.env.TWILIO_WHATSAPP_NUMBER, // Should be in format 'whatsapp:+1234567890'
          to: `whatsapp:+${formattedPhone}` // Format with whatsapp: prefix and + sign
        });
        
        // Update donation to log message sent
        await Donation.findByIdAndUpdate(donation._id, {
          $push: {
            messageHistory: {
              type: 'whatsapp',
              message: personalizedMessage,
              status: twilioMessage.status,
              timestamp: new Date()
            }
          }
        });
        
        sentCount++;
        results.push({
          id: donation._id.toString(),
          status: 'success',
          messageId: twilioMessage.sid
        });
      } catch (error) {
        console.error(`Error sending WhatsApp for donation ${donation._id}:`, error);
        failedCount++;
        results.push({
          id: donation._id,
          status: 'failed',
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully sent ${sentCount} WhatsApp messages. Failed to send ${failedCount} messages.`,
      sentCount,
      failedCount,
      results
    });
  } catch (error) {
    console.error('Error in WhatsApp sending API:', error);
    return NextResponse.json(
      { error: 'Failed to process WhatsApp request', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Format phone number for Twilio WhatsApp
 * Twilio requires international format without the leading +
 */
function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Remove any non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // Ensure it has the country code (assuming India +91)
  // If it already has country code, use as is
  if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
    return digitsOnly;
  }

  // If it's a 10-digit number without country code (standard Indian number)
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }

  // Return null if format is unrecognized
  return null;
}

/**
 * Format message with donation data placeholders
 */
function formatMessageContent(message: string, donation: DonationType): string {
  const donationId = donation.razorpayOrderId || `DON-${donation._id.toString().slice(-6).toUpperCase()}`;
  
  // Format amount
  let formattedAmount = 'N/A';
  try {
    formattedAmount = donation.amount !== undefined ? `₹${parseFloat(String(donation.amount)).toLocaleString('en-IN')}` : 'N/A';
  } catch (error) {
    console.error('Error formatting amount:', error);
  }
  
  // Format date
  const formattedDate = donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : 'N/A';
  
  // Replace placeholders
  return message
    .replace(/{name}/g, donation.name || 'Donor')
    .replace(/{amount}/g, formattedAmount)
    .replace(/{id}/g, donationId)
    .replace(/{date}/g, formattedDate)
    .replace(/{type}/g, donation.type || 'General');
}