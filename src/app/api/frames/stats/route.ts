// src/app/api/frames/stats/route.ts
import {  NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Frame from '@/models/Frame';

export async function GET() {
  try {
    await dbConnect();
    
    // Get total frames count
    const totalFrames = await Frame.countDocuments();
    
    // Get active frames count
    const activeFrames = await Frame.countDocuments({ isActive: true });
    
    // Get the total number of usages across all frames
    const aggregationResult = await Frame.aggregate([
      {
        $group: {
          _id: null,
          totalUsage: { $sum: "$usageCount" }
        }
      }
    ]);
    
    // Extract the total usage from the aggregation result or default to 0
    const totalUsage = aggregationResult.length > 0 ? aggregationResult[0].totalUsage : 0;
    
    // Get top 5 most used frames
    const topFrames = await Frame.find()
      .sort({ usageCount: -1, name: 1 }) // Sort by usage count (desc) and name (asc)
      .limit(5)
      .select('_id name usageCount');
    
    return NextResponse.json({
      success: true,
      data: {
        totalFrames,
        activeFrames,
        totalUsage,
        topFrames
      }
    });
  } catch (error) {
    console.error("Error fetching frame statistics:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch frame statistics",
        error: error instanceof Error ? error.message : "An unknown error occurred"
      },
      { status: 500 }
    );
  }
}