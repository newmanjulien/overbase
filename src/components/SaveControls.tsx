"use client";

import React from "react";
import { Button } from "./ui/button";
import { CheckCircle, Save } from "lucide-react";

interface SaveControlsProps {
  isSaving: boolean;
  saveSuccess: boolean;
  disabled: boolean;
  onSave: () => void;
  onTest?: () => void;
}

export function SaveControls({
  isSaving,
  saveSuccess,
  disabled,
  onSave,
  onTest,
}: SaveControlsProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
      <Button
        variant="outline"
        className="text-gray-600 border-gray-200 hover:bg-gray-100"
        onClick={onTest}
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Test workflow
      </Button>
      <Button
        onClick={onSave}
        disabled={disabled}
        className="font-normal bg-white border border-gray-200 relative"
      >
        {isSaving ? (
          <span className="flex items-center">
            <svg
              className="animate-spin mr-2 h-4 w-4 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Saving...
          </span>
        ) : saveSuccess ? (
          <span className="flex items-center text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Saved
          </span>
        ) : (
          <span className="flex items-center">
            <Save className="mr-2 h-4 w-4" />
            Save Workflow
          </span>
        )}
      </Button>
    </div>
  );
}
