import { useState } from "react";
import { X } from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";

interface UserApprovalInstructions {
  whenToAsk: string;
  approvalConditions: string;
}

interface Props {
  step: {
    id: string;
    userApprovalInstructions: UserApprovalInstructions;
  };
  onUpdate: (
    id: string,
    updates: { userApprovalInstructions?: UserApprovalInstructions }
  ) => void;
}

export function ApprovalSection({ step, onUpdate }: Props) {
  const [local, setLocal] = useState(step.userApprovalInstructions);

  const updateField = (
    field: keyof UserApprovalInstructions,
    value: string
  ) => {
    const updated = { ...local, [field]: value };
    setLocal(updated);
    onUpdate(step.id, { userApprovalInstructions: updated });
  };

  const remove = () =>
    onUpdate(step.id, { userApprovalInstructions: undefined });

  return (
    <div>
      <div className="flex justify-between mb-4">
        <label className="text-sm font-medium text-gray-700">
          Approval Instructions
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
            When should the AI ask for your approval?
          </label>
          <Textarea
            value={local.whenToAsk}
            onChange={(e) => updateField("whenToAsk", e.target.value)}
            placeholder="e.g., Before sending responses to VIP customers..."
            className="text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            What conditions require approval?
          </label>
          <Textarea
            value={local.approvalConditions}
            onChange={(e) => updateField("approvalConditions", e.target.value)}
            placeholder="e.g., Responses involving refunds over $100..."
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
