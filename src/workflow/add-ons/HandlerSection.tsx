import { useState } from "react";
import { X } from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

interface HandlerInstructions {
  whenToCall: string;
  qaInstructions: string;
}

interface Props {
  step: {
    id: string;
    handlerInstructions: HandlerInstructions;
  };
  onUpdate: (
    id: string,
    updates: { handlerInstructions?: HandlerInstructions }
  ) => void;
}

export function HandlerSection({ step, onUpdate }: Props) {
  const [local, setLocal] = useState(step.handlerInstructions);

  const updateField = (field: keyof HandlerInstructions, value: string) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    onUpdate(step.id, { handlerInstructions: updated });
  };

  const remove = () => onUpdate(step.id, { handlerInstructions: undefined });

  return (
    <div>
      <div className="flex justify-between mb-4">
        <label className="text-sm font-medium text-gray-700">
          Handler Instructions
        </label>
        <Button
          onClick={remove}
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6 text-gray-400 hover:text-red-500"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="space-y-4 border rounded-lg p-4 bg-gray-50/50">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            When should the AI call on the handler for help?
          </label>
          <Textarea
            value={local.whenToCall}
            onChange={(e) => updateField("whenToCall", e.target.value)}
            placeholder="e.g., When email requires complex decision..."
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            How should the AI quality check the handler's work?
          </label>
          <Textarea
            value={local.qaInstructions}
            onChange={(e) => updateField("qaInstructions", e.target.value)}
            placeholder="e.g., Check response addresses all customer concerns..."
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
