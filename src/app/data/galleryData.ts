import { GalleryImage } from "@/types/gallery";

const hashtags = [
  "nature",
  "city",
  "food",
  "travel",
  "art",
  "architecture",
  "landscape",
  "portrait",
  "abstract",
  "vintage",
  "modern",
  "colorful",
  "black-white",
  "minimalist",
  "urban",
];

// Generate unique ID without deprecated methods
const generateUniqueId = (index: number): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `image-${timestamp}-${index}-${randomPart}`;
};

export const generateMockImages = (count: number): GalleryImage[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: generateUniqueId(index),
    imageUrl: `https://placehold.co/${getSeededSize(index)}`,
    hashtags: getSeededHashtags(index),
    width: getSeededWidth(index),
    height: getSeededHeight(index),
  }));
};

// Seeded random functions for consistent SSR/Client rendering
const getSeededSize = (seed: number) => {
  const sizes = ["300x400", "400x300", "350x500", "500x350", "400x400"];
  return sizes[seed % sizes.length];
};

const getSeededHashtags = (seed: number) => {
  const numTags = (seed % 4) + 1; // 1-4 tags
  const shuffled = [...hashtags].sort((a, b) => {
    const hashA = a
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hashB = b
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (hashA + seed) % 2 === 0 ? 1 : -1;
  });
  return shuffled.slice(0, numTags);
};

const getSeededWidth = (seed: number) => {
  const widths = [300, 350, 400, 450, 500];
  return widths[seed % widths.length];
};

const getSeededHeight = (seed: number) => {
  const heights = [300, 350, 400, 450, 500, 550, 600];
  return heights[seed % heights.length];
};
