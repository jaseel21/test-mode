"use client";

import React, { useState, useEffect } from "react";
import { Film, Eye, EyeOff, Star, Play, Clock, Folder } from "lucide-react";
import VideoThumbnail from "./VideoThumbnail";

const VideoStatusCard = ({ 
  status, 
  onPlay, 
  isSelected, 
  onSelect, 
  onToggleActive, 
  onToggleFeatured,
  onEdit,
  onDelete
}) => {
  const [hovered, setHovered] = useState(false);
  const [timeAgo, setTimeAgo] = useState("");
  
  useEffect(() => {
    if (status.createdAt) {
      const date = new Date(status.createdAt);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) {
        setTimeAgo(`${diffInSeconds} sec ago`);
      } else if (diffInSeconds < 3600) {
        setTimeAgo(`${Math.floor(diffInSeconds / 60)} min ago`);
      } else if (diffInSeconds < 86400) {
        setTimeAgo(`${Math.floor(diffInSeconds / 3600)} hr ago`);
      } else if (diffInSeconds < 604800) {
        setTimeAgo(`${Math.floor(diffInSeconds / 86400)} days ago`);
      } else {
        setTimeAgo(date.toLocaleDateString());
      }
    }
  }, [status.createdAt]);

  return (
    <div 
      className={`bg-white/10 backdrop-blur-md rounded-xl border ${
        status.isActive
          ? status.featured
            ? "border-amber-300/30 dark:border-amber-700/30"
            : "border-white/20"
          : "border-red-300/30 dark:border-red-900/30"
      } shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-white/10 bg-white/5">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(status._id)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
          />
          <div className="flex items-center">
            <Film className="h-4 w-4 text-purple-500" />
            <span className="ml-1.5 text-xs font-medium capitalize text-gray-700 dark:text-gray-300">
              Video Status
            </span>
          </div>
        </div>

        <div className="flex space-x-1">
          <div
            className={`${
              status.isActive
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
            } text-xs py-0.5 px-2 rounded-full flex items-center`}
          >
            {status.isActive ? <Eye className="h-3 w-3 mr-0.5" /> : <EyeOff className="h-3 w-3 mr-0.5" />}
            {status.isActive ? 'Active' : 'Inactive'}
          </div>

          {status.featured && (
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs py-0.5 px-2 rounded-full flex items-center ml-1">
              <Star className="h-3 w-3 mr-0.5" />
              Featured
            </div>
          )}
        </div>
      </div>

      {/* Video preview */}
      <div 
        className="aspect-square relative bg-gray-900 overflow-hidden cursor-pointer group"
        onClick={() => onPlay(status)}
      >
        {/* Video thumbnail */}
        <VideoThumbnail videoUrl={status.mediaUrl} alt={status.content} />
        
        {/* Duration indicator (if available) */}
        {status.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            <Clock className="h-3 w-3 inline mr-0.5" />
            {status.duration}
          </div>
        )}
        
        {/* Play button overlay */}
        <div className={`absolute inset-0 flex items-center justify-center ${hovered ? 'bg-black/40' : ''} transition-all duration-300`}>
          <div className={`p-4 rounded-full bg-black/70 backdrop-blur-sm text-white transform transition-all duration-300 ${
            hovered ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}>
            <Play className="h-8 w-8" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="p-4 bg-white/5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white mb-2 line-clamp-2">
          {status.content}
        </h3>

        <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
          {/* Category and date */}
          <div className="flex flex-wrap gap-2">
            {status.category && (
              <div className="bg-white/10 rounded-md px-2 py-1 flex items-center">
                <Folder className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{status.category}</span>
              </div>
            )}

            {timeAgo && (
              <div className="bg-white/10 rounded-md px-2 py-1 flex items-center">
                <Clock className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{timeAgo}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {status.tags && status.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {status.tags.map((tag, idx) => (
                <span key={idx} className="inline-block bg-blue-100/10 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 rounded-full px-2 py-0.5 text-xs border border-blue-200/20 dark:border-blue-800/20">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Usage count */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className={`flex items-center px-2 py-1 rounded ${
              (status.usageCount || 0) > 0
                ? "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}>
              <Eye className="h-3 w-3 mr-1" />
              <span className="font-medium">{status.usageCount || 0}</span>
              <span className="ml-1 text-xs opacity-80">views</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex justify-between items-center">
        <button
          onClick={() => onToggleActive(status)}
          className={`flex items-center px-3 py-1.5 rounded-lg text-xs transition-all duration-300 ${
            status.isActive
              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40"
              : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40"
          }`}
        >
          {status.isActive ? (
            <>
              <EyeOff className="h-3.5 w-3.5 mr-1" /> Deactivate
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 mr-1" /> Activate
            </>
          )}
        </button>

        <div className="flex space-x-2">
          <button
            onClick={() => onToggleFeatured(status)}
            className={`px-3 py-1.5 rounded-lg text-xs flex items-center transition-colors ${
              status.featured
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-800/40"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            title={status.featured ? "Remove from featured" : "Add to featured"}
          >
            <Star className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => onEdit(status._id)}
            className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-xs flex items-center hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(status._id)}
            className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-xs flex items-center hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoStatusCard;