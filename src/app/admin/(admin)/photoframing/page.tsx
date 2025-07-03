"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  PlusCircle, 
  Image as ImageIcon, 
  Settings, 
  Users, 
  Upload, 
  Layers,
  Medal,
  TrendingUp
} from "lucide-react";
// import { Frame } from "@/lib/types";

// Define the stats interface with top frames
interface Stats {
  totalFrames: number;
  activeFrames: number;
  userFrames: number; // Total usage count
  topFrames?: {
    _id: string;
    name: string;
    usageCount: number;
  }[];
}

export default function PhotoFramingAdminPage() {
  const [stats, setStats] = useState<Stats>({
    totalFrames: 0,
    activeFrames: 0,
    userFrames: 0,
    topFrames: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Use the new stats endpoint
        const response = await fetch('/api/frames/stats',{
       headers: {
            'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
          },
        });
        const data = await response.json();
        
        if (data.success) {
          setStats({
            totalFrames: data.data.totalFrames,
            activeFrames: data.data.activeFrames,
            userFrames: data.data.totalUsage,
            topFrames: data.data.topFrames
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">
            Photo Framing Tool
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage frames, templates, and user photo framing options
          </p>
        </div>
        
        <Link 
          href="/admin/photoframing/create" 
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center shadow-lg"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Create New Frame
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Frames</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  stats.totalFrames
                )}
              </h3>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
              <Layers className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-2">
            <Link 
              href="/admin/photoframing/all"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center"
            >
              View all frames
            </Link>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Frames</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  stats.activeFrames
                )}
              </h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <ImageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isLoading ? '...' : 'Available on user interface'}
            </span>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User Posters</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ) : (
                  stats.userFrames
                )}
              </h3>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {isLoading ? '...' : 'Total posters created by users'}
            </span>
          </div>
        </div>
      </div>

      {/* Most Popular Frames Section */}
      {stats.topFrames && stats.topFrames.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6">
          <div className="flex items-center mb-4">
            <Medal className="h-5 w-5 text-amber-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Most Popular Frames</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Rank</th>
                  <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Frame Name</th>
                  <th className="py-2 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Usage Count</th>
                  <th className="py-2 px-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4">
                        <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ml-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  stats.topFrames.map((frame, index) => (
                    <tr key={frame._id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium 
                            ${index === 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' : 
                            index === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400' :
                            index === 2 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                            'bg-white/10 text-gray-600 dark:text-gray-400'}`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">{frame.name}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {frame.usageCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link 
                          href={`/admin/photoframing/edit?id=${frame._id}`}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/admin/photoframing/create" 
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 hover:from-emerald-500/10 hover:to-blue-500/10 transition-colors"
          >
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full mb-3">
              <PlusCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-white">Create New Frame</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              Add a new frame template
            </p>
          </Link>
          
          <Link 
            href="/admin/photoframing/all" 
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 hover:from-emerald-500/10 hover:to-blue-500/10 transition-colors"
          >
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-3">
              <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-white">View All Frames</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              Manage existing frames
            </p>
          </Link>
          
          <Link 
            href="/admin/photoframing/edit" 
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 hover:from-emerald-500/10 hover:to-blue-500/10 transition-colors"
          >
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full mb-3">
              <Settings className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-white">Edit Templates</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              Modify existing frames
            </p>
          </Link>
          
          <Link 
            href="/photoframing"
            target="_blank"
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/5 to-blue-500/5 hover:from-emerald-500/10 hover:to-blue-500/10 transition-colors"
          >
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-3">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-white">User Interface</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              View the user experience
            </p>
          </Link>
        </div>
      </div>

      {/* User Interface Preview section remains unchanged */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">User Interface Preview</h3>
        </div>
        
        <div className="p-6">
          <div className="bg-white/5 rounded-lg border border-white/10 p-4 flex flex-col lg:flex-row items-center gap-6">
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
                <span className="absolute bottom-2 right-2 bg-white/80 dark:bg-black/60 backdrop-blur-sm text-xs text-gray-800 dark:text-white px-2 py-1 rounded">
                  Photo Framing Preview
                </span>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 space-y-4">
              <h4 className="text-base font-medium text-gray-800 dark:text-white">User Photo Framing Tool</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                The photo framing tool allows users to upload their own photos and place them into the frames you create. Users can crop their images, position them within your pre-defined areas, and add their names.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/photoframing"
                  target="_blank"
                  className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-sm font-medium hover:bg-white/20 transition-all duration-300 flex items-center"
                >
                  View User Interface
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}