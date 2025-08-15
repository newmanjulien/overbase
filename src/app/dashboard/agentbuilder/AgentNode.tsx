
// "use client";

// import { memo } from "react";
// import { Handle, Position, type NodeProps } from "@xyflow/react";
// import { Button } from "../../../components/ui/button";
// import { Card } from "../../../components/ui/card";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../../../components/ui/dropdown-menu";
// import type { NodeData } from "./AgentBuilder"; 

// interface AgentNodeProps extends NodeProps {
//   data: NodeData & {
//     nodeIndex: number;
//     totalNodes: number;
//     onMoveUp: (id: string) => void;
//     onMoveDown: (id: string) => void;
//   };
// }

// const AgentNode = memo(({ data, id }: AgentNodeProps) => {
//   const { stepNumber, title, onEdit, onDelete, onAddBelow, nodeIndex, totalNodes, onMoveUp, onMoveDown } = data;

//   const handleCardClick = (e: React.MouseEvent) => {
//     const target = e.target as HTMLElement;
//     if (target.closest('button') || target.closest('[role="menuitem"]')) return;
//     onEdit(id);
//   };

//   const handleAddClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     onAddBelow(id);
//   };

//   const handleDropdownClick = (e: React.MouseEvent) => e.stopPropagation();

//   return (
//     <div className="w-80">
//       <Handle type="target" position={Position.Top} className="opacity-0" />

//       <Card
//         className="bg-white border border-gray-100 hover:border-gray-200 rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0"
//         onClick={handleCardClick}
//       >
//         <div className="p-3 border-b border-gray-100">
//           <div className="flex items-center justify-between">
//             <h3 className="font-semibold text-gray-900">
//               Step {stepNumber} - <span className="font-normal">{title || "Enter step title"}</span>
//             </h3>

//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-8 w-8 p-0 hover:bg-gray-100"
//                   aria-label="Actions"
//                   onClick={handleDropdownClick}
//                 >
//                   <span className="text-gray-400 text-lg leading-none">⋯</span>
//                 </Button>
//               </DropdownMenuTrigger>

//               <DropdownMenuContent align="end" className="w-32">
//                 <DropdownMenuItem
//                   onClick={() => onMoveUp(id)}
//                   disabled={totalNodes <= 1 || nodeIndex === 0}
//                   className="hover:bg-gray-100 disabled:text-gray-400"
//                 >
//                   Move Up
//                 </DropdownMenuItem>

//                 <DropdownMenuItem
//                   onClick={() => onMoveDown(id)}
//                   disabled={totalNodes <= 1 || nodeIndex === totalNodes - 1}
//                   className="hover:bg-gray-100 disabled:text-gray-400"
//                 >
//                   Move Down
//                 </DropdownMenuItem>

//                 <DropdownMenuItem
//                   onClick={() => onDelete(id)}
//                   disabled={totalNodes <= 1}
//                   className="text-red-600 hover:text-red-700 hover:bg-red-50"
//                 >
//                   Delete
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>

//         <div className="px-3 pb-3 pt-0 -mt-1">
//           <Button
//             onClick={handleAddClick}
//             variant="outline"
//             size="sm"
//             className="w-full border-0 bg-gray-50 text-gray-800 hover:bg-gray-100 hover:text-gray-700"
//           >
//             Add Step
//           </Button>
//         </div>
//       </Card>

//       <Handle type="source" position={Position.Bottom} className="opacity-0" />
//     </div>
//   );
// });

// AgentNode.displayName = "AgentNode";
// export default AgentNode;


"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import type { NodeData } from "./AgentBuilder"; 

interface AgentNodeProps extends NodeProps {
  data: NodeData & {
    nodeIndex: number;
    totalNodes: number;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
  };
}

const AgentNode = memo(({ data, id }: AgentNodeProps) => {
  const { 
    stepNumber, 
    title, 
    onEdit, 
    onDelete, 
    onAddBelow, 
    nodeIndex, 
    totalNodes, 
    onMoveUp, 
    onMoveDown 
  } = data;

  // --- Helpers ---
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // ignore clicks inside buttons or dropdown menu
    if (target.closest('button') || target.closest('[role="menuitem"]')) return;
    onEdit(id);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddBelow(id);
  };

  const handleItemClick = (callback?: () => void, disabled?: boolean) => (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card edit
    if (!disabled && callback) callback();
  };

  return (
    <div className="w-80">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <Card
        className="bg-white border border-gray-100 hover:border-gray-200 rounded-md overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0"
        onClick={handleCardClick}
      >
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Step {stepNumber} - <span className="font-normal">{title || "Enter step title"}</span>
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  aria-label="Actions"
                  onClick={(e) => e.stopPropagation()} // stop menu button from opening edit
                >
                  <span className="text-gray-400 text-lg leading-none">⋯</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-32"
                onClick={(e) => e.stopPropagation()} // stop clicks inside menu
              >
                <DropdownMenuItem
                  onClick={handleItemClick(() => onMoveUp(id), totalNodes <= 1 || nodeIndex === 0)}
                  disabled={totalNodes <= 1 || nodeIndex === 0}
                  className="hover:bg-gray-100 disabled:text-gray-400"
                >
                  Move Up
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleItemClick(() => onMoveDown(id), totalNodes <= 1 || nodeIndex === totalNodes - 1)}
                  disabled={totalNodes <= 1 || nodeIndex === totalNodes - 1}
                  className="hover:bg-gray-100 disabled:text-gray-400"
                >
                  Move Down
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleItemClick(() => onDelete(id), totalNodes <= 1)}
                  disabled={totalNodes <= 1}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="px-3 pb-3 pt-0 -mt-1">
          <Button
            onClick={handleAddClick}
            variant="outline"
            size="sm"
            className="w-full border-0 bg-gray-50 text-gray-800 hover:bg-gray-100 hover:text-gray-700"
          >
            Add Step
          </Button>
        </div>
      </Card>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
});

AgentNode.displayName = "AgentNode";
export default AgentNode;
