"use client";
import TagFilter from "./TagFilter";
import { useGalleryStore } from "@/store/galleryStore";

export default function Header() {
  const { selectedTags, toggleTag, clearAllTags } = useGalleryStore();

  // Get all unique tags
  const allTags = Array.from(
    new Set(useGalleryStore.getState().images.flatMap((img) => img.hashtags))
  ).sort();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-md">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-3xl font-bold text-center mb-6">Gallery</h1>

        <TagFilter
          tags={allTags}
          selectedTags={selectedTags}
          onTagToggle={toggleTag}
          onClearAll={clearAllTags}
        />
      </div>
    </header>
  );
}
