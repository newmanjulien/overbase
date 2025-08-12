// "use client";

// import { useState, useEffect, useRef } from "react";
// import Image from "next/image";

// interface PreviewImage {
//   id: string;
//   src: string;
//   alt: string;
// }

// interface PreviewImagesProps {
//   images: PreviewImage[];
// }

// export function PreviewImages({ images }: PreviewImagesProps) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const thumbnailsContainerRef = useRef<HTMLDivElement | null>(null);
//   const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

//   useEffect(() => {
//     if (images.length === 0) return;
//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % images.length);
//     }, 10000);
//     return () => clearInterval(interval);
//   }, [images.length]);

//   // Auto-scroll thumbnail into view when currentIndex changes
//   useEffect(() => {
//     const container = thumbnailsContainerRef.current;
//     const activeThumbnail = thumbnailRefs.current[currentIndex];
//     if (container && activeThumbnail) {
//       activeThumbnail.scrollIntoView({ block: "nearest", behavior: "smooth" });
//     }
//   }, [currentIndex]);

//   if (images.length === 0) return null;

//   return (
//     <section>
//       <h2 className="text-xl font-semibold text-gray-900 mb-12">Preview</h2>

//       <div className="flex gap-4 items-start">
//         {/* Main preview image */}
//         <div
//           className="relative bg-gray-100 rounded-lg overflow-hidden"
//           style={{
//             height: "25rem", // same height as thumbnails
//             aspectRatio: "16 / 10",
//           }}
//         >
//           <Image
//             src={images[currentIndex].src}
//             alt={images[currentIndex].alt}
//             fill
//             className="object-cover"
//             priority
//           />
//         </div>

//         {/* Thumbnails container with fixed height and scrolling */}
//         <div
//           ref={thumbnailsContainerRef}
//           className="relative"
//           style={{
//             width: "12rem",
//             height: "25rem", // height for 4 thumbnails + gaps
//           }}
//         >
//           {/* Scrollable thumbnails */}
//           <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar h-full">
//             {images.map((image, index) => (
//               <div
//                 key={image.id}
//                 ref={(el) => {
//                   thumbnailRefs.current[index] = el;
//                 }}
//                 className="relative bg-gray-100 rounded-md overflow-hidden cursor-pointer transition-all"
//                 style={{
//                   width: "12rem",
//                   height: "7rem",
//                   flexShrink: 0,
//                 }}
//                 onClick={() => setCurrentIndex(index)}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" || e.key === " ")
//                     setCurrentIndex(index);
//                 }}
//                 aria-label={`Preview image ${index + 1}: ${image.alt}`}
//               >
//                 <Image
//                   src={image.src}
//                   alt={image.alt}
//                   fill
//                   className="object-cover"
//                 />

//                 {index === currentIndex && (
//                   <div
//                     className="pointer-events-none absolute inset-0 rounded-md"
//                     style={{
//                       boxShadow: "inset 0 0 0 2px rgb(31 41 55)", // gray-800 inner border
//                     }}
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

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

  // Refs for thumbnails (same as before)
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto slide every 10s
  useEffect(() => {
    if (images.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Auto-scroll thumbnail into view when currentIndex changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    const activeThumbnail = thumbnailRefs.current[currentIndex];
    if (container && activeThumbnail) {
      activeThumbnail.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentIndex]);

  // Show glow only if scrollable and not scrolled to bottom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    function checkScroll() {
      const isScrollable = container.scrollHeight > container.clientHeight;
      const scrolledToBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 5;
      setShowGlow(isScrollable && !scrolledToBottom);
    }

    const timeout = setTimeout(checkScroll, 100);

    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      clearTimeout(timeout);
      container.removeEventListener("scroll", checkScroll);
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
                className="relative bg-gray-100 rounded-md overflow-hidden cursor-pointer transition-all"
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

                {index === currentIndex && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-md"
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
                  "linear-gradient(to bottom, rgba(255,255,255,0), rgba(252,252,252,0.8))",
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
