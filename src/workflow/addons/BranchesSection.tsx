import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

interface StepBranch {
  id: string;
  condition: string;
  prompt: string;
}

interface Props {
  step: {
    id: string;
    branches: StepBranch[];
  };
  onUpdate: (id: string, updates: { branches?: StepBranch[] }) => void;
}

export function BranchesSection({ step, onUpdate }: Props) {
  const [localBranches, setLocalBranches] = useState(step.branches || []);

  const handleUpdate = (id: string, field: keyof StepBranch, value: string) => {
    const updated = localBranches.map((b) =>
      b.id === id ? { ...b, [field]: value } : b
    );
    setLocalBranches(updated);
    onUpdate(step.id, { branches: updated });
  };

  const addBranch = () => {
    const newBranch: StepBranch = {
      id: Date.now().toString(),
      condition: "",
      prompt: "",
    };
    const updated = [...localBranches, newBranch];
    setLocalBranches(updated);
    onUpdate(step.id, { branches: updated });
  };

  const removeBranch = (id: string) => {
    const updated = localBranches.filter((b) => b.id !== id);
    setLocalBranches(updated);
    onUpdate(step.id, { branches: updated });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-medium text-gray-700">
          Step Options
        </label>
        <Button
          size="sm"
          variant="outline"
          onClick={addBranch}
          className="border-gray-200 text-gray-700 hover:bg-gray-100"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Option
        </Button>
      </div>

      {localBranches.map((branch, idx) => (
        <div
          key={branch.id}
          className="mb-4 border border-gray-200 p-4 rounded bg-gray-50/50"
        >
          <div className="flex justify-between mb-2">
            <span className="text-sm font-small">Option {idx + 1}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeBranch(branch.id)}
              className="text-gray-400 hover:text-red-500 p-0 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            <Input
              value={branch.condition}
              onChange={(e) =>
                handleUpdate(branch.id, "condition", e.target.value)
              }
              placeholder="Condition..."
            />
            <Textarea
              value={branch.prompt}
              onChange={(e) =>
                handleUpdate(branch.id, "prompt", e.target.value)
              }
              placeholder="Prompt..."
            />
          </div>
        </div>
      ))}
    </div>
  );
}
