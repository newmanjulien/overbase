"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ASSET_KEYS } from "@/lib/assets";
import { ConnectorProvider } from "@/app/dashboard/connectors/connectorContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ConnectorProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ConnectorProvider>
  );
}

function DashboardLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const logoAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.OVERBASE_LOGO,
  });
  const logoUrl = logoAsset?.imageUrl ?? null;

  const navItems = [
    { href: "/dashboard/questions", label: "Questions" },
    { href: "/dashboard/templates", label: "Templates" },
    { href: "/dashboard/connectors", label: "Connectors" },
    { href: "/dashboard/people", label: "People" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200/60">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11">
            <div className="flex items-center space-x-8">
              <div className="h-7">
                <Link href="/dashboard/questions">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt=""
                      width={42}
                      height={30}
                      priority
                    />
                  ) : (
                    <div className="w-[42px] h-[30px] bg-gray-100 rounded animate-pulse" />
                  )}
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
      <main className="pt-14 flex-grow overflow-y-auto">{children}</main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-4">
                {logoUrl ? (
                  <Image src={logoUrl} alt="" width={38} height={20} />
                ) : (
                  <div className="w-[38px] h-[20px] bg-gray-100 rounded animate-pulse" />
                )}
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
                ),
              )}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
