// src/app/api/subscriptions/cancel/route.ts
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db'; // Adjust path to your MongoDB connection utility
import Subscription from '@/models/AutoSubscription'; // Adjust path to your Subscription model
import Donor from '@/models/Donor'; // Adjust path to your Donor model

export async function DELETE(request) {
  try {
    // Extract subscriptionId from query parameters or request body
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get('subscriptionId');

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();


    console.log("jsubscription idddddddddddddddddddddddddddddd");
    
    console.log(subscriptionId);
    console.log('Type of subscriptionId:', typeof subscriptionId);
    

    // Step 1: Fetch the subscription document
    const subscription = await Subscription.findById(subscriptionId).lean();
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Step 2: Extract donorId from the subscription
    const donorId = subscription.donorId; // Adjust field name based on your schema
    if (!donorId) {
      return NextResponse.json(
        { error: 'Donor ID not found in subscription' },
        { status: 400 }
      );
    }

    // Step 3: Delete the subscription document
    await Subscription.findByIdAndDelete(subscriptionId);

    // Step 4: Delete the donor document matching donorId
    const deletedDonor = await Donor.findByIdAndDelete(donorId);
    if (!deletedDonor) {
      // Note: We don’t fail the request if donor isn’t found, but log it
      console.warn(`Donor with ID ${donorId} not found for deletion`);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription and associated donor deleted successfully',
      subscriptionId,
      donorId,
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    );
  }
}