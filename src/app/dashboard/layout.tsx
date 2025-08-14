"use client";

import React from "react";
import Logo from "../../components/Logo";
import LogoSmall from "../../components/LogoSmall";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IntegrationProvider } from "../../lib/integrationContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    // { href: "/dashboard/email", label: "Email & Slack" },
    // { href: "/dashboard/sales", label: "After Sales Calls" },
    // { href: "/dashboard/customer", label: "Customer Success" },
    { href: "/dashboard/templates", label: "Agents" },
    { href: "/dashboard/colleagues", label: "Colleagues" },
    { href: "/dashboard/external", label: "External" },
    { href: "/dashboard/integrations", label: "Integrations" },
  ];

  return (
    <IntegrationProvider>
      <div
        className="min-h-screen flex flex-col"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center space-x-8">
                <div className="h-9 w-[3.75rem]">
                  <Logo />
                </div>
                <nav className="flex space-x-3 items-center">
                  {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`px-2.5 py-1.5 text-sm font-normal rounded-md hover:text-gray-900 hover:bg-gray-100 ${
                          isActive
                            ? "text-gray-900 bg-gray-100"
                            : "text-gray-500"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 pt-14">{children}</main>

        {/* Footer */}
        <footer className="bg-white">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-6 w-4">
                  <LogoSmall />
                </div>
              </div>
              <nav className="flex space-x-8">
                {["Home", "Docs", "Guides", "Help", "Contact", "Legal"].map(
                  (label) => (
                    <a
                      key={label}
                      href="#"
                      className="text-gray-500 hover:text-gray-700 text-sm font-light transition-colors"
                    >
                      {label}
                    </a>
                  )
                )}
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </IntegrationProvider>
  );
}
