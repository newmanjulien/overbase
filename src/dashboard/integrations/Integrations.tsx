"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "../../components/ui/button";
import { WorkflowCard } from "../../components/WorkflowCard";
import { EmptyState } from "./EmptyState";
import { PopularIntegrations } from "./PopularIntegrations";

interface Integration {
  id: number;
  title: string;
  subtitle: string;
  logo: string;
  status?: string;
  badge?: string;
  lastUpdated?: string;
}

const initialInstalledIntegrations: Integration[] = []; // start empty

const initialPopularIntegrations: Integration[] = [
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
  const [installedIntegrations, setInstalledIntegrations] = useState<
    Integration[]
  >(initialInstalledIntegrations);
  const [popularIntegrations, setPopularIntegrations] = useState<Integration[]>(
    initialPopularIntegrations
  );

  const handleAddIntegration = (integration: Integration) => {
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
          <PopularIntegrations
            popularIntegrations={popularIntegrations}
            onAddIntegration={handleAddIntegration}
            onBrowseClick={handleBrowseClick}
          />
        </div>
      </div>
    </div>
  );
}
