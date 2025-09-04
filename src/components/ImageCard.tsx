"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { GalleryImage } from "@/types/gallery";

interface ImageCardProps {
  image: GalleryImage;
  onTagClick: (tag: string) => void;
  priority?: boolean;
  onMeasure?: (height: number) => void;
}

function ImageCard({
  image,
  onTagClick,
  priority = false,
  onMeasure,
}: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer สำหรับ lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "100px", // เริ่มโหลดก่อนเข้าหน้าจอ 100px
        threshold: 0.1,
      }
    );

    if (cardRef.current && !priority) {
      observer.observe(cardRef.current);
    } else if (priority) {
      setIsInView(true);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Measure actual card height (image + tags) using ResizeObserver
  useEffect(() => {
    if (!cardRef.current || !onMeasure) return;
    const el = cardRef.current;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = Math.round(entry.contentRect.height);
        onMeasure(h);
      }
    });
    observer.observe(el);
    // initial measure
    onMeasure(Math.round(el.getBoundingClientRect().height));
    return () => observer.disconnect();
  }, [onMeasure]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
  };

  return (
    <div className="mb-2" ref={cardRef}>
      <div className="relative group overflow-hidden rounded-lg bg-gray-100">
        {hasError ? (
          <div className="w-full h-64 flex items-center justify-center bg-gray-200 rounded-lg">
            <span className="text-gray-500 text-sm">ไม่สามารถโหลดรูปได้</span>
          </div>
        ) : isInView ? (
          <Image
            src={image.imageUrl}
            alt={`Gallery image ${image.id}`}
            width={image.width}
            height={image.height}
            className={`w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
            unoptimized
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            sizes="(max-width: 500px) 100vw, (max-width: 700px) 50vw, (max-width: 1100px) 33vw, (max-width: 1400px) 25vw, 20vw"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
            <span className="text-gray-500 text-sm">กำลังโหลด...</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1">
        {image.hashtags.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ImageCard;
