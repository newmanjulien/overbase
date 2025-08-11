"use client";

import { Layers } from "lucide-react";
import { Button } from "../../components/ui/button";
import Image from "next/image";

interface Integration {
  id: number;
  title: string;
  subtitle: string;
  logo: string;
}

interface PopularIntegrationsProps {
  popularIntegrations: Integration[];
  onAddIntegration: (integration: Integration) => void;
  onBrowseClick: () => void;
}

export function PopularIntegrations({
  popularIntegrations,
  onAddIntegration,
  onBrowseClick,
}: PopularIntegrationsProps) {
  return (
    <div
      id="popular-integrations"
      tabIndex={-1}
      className="w-80"
      aria-label="Popular integrations"
    >
      <div className="border border-gray-200/60 rounded-lg p-8">
        <div className="mb-6">
          <div className="mb-6 flex flex-col items-center text-center">
            <Layers className="w-4 h-4 text-gray-600 " />
            <h2 className="text-md font-medium text-gray-800 mt-4">
              Popular Integrations
            </h2>
            <p className="text-sm text-gray-500 font-light leading-relaxed mt-1 max-w-xs mb-2">
              Explore more integrations to expand your Vercel development
              experience.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {popularIntegrations.length === 0 ? (
            <p className="text-center text-gray-400 italic">
              No more integrations to add.
            </p>
          ) : (
            popularIntegrations.map((integration) => (
              <div
                key={integration.id}
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-md p-2"
                onClick={() => onAddIntegration(integration)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onAddIntegration(integration);
                  }
                }}
              >
                <div className="w-10 h-10 rounded-md flex items-center justify-center relative overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                  <Image
                    src={integration.logo}
                    alt={integration.title}
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0 flex flex-col">
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-800 text-sm truncate">
                      {integration.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5 font-light">
                    {integration.subtitle}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <hr className="border-t border-gray-200 my-6 " />

        <Button
          variant="outline"
          className="font-normal bg-white text-black border border-gray-200 hover:bg-gray-100 w-full"
          onClick={onBrowseClick}
        >
          Browse integrations
        </Button>
      </div>
    </div>
  );
}
