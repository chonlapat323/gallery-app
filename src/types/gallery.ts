export interface GalleryImage {
  id: string;
  imageUrl: string;
  hashtags: string[];
  width: number;
  height: number;
}

export interface GalleryState {
  images: GalleryImage[];
  filteredImages: GalleryImage[];
  selectedTags: string[];
  isLoading: boolean;
  hasMore: boolean;
}
