export interface PlacementCoords {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface TextSettings {
    x: number;
    y: number;
    width: number;
    height: number;
    font: string;
    size: number;
    color: string;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface Frame {
    _id?: string;
    name: string;
    imageUrl: string;
    dimensions: Dimensions;
    placementCoords: PlacementCoords;
    textSettings: TextSettings;
    isActive?: boolean;
    usageCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Status {
    duration: string;
    _id: string;
    content: string;
    type: 'text' | 'image' | 'video';
    mediaUrl?: string;
    thumbnailUrl?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    fontSize?: number;
    tags: string[];
    category: string;
    featured: boolean;
    isActive: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface StatusCategory {
    _id: string;
    name: string;
    description?: string;
    isActive: boolean;
    count?: number;
}

export interface StatusTag {
    _id: string;
    name: string;
    count?: number;
}

export interface StatusStats {
    dailyUsage: number | undefined;
    recentActivity: Record<string, unknown>;
    weeklyEngagement: Record<string, unknown>;
    typeDistribution: Record<string, unknown>;
    totalStatuses: number;
    activeStatuses: number;
    totalUsage: number;
    topStatuses: {
        category: string;
        _id: string;
        content: string;
        usageCount: number;
    }[];
    categoryCounts: {
        category: string;
        count: number;
    }[];
}