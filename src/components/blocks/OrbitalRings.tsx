"use client";

import React from "react";
import Image from "next/image";

export default function OrbitalRings() {
  // Explicit class strings so Tailwind won’t purge them.
  const rings = [
    {
      sizeClass: "w-32 h-32",
      borderClass: "border-gray-300/80",
      delay: "0s",
      spin: 40,
      dotBorder: "border-gray-300/80",
    },
    {
      sizeClass: "w-48 h-48",
      borderClass: "border-gray-300/60",
      delay: "0.2s",
    },
    {
      sizeClass: "w-64 h-64",
      borderClass: "border-gray-300/40",
      delay: "0.4s",
      spin: 40,
      dotBorder: "border-gray-300/40",
    },
    {
      sizeClass: "w-80 h-80",
      borderClass: "border-gray-300/20",
      delay: "0.6s",
    },
    {
      sizeClass: "w-96 h-96",
      borderClass: "border-gray-300/10",
      delay: "0.8s",
      spin: 40,
      dotBorder: "border-gray-300/10",
    },
  ];

  const spinningRings = rings.filter((r) => r.spin);

  // Generate CSS keyframes once (not inside JSX map)
  const keyframes = spinningRings
    .map((r, i) => {
      const startAngle = (360 / spinningRings.length) * i;
      return `
        @keyframes spin-${i} {
          from { transform: rotate(${startAngle}deg); }
          to { transform: rotate(${startAngle + 360}deg); }
        }
      `;
    })
    .join("\n");

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="relative flex items-center justify-center w-96 h-96">
        {/* Global styles */}
        <style jsx global>{`
          @keyframes ripple {
            0% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.15);
              opacity: 0.6;
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes rippleScale {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.15);
            }
            100% {
              transform: scale(1);
            }
          }
          ${keyframes}
        `}</style>

        {/* Concentric rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          {rings.map((r, i) => (
            <div
              key={`ring-${i}`}
              className={`absolute ${r.sizeClass} rounded-full border ${r.borderClass} animate-[ripple_3s_ease-out_infinite] origin-center`}
              style={{ animationDelay: r.delay }}
            />
          ))}
        </div>

        {/* Orbiting dots */}
        {spinningRings.map((r, i) => (
          <div
            key={`orbit-${i}`}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              animation: `spin-${i} ${r.spin}s linear infinite`,
            }}
          >
            {/* This container scales with the ring but never fades */}
            <div
              className={`absolute ${r.sizeClass} animate-[rippleScale_3s_ease-out_infinite] origin-center`}
              style={{ animationDelay: r.delay }}
            >
              <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border ${
                  r.dotBorder ?? ""
                } shadow-none`}
              />
            </div>
          </div>
        ))}

        {/* Static center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={55}
            height={55}
            className="pointer-events-none select-none"
          />
        </div>
      </div>
    </div>
  );
}
