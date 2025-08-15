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
    <Card className="h-full flex flex-col bg-white border border-gray-100 hover:border-gray-200 overflow-hidden p-0 hover:shadow-md transition-shadow rounded-md">
      {/* Header */}
      <div className="p-3 bg-gray-100 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
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
        <div className="p-3 pt-0 space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-normal text-gray-600"
            >
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter step title"
              className={`text-sm rounded-sm border-gray-100 ${
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
              className="text-sm font-normal text-gray-600"
            >
              Prompt *
            </Label>
            <Textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleInputChange("prompt", e.target.value)}
              placeholder="Enter your prompt"
              rows={5}
              className={`resize-none text-xs rounded-sm border-gray-100 ${
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
              className="text-sm font-normal text-gray-600"
            >
              Context
            </Label>
            <Textarea
              id="context"
              value={formData.context}
              onChange={(e) => handleInputChange("context", e.target.value)}
              placeholder="Add additional context (optional)"
              rows={8}
              className="resize-none text-xs rounded-sm border-gray-100"
            />
            <p className="text-xs text-gray-400">
              Optional additional information for this step
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-white">
        <div className="flex justify-end space-x-2">
          <Button 
            variant="ghost" 
            className="bg-white text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-black text-white hover:bg-gray-900 font-normal text-sm px-3 py-1.5 h-auto"
          >
            Save changes
          </Button>
        </div>
      </div>
    </Card>
  );
}
