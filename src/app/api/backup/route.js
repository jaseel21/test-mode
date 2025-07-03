import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    await connectToDatabase();

    // Ensure the database connection is ready
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }

    // Get all collections from the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {};
    const collectionStats = {};
    let totalDocuments = 0;

    // Export data from each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await mongoose.connection.db
        .collection(collectionName)
        .find({})
        .toArray();
      
      backupData[collectionName] = data;
      collectionStats[collectionName] = data.length;
      totalDocuments += data.length;
    }

    // Add metadata to the backup
    const backupPayload = {
      metadata: {
        version: "2.0",
        createdAt: new Date().toISOString(),
        totalCollections: collections.length,
        totalDocuments,
        collectionStats
      },
      data: backupData
    };

    // Convert to JSON string
    const backupJson = JSON.stringify(backupPayload);
    const backupBuffer = Buffer.from(backupJson);

    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup-${timestamp}.json`;

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from("frames")
      .upload(fileName, backupBuffer, {
        contentType: "application/json",
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    // Get public URL for download
    const { data: urlData } = supabase.storage
      .from("frames")
      .getPublicUrl(fileName);

    // Create a record of this backup in a backups collection if it exists
    try {
      const backupsCollection = mongoose.connection.db.collection("backups");
      await backupsCollection.insertOne({
        fileName,
        createdAt: new Date(),
        metadata: backupPayload.metadata,
        downloadUrl: urlData.publicUrl
      });
    } catch (err) {
      // Non-critical operation, just log the error and continue
      console.warn("Could not record backup metadata:", err);
    }

    return NextResponse.json({
      message: "Backup created successfully",
      downloadUrl: urlData.publicUrl,
      stats: {
        totalCollections: collections.length,
        totalDocuments,
        collectionStats
      }
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}