import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();

    // Ensure the database connection is established
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }

    // Get all collections from the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionStats = {};
    let totalDocuments = 0;

    // Count documents in each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await mongoose.connection.db
        .collection(collectionName)
        .countDocuments();
      
      collectionStats[collectionName] = count;
      totalDocuments += count;
    }

    // Get the last backup date from Supabase storage
    const { data: files, error } = await supabase
      .storage
      .from("frames")
      .list("", {
        sortBy: { column: "created_at", order: "desc" },
        limit: 1,
      });

    let lastBackupDate = null;
    if (!error && files && files.length > 0) {
      lastBackupDate = files[0].created_at;
    }

    return NextResponse.json({
      totalCollections: collections.length,
      totalDocuments,
      collectionCounts: collectionStats,
      lastBackupDate,
    });
  } catch (error) {
    console.error("Error fetching backup stats:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal server error",
        totalCollections: 0,
        totalDocuments: 0,
        collectionCounts: {},
        lastBackupDate: null,
      },
      { status: 500 }
    );
  }
}