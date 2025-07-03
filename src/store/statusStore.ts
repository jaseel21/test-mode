// src/store/statusStore.ts
import { create } from 'zustand';
import { Status, StatusCategory, StatusStats } from '@/lib/types';

interface StatusState {
    statuses: Status[];
    categories: StatusCategory[];
    selectedStatus: Status | null;
    isLoading: boolean;
    error: string | null;
    stats: StatusStats | null;

    // Fetch functions
    fetchStatuses: (activeOnly?: boolean, category?: string, tag?: string) => Promise<void>;
    fetchCategories: () => Promise<void>;
    fetchStats: () => Promise<void>;

    // CRUD functions
    setSelectedStatus: (status: Status | null) => void;
    addStatus: (status: Status) => void;
    updateStatus: (status: Status) => void;
    toggleStatusActive: (statusId: string, isActive: boolean) => Promise<void>;
    toggleStatusFeatured: (statusId: string, featured: boolean) => Promise<void>;
    deleteStatus: (statusId: string) => void;

    // Error handling
    setError: (error: string | null) => void;
}

export const useStatusStore = create<StatusState>((set, get) => ({
    statuses: [],
    categories: [],
    selectedStatus: null,
    isLoading: false,
    error: null,
    stats: null,

    fetchStatuses: async (activeOnly = false, category = '', tag = '') => {
        set({ isLoading: true, error: null });
        try {
            let url = '/api/statuses';
            const params = new URLSearchParams();

            if (activeOnly) params.append('activeOnly', 'true');
            if (category) params.append('category', category);
            if (tag) params.append('tag', tag);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await fetch(url,{
                headers: { 
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                   },
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch statuses');
            }

            set({ statuses: data.data, isLoading: false });
            return data.data;
        } catch (error) {
            console.error('Error fetching statuses:', error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            });
            throw error;
        }
    },

    fetchCategories: async () => {
        try {
            const res = await fetch('/api/statuses/categories', {
                headers: {
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch categories');
            }

            set({ categories: data.data });
            return data.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            set({
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            });
            throw error;
        }
    },

    fetchStats: async () => {
        try {
            const res = await fetch('/api/statuses/stats',
                {
                    headers: {
                        'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                    },
                }
            );
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch status statistics');
            }

            set({ stats: data.data });
            return data.data;
        } catch (error) {
            console.error('Error fetching status statistics:', error);
            set({
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            });
            throw error;
        }
    },

    toggleStatusActive: async (statusId, isActive) => {
        try {
            const status = get().statuses.find(s => s._id === statusId);
            if (!status) {
                throw new Error('Status not found');
            }

            const res = await fetch(`/api/statuses/${statusId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
                body: JSON.stringify({ ...status, isActive }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to update status');
            }

            set((state) => ({
                statuses: state.statuses.map(s =>
                    s._id === statusId ? { ...data.data } : s
                ),
                selectedStatus: state.selectedStatus?._id === statusId
                    ? { ...data.data }
                    : state.selectedStatus
            }));
        } catch (error) {
            console.error('Error toggling status active state:', error);
            set({
                error: error instanceof Error
                    ? error.message
                    : 'Failed to update status'
            });
            throw error;
        }
    },

    toggleStatusFeatured: async (statusId, featured) => {
        try {
            const status = get().statuses.find(s => s._id === statusId);
            if (!status) {
                throw new Error('Status not found');
            }

            const res = await fetch(`/api/statuses/${statusId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
                body: JSON.stringify({ ...status, featured }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to update status');
            }

            set((state) => ({
                statuses: state.statuses.map(s =>
                    s._id === statusId ? { ...data.data } : s
                ),
                selectedStatus: state.selectedStatus?._id === statusId
                    ? { ...data.data }
                    : state.selectedStatus
            }));
        } catch (error) {
            console.error('Error toggling status featured state:', error);
            set({
                error: error instanceof Error
                    ? error.message
                    : 'Failed to update status'
            });
            throw error;
        }
    },

    setSelectedStatus: (status) => set({ selectedStatus: status }),

    addStatus: (status) => {
        set((state) => ({
            statuses: [...state.statuses, status],
            error: null
        }));
    },

    updateStatus: (updatedStatus) => {
        set((state) => ({
            statuses: state.statuses.map(status =>
                status._id === updatedStatus._id ? updatedStatus : status
            ),
            selectedStatus: updatedStatus._id === state.selectedStatus?._id
                ? updatedStatus
                : state.selectedStatus,
            error: null
        }));
    },

    deleteStatus: (statusId) => {
        set((state) => ({
            statuses: state.statuses.filter(status => status._id !== statusId),
            selectedStatus: state.selectedStatus?._id === statusId ? null : state.selectedStatus,
            error: null
        }));
    },

    setError: (error) => set({ error })
}));