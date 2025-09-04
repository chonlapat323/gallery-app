"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useGalleryStore } from "@/store/galleryStore";
// import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
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

  // เมื่อเปลี่ยน filter ให้เลื่อนสกรอลล์กลับบนสุดเพื่อกันโหลดเพิ่มโดยไม่ตั้งใจ
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [selectedTags]);

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
  }, [loadMoreItems, hasNextPage, fetchNextPage, selectedTags]);

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
  // ---------------- Balance helpers ----------------
  // Measure-based layout: cache actual card heights
  const [heightById, setHeightById] = useState<Record<string, number>>({});
  const handleMeasure = useCallback((id: string, h: number) => {
    setHeightById((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }));
  }, []);

  const distributeBalancedByCountFirst = (
    images: GalleryImage[],
    columnCount: number
  ) => {
    const cols: ColumnItem[][] = Array.from({ length: columnCount }, () => []);
    const counts = new Array(columnCount).fill(0);
    const heights = new Array(columnCount).fill(0);

    const pickTarget = () => {
      let idx = 0;
      let minCount = Number.MAX_SAFE_INTEGER;
      let minHeight = Number.MAX_SAFE_INTEGER;
      for (let i = 0; i < columnCount; i++) {
        const c = counts[i];
        const h = heights[i];
        if (c < minCount || (c === minCount && h < minHeight)) {
          minCount = c;
          minHeight = h;
          idx = i;
        }
      }
      return idx;
    };

    for (const img of images) {
      const estHeight = heightById[img.id] ?? img.height;
      const target = pickTarget();
      cols[target].push({ ...img, estHeight });
      counts[target] += 1;
      heights[target] += estHeight;
    }

    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const minH = Math.min(...heights);
    const maxH = Math.max(...heights);
    const ratioCount = maxCount === 0 ? 1 : minCount / maxCount;
    const ratioHeight = maxH === 0 ? 1 : minH / maxH;
    const metrics = {
      counts,
      heights,
      ratioCount,
      ratioHeight,
      okCount: ratioCount >= 0.8,
      okHeight: ratioHeight >= 0.8,
    };
    return { cols, metrics };
  };

  const { cols: columnArrays, metrics } = useMemo(() => {
    return distributeBalancedByCountFirst(visible, columns);
  }, [visible, columns, heightById, distributeBalancedByCountFirst]);

  // Track DOM counts for mismatch detection
  const columnRefs = useRef<HTMLDivElement[]>([]);
  const [domCounts, setDomCounts] = useState<number[]>([]);
  useEffect(() => {
    const counts = columnRefs.current.map((el) =>
      el ? el.children.length : 0
    );
    setDomCounts((prev) => {
      if (
        prev.length === counts.length &&
        prev.every((v, i) => v === counts[i])
      ) {
        return prev;
      }
      return counts;
    });
  }, [columnArrays, columns]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {columnArrays.map((col, idx) => (
          <div
            key={idx}
            ref={(el) => {
              columnRefs.current[idx] = el as HTMLDivElement;
            }}
            className="flex flex-col gap-4"
          >
            {col.map((image, i) => (
              <div key={`${image.id}-${i}`} className="break-inside-avoid">
                <ImageCard
                  image={image}
                  onTagClick={toggleTag}
                  priority={i < 10}
                  onMeasure={(h: number) => handleMeasure(image.id, h)}
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

      {/* Balance overlay */}
      <div className="fixed bottom-4 right-4 z-50 rounded-md border bg-white/90 px-3 py-2 text-xs shadow">
        <div>Counts: [{metrics.counts.join(", ")}]</div>
        <div>
          Heights: [{metrics.heights.map((h) => Math.round(h)).join(", ")}]
        </div>
        <div>
          RatioCount:{" "}
          <span className={metrics.okCount ? "text-green-600" : "text-red-600"}>
            {(metrics.ratioCount * 100).toFixed(0)}%
          </span>{" "}
          (&#8805; 80%)
        </div>
        <div>
          RatioHeight:{" "}
          <span
            className={metrics.okHeight ? "text-green-600" : "text-red-600"}
          >
            {(metrics.ratioHeight * 100).toFixed(0)}%
          </span>
        </div>
        <div>DOMCounts: [{domCounts.join(", ")}]</div>
        {!metrics.okCount && (
          <div className="text-red-600">Unbalanced by count (&lt; 80%)</div>
        )}
        {metrics.okCount &&
          domCounts.length === metrics.counts.length &&
          domCounts.some((n, i) => Math.abs(n - metrics.counts[i]) > 0) && (
            <div className="text-red-600">Mismatch: logic vs DOM</div>
          )}
      </div>
    </div>
  );
}
