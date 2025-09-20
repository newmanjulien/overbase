"use client";

import { Layers } from "lucide-react";
import Image from "next/image";
import type { Connectors } from "./DummyData";
import { Button } from "@/components/ui/button";

interface PopularConnectorsProps {
  popularConnectors: Connectors[];
  onAddConnector: (connector: Connectors) => void;
  onBrowseClick: () => void;
}

export function PopularConnectors({
  popularConnectors,
  onAddConnector,
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
            Popular Connectors
          </h2>
          <p className="text-sm text-gray-500 font-light leading-relaxed mt-1 max-w-xs">
            Easily set up connectors with the most popular platforms.
          </p>
        </div>

        <div className="space-y-5">
          {popularConnectors.length === 0 ? (
            <p className="text-center text-gray-400 italic">
              No more connectors to add
            </p>
          ) : (
            popularConnectors.map((connector) => (
              <div
                key={connector.id}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-xl"
                onClick={() => onAddConnector(connector)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onAddConnector(connector);
                  }
                }}
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center relative overflow-hidden border border-gray-200/60 bg-white flex-shrink-0">
                  <Image
                    src={connector.logo}
                    alt={connector.title}
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0 flex flex-col">
                  <h3 className="font-medium text-gray-800 text-sm truncate">
                    {connector.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-0.5 font-light">
                    {connector.subtitle}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <hr className="border-t border-gray-200/60 my-6 " />

        <Button
          variant="outline"
          className="font-normal bg-white text-black border border-gray-200 hover:bg-gray-100 w-full rounded-lg"
          onClick={onBrowseClick}
        >
          Browse connectors
        </Button>
      </div>
    </div>
  );
}
