import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import JSZip from "jszip";
import { createHash } from "crypto";

// Helper function to check if a file is an image
const isImageFile = (file) => {
  const imageMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/svg+xml",
    "image/webp",
    "image/bmp",
    "image/tiff",
    "image/heic",
    "image/heif",
    // Fallback for generic or unknown MIME types
    "application/octet-stream",
  ];
  const imageExtensions = /\.(jpg|jpeg|png|gif|svg|webp|bmp|tiff|tif|heic|heif)$/i;

  const isImageMimeType = file.metadata?.mimetype && imageMimeTypes.includes(file.metadata.mimetype);
  const isImageExtension = imageExtensions.test(file.name);

  // Log file details for debugging
  console.log(`File: ${file.name}`, {
    mimetype: file.metadata?.mimetype || "missing",
    isImageMimeType,
    isImageExtension,
  });

  return isImageMimeType || isImageExtension;
};

// Helper function to compute SHA256 checksum
const computeChecksum = (buffer) => {
  return createHash("sha256").update(Buffer.from(buffer)).digest("hex");
};

// Process files in batches with concurrency control
async function processFilesInBatches(items, batchSize, concurrency, callback) {
  const batches = Array.from({ length: Math.ceil(items.length / batchSize) }, (_, i) =>
    items.slice(i * batchSize, (i + 1) * batchSize)
  );

  for (const batch of batches) {
    const promises = batch.map(async (item, index) => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await callback(item, index);
          return;
        } catch (err) {
          if (attempt === 3) throw err;
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    });

    await Promise.all(promises.slice(0, concurrency));
  }
}

// Recursively list all files in the bucket
async function listAllFiles(bucket, path = "") {
  const { data: files, error } = await supabase.storage
    .from(bucket)
    .list(path, { sortBy: { column: "created_at", order: "desc" } });

  if (error) {
    throw new Error(`Failed to list files in ${path}: ${error.message}`);
  }

  let allFiles = [];
  for (const file of files) {
    if (file.metadata) {
      // File (not a folder)
      allFiles.push({ ...file, name: path ? `${path}/${file.name}` : file.name });
    } else {
      // Folder
      const subFiles = await listAllFiles(bucket, path ? `${path}/${file.name}` : file.name);
      allFiles = allFiles.concat(subFiles);
    }
  }

  return allFiles;
}

export async function POST() {
  try {
    const zip = new JSZip();
    const imagesFolder = zip.folder("images");
    if (!imagesFolder) {
      throw new Error("Failed to create images folder in ZIP");
    }

    // Get all files recursively from the Supabase bucket
    const files = await listAllFiles("frames");

    // Log all files for debugging
    console.log("All files in bucket:", files.map((f) => ({
      name: f.name,
      mimetype: f.metadata?.mimetype || "missing",
      size: f.metadata?.size || 0,
    })));

    if (!files || files.length === 0) {
      throw new Error("No files found in the 'frames' bucket");
    }

    // Filter image files
    const imageFiles = files.filter(isImageFile);
    if (imageFiles.length === 0) {
      throw new Error(
        "No image files found in the 'frames' bucket. Check file extensions or MIME types."
      );
    }

    // Metadata for the export
    const metadata = {
      exportDate: new Date().toISOString(),
      totalFiles: imageFiles.length,
      files: [],
    };

    const results = { successful: 0, failed: 0, errors: [] };

    // Process files in batches with concurrency limit
    await processFilesInBatches(
      imageFiles,
      10, // Batch size
      5, // Concurrent downloads
      async (file) => {
        try {
          const { data, error: downloadError } = await supabase.storage
            .from("frames")
            .download(file.name);

          if (downloadError) {
            throw new Error(`Failed to download ${file.name}: ${downloadError.message}`);
          }

          if (!data) {
            throw new Error(`No data received for ${file.name}`);
          }

          // Convert Blob to ArrayBuffer
          const arrayBuffer = await data.arrayBuffer();
          imagesFolder.file(file.name, arrayBuffer);

          // Update metadata
          metadata.files.push({
            name: file.name,
            size: file.metadata?.size || arrayBuffer.byteLength,
            contentType: file.metadata?.mimetype || "application/octet-stream",
            createdAt: file.created_at,
            lastModified: file.updated_at,
            checksum: computeChecksum(arrayBuffer),
          });

          results.successful++;
        } catch (err) {
          results.failed++;
          const errorMessage = err instanceof Error ? err.message : `Unknown error with ${file.name}`;
          results.errors.push(errorMessage);
          console.error(`Error processing file ${file.name}:`, err);
        }
      }
    );

    // Add metadata file
    zip.file("metadata.json", JSON.stringify(metadata, null, 2));

    // Generate ZIP
    const zipContent = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `images-backup-${timestamp}.zip`;

    // Upload ZIP to Supabase
    const { error: uploadError } = await supabase.storage
      .from("frames")
      .upload(fileName, zipContent, { contentType: "application/zip" });

    if (uploadError) {
      throw new Error(`Failed to upload ZIP: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("frames").getPublicUrl(fileName);

    return NextResponse.json({
      message: results.failed > 0 ? "Images exported with some errors" : "Images exported successfully",
      totalProcessed: imageFiles.length,
      successful: results.successful,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
      downloadUrl: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Export images error:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Internal server error",
        totalProcessed: 0,
        successful: 0,
        failed: 0,
      },
      { status: 500 }
    );
  }
}