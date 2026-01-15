"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ASSET_KEYS } from "@/lib/assets";

export default function StaticFooter() {
  const logoAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.OVERBASE_LOGO,
  });
  const logoUrl = logoAsset?.imageUrl ?? null;

  return (
    <footer className="bg-white">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Unclickable Logo */}
            <div className="h-4 cursor-default">
              {logoUrl ? (
                <Image src={logoUrl} alt="" width={38} height={20} />
              ) : (
                <div className="w-[38px] h-[20px] bg-gray-100 rounded animate-pulse" />
              )}
            </div>
          </div>
          <nav className="flex space-x-8">
            {["Home", "Docs", "Guides", "Help", "Contact", "Legal"].map(
              (label) => (
                <div
                  key={label}
                  className="text-gray-500 cursor-default text-sm font-light transition-colors"
                >
                  {label}
                </div>
              )
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}
