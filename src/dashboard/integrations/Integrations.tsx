"use client";

import { useState } from "react";
import { Layers, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { WorkflowCard } from "../../components/WorkflowCard";
import { EmptyState } from "./EmptyState";

const initialInstalledIntegrations = []; // start empty

const initialPopularIntegrations = [
  {
    id: 1,
    title: "GrowthBook",
    subtitle: "Open source feature flags and A/B tests",
    logo: "/images/gmail.png",
  },
  {
    id: 2,
    title: "Clerk",
    subtitle: "Drop-in authentication for React",
    logo: "/images/gmail.png",
  },
  {
    id: 3,
    title: "Inngest",
    subtitle: "Reliable & powerful background functions",
    logo: "/images/gmail.png",
  },
  {
    id: 4,
    title: "Upstash",
    subtitle: "Serverless DB (Redis, Vector, Queue)",
    logo: "/images/gmail.png",
  },
  {
    id: 5,
    title: "Turso Cloud",
    subtitle: "SQLite for the age of AI",
    logo: "/images/gmail.png",
  },
  {
    id: 6,
    title: "PlanetScale",
    subtitle: "The world's most advanced serverless MySQL platform",
    logo: "/images/gmail.png",
  },
  {
    id: 7,
    title: "Stripe",
    subtitle: "Online payment processing for internet businesses",
    logo: "/images/gmail.png",
  },
];

export function Integrations() {
  const [installedIntegrations, setInstalledIntegrations] = useState(
    initialInstalledIntegrations
  );
  const [popularIntegrations, setPopularIntegrations] = useState(
    initialPopularIntegrations
  );

  // When user clicks a popular integration:
  const handleAddIntegration = (integration) => {
    setInstalledIntegrations((prev) => [
      ...prev,
      {
        ...integration,
        status: "active",
        badge: "Billed Via Vercel",
        lastUpdated: "just now",
      },
    ]);
    setPopularIntegrations((prev) =>
      prev.filter((item) => item.id !== integration.id)
    );
  };

  // Optional: scroll or focus popular integrations on Browse click
  const handleBrowseClick = () => {
    const popularSection = document.getElementById("popular-integrations");
    if (popularSection) {
      popularSection.scrollIntoView({ behavior: "smooth" });
      popularSection.focus();
    }
  };

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col leading-tight max-w-[calc(100%-180px)]">
              <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight mb-4">
                Integrations
              </h1>
              <div className="flex items-center text-gray-800 text-sm mt-1">
                <span>
                  Set up integrations so you can use them in your workflows and
                  so your AI can more easily help with tasks.
                </span>
                <a
                  href="#"
                  className="inline-flex items-center text-[#1A69FF] hover:text-[#1A69FF]/80 ml-1 transition-colors"
                >
                  <span>Learn more</span>
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>

            <Button
              onClick={handleBrowseClick}
              className="font-normal bg-white text-black border border-gray-200 hover:bg-gray-100"
            >
              Browse integrations
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          {/* Left Section - Installed Integrations */}
          <div className="flex-1 flex flex-col gap-2">
            {installedIntegrations.length === 0 ? (
              <EmptyState onButtonClick={handleBrowseClick} />
            ) : (
              installedIntegrations.map((integration) => (
                <WorkflowCard
                  key={integration.id}
                  title={integration.title}
                  subtitle={integration.subtitle}
                  image={integration.logo}
                  buttonLabel="Manage"
                  buttonOnClick={() =>
                    console.log(`Manage clicked for ${integration.title}`)
                  }
                  showGreenDot={integration.status === "active"}
                  buttonClassName="text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
                />
              ))
            )}
          </div>

          {/* Right Section - Popular Integrations */}
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
                    Latest Integrations
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
                      onClick={() => handleAddIntegration(integration)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleAddIntegration(integration);
                        }
                      }}
                    >
                      <div className="w-10 h-10 rounded-md flex items-center justify-center relative overflow-hidden border border-gray-200 bg-white flex-shrink-0">
                        <img
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
                onClick={handleBrowseClick}
              >
                Browse integrations
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
