import React from "react";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-4">Welcome to the Dashboard</h1>
      <p className="text-gray-700">
        Select a section from the header to get started.
      </p>
    </div>
  );
}
