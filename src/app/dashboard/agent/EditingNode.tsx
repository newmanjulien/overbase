"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Card } from "../../../components/ui/card";
import type { NodeData } from "./Agent";

interface EditingNodeProps {
  node: {
    id: string;
    data: NodeData;
  };
  onSave: (data: Partial<NodeData>) => void;
  onClose: () => void;
}

export default function EditingNodeComponent({
  node,
  onSave,
  onClose,
}: EditingNodeProps) {
  const [formData, setFormData] = useState({
    title: node.data.title || "",
    prompt: node.data.prompt || "",
    context: node.data.context || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when node changes
  useEffect(() => {
    setFormData({
      title: node.data.title || "",
      prompt: node.data.prompt || "",
      context: node.data.context || "",
    });
  }, [node.data]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.prompt.trim()) {
      newErrors.prompt = "Prompt is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        title: formData.title.trim(),
        prompt: formData.prompt.trim(),
        context: formData.context.trim(),
      });
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Edit Step {node.data.stepNumber}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-gray-700"
            >
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter step title"
              className={`text-sm ${
                errors.title
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Prompt Field */}
          <div className="space-y-2">
            <Label
              htmlFor="prompt"
              className="text-sm font-medium text-gray-700"
            >
              Prompt *
            </Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleInputChange("prompt", e.target.value)}
              placeholder="Enter your prompt"
              rows={3}
              className={`resize-none text-sm ${
                errors.prompt
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : ""
              }`}
            />
            {errors.prompt && (
              <p className="text-xs text-red-600">{errors.prompt}</p>
            )}
          </div>

          {/* Context Field */}
          <div className="space-y-2">
            <Label
              htmlFor="context"
              className="text-sm font-medium text-gray-700"
            >
              Context
            </Label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={(e) => handleInputChange("context", e.target.value)}
              placeholder="Add additional context (optional)"
              rows={2}
              className="resize-none text-sm"
            />
            <p className="text-xs text-gray-500">
              Optional additional information for this step
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-black text-white hover:bg-gray-800"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
