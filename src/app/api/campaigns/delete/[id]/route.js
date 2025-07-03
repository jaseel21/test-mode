// src/app/api/campaigns/delete/[id]/route.js - UPDATED
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Campaign from "@/models/Campaign";
import { supabase } from '@/lib/supabase';

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const campaign = await Campaign.findById(params.id);
    
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    
    // Delete image from Supabase if it exists
    if (campaign.featuredImageUrl) {
      const imagePath = campaign.featuredImageUrl.split('/').pop();
      if (imagePath) {
        try {
          await supabase.storage
            .from('frames')
            .remove([`campaigns/${imagePath}`]);
        } catch (err) {
          console.warn('Error removing image from storage:', err);
          // Continue with deletion even if image removal fails
        }
      }
    }
    
    // Delete the campaign from database
    await Campaign.findByIdAndDelete(params.id);
    
    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
}