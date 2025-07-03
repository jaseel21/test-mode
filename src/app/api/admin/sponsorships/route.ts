import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sponsor from '@/models/Sponsor';
import { FilterQuery } from 'mongoose';

// Define a strict Sponsor interface based on explicitly used fields
interface Sponsor {
  type: string;
  name?: string;
  district?: string;
  razorpayOrderId?: string;
  period?: string;
  paymentDate?: Date | string; // Allow string for incoming ISO date
  userId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

// GET handler to fetch all sponsorships
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const period = searchParams.get('period') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

    // Build query object with proper typing
    const query: FilterQuery<Sponsor> = {
      $or: [
        { type: 'Sponsor-Yatheem' },
        { type: 'Sponsor-Hafiz' },
      ],
    };

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { razorpayOrderId: { $regex: search, $options: 'i' } },
      ];
    }

    // Add type filter
    if (type) {
      query.type = type;
    }

    // Add period filter
    if (period) {
      query.period = period;
    }

    // Add date range filter
    if (dateFrom || dateTo) {
      query.paymentDate = {};

      if (dateFrom) {
        query.paymentDate.$gte = new Date(dateFrom);
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        query.paymentDate.$lte = toDate;
      }
    }

    // Fetch sponsorships from database
    const sponsorships = await Sponsor.find(query)
      .sort({ paymentDate: -1 }) // Default sort by payment date descending
      .lean();

    return NextResponse.json(sponsorships);
  } catch (error) {
    console.error('Error fetching sponsorships:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sponsorships' },
      { status: 500 }
    );
  }
}

// Define the expected shape of the POST request body
interface SponsorCreateRequest {
  type: string;
  name?: string;
  district?: string;
  period?: string;
  paymentMethod?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  paymentDate?: string; // Add paymentDate to request body
}

// POST handler to create a new sponsorship
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const data = (await req.json()) as SponsorCreateRequest;

    // Check if payment method related fields are already present
    const paymentId = data.razorpayPaymentId || generatePaymentId(data.paymentMethod ?? 'Offline');
    const orderId = data.razorpayOrderId || `MANUAL-${Date.now()}`;

    // Generate mock data for fields required by the model but not in the form
    const mockData: Partial<Sponsor> = {
      userId: 'admin-created',
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId,
      razorpaySignature: `signature_${Math.random().toString(36).substring(2, 15)}`,
      paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(), // Use provided paymentDate or default
    };

    // Create new sponsorship
    const newSponsor = await Sponsor.create({
      ...data,
      ...mockData,
    });

    return NextResponse.json(newSponsor, { status: 201 });
  } catch (error) {
    console.error('Error creating sponsorship:', error);
    return NextResponse.json(
      { error: 'Failed to create sponsorship' },
      { status: 500 }
    );
  }
}

// Helper function to generate payment ID based on payment method
function generatePaymentId(paymentMethod: string): string {
  switch (paymentMethod) {
    case 'Check':
      return `CHECK-${Date.now()}`;
    case 'Bank Transfer':
      return `BANK-${Date.now()}`;
    case 'UPI':
      return `UPI-${Date.now()}`;
    case 'Razorpay':
      return ''; // Expect razorpayPaymentId to be provided
    default: // Cash or Offline
      return 'OFFLINE_PAYMENT';
  }
}