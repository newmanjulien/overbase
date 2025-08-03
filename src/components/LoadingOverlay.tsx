"use client";

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
      <div className="loader"></div>
    </div>
  );
}
