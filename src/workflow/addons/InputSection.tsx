import { useState } from "react";
import { X } from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

interface UserInputInstructions {
  whenToAsk: string;
  inputDescription: string;
}

interface Props {
  step: {
    id: string;
    userInputInstructions: UserInputInstructions;
  };
  onUpdate: (
    id: string,
    updates: { userInputInstructions?: UserInputInstructions }
  ) => void;
}

export function InputSection({ step, onUpdate }: Props) {
  const [local, setLocal] = useState(step.userInputInstructions);

  const updateField = (field: keyof UserInputInstructions, value: string) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    onUpdate(step.id, { userInputInstructions: updated });
  };

  const remove = () => onUpdate(step.id, { userInputInstructions: undefined });

  return (
    <div>
      <div className="flex justify-between mb-4">
        <label className="text-sm font-medium text-gray-700">
          Input Instructions
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
      <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            When should the AI ask for your input?
          </label>
          <Textarea
            value={local.whenToAsk}
            onChange={(e) => updateField("whenToAsk", e.target.value)}
            placeholder="e.g., When customer asks for specific product details..."
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            What should the AI request?
          </label>
          <Textarea
            value={local.inputDescription}
            onChange={(e) => updateField("inputDescription", e.target.value)}
            placeholder="e.g., Ask for latest pricing sheet..."
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
