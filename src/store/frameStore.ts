// src/store/frameStore.ts
import { create } from 'zustand';
import { Frame } from '@/lib/types';

interface FrameState {
    frames: Frame[];
    selectedFrame: Frame | null;
    isLoading: boolean;
    error: string | null;
    fetchFrames: (activeOnly?: boolean) => Promise<void>;
    setSelectedFrame: (frame: Frame | null) => void;
    addFrame: (frame: Frame) => void;
    updateFrame: (frame: Frame) => void;
    toggleFrameActive: (frameId: string, isActive: boolean) => Promise<void>;
    deleteFrame: (frameId: string) => void;
    setError: (error: string | null) => void;
}

export const useFrameStore = create<FrameState>((set, get) => ({
    frames: [],
    selectedFrame: null,
    isLoading: false,
    error: null,

    fetchFrames: async (activeOnly = false) => {
        set({ isLoading: true, error: null });
        try {
            const url = activeOnly
                ? '/api/frames?activeOnly=true'
                : '/api/frames';

            const res = await fetch(url,
                {
                    headers: {
                        "x-api-key": "9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d",
                    },
                }
            );
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch frames');
            }

            set({ frames: data.data, isLoading: false });
            return data.data;
        } catch (error) {
            console.error('Error fetching frames:', error);
            set({
                isLoading: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            });
            throw error;
        }
    },

    toggleFrameActive: async (frameId, isActive) => {
        try {
            const frame = get().frames.find(f => f._id === frameId);
            if (!frame) {
                throw new Error('Frame not found');
            }

            const formData = new FormData();
            formData.append('name', frame.name);
            formData.append('dimensions', JSON.stringify(frame.dimensions));
            formData.append('placementCoords', JSON.stringify(frame.placementCoords));
            formData.append('textSettings', JSON.stringify(frame.textSettings));
            formData.append('currentImageUrl', frame.imageUrl);
            formData.append('isActive', isActive.toString());

            const res = await fetch(`/api/frames/${frameId}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'x-api-key': '9a4f2c8d7e1b5f3a9c2d8e7f1b4a5c3d',
                },
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to update frame status');
            }

            // Use the full updated frame from the API response to ensure consistency
            set((state) => ({
                frames: state.frames.map(f =>
                    f._id === frameId ? { ...data.data } : f
                ),
                selectedFrame: state.selectedFrame?._id === frameId
                    ? { ...data.data }
                    : state.selectedFrame
            }));
        } catch (error) {
            console.error('Error toggling frame active status:', error);
            set({
                error: error instanceof Error
                    ? error.message
                    : 'Failed to update frame status'
            });
            throw error;
        }
    },

    setSelectedFrame: (frame) => set({ selectedFrame: frame }),

    addFrame: (frame) => {
        set((state) => ({
            frames: [...state.frames, frame],
            error: null
        }));
    },

    updateFrame: (updatedFrame) => {
        set((state) => ({
            frames: state.frames.map(frame =>
                frame._id === updatedFrame._id ? updatedFrame : frame
            ),
            selectedFrame: updatedFrame._id === state.selectedFrame?._id
                ? updatedFrame
                : state.selectedFrame,
            error: null
        }));
    },

    deleteFrame: (frameId) => {
        console.log(`Store: Deleting frame with ID: ${frameId}`);
        set((state) => {
            const newFrames = state.frames.filter(frame => frame._id !== frameId);
            console.log(`Store: Frames after delete - count: ${newFrames.length}`);

            return {
                frames: newFrames,
                selectedFrame: state.selectedFrame?._id === frameId ? null : state.selectedFrame,
                error: null
            };
        });
    },

    setError: (error) => set({ error })
}));