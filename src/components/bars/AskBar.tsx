"use client";

import { Fragment, type ComponentType, type SVGProps } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ASSET_KEYS } from "@/lib/assets";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Mic, Repeat, Zap } from "lucide-react";

export type ModalOptions = {
  tab?: "one" | "recurring";
};

type FooterButton = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  modalOptions?: ModalOptions;
};

interface AskBarProps {
  onClick: (options?: ModalOptions) => void;
  onMicClick?: () => void;
  disabledButtons?: string[]; // labels of buttons to disable
}

export default function AskBar({
  onClick,
  onMicClick,
  disabledButtons = [],
}: AskBarProps) {
  const userAvatarAsset = useQuery(api.features.assets.getAssetByKey, {
    key: ASSET_KEYS.USER_AVATAR,
  });
  const userAvatar = userAvatarAsset?.imageUrl ?? null;

  const footerButtons: FooterButton[] = [
    { icon: Clock, label: "One time", modalOptions: { tab: "one" } },
    { icon: Repeat, label: "Recurring", modalOptions: { tab: "recurring" } },
    { icon: Zap, label: "Quick" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-1 pt-4 mb-4">
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10 ml-3">
          <AvatarImage src={userAvatar ?? undefined} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <div
          onClick={() => onClick()}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full text-sm px-4 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
        >
          What question do you want to ask?
        </div>

        <button
          onClick={onMicClick}
          disabled
          className="h-9 w-9 mr-3 flex items-center justify-center rounded-full bg-gray-100 text-gray-300 cursor-not-allowed"
          title="Dictate"
        >
          <Mic className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-2 mt-1 items-center">
        {footerButtons.map((btn, index) => {
          const isDisabled = disabledButtons.includes(btn.label);
          return (
            <Fragment key={btn.label}>
              <button
                onClick={
                  isDisabled ? undefined : () => onClick(btn.modalOptions)
                }
                disabled={isDisabled}
                className={`flex-1 flex items-center justify-center rounded-full gap-2 px-3 py-2 text-sm transition-colors
                  ${
                    isDisabled
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
              >
                <btn.icon className="h-4 w-4" />
                {btn.label}
              </button>
              {index < footerButtons.length - 1 && (
                <div className="w-px h-6 bg-gray-200"></div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
