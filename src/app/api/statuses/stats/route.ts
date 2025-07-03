// src/app/api/statuses/stats/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Status from '@/models/Status';

export async function GET() {
    try {
        await dbConnect();

        // Get total statuses count
        const totalStatuses = await Status.countDocuments();

        // Get active statuses count
        const activeStatuses = await Status.countDocuments({ isActive: true });

        // Get the total number of usages across all statuses
        const aggregationResult = await Status.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsage: { $sum: "$usageCount" }
                }
            }
        ]);

        // Extract the total usage from the aggregation result or default to 0
        const totalUsage = aggregationResult.length > 0 ? aggregationResult[0].totalUsage : 0;

        // Get top 5 most used statuses
        const topStatuses = await Status.find()
            .sort({ usageCount: -1, content: 1 })
            .limit(5)
            .select('_id content usageCount category');

        // Get category counts
        const categoryCounts = await Status.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    category: "$_id",
                    count: 1,
                    _id: 0
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // NEW: Get usage by type (text, image, video)
        const typeDistribution = await Status.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    usage: { $sum: "$usageCount" }
                }
            },
            {
                $project: {
                    type: "$_id",
                    count: 1,
                    usage: 1,
                    _id: 0
                }
            }
        ]);

        // NEW: Get today's usage
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const usageToday = await Status.aggregate([
            {
                $match: {
                    updatedAt: { $gte: today }
                }
            },
            {
                $group: {
                    _id: null,
                    todayUsage: { $sum: "$usageCount" }
                }
            }
        ]);

        const todayUsageCount = usageToday.length > 0 ? usageToday[0].todayUsage : 0;

        // NEW: Get weekly engagement data (last 7 days)
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);
            
            const dailyUsage = await Status.aggregate([
                {
                    $match: {
                        updatedAt: { 
                            $gte: date,
                            $lt: nextDate
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        usage: { $sum: "$usageCount" }
                    }
                }
            ]);
            
            weeklyData.push({
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.toISOString().split('T')[0],
                usage: dailyUsage.length > 0 ? dailyUsage[0].usage : 0
            });
        }

        // NEW: Get recent activity (10 most recent status changes or high usage)
        const recentActivity = await Status.find()
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('_id content type category usageCount updatedAt');
        
        // Transform into activity feed items
        const activityFeed = recentActivity.map(status => {
            // Determine activity type based on available data
            // This is a simplified version - you might want to track specific events in a real app
            return {
                id: status._id,
                type: status.usageCount > 50 ? 'high_usage' : 'update',
                content: status.content,
                category: status.category,
                statusType: status.type,
                usageCount: status.usageCount,
                timestamp: status.updatedAt
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                totalStatuses,
                activeStatuses,
                totalUsage,
                topStatuses,
                categoryCounts,
                typeDistribution,
                todayUsage: todayUsageCount,
                weeklyEngagement: weeklyData,
                recentActivity: activityFeed
            }
        });
    } catch (error) {
        console.error("Error fetching status statistics:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch status statistics",
                error: error instanceof Error ? error.message : "An unknown error occurred"
            },
            { status: 500 }
        );
    }
}