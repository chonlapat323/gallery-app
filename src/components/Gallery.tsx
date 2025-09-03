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
          1400: 4,
          1100: 3,
          700: 2,
          500: 1,
        }}
        className="flex -ml-2 w-auto"
        columnClassName="pl-2 bg-clip-padding"
      >
        {filteredImages.map((image, index) => (
          <div key={image.id} className="break-inside-avoid mb-2">
            <ImageCard
              image={image}
              onTagClick={toggleTag}
              priority={index < 10} // priority เฉพาะ 10 รูปแรก
            />
          </div>
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
