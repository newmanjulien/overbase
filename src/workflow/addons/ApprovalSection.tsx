import { useState } from "react";
import { X } from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

interface UserApprovalInstructions {
  enabled?: boolean; // optional to preserve existing data shape
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
  const [local, setLocal] = useState({
    enabled: step.userApprovalInstructions.enabled ?? false,
    whenToAsk: step.userApprovalInstructions.whenToAsk,
    approvalConditions: step.userApprovalInstructions.approvalConditions,
  });

  const updateField = (
    field: keyof UserApprovalInstructions,
    value: string | boolean
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

      <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-approval"
            checked={local.enabled}
            onCheckedChange={(checked) => updateField("enabled", !!checked)}
          />
          <label
            htmlFor="enable-approval"
            className="text-sm font-normal text-gray-700"
          >
            Ask for approval after completing this step
          </label>
        </div>

        {local.enabled && (
          <>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                What should we ask and how?
              </label>
              <Textarea
                value={local.whenToAsk}
                onChange={(e) => updateField("whenToAsk", e.target.value)}
                placeholder="e.g., Send me a Slack DM and ask me..."
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                What do we do if you do not approve?
              </label>
              <Textarea
                value={local.approvalConditions}
                onChange={(e) =>
                  updateField("approvalConditions", e.target.value)
                }
                placeholder="e.g., Reply and ask me what to do..."
                className="text-sm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
