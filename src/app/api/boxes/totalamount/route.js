// src/app/api/total-amount/route.js
import connectToDatabase from '../../../../lib/db';
import Box from '../../../../models/Box';
import Donation from '../../../../models/Donation';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('API hit with URL:', request.url);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');
    console.log('Phone number received:', phone);

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const boxes = await Box.find({ phone }).select('_id');
    console.log('Boxes found:', boxes);
    if (!boxes || boxes.length === 0) {
      return NextResponse.json(
        { error: 'No boxes found for this phone number' },
        { status: 404 }
      );
    }

    const boxIds = boxes.map((box) => box._id);
    console.log('Box IDs:', boxIds);

    const donations = await Donation.find({
      boxId: { $in: boxIds.map((id) => id.toString()) },
    }).lean();
    console.log('Donations found:', donations);

    let totalAmount = 0;
    const amountsByBox = {};

    boxIds.forEach((boxId) => {
      amountsByBox[boxId.toString()] = 0;
    });

    donations.forEach((donation) => {
      const boxIdStr = donation.boxId;
      const amount = donation.amount || 0;
      amountsByBox[boxIdStr] += amount;
      totalAmount += amount;
    });

    const responseData = {
      success: true,
      totalAmount,
      amountsByBox: Object.entries(amountsByBox).map(([boxId, amount]) => ({
        boxId,
        amount,
      })),
    };

    console.log('Response data:', responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in total-amount API:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}