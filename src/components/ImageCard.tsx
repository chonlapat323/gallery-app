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
    <div className="mb-4">
      <div className="relative group">
        <Image
          src={image.imageUrl}
          alt={`Gallery image ${image.id}`}
          width={image.width}
          height={image.height}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
          }}
          className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
          unoptimized
          priority={priority}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg" />
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
