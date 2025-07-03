import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/db";
import { supabase } from "@/lib/supabase";

// Helper function to process nested objects
function processNestedObjects(obj) {
  if (!obj || typeof obj !== "object") return;

  Object.keys(obj).forEach((key) => {
    if (obj[key] instanceof mongoose.Types.ObjectId) {
      obj[key] = obj[key].toString();
    } else if (obj[key] instanceof Date) {
      obj[key] = obj[key].toISOString();
    } else if (Array.isArray(obj[key])) {
      obj[key].forEach((item) => {
        if (typeof item === "object" && item !== null) {
          processNestedObjects(item);
        }
      });
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      processNestedObjects(obj[key]);
    }
  });
}

export async function POST() {
  try {
    await connectToDatabase();

    // Ensure the database connection is ready
    if (!mongoose.connection.db) {
      throw new Error("Database connection not established");
    }

    // Get all collections from the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    const exportData = {};

    // Export data from each collection in a format optimized for migration
    for (const collection of collections) {
      const collectionName = collection.name;
      const data = await mongoose.connection.db
        .collection(collectionName)
        .find({})
        .toArray();

      // Process data for migration - convert ObjectId to string, etc.
      const processedData = data.map((item) => {
        // Create a copy of the item to avoid modifying the original
        const processedItem = { ...item };

        // Convert ObjectId to string representation for cleaner import
        if (processedItem._id) {
          processedItem._id = processedItem._id.toString();
        }

        // Handle any nested ObjectIds or dates for better cross-platform compatibility
        Object.keys(processedItem).forEach((key) => {
          if (processedItem[key] instanceof mongoose.Types.ObjectId) {
            processedItem[key] = processedItem[key].toString();
          } else if (processedItem[key] instanceof Date) {
            processedItem[key] = processedItem[key].toISOString();
          } else if (
            typeof processedItem[key] === "object" &&
            processedItem[key] !== null
          ) {
            // Handle nested objects recursively
            processNestedObjects(processedItem[key]);
          }
        });

        return processedItem;
      });

      exportData[collectionName] = processedData;
    }

    // Add metadata to help with migration
    const exportPayload = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0",
        collections: collections.map((c) => c.name),
        totalDocuments: Object.values(exportData).reduce(
          (sum, arr) => sum + arr.length,
          0
        ),
      },
      data: exportData,
    };

    // Convert to JSON string with nice formatting for readability
    const exportJson = JSON.stringify(exportPayload, null, 2);
    const exportBuffer = Buffer.from(exportJson);

    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `db-export-${timestamp}.json`;

    // Upload to Supabase storage
    const { error } = await supabase.storage
      .from("frames")
      .upload(fileName, exportBuffer, {
        contentType: "application/json",
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    // Get public URL for download
    const { data: urlData } = supabase.storage
      .from("frames")
      .getPublicUrl(fileName);

    return NextResponse.json({
      message: "Database exported successfully",
      downloadUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}