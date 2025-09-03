"use client";
import React from "react";
import Image from "next/image";
import { GalleryImage } from "@/types/gallery";

interface ImageCardProps {
  image: GalleryImage;
  onTagClick: (tag: string) => void;
  priority?: boolean;
}

function ImageCard({ image, onTagClick, priority = false }: ImageCardProps) {
  return (
    <div className="mb-2">
      <div className="relative group overflow-hidden rounded-lg">
        <Image
          src={image.imageUrl}
          alt={`Gallery image ${image.id}`}
          width={image.width}
          height={image.height}
          className="w-full h-auto rounded-lg shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105"
          unoptimized
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes="(max-width: 500px) 100vw, (max-width: 700px) 50vw, (max-width: 1100px) 33vw, (max-width: 1400px) 25vw, 20vw"
        />
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
