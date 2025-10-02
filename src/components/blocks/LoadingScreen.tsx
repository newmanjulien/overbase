"use client";

import React from "react";

export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-muted">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-gray-500"></div>
    </div>
  );
}
