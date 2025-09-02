"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { HandlerSelect } from "./HandlerSelect";
import { useHandlers } from "../../../hooks/useHandlers";
import { Button } from "../../../components/ui/button";

interface AgentCardProps {
  id: string;
  title: string;
  description: string;
  gradientFrom?: string;
  gradientTo?: string;
  isInstalled: boolean;
  image?: string;
  onInstall: () => void;
  onLaunch?: () => void;
  assignedHandler?: string;
}

export function AgentCard({
  id,
  title,
  description,
  gradientFrom = "from-emerald-400",
  gradientTo = "to-teal-500",
  isInstalled,
  image,
  onInstall,
  onLaunch,
  assignedHandler = "",
}: AgentCardProps) {
  const router = useRouter();
  const { handlers, loading: handlersLoading } = useHandlers();
  const [selectedHandler, setSelectedHandler] = useState(() => assignedHandler);
  const [isAnimating, setIsAnimating] = useState(false);

  // Keep local handler state in sync if parent/DB changes
  useEffect(() => setSelectedHandler(assignedHandler ?? ""), [assignedHandler]);

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isInstalled) {
      setIsAnimating(true);
      setTimeout(() => {
        onInstall();
        setIsAnimating(false);
      }, 200); // match animation duration
    } else {
      onLaunch?.();
    }
  };

  const handleHandlerChange = async (newHandlerId: string) => {
    setSelectedHandler(newHandlerId);

    try {
      const agentRef = doc(db, "agents", id);
      await updateDoc(agentRef, { assignedHandler: newHandlerId });
    } catch (err) {
      console.error("Failed to update assignedHandler:", err);
    }
  };

  return (
    <div
      className={`rounded-xl border border-gray-200/60 overflow-hidden cursor-pointer hover:shadow-md transform transition-all duration-200
        ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
      onClick={() => router.push("/dashboard/agents/builder")}
    >
      {/* Top image + install/launch button */}
      <div
        className={`relative h-56 flex items-center justify-center bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white p-1">
          {image ? (
            <Image
              src={image}
              alt={`${title} logo`}
              width={54}
              height={54}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-800">
              {title.charAt(0)}
            </div>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 bg-white text-gray-800 hover:bg-gray-50 font-normal"
          onClick={handleInstallClick}
        >
          {isInstalled ? "Launch" : "Install"}
        </Button>
      </div>

      {/* Title + description */}
      <div className="bg-white p-4 pt-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* Handler dropdown (only if installed and handlers loaded) */}
      {isInstalled && !handlersLoading && (
        <div className="p-3 pt-0 bg-white" onClick={(e) => e.stopPropagation()}>
          <HandlerSelect
            value={selectedHandler}
            onChange={handleHandlerChange}
            handlers={handlers}
            loading={handlersLoading}
          />
        </div>
      )}
    </div>
  );
}
