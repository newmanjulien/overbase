"use client";

import { useState, useEffect, useRef } from "react";
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
  const [showGlow, setShowGlow] = useState(false);

  // Ref for the scrollable thumbnails container (the one with overflow-y-auto)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Refs for thumbnails
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto slide every 10s
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Manual scroll thumbnails container to show active thumbnail without scrolling the whole page
  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeThumbnail = thumbnailRefs.current[currentIndex];
    if (container && activeThumbnail) {
      const containerRect = container.getBoundingClientRect();
      const thumbnailRect = activeThumbnail.getBoundingClientRect();

      const offsetTop = thumbnailRect.top - containerRect.top;
      const offsetBottom = offsetTop + thumbnailRect.height;

      if (offsetTop < 0) {
        // Scroll up
        container.scrollBy({ top: offsetTop, behavior: "smooth" });
      } else if (offsetBottom > container.clientHeight) {
        // Scroll down
        container.scrollBy({
          top: offsetBottom - container.clientHeight,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex]);

  // Show glow only if scrollable, not scrolled to bottom, and 4+ images
  useEffect(() => {
    function checkScroll() {
      const container = scrollContainerRef.current;
      if (!container) return;

      const isScrollable = container.scrollHeight > container.clientHeight;
      const scrolledToBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 5;
      setShowGlow(isScrollable && !scrolledToBottom && images.length >= 4);
    }

    const timeout = setTimeout(checkScroll, 100);

    const container = scrollContainerRef.current;
    container?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      clearTimeout(timeout);
      container?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-900 mb-12">Preview</h2>

      <div className="flex gap-4 items-start">
        {/* Main preview image */}
        <div
          className="relative bg-gray-100 rounded-xl overflow-hidden"
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

        {/* Thumbnails container with fixed width and height */}
        <div
          className="relative"
          style={{
            width: "12rem",
            height: "25rem",
          }}
        >
          {/* Scrollable thumbnails - this is the scroll container */}
          <div
            ref={scrollContainerRef}
            className="flex flex-col gap-2 overflow-y-auto no-scrollbar h-full"
          >
            {images.map((image, index) => (
              <div
                key={image.id}
                ref={(el) => {
                  thumbnailRefs.current[index] = el;
                }}
                className="relative bg-gray-100 rounded-xl overflow-hidden cursor-pointer transition-all"
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
                aria-current={index === currentIndex ? "true" : undefined}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />

                {index === currentIndex && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl"
                    style={{
                      boxShadow: "inset 0 0 0 2px rgb(31 41 55)", // gray-800 inner border
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Glow overlay at bottom if needed */}
          {showGlow && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 w-full h-8 rounded-b-md"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(250,250,250,0), rgba(250,250,250,0.8))",
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
