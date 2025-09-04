"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useGalleryStore } from "@/store/galleryStore";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ImageCard from "./ImageCard";
import { generateMockImages } from "@/app/data/galleryData";
import { GalleryImage } from "@/types/gallery";

type ColumnItem = GalleryImage & { estHeight: number };

// deterministic: generator ใน galleryData.ts เป็นแบบ seeded อยู่แล้ว

export default function Gallery() {
  const { toggleTag, selectedTags } = useGalleryStore();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["images"],
      queryFn: ({ pageParam }: { pageParam: number }) =>
        new Promise<{
          images: GalleryImage[];
          nextPage: number;
          hasMore: boolean;
        }>((resolve) => {
          setTimeout(() => {
            const images = generateMockImages(50);
            resolve({
              images,
              nextPage: pageParam + 1,
              hasMore: pageParam < 1000,
            });
          }, 300);
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage: {
        images: GalleryImage[];
        nextPage: number;
        hasMore: boolean;
      }) => (lastPage.hasMore ? lastPage.nextPage : undefined),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    });

  const allImages: GalleryImage[] =
    data?.pages.flatMap((p: { images: GalleryImage[] }) => p.images) || [];

  const filteredImages = useMemo(() => {
    if (selectedTags.length === 0) return allImages;
    return allImages.filter((img) =>
      selectedTags.some((tag) => img.hashtags.includes(tag))
    );
  }, [allImages, selectedTags]);

  // incremental loading เหมือน PinGallery
  const [visibleItems, setVisibleItems] = useState(50);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadMoreItems = useCallback(() => {
    if (visibleItems >= filteredImages.length) return;
    setVisibleItems((prev) => Math.min(prev + 50, filteredImages.length));
  }, [visibleItems, filteredImages.length]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItems();
          if (hasNextPage) fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMoreItems, hasNextPage, fetchNextPage]);

  // คอลัมน์ตามความสูงแบบ PinGallery
  const [columns, setColumns] = useState(4);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w >= 1280) setColumns(4);
      else if (w >= 1024) setColumns(3);
      else if (w >= 640) setColumns(2);
      else setColumns(1);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const visible = useMemo(
    () => filteredImages.slice(0, visibleItems),
    [filteredImages, visibleItems]
  );

  const columnArrays = useMemo(() => {
    const cols: ColumnItem[][] = Array.from({ length: columns }, () => []);
    const heights = new Array(columns).fill(0);
    visible.forEach((img) => {
      const estHeight = img.height; // ใช้ข้อมูล seeded height เดิม
      const shortest = heights.indexOf(Math.min(...heights));
      cols[shortest].push({ ...img, estHeight });
      heights[shortest] += estHeight;
    });
    return cols;
  }, [visible, columns]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {columnArrays.map((col, idx) => (
          <div key={idx} className="flex flex-col gap-4">
            {col.map((image, i) => (
              <div key={`${image.id}-${i}`} className="break-inside-avoid">
                <ImageCard
                  image={image}
                  onTagClick={toggleTag}
                  priority={i < 10}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {(isLoading || isFetchingNextPage) && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      )}

      <div ref={loadMoreRef} className="h-10" />
    </div>
  );
}
