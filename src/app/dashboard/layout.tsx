// /app/dashboard/layout.tsx
import React from "react";
import Logo from "../../components/Logo";
import LogoSmall from "../../components/LogoSmall";
import Link from "next/link";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
                {/* Workflow dropdown can be replaced with simple links for now */}
                <Link
                  href="/dashboard/email"
                  className="px-2.5 py-1.5 text-sm font-normal rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  Email & Slack
                </Link>
                <Link
                  href="/dashboard/sales"
                  className="px-2.5 py-1.5 text-sm font-normal rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  After Sales Calls
                </Link>
                <Link
                  href="/dashboard/customer"
                  className="px-2.5 py-1.5 text-sm font-normal rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  Customer Success
                </Link>

                {/* Other nav items */}
                <Link
                  href="/dashboard/templates"
                  className="px-2.5 py-1.5 text-sm font-normal rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  Templates
                </Link>
                <Link
                  href="/dashboard/colleagues"
                  className="px-2.5 py-1.5 text-sm font-normal rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  Colleagues
                </Link>
                <Link
                  href="/dashboard/external"
                  className="px-2.5 py-1.5 text-sm font-normal rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  External
                </Link>
                <Link
                  href="/dashboard/integrations"
                  className="px-2.5 py-1.5 text-sm font-normal rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  Integrations
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-16">{children}</main>

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
  );
}
