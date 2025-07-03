import { NextResponse } from 'next/server';
import { donationService } from '../../../../../services/donationService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters with proper defaults and validation
    const params = {
      searchText: searchParams.get('search') || '',
      selectedType: searchParams.get('type') || '',
      selectedStatus: searchParams.get('status') || '',
      dateFrom: searchParams.get('dateFrom') || '',
      dateTo: searchParams.get('dateTo') || '',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc',
      page: Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1), // Ensure minimum value of 1
      limit: Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10)), // Limit between 1-100
      exportAll: searchParams.get('exportAll') === 'true'
    };
    
    const result = await donationService.getAllDonations(params);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching donations:', error);
    
    // Send a meaningful error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch donations',
        message: error.message || 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}