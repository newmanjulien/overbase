import { BranchesSection } from "./BranchesSection";
import { ApprovalSection } from "./ApprovalSection";
import { InputSection } from "./InputSection";
import { Button } from "../../components/ui/button";
import { Split, UserCheck, FileEdit, Share2 } from "lucide-react";

interface Step {
  id: string;
  branches: any[];
  userApprovalInstructions?: any;
  userInputInstructions?: any;
}

interface Props {
  step: Step;
  onUpdate: (id: string, updates: Partial<Step>) => void;
}

export function StepAddOns({ step, onUpdate }: Props) {
  const hasBranches = step.branches.length > 0;

  return (
    <div className="pt-5 pb-3 space-y-6">
      {/* Remove the duplicate BranchesSection - you had it twice */}
      {hasBranches && (
        <BranchesSection
          step={{ id: step.id, branches: step.branches }}
          onUpdate={onUpdate}
        />
      )}

      {step.userApprovalInstructions && (
        <ApprovalSection
          step={{
            id: step.id,
            userApprovalInstructions: step.userApprovalInstructions,
          }}
          onUpdate={onUpdate}
        />
      )}

      {step.userInputInstructions && (
        <InputSection
          step={{
            id: step.id,
            userInputInstructions: step.userInputInstructions,
          }}
          onUpdate={onUpdate}
        />
      )}

      {/* Action buttons to add new sections */}
      <div className="flex space-x-2">
        {!hasBranches && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdate(step.id, {
                branches: [
                  { id: Date.now().toString(), condition: "", prompt: "" },
                ],
              })
            }
            className="text-xs bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50 min-w-[110px] px-3"
          >
            <Split className="mr-1 h-3 w-3" /> Split into options
          </Button>
        )}
        {!step.userApprovalInstructions && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdate(step.id, {
                userApprovalInstructions: {
                  whenToAsk: "",
                  approvalConditions: "",
                },
              })
            }
            className="text-xs bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50 min-w-[110px] px-3"
          >
            <UserCheck className="mr-1 h-3 w-3" /> Ask for approval
          </Button>
        )}
        {!step.userInputInstructions && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdate(step.id, {
                userInputInstructions: {
                  whenToAsk: "",
                  inputDescription: "",
                },
              })
            }
            className="text-xs bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50 min-w-[110px] px-3"
          >
            <FileEdit className="mr-1 h-3 w-3" /> Ask for input
          </Button>
        )}
      </div>
    </div>
  );
}
