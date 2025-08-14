"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";
import { CARD_TYPES } from "./AgentCard";

interface EditAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    title: string;
    description: string;
    type: keyof typeof CARD_TYPES;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      title: string;
      description: string;
      type: keyof typeof CARD_TYPES;
    }>
  >;
}

export default function EditAgentModal({
  isOpen,
  onClose,
  formData,
  setFormData,
}: EditAgentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Edit Agent Step
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Configure the details and behavior for this agent step.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Type */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="step-type" className="text-right">
              Service
            </Label>
            <Select
              value={formData.type}
              onValueChange={(v) =>
                setFormData((p) => ({
                  ...p,
                  type: v as keyof typeof CARD_TYPES,
                }))
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CARD_TYPES).map(([k, t]) => (
                  <SelectItem key={k} value={k}>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center ${t.iconBg}`}
                      >
                        <t.icon className="w-3 h-3" />
                      </div>
                      <span>{t.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="step-title" className="text-right">
              Title
            </Label>
            <Input
              id="step-title"
              value={formData.title}
              onChange={(e) =>
                setFormData((p) => ({ ...p, title: e.target.value }))
              }
              className="col-span-3"
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="step-description" className="text-right">
              Description
            </Label>
            <Textarea
              id="step-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              className="col-span-3"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
