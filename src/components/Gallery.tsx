"use client";
import { useEffect } from "react";
import { useGalleryStore } from "@/store/galleryStore";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ImageCard from "./ImageCard";
import Masonry from "react-masonry-css";

export default function Gallery() {
  const {
    filteredImages,
    isLoading,
    hasMore,
    loadMoreImages,
    toggleTag,
    filterImages,
  } = useGalleryStore();

  const observerRef = useInfiniteScroll(loadMoreImages, hasMore);

  useEffect(() => {
    filterImages();
  }, [filterImages]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Masonry
        breakpointCols={{
          default: 4,
          1100: 3,
          700: 2,
          500: 1,
        }}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {filteredImages.map((image) => (
          <ImageCard key={image.id} image={image} onTagClick={toggleTag} />
        ))}
      </Masonry>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      <div ref={observerRef} className="h-4" />
    </div>
  );
}
