"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ASSET_KEYS } from "@/lib/assets";

export default function StaticHeader() {
  const logoAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.OVERBASE_LOGO,
  });
  const logoUrl = logoAsset?.imageUrl ?? null;

  const navItems = [
    { label: "Questions" },
    { label: "Templates" },
    { label: "Connectors" },
    { label: "People" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200/60">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11">
          <div className="flex items-center space-x-8">
            {/* Unclickable Logo */}
            <div className="h-7 cursor-default">
              {logoUrl ? (
                <Image src={logoUrl} alt="" width={42} height={30} priority />
              ) : (
                <div className="w-[42px] h-[30px] bg-gray-100 rounded animate-pulse" />
              )}
            </div>

            {/* Unclickable Nav */}
            <nav className="flex space-x-3 items-center">
              {navItems.map((item) => {
                // For static demo, we can just say nothing is active, or "Questions" is active
                // "Questions" seems appropriate since we are viewing an answer
                const isActive = item.label === "Questions";
                return (
                  <div
                    key={item.label}
                    className={`px-2 py-1 text-sm font-[350] rounded-lg cursor-default hover:text-gray-900 hover:bg-gray-100 ${
                      isActive ? "text-gray-700 bg-gray-100" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
