import { NextResponse } from 'next/server';
import { donationService } from '@/services/donationService';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Donation ID is required' },
        { status: 400 }
      );
    }
    
    const donation = await donationService.getDonationById(id);
    
    return NextResponse.json(donation);
  } catch (error) {
    console.error(`Error fetching donation ${params.id}:`, error);
    
    // Determine appropriate status code
    const statusCode = error.message?.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { 
        error: `Failed to fetch donation: ${error.message}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Donation ID is required' },
        { status: 400 }
      );
    }
    
    // Parse request body and validate required fields
    let data;
    try {
      data = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Check if status is provided
    if (!data.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    const updatedDonation = await donationService.updateDonationStatus(id, data);
    
    return NextResponse.json(updatedDonation);
  } catch (error) {
    console.error(`Error updating donation ${params.id}:`, error);
    
    // Determine appropriate status code
    const statusCode = error.message?.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { 
        error: `Failed to update donation: ${error.message}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Donation ID is required' },
        { status: 400 }
      );
    }
    
    await donationService.deleteDonation(id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Donation deleted successfully' 
    });
  } catch (error) {
    console.error(`Error deleting donation ${params.id}:`, error);
    
    // Determine appropriate status code
    const statusCode = error.message?.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { 
        error: `Failed to delete donation: ${error.message}`,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
}