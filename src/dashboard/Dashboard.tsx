"use client";

import { useState } from "react";
import { Emails } from "./Email";
import { Templates } from "./Templates";
import Handlers from "./Handlers";
import { Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import Logo from "../components/Logo";
import LogoSmall from "../components/LogoSmall";
import { handlers } from "./DummyData";
import { useRouter } from "next/navigation";
import { Updates } from "./Updates";
import { Research } from "./Research";
import { useSearchParams } from "next/navigation";

type Section = "email" | "updates" | "research" | "templates" | "handlers";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const initialSection = searchParams.get("section") as Section;

  const [activeSection, setActiveSection] = useState<Section>(
    initialSection || "email"
  );

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const navigationItems = [
    { id: "email" as Section, label: "Email & Slack" },
    { id: "updates" as Section, label: "Investor updates" },
    { id: "research" as Section, label: "Internal research" },
    { id: "templates" as Section, label: "Templates" },
    { id: "handlers" as Section, label: "Handlers" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "email":
        return <Emails />;
      case "updates":
        return <Updates />;
      case "research":
        return <Research />;
      case "templates":
        return <Templates />;
      case "handlers":
        return <Handlers />;
      default:
        return <Emails />;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#FAFAFA" }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left-aligned: Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="h-9 w-[3.75rem]">
                <Logo />
              </div>
              <nav className="flex space-x-4">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-2.5 py-1.5 text-sm font-normal rounded-md transition-colors ${
                      activeSection === item.id
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right-aligned: Create Workflow Button */}

            <Button
              onClick={() => {
                setLoading(true);
                router.push(`/workflow/new?from=${activeSection}`);
              }}
              variant="outline"
              className="font-normal bg-white border-gray-200 hover:bg-gray-50/80"
            >
              <Plus className="mr-1 h-4 w-4" />
              Create workflow
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1  pt-16">{renderContent()}</main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <div className="h-6 w-4">
                <LogoSmall />
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex space-x-8">
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 text-sm font-light transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 text-sm font-light transition-colors"
              >
                Docs
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 text-sm font-light transition-colors"
              >
                Guides
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 text-sm font-light transition-colors"
              >
                Help
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 text-sm font-light transition-colors"
              >
                Contact
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-gray-700 text-sm font-light transition-colors"
              >
                Legal
              </a>
            </nav>
          </div>

          {/* Copyright */}
        </div>
      </footer>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
}

// Export the data arrays for use in other components if needed
export { handlers };
