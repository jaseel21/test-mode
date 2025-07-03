// src/app/api/donations/dashboard/donations/create/route.js
import { NextResponse } from 'next/server';
import { donationService } from '@/services/donationService';
import { whatsappService } from '@/services/whatsappService';

export async function POST(request) {
  try {
    // Parse request body
    let data;
    try {
      data = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Extract WhatsApp notification flag but don't send it to the donation service
    const sendWhatsAppNotification = data.sendWhatsAppNotification || false;
    
    // Remove the flag from data before sending to donation service
    const {...donationData } = data;
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'amount', 'type', 'status'];
    const missingFields = requiredFields.filter(field => !donationData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          fields: missingFields 
        },
        { status: 400 }
      );
    }
    
    // Prepare donation data with additional location details
    const preparedData = {
      ...donationData,
      district: donationData.district || null,
      location: donationData.location || null,
      locationType: donationData.locationType || 'district',
      address: donationData.address || null,
      razorpayPaymentId: donationData.paymentMethod === "Offline" ? "OFFLINE_PAYMENT" : 
                         donationData.paymentMethod === "Check" ? `CHECK-${Date.now()}` :
                         donationData.paymentMethod === "Bank Transfer" ? `BANK-${Date.now()}` :
                         donationData.paymentMethod === "UPI" ? `UPI-${Date.now()}` : "OFFLINE_PAYMENT",
      razorpayOrderId: `MANUAL-${Date.now()}`
    };
    
    // Create the donation
    const donation = await donationService.createManualDonation(preparedData);
    
    // Handle WhatsApp notification if requested
    let notificationResult = { success: false, message: 'No notification requested' };
    
    if (sendWhatsAppNotification && donationData.phone) {
      try {
        console.log('Sending WhatsApp notification to:', donationData.phone);
        
        notificationResult = await whatsappService.sendDonationConfirmation(
          {
            name: donationData.name || 'Donor',
            phone: donationData.phone
          },
          donation
        );
        
        console.log('WhatsApp notification result:', notificationResult);
        
        notificationResult.message = notificationResult.success
          ? 'WhatsApp notification sent successfully'
          : `Failed to send WhatsApp notification: ${notificationResult.error}`;
      } catch (error) {
        console.error('Error sending WhatsApp notification:', error);
        notificationResult = {
          success: false,
          message: `Error sending notification: ${error.message}`
        };
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Donation created successfully',
      donation,
      notification: notificationResult
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create donation',
        message: error.message || 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}