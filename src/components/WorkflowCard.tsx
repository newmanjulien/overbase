// import Image from "next/image";
// import { ReactNode, useState } from "react";
// import { ChevronDown } from "lucide-react";
// import { LaunchMenu } from "./LaunchMenu";

// interface WorkflowCardProps {
//   id: number;
//   title: string;
//   subtitle: string;
//   image?: string;
//   actions?: ReactNode;
//   onLaunch?: (id: number, type: "one-time" | "schedule") => void;
// }

// export function WorkflowCard({
//   id,
//   title,
//   subtitle,
//   image,
//   actions,
//   onLaunch,
// }: WorkflowCardProps) {
//   const [launchMenuOpen, setLaunchMenuOpen] = useState(false);

//   const handleLaunchSelect = (type: "one-time" | "schedule") => {
//     setLaunchMenuOpen(false);
//     if (onLaunch) {
//       onLaunch(id, type);
//     }
//   };

//   return (
//     <div
//       key={id}
//       className="flex items-center justify-between py-3 px-3 bg-white border border-gray-200/60 hover:border-gray-300 transition-all duration-200 rounded-lg"
//     >
//       <div className="flex items-center space-x-4">
//         <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden border border-gray-200/60">
//           <Image
//             src={image || "/placeholder.svg"}
//             alt={title}
//             fill
//             style={{ objectFit: "cover" }}
//           />
//         </div>
//         <div className="min-w-0 max-w-lg">
//           <h3 className="font-semibold text-gray-700 text-sm tracking-tight leading-tight">
//             {title}
//           </h3>
//           <p className="text-gray-500 text-sm font-light leading-relaxed truncate">
//             {subtitle}
//           </p>
//         </div>
//       </div>
//       <div className="flex items-center space-x-3">
//         <div className="relative">
//           <button
//             onClick={() => setLaunchMenuOpen(!launchMenuOpen)}
//             className="text-gray-700 hover:bg-green-50 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60 rounded-md transition-colors flex items-center gap-1"
//           >
//             Launch
//             <ChevronDown className="w-3 h-3" />
//           </button>
//           {/* <LaunchMenu isOpen={launchMenuOpen} onSelect={handleLaunchSelect} /> */}
//           <LaunchMenu
//             isOpen={launchMenuOpen}
//             onSelect={handleLaunchSelect}
//             onClose={() => setLaunchMenuOpen(false)}
//           />
//         </div>
//         {actions && (
//           <div className="flex items-center space-x-3">{actions}</div>
//         )}
//       </div>
//     </div>
//   );
// }

import Image from "next/image";
import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LaunchMenu } from "./LaunchMenu";
import { Button } from "./ui/button";

interface WorkflowCardProps {
  id: number;
  title: string;
  subtitle: string;
  image?: string;
  actions?: ReactNode;
  onLaunch?: (id: number, type: "one-time" | "schedule") => void;
  onEdit?: () => void;
}

export function WorkflowCard({
  id,
  title,
  subtitle,
  image,
  actions,
  onLaunch,
  onEdit,
}: WorkflowCardProps) {
  const [launchMenuOpen, setLaunchMenuOpen] = useState(false);

  const handleLaunchSelect = (type: "one-time" | "schedule") => {
    setLaunchMenuOpen(false);
    if (onLaunch) {
      onLaunch(id, type);
    }
  };

  return (
    <div
      key={id}
      className="flex items-center justify-between py-3 px-3 bg-white border border-gray-200/60 hover:border-gray-300 transition-all duration-200 rounded-lg"
    >
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center relative overflow-hidden border border-gray-200/60">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="min-w-0 max-w-lg">
          <h3 className="font-semibold text-gray-700 text-sm tracking-tight leading-tight">
            {title}
          </h3>
          <p className="text-gray-500 text-sm font-light leading-relaxed truncate">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <button
            onClick={() => setLaunchMenuOpen(!launchMenuOpen)}
            className="text-gray-700 hover:bg-green-50 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60 rounded-md transition-colors flex items-center gap-1"
          >
            Launch
            <ChevronDown className="w-3 h-3" />
          </button>
          <LaunchMenu
            isOpen={launchMenuOpen}
            onSelect={handleLaunchSelect}
            onClose={() => setLaunchMenuOpen(false)}
          />
        </div>

        {onEdit && (
          <Button
            variant="ghost"
            className="text-gray-700 hover:bg-gray-50/80 font-normal text-sm px-3 py-1.5 h-auto border border-gray-200/60"
            onClick={onEdit}
          >
            Edit
          </Button>
        )}

        {actions && (
          <div className="flex items-center space-x-3">{actions}</div>
        )}
      </div>
    </div>
  );
}
