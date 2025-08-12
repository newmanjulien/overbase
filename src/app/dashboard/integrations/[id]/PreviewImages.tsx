"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface PreviewImage {
  id: string;
  src: string;
  alt: string;
}

interface PreviewImagesProps {
  images: PreviewImage[];
}

export function PreviewImages({ images }: PreviewImagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-12">Preview</h2>

      <div className="flex gap-4 items-start">
        {/* Main preview image */}
        <div
          className="relative bg-gray-100 rounded-lg overflow-hidden"
          style={{
            height: "25rem", // same height as thumbnails
            aspectRatio: "16 / 10",
          }}
        >
          <Image
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Thumbnails container with fixed height and scrolling */}
        <div
          className="relative"
          style={{
            width: "12rem",
            height: "25rem", // height for 4 thumbnails + gaps
          }}
        >
          {/* Scrollable thumbnails */}
          <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar h-full">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`relative bg-gray-100 rounded-md overflow-hidden cursor-pointer transition-all border-2 ${
                  index === currentIndex
                    ? "border-gray-800"
                    : "border-transparent"
                }`}
                style={{
                  width: "12rem",
                  height: "7rem",
                  flexShrink: 0,
                }}
                onClick={() => setCurrentIndex(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setCurrentIndex(index);
                }}
                aria-label={`Preview image ${index + 1}: ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
