"use client";

import { Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Connectors } from "./DummyData";
import { Button } from "@/components/ui/button";

interface PopularConnectorsProps {
  popularConnectors: Connectors[];
  onBrowseClick: () => void;
}

export function PopularConnectors({
  popularConnectors,
  onBrowseClick,
}: PopularConnectorsProps) {
  return (
    <div
      id="popular-connectors"
      tabIndex={-1}
      className="w-80"
      aria-label="Popular connectors"
    >
      <div className="border border-gray-200/60 rounded-2xl p-7">
        <div className="mb-6 flex flex-col items-center text-center">
          <Layers className="w-4 h-4 text-gray-600" />
          <h2 className="text-md font-medium text-gray-800 mt-4">
            Installed connectors
          </h2>
          <p className="text-sm text-gray-500 font-light leading-relaxed mt-1 max-w-xs">
            Easily add connectors your colleagues have already installed
          </p>
        </div>

        <div className="space-y-3">
          {popularConnectors.length === 0 ? (
            <p className="text-center text-gray-400 italic">
              No more connectors to add
            </p>
          ) : (
            popularConnectors.map((connector) => (
              <Link
                key={connector.id}
                href={`/dashboard/connectors/${connector.id}`}
                title={`Set up ${connector.title}`}
                className="block"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl px-2 py-2 h-auto focus-visible:ring-2"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center relative overflow-hidden border border-gray-200/60 bg-white flex-shrink-0">
                      <Image
                        src={connector.logo}
                        alt={`${connector.title} logo`}
                        width={30}
                        height={30}
                        className="object-contain"
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0 flex flex-col text-left">
                      <h3 className="font-medium text-gray-800 text-sm truncate">
                        {connector.title}
                      </h3>
                      <p className="text-gray-400 text-xs mt-0.5 font-light truncate">
                        {connector.subtitle}
                      </p>
                    </div>
                  </div>
                </Button>
              </Link>
            ))
          )}
        </div>

        <hr className="border-t border-gray-200/60 my-6 " />

        <Button variant="outline" className="w-full" onClick={onBrowseClick}>
          See all installed connectors
        </Button>
      </div>
    </div>
  );
}
