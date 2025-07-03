import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import JSZip from "jszip";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageBackupFile = formData.get("imageBackupFile");

    if (!imageBackupFile || !imageBackupFile.name.endsWith('.zip')) {
      return NextResponse.json(
        { message: "Invalid or missing ZIP file" },
        { status: 400 }
      );
    }

    // Read the ZIP file
    const zipBuffer = await imageBackupFile.arrayBuffer();
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(zipBuffer);
    
    // Check if the images folder exists
    const imagesFolder = loadedZip.folder("images");
    if (!imagesFolder) {
      return NextResponse.json(
        { message: "Invalid backup format: missing images folder" },
        { status: 400 }
      );
    }
    
    // Process metadata if available
    // let metadata = null;
    // try {
    //   // const metadataFile = loadedZip.file("metadata.json");
    //   // if (metadataFile) {
    //   //   // const metadataContent = await metadataFile.async("string");
    //   //   // metadata = JSON.parse(metadataContent);
    //   // }
    // } catch (err) {
    //   console.warn("Could not process metadata file:", err);
    //   // Continue without metadata - it's not critical
    // }
    
    // Get a list of all files in the images folder
    const fileNames = [];
    imagesFolder.forEach((relativePath, file) => {
      if (!file.dir) {
        fileNames.push(relativePath);
      }
    });
    
    if (fileNames.length === 0) {
      return NextResponse.json(
        { message: "No images found in the backup" },
        { status: 400 }
      );
    }
    
    // Process files in batches to avoid overwhelming the server
    const BATCH_SIZE = 10;
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };
    
    // Process files in sequential batches
    for (let i = 0; i < fileNames.length; i += BATCH_SIZE) {
      const batch = fileNames.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (fileName) => {
        try {
          // Get the file from the ZIP
          const file = imagesFolder.file(fileName);
          if (!file) return;
          
          // Get the file content
          const content = await file.async("arraybuffer");
          
          // Determine content type based on file extension
          let contentType = "application/octet-stream";
          if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) contentType = "image/jpeg";
          else if (fileName.endsWith(".png")) contentType = "image/png";
          else if (fileName.endsWith(".gif")) contentType = "image/gif";
          else if (fileName.endsWith(".svg")) contentType = "image/svg+xml";
          else if (fileName.endsWith(".webp")) contentType = "image/webp";
          
          // Upload the file to Supabase
          const { error } = await supabase
            .storage
            .from("frames")
            .upload(fileName, content, {
              contentType,
              upsert: true // Overwrite if file exists
            });
            
          if (error) {
            throw new Error(`Failed to upload ${fileName}: ${error.message}`);
          }
          
          results.successful++;
        } catch (err) {
          results.failed++;
          const errorMessage = err instanceof Error ? err.message : `Unknown error with ${fileName}`;
          results.errors.push(errorMessage);
          console.error(`Error restoring ${fileName}:`, err);
        }
      });
      
      // Wait for the current batch to complete before moving to the next
      await Promise.all(batchPromises);
    }
    
    return NextResponse.json({
      message: "Images restored successfully",
      totalProcessed: fileNames.length,
      successful: results.successful,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined
    });
  } catch (error) {
    console.error("Restore images error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}