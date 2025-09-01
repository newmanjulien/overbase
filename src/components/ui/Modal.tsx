"use client";

import { Input } from "./input";
import { Label } from "./label";
import { Switch } from "./switch";
import { Button } from "./button";
import { X } from "lucide-react";
import { ModalContent } from "../../app/dashboard/agents/DummyData";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  content: ModalContent;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  isEnabled: boolean;
  onEnabledChange: (value: boolean) => void;
  onAction: (actionCallback: string) => void;
  classNameOverrides?: {
    wrapper?: string;
    content?: string;
    button?: string;
  };
}

const sizeMap = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  size = "md",
  content,
  apiKey,
  onApiKeyChange,
  isEnabled,
  onEnabledChange,
  onAction,
  classNameOverrides = {},
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${classNameOverrides.wrapper}`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-md w-full ${sizeMap[size]} overflow-hidden ${classNameOverrides.content}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-50 p-3 border-b border-gray-200">
          <h2 className="text-md font-semibold text-gray-900">
            {content.title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-gray-700 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white p-4 space-y-6">
          {content.fields.map((field, idx) => {
            if (field.type === "input") {
              return (
                <div key={idx} className="space-y-2">
                  <Label
                    htmlFor={field.label}
                    className="text-sm font-medium text-gray-800"
                  >
                    {field.label}
                  </Label>
                  <Input
                    id={field.label}
                    type="text"
                    placeholder={field.placeholder || ""}
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    className="w-full border-gray-200 focus:ring-black focus:border-black rounded-sm"
                  />
                </div>
              );
            }

            if (field.type === "switch") {
              return (
                <div key={idx} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {field.label}
                    </h3>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={onEnabledChange}
                    />
                  </div>
                  {content.description && (
                    <p className="text-sm text-gray-500">
                      {content.description}
                    </p>
                  )}
                </div>
              );
            }

            return null;
          })}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {content.actions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.type === "secondary" ? "secondary" : "default"}
                onClick={() => {
                  if (action.callback === "onClose") onClose();
                  else onAction(action.callback);
                }}
                className={`flex-1 font-normal text-sm px-3 py-1.5 h-auto ${
                  classNameOverrides.button || ""
                } ${
                  action.type === "secondary"
                    ? "bg-white text-gray-700 hover:bg-gray-50/80 border border-gray-200/60"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
