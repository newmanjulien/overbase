"use client";

import { useState } from "react";
import { Emails } from "./Emails";
import { Decks } from "./Decks";
import { Data } from "./Data";
import { Templates } from "./Templates";
import Handlers from "./Handlers";
import { Plus } from "lucide-react";
import { Button } from "../components/button";
import Logo from "../components/ui/Logo";
import LogoSmall from "../components/ui/LogoSmall";
import Link from "next/link";

// Dummy data for the cards
export const emailsData = [
  {
    id: 1,
    image: "/images/profile-1.png",
    title: "Emails from customers",
    subtitle: "Highlight emails you need to answer from customers",
  },
  {
    id: 2,
    image: "/images/profile-2.png",
    title: "Celebrate success",
    subtitle:
      "Highlight emails where there's an opportunity to celebrate your team's success",
  },
  {
    id: 3,
    image: "/images/profile-4.png",
    title: "Needs to be routed",
    subtitle: "Highlight emails you need to route to one of your colleagues",
  },
];

export const decksData = [
  {
    id: 1,
    image: "/images/profile-3.png",
    title: "Board presentation",
    subtitle: "Create a presentation for Board meetings",
  },
  {
    id: 2,
    image: "/images/profile-4.png",
    title: "Style Jason prefers",
    subtitle: "Create a presentation for meetings Jason participates in",
  },
  {
    id: 3,
    image: "/images/profile-3.png",
    title: "Conferences about AI",
    subtitle:
      "Create a presentation for conferences where you do thought leadership about AI",
  },
];

export const dataData = [
  {
    id: 1,
    image: "/images/profile-2.png",
    title: "Customer sentiment",
    subtitle: "Listen in on sales calls and customer service calls",
  },
  {
    id: 2,
    image: "/images/profile-1.png",
    title: "With Jon Bonato",
    subtitle: "Collaborate with Jon to gather data from team members",
  },
  {
    id: 3,
    image: "/images/profile-2.png",
    title: "Survey customers",
    subtitle: "Ask customers simple questions",
  },
  {
    id: 4,
    image: "/images/profile-2.png",
    title: "Salesforce and Marketo",
    subtitle: "Create a custom dashboard of data from Salesforce and Marketo",
  },
];

type Section = "emails" | "decks" | "data" | "templates" | "handlers";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>("emails");

  const navigationItems = [
    { id: "emails" as Section, label: "Triage emails" },
    { id: "decks" as Section, label: "Create decks" },
    { id: "data" as Section, label: "Gather internal data" },
    { id: "templates" as Section, label: "Templates" },
    { id: "handlers" as Section, label: "Handlers" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "emails":
        return <Emails />;
      case "decks":
        return <Decks />;
      case "data":
        return <Data />;
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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left-aligned: Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="h-9 w-16">
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
            {/* <Button
              variant="ghost"
              className="text-gray-900 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
            >
              <Plus className="mr-1 h-4 w-4" />
              Create workflow
            </Button> */}
            <Link href="/workflow">
              <Button
                variant="ghost"
                className="text-gray-900 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
              >
                <Plus className="mr-1 h-4 w-4" />
                Create workflow
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{renderContent()}</main>

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
    </div>
  );
}
