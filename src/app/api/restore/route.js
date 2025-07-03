import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";

export async function POST(request) {
  try {
    await connectToDatabase();

    const formData = await request.formData();
    const backupFile = formData.get("backupFile");

    if (!backupFile || backupFile.type !== "application/json") {
      return NextResponse.json(
        { message: "Invalid or missing JSON backup file" },
        { status: 400 }
      );
    }

    // Read and parse the backup file
    const backupJson = await backupFile.text();
    let backupData;
    
    try {
      backupData = JSON.parse(backupJson);
    } catch {
      return NextResponse.json(
        { message: "Invalid JSON format in backup file" },
        { status: 400 }
      );
    }
    
    // Check if the backup has the expected format (with metadata and data)
    if (!backupData || typeof backupData !== 'object') {
      return NextResponse.json(
        { message: "Invalid backup format" },
        { status: 400 }
      );
    }
    
    // Handle both new format (with metadata) and old format
    const dataToRestore = backupData.data || backupData;
    
    // Get all collections from the backup
    const collections = Object.keys(dataToRestore);
    
    if (collections.length === 0) {
      return NextResponse.json(
        { message: "No collections found in backup file" },
        { status: 400 }
      );
    }

    // Ensure the database connection is ready
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }

    // Statistics to track the restore process
    const restoreStats = {
      collectionsProcessed: 0,
      documentsRestored: 0,
      errors: []
    };

    // Clear existing data and restore
    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        
        // Skip system collections as a safety measure
        if (collectionName.startsWith('system.')) {
          restoreStats.errors.push(`Skipped system collection: ${collectionName}`);
          continue;
        }

        // Drop existing collection
        await collection.drop().catch((err) => {
          if (err.codeName !== "NamespaceNotFound") {
            restoreStats.errors.push(`Failed to drop collection ${collectionName}: ${err.message}`);
          }
        });

        // Process the data before insertion to handle ObjectId strings
        const processedData = dataToRestore[collectionName].map((item) => {
          const newItem = { ...item };
          
          // Convert _id string back to ObjectId where needed
          if (typeof newItem._id === 'string' && /^[0-9a-fA-F]{24}$/.test(newItem._id)) {
            try {
              newItem._id = new mongoose.Types.ObjectId(newItem._id);
            } catch {
              // If conversion fails, keep as string
            }
          }
          
          return newItem;
        });

        // Insert backup data
        if (processedData.length > 0) {
          await collection.insertMany(processedData);
          restoreStats.documentsRestored += processedData.length;
        }
        
        restoreStats.collectionsProcessed++;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Unknown error with ${collectionName}`;
        restoreStats.errors.push(`Error with collection ${collectionName}: ${errorMessage}`);
        console.error(`Error restoring collection ${collectionName}:`, err);
      }
    }

    // Log the restore operation if a backups collection exists
    try {
      const backupsCollection = mongoose.connection.db.collection("backups");
      await backupsCollection.insertOne({
        type: "restore",
        createdAt: new Date(),
        fileName: backupFile.name,
        fileSize: backupFile.size,
        stats: restoreStats
      });
    } catch (err) {
      // Non-critical operation, just log the error
      console.warn("Could not record restore operation:", err);
    }

    return NextResponse.json({ 
      message: "Database restored successfully",
      stats: {
        collectionsProcessed: restoreStats.collectionsProcessed,
        documentsRestored: restoreStats.documentsRestored,
        errors: restoreStats.errors.length > 0 ? restoreStats.errors : undefined
      }
    });
  } catch (error) {
    console.error("Restore error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}