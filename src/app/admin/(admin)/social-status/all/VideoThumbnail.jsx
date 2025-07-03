"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Film, RefreshCw } from "lucide-react";

const VideoThumbnail = ({ videoUrl, alt }) => {
  const [thumbnail, setThumbnail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      setError(true);
      setIsLoading(false);
      return;
    }

    const generateThumbnail = async () => {
      try {
        // Create video element to extract thumbnail
        const video = document.createElement("video");
        video.crossOrigin = "anonymous";
        
        // Create promise to handle video loading
        const videoLoadPromise = new Promise((resolve, reject) => {
          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(new Error("Video failed to load"));
          
          // Set timeout for 5 seconds
          setTimeout(() => reject(new Error("Video loading timeout")), 5000);
        });
        
        // Set video source
        video.src = videoUrl;
        
        // Wait for video to load metadata
        await videoLoadPromise;
        
        // Seek to 25% of the video for a good thumbnail frame
        video.currentTime = video.duration * 0.25;
        
        // When seeking is complete, capture the frame
        video.onseeked = () => {
          try {
            // Create canvas to capture frame
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // Draw frame to canvas
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Convert canvas to data URL
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            setThumbnail(dataUrl);
            setIsLoading(false);
          } catch (err) {
            console.error("Error generating thumbnail:", err);
            setError(true);
            setIsLoading(false);
          }
        };
      } catch (err) {
        console.error("Error loading video:", err);
        setError(true);
        setIsLoading(false);
      }
    };

    generateThumbnail();
  }, [videoUrl]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-800">
        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error || !thumbnail) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-800">
        <Film className="h-12 w-12 text-gray-400 mb-2" />
        <span className="text-xs text-gray-400">Preview not available</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={thumbnail}
        alt={alt || "Video thumbnail"}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{ objectFit: "cover" }}
        className="bg-black"
      />
    </div>
  );
};

export default VideoThumbnail;