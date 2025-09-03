"use client";
import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useGalleryStore } from "@/store/galleryStore";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ImageCard from "./ImageCard";
import Masonry from "react-masonry-css";
import { generateMockImages } from "@/app/data/galleryData";
import { GalleryImage } from "@/types/gallery";

export default function Gallery() {
  const { toggleTag, selectedTags } = useGalleryStore();
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);
  const [renderedImages, setRenderedImages] = useState(0);

  // React Query infinite scroll
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["images"],
      queryFn: ({ pageParam }: { pageParam: number }) => {
        // Simulate API call
        return new Promise<{
          images: GalleryImage[];
          nextPage: number;
          hasMore: boolean;
        }>((resolve) => {
          setTimeout(() => {
            const images = generateMockImages(20);
            resolve({
              images,
              nextPage: pageParam + 1,
              hasMore: pageParam < 99999, // จำกัด 10 หน้า
            });
          }, 1000);
        });
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage: {
        images: GalleryImage[];
        nextPage: number;
        hasMore: boolean;
      }) => (lastPage.hasMore ? lastPage.nextPage : undefined),
      staleTime: 5 * 60 * 1000, // 5 นาที
      gcTime: 10 * 60 * 1000, // 10 นาที (เปลี่ยนจาก cacheTime)
    });

  // รวมรูปจากทุกหน้า
  const allImages =
    data?.pages.flatMap(
      (page: { images: GalleryImage[]; nextPage: number; hasMore: boolean }) =>
        page.images
    ) || [];

  // Filter รูปตาม tags
  const filteredImages =
    selectedTags.length === 0
      ? allImages
      : allImages.filter((image: GalleryImage) =>
          selectedTags.some((tag) => image.hashtags.includes(tag))
        );

  const observerRef = useInfiniteScroll(fetchNextPage, hasNextPage);

  // Memory monitoring
  useEffect(() => {
    const updateMemoryInfo = () => {
      if ("memory" in performance) {
        setMemoryInfo(
          performance.memory as {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
          }
        );
      }

      // นับจำนวนรูปที่ render อยู่
      const imageElements = document.querySelectorAll('img[src*="picsum"]');
      setRenderedImages(imageElements.length);

      // Debug: log จำนวนรูป
      console.log("Rendered Images:", imageElements.length);
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 1000);

    return () => clearInterval(interval);
  }, []); // ลบ filteredImages ออกจาก dependency

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Memory Monitor */}
      <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-sm z-50">
        <h3 className="font-bold mb-2">Memory Monitor</h3>
        {memoryInfo && (
          <div className="space-y-1">
            <div>
              Used: {(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(1)} MB
            </div>
            <div>
              Total: {(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(1)} MB
            </div>
            <div>
              Limit: {(memoryInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(1)} MB
            </div>
            <div className="border-t pt-1 mt-2">
              <div>Total Images: {filteredImages.length}</div>
              <div>Rendered Images: {renderedImages}</div>
              <div>Pages: {data?.pages.length || 0}</div>
            </div>
          </div>
        )}
      </div>

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
        {filteredImages.map((image: GalleryImage, index: number) => (
          <div key={image.id} className="break-inside-avoid mb-2">
            <ImageCard
              image={image}
              onTagClick={toggleTag}
              priority={index < 10} // priority เฉพาะ 10 รูปแรก
            />
          </div>
        ))}
      </Masonry>

      {(isLoading || isFetchingNextPage) && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      <div ref={observerRef} className="h-4" />
    </div>
  );
}
