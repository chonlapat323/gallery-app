import { create } from "zustand";
import { GalleryState } from "@/types/gallery";
import { generateMockImages } from "@/app/data/galleryData";

interface GalleryStore extends GalleryState {
  // Actions
  loadMoreImages: () => void;
  toggleTag: (tag: string) => void;
  clearAllTags: () => void;
  filterImages: () => void;
}

export const useGalleryStore = create<GalleryStore>((set, get) => ({
  images: generateMockImages(20),
  filteredImages: [],
  selectedTags: [],
  isLoading: false,
  hasMore: true,

  loadMoreImages: () => {
    set({ isLoading: true });

    // Simulate API call
    setTimeout(() => {
      const newImages = generateMockImages(10);
      set((state) => ({
        images: [...state.images, ...newImages],
        isLoading: false,
        hasMore: newImages.length > 0,
      }));

      // Re-filter after loading new images
      get().filterImages();
    }, 1000);
  },

  toggleTag: (tag: string) => {
    set((state) => {
      const newSelectedTags = state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag];

      return { selectedTags: newSelectedTags };
    });

    get().filterImages();
  },

  clearAllTags: () => {
    set({ selectedTags: [] });
    get().filterImages();
  },

  filterImages: () => {
    const { images, selectedTags } = get();

    if (selectedTags.length === 0) {
      set({ filteredImages: images });
    } else {
      const filtered = images.filter((image) =>
        selectedTags.some((tag) => image.hashtags.includes(tag))
      );
      set({ filteredImages: filtered });
    }
  },
}));
