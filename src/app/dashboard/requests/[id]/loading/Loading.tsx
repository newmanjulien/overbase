"use client";

import OrbitalRings from "@/components/blocks/OrbitalRings";

type Props = {
  message?: string;
};

export default function Loading({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-20 min-h-[calc(100vh-56px)]">
      <OrbitalRings />
      {message && (
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {message}
        </p>
      )}
    </div>
  );
}
