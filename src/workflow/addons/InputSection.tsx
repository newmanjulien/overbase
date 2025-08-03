// import { useState } from "react";
// import { X } from "lucide-react";
// import { Textarea } from "../../components/ui/textarea";
// import { Button } from "../../components/ui/button";

// interface UserInputInstructions {
//   whenToAsk: string;
//   inputDescription: string;
// }

// interface Props {
//   step: {
//     id: string;
//     userInputInstructions: UserInputInstructions;
//   };
//   onUpdate: (
//     id: string,
//     updates: { userInputInstructions?: UserInputInstructions }
//   ) => void;
// }

// export function InputSection({ step, onUpdate }: Props) {
//   const [local, setLocal] = useState(step.userInputInstructions);

//   const updateField = (field: keyof UserInputInstructions, value: string) => {
//     const updated = { ...local, [field]: value };
//     setLocal(updated);
//     onUpdate(step.id, { userInputInstructions: updated });
//   };

//   const remove = () => onUpdate(step.id, { userInputInstructions: undefined });

//   return (
//     <div>
//       <div className="flex justify-between mb-4">
//         <label className="text-sm font-medium text-gray-700">
//           Input Instructions
//         </label>
//         <Button
//           onClick={remove}
//           variant="ghost"
//           size="sm"
//           className="p-0 h-6 w-6 text-gray-400 hover:text-red-500"
//         >
//           <X className="h-3 w-3" />
//         </Button>
//       </div>
//       <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50/50">
//         <div>
//           <label className="text-xs font-medium text-gray-600 mb-1 block">
//             When should the AI ask for your input?
//           </label>
//           <Textarea
//             value={local.whenToAsk}
//             onChange={(e) => updateField("whenToAsk", e.target.value)}
//             placeholder="e.g., When customer asks for specific product details..."
//             className="text-sm"
//           />
//         </div>
//         <div>
//           <label className="text-xs font-medium text-gray-600 mb-1 block">
//             What should the AI request?
//           </label>
//           <Textarea
//             value={local.inputDescription}
//             onChange={(e) => updateField("inputDescription", e.target.value)}
//             placeholder="e.g., Ask for latest pricing sheet..."
//             className="text-sm"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { X } from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

interface UserInputInstructions {
  enabled?: boolean; // optional for backwards compatibility
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
  const [local, setLocal] = useState({
    enabled: step.userInputInstructions.enabled ?? false,
    whenToAsk: step.userInputInstructions.whenToAsk,
    inputDescription: step.userInputInstructions.inputDescription,
  });

  const updateField = (
    field: keyof UserInputInstructions,
    value: string | boolean
  ) => {
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
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-input"
            checked={local.enabled}
            onCheckedChange={(checked) => updateField("enabled", !!checked)}
          />
          <label
            htmlFor="enable-input"
            className="text-sm font-normal text-gray-700"
          >
            Ask for input after completing this step
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
                What should we do with your input?
              </label>
              <Textarea
                value={local.inputDescription}
                onChange={(e) =>
                  updateField("inputDescription", e.target.value)
                }
                placeholder="e.g., Use what I give you to..."
                className="text-sm"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
