// src/app/api/donations/dashboard/receipts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Donation from '@/models/Donation';
import { FilterQuery } from 'mongoose';

// Define the Donation interface
interface DonationType {
  _id: string; // String after .lean()
  name?: string;
  email?: string;
  phone?: string;
  amount?: string | number; // Can be string or number
  type?: string;
  status?: string;
  createdAt?: string | Date; // Can be string or Date
  razorpayOrderId?: string;
  receipt_generated?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const type = searchParams.get('type') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    
    // Build query filters
    const query: FilterQuery<DonationType> = { status: 'Completed' }; // Only completed donations
    
    // Handle search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Handle type filter
    if (type) {
      query.type = type;
    }
    
    // Handle date filters
    if (dateFrom || dateTo) {
      query.createdAt = {};
      
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      
      if (dateTo) {
        // Add one day to include the end date fully
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query.createdAt.$lte = endDate;
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute queries with pagination
    const [donations, totalItems] = await Promise.all([
      Donation.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean() as Promise<DonationType[]>,
      Donation.countDocuments(query)
    ]);
    
    // Format donations for display
    const formattedDonations = donations.map(formatDonation);
    
    // Return paginated results
    return NextResponse.json({
      donations: formattedDonations,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching donations for receipts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to format a donation
function formatDonation(donation: DonationType) {
  // Format date
  let formattedDate = 'N/A';
  try {
    formattedDate = donation.createdAt ? new Date(donation.createdAt).toISOString().split('T')[0] : 'N/A';
  } catch (error) {
    console.error('Error formatting date:', error);
  }

  // Format amount
  let formattedAmount = 'N/A';
  try {
    formattedAmount = donation.amount !== undefined ? `₹${parseFloat(String(donation.amount)).toLocaleString('en-IN')}` : 'N/A';
  } catch (error) {
    console.error('Error formatting amount:', error);
  }

  // Generate donation ID
  const donationId = donation.razorpayOrderId || `DON-${donation._id.toString().slice(-6).toUpperCase()}`;

  return {
    _id: donation._id.toString(),
    id: donationId,
    donor: donation.name || 'Anonymous',
    email: donation.email || 'N/A',
    phone: donation.phone || 'N/A',
    amount: formattedAmount,
    type: donation.type || 'General',
    status: donation.status || 'N/A',
    date: formattedDate,
    receipt_generated: donation.receipt_generated || false,
    displayDate: donation.createdAt ? new Date(donation.createdAt).toLocaleDateString() : 'N/A'
  };
}