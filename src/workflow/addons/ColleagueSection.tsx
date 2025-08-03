import { useState } from "react";
import { X } from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../../components/ui/select";

// Dummy colleagues list (can be moved to shared file)
const colleagues = [
  { id: "jane", name: "Jane Doe" },
  { id: "john", name: "John Smith" },
  { id: "alex", name: "Alex Lee" },
];

interface ColleagueInstructions {
  whenToLoop: string;
  selectedColleague: string;
  whatToRequest: string;
}

interface Props {
  step: {
    id: string;
    colleagueInstructions: ColleagueInstructions;
  };
  onUpdate: (
    id: string,
    updates: { colleagueInstructions?: ColleagueInstructions }
  ) => void;
}

export function ColleagueSection({ step, onUpdate }: Props) {
  const [local, setLocal] = useState(step.colleagueInstructions);

  const updateField = (field: keyof ColleagueInstructions, value: string) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    onUpdate(step.id, { colleagueInstructions: updated });
  };

  const remove = () => onUpdate(step.id, { colleagueInstructions: undefined });

  return (
    <div>
      <div className="flex justify-between mb-4">
        <label className="text-sm font-medium text-gray-700">
          Colleague Loop-in Instructions
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
            When should the AI loop in a colleague?
          </label>
          <Textarea
            value={local.whenToLoop}
            onChange={(e) => updateField("whenToLoop", e.target.value)}
            placeholder="e.g., When technical expertise is needed..."
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            Select colleague to loop in
          </label>
          <Select
            value={local.selectedColleague}
            onValueChange={(v) => updateField("selectedColleague", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a colleague..." />
            </SelectTrigger>
            <SelectContent>
              {colleagues.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            What should the AI request from the colleague?
          </label>
          <Textarea
            value={local.whatToRequest}
            onChange={(e) => updateField("whatToRequest", e.target.value)}
            placeholder="e.g., Technical guidance on the issue..."
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
