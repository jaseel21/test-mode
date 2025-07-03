"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Search, 
  Plus, 
  RefreshCw,
  AlertCircle,
  Users,
  TrendingUp
} from "lucide-react";
import { useFrameStore } from "@/store/frameStore";
import { Frame } from "@/lib/types";

export default function AllFramesPage() {
  const { 
    frames, 
    fetchFrames, 
    toggleFrameActive, 
    isLoading, 
    error 
  } = useFrameStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchFrames(filter === "active");
  }, [filter, fetchFrames]);

  const filteredFrames = frames.filter(frame => 
    frame.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filter === "all" || 
     (filter === "active" && frame.isActive) || 
     (filter === "inactive" && !frame.isActive))
  );

  const handleToggleActive = async (frame: Frame) => {
    try {
      await toggleFrameActive(frame._id!, !frame.isActive);
      // Refetch frames to ensure UI syncs with backend
      await fetchFrames(filter === "active");
    } catch (err) {
      console.error('Failed to toggle frame status', err);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
            All Frames
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and preview all available photo frames
          </p>
        </div>

        <div className="flex gap-2">
          <Link 
            href="/admin/photoframing" 
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Link>
          
          <Link 
            href="/admin/photoframing/create" 
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" /> Create
          </Link>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search frames..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 dark:text-gray-200"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs ${
                  filter === "all" 
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400" 
                    : "bg-white/10 text-gray-600 dark:text-gray-400"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1 rounded-lg text-xs ${
                  filter === "active" 
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400" 
                    : "bg-white/10 text-gray-600 dark:text-gray-400"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("inactive")}
                className={`px-3 py-1 rounded-lg text-xs ${
                  filter === "inactive" 
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400" 
                    : "bg-white/10 text-gray-600 dark:text-gray-400"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
          
          <button
            onClick={() => fetchFrames(filter === "active")}
            className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center whitespace-nowrap"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute top-0 left-0 right-0 bottom-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
          </div>
        </div>
      )}

      {!isLoading && error && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-red-300 dark:border-red-900/50 shadow-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Error Loading Frames</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => fetchFrames(filter === "active")}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </button>
        </div>
      )}

      {!isLoading && !error && filteredFrames.length === 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-8 text-center">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            {searchTerm ? "No matching frames found" : "No frames available"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            {searchTerm 
              ? `No frames matching "${searchTerm}" were found. Try adjusting your search term or create a new frame.`
              : "You haven't created any frames yet. Get started by creating your first frame template."}
          </p>
          <Link 
            href="/admin/photoframing/create" 
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center shadow-lg mx-auto w-fit"
          >
            <Plus className="h-4 w-4 mr-2" /> Create New Frame
          </Link>
        </div>
      )}

      {!isLoading && !error && filteredFrames.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFrames.map((frame) => (
            <div 
              key={frame._id}
              className={`bg-white/10 backdrop-blur-md rounded-xl border ${
                frame.isActive 
                  ? "border-white/20" 
                  : "border-red-300/30 dark:border-red-900/30"
              } shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300`}
            >
              <div className="aspect-video relative bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <NextImage
                  src={frame.imageUrl}
                  alt={frame.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "contain" }}
                  priority={false}
                />
                
                <div 
                  className="absolute bg-emerald-500/20 rounded px-2 py-1 text-xs pointer-events-none"
                  style={{
                    left: `${frame.textSettings.x}px`,
                    top: `${frame.textSettings.y}px`,
                    fontFamily: frame.textSettings.font,
                    fontSize: `${frame.textSettings.size}px`,
                    color: frame.textSettings.color,
                  }}
                >
                  Name
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base font-medium text-gray-800 dark:text-white">
                    {frame.name}
                  </h3>
                  
                  <div 
                    className={`${
                      frame.isActive 
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400" 
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
                    } text-xs py-0.5 px-2 rounded-full`}
                  >
                    {frame.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <p>Dimensions: {frame.dimensions ? `${frame.dimensions.width}×${frame.dimensions.height}` : 'Not specified'}</p>
                  <p>Font: {frame.textSettings.font}, {frame.textSettings.size}px</p>
                  
                  {/* Add usage count display */}
                  <div className="flex items-center mt-2">
                    <div className={`flex items-center px-2 py-1 rounded ${
                      (frame.usageCount || 0) > 0 
                        ? "bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}>
                      <Users className="h-3 w-3 mr-1" />
                      <span className="font-medium">{frame.usageCount || 0}</span>
                      <span className="ml-1 text-xs opacity-80">posters created</span>
                    </div>
                    
                    {(frame.usageCount || 0) > 10 && (
                      <span className="ml-2 flex items-center text-xs text-amber-600 dark:text-amber-400">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        Popular
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleToggleActive(frame)}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                      frame.isActive
                        ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/40"
                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/40"
                    }`}
                  >
                    {frame.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  
                  <div className="flex space-x-2">
                    <Link 
                      href={`/admin/photoframing/edit?id=${frame._id}`}
                      className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-lg text-sm flex items-center hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Link>
                    
                    <Link 
                      href={`/admin/photoframing/delete?id=${frame._id}`}
                      className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm flex items-center hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}