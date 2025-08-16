"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { X } from "lucide-react";

interface LaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LaunchModal({ isOpen, onClose }: LaunchModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);

  if (!isOpen) return null;

  const handleAddKey = () => {
    console.log("Adding API key:", apiKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-md shadow-md w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between bg-gray-50 p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Launch Agent</h2>
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
        <div className="bg-white p-6 space-y-6">
          {/* API Key Input */}
          <div className="space-y-2">
            <Label
              htmlFor="api-key"
              className="text-sm font-medium text-gray-800"
            >
              Anthropic API Key
            </Label>
            <Input
              id="api-key"
              type="text"
              placeholder="sk-abcdefg..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border-gray-200 focus:ring-black focus:border-black"
            />
          </div>

          {/* Enabled Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900">Enabled</h3>
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>
            <p className="text-sm text-gray-500">
              Your Anthropic key is securely encrypted. If enabled, your key
              will be used for all requests routed to Anthropic. If a rate limit
              or failure occurs, AI Gateway will work to increase your uptime
              with system credentials.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 bg-white text-gray-800 border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddKey}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              Add Key
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
