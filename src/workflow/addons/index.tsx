import { BranchesSection } from "./BranchesSection";
import { ApprovalSection } from "./ApprovalSection";
import { InputSection } from "./InputSection";
import { ColleagueSection } from "./ColleagueSection";
import { Button } from "../../components/ui/button";
import { Split, UserCheck, FileEdit, Share2 } from "lucide-react";

interface Step {
  id: string;
  branches: any[];
  userApprovalInstructions?: any;
  userInputInstructions?: any;
  colleagueInstructions?: any;
}

interface Props {
  step: Step;
  onUpdate: (id: string, updates: Partial<Step>) => void;
}

export function StepAddOns({ step, onUpdate }: Props) {
  const hasBranches = step.branches.length > 0;

  return (
    <div className="py-4 space-y-6">
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

      {step.colleagueInstructions && (
        <ColleagueSection
          step={{
            id: step.id,
            colleagueInstructions: step.colleagueInstructions,
          }}
          onUpdate={onUpdate}
        />
      )}

      {/* Action buttons to add new sections */}
      <div className="grid grid-cols-2 gap-2">
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
            className="text-xs bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50"
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
            className="text-xs bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50"
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
            className="text-xs bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <FileEdit className="mr-1 h-3 w-3" /> Ask for input
          </Button>
        )}
        {!step.colleagueInstructions && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdate(step.id, {
                colleagueInstructions: {
                  whenToLoop: "",
                  selectedColleague: "",
                  whatToRequest: "",
                },
              })
            }
            className="text-xs bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50"
          >
            <Share2 className="mr-1 h-3 w-3" /> Loop in a colleague
          </Button>
        )}
      </div>
    </div>
  );
}
