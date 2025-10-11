"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectorProvider } from "@/lib//dashboard/connectorContext";
import {
  FooterProvider,
  useFooterContext,
} from "@/lib/dashboard/footerContext";
import { DashboardProvider } from "../../lib/dashboard/DashboardProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConnectorProvider>
      <FooterProvider>
        <DashboardProvider>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </DashboardProvider>
      </FooterProvider>
    </ConnectorProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hideFooter } = useFooterContext();

  const navItems = [
    { href: "/dashboard/requests", label: "Requests" },
    { href: "/dashboard/templates", label: "Templates" },
    { href: "/dashboard/connectors", label: "Connectors" },
    { href: "/dashboard/customers", label: "Customers" },
  ];

  return (
    <div className="flex flex-1 flex-col bg-muted">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200/60">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">
            <div className="flex items-center space-x-8">
              <div className="h-7">
                <Link href="/dashboard/requests">
                  <Image
                    src="/images/logo.png"
                    alt="Logo"
                    width={42}
                    height={30}
                    priority
                  />
                </Link>
              </div>

              <nav className="flex space-x-3 items-center">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-2 py-1 text-sm font-[350] rounded-lg hover:text-gray-900 hover:bg-gray-100 ${
                        isActive ? "text-gray-700 bg-gray-100" : "text-gray-500"
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
      <main className="pt-14 flex-grow min-h-[calc(100vh-56px)]">
        {children}
      </main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="bg-white">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-4">
                  <Image
                    src="/images/logo.png"
                    alt="Logo small"
                    width={38}
                    height={20}
                  />
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
      )}
    </div>
  );
}
