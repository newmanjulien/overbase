import { Layers, ExternalLink } from "lucide-react";
import { Button } from "../../components/ui/button";
import { WorkflowCard } from "../../components/WorkflowCard";

const installedIntegrations = [
  {
    id: 1,
    title: "Prisma",
    subtitle: "Storage",
    logo: "/images/gmail.png",
    badge: "Billed Via Vercel",
    lastUpdated: "49s ago",
    status: "active",
  },
  {
    id: 2,
    title: "Supabase",
    subtitle: "Database & Auth",
    logo: "/images/gmail.png",
    badge: "Billed Via Vercel",
    lastUpdated: "2h ago",
    status: "active",
  },
  {
    id: 3,
    title: "Vercel Analytics",
    subtitle: "Web Analytics",
    logo: "/images/gmail.png",
    badge: "Billed Via Vercel",
    lastUpdated: "1d ago",
    status: "active",
  },
];

const popularIntegrations = [
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
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      {/* Header Section with subtle bottom border */}
      {/* <div className="border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-[2rem] font-medium text-gray-800 mb-4 tracking-tight">
            Integrations
          </h1>
        </div>
      </div> */}
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
              onClick={() => {
                /* does nothing */
              }}
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
            {installedIntegrations.map((integration) => (
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
            ))}
          </div>

          {/* Right Section - Popular Integrations */}
          <div className="w-80">
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
                {popularIntegrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center space-x-3 cursor-pointer"
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
                ))}
              </div>

              <hr className="border-t border-gray-200 my-6 " />

              <Button
                variant="outline"
                className="font-normal bg-white text-black border border-gray-200 hover:bg-gray-100 w-full"
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
