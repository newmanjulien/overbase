// "use client";

// import { Button } from "../../../components/ui/button";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import Image from "next/image";

// interface AgentCardProps {
//   id: number;
//   title: string;
//   description: string;
//   gradientFrom?: string;
//   gradientTo?: string;
//   isInstalled: boolean;
//   image?: string; // optional image
//   onInstall: () => void;
//   onLaunch?: () => void;
// }

// export function AgentCard({
//   id,
//   title,
//   description,
//   gradientFrom = "from-emerald-400",
//   gradientTo = "to-teal-500",
//   isInstalled,
//   image,
//   onInstall,
//   onLaunch,
// }: AgentCardProps) {
//   const router = useRouter();
//   const [isAnimating, setIsAnimating] = useState(false);

//   const handleInstallClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (!isInstalled) {
//       setIsAnimating(true);
//       setTimeout(() => {
//         onInstall();
//         setIsAnimating(false);
//       }, 200);
//     } else {
//       onLaunch?.();
//     }
//   };

//   return (
//     <div
//       className={`rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transform transition-all duration-200
//         ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}
//       `}
//       onClick={() => router.push("/dashboard/agents/builder")}
//     >
//       <div
//         className={`relative h-56 flex items-center justify-center bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
//       >
//         {/* Centered image or first letter */}
//         {image ? (
//           <Image
//             src={image}
//             alt={`${title} logo`}
//             width={54}
//             height={54}
//             className="rounded-full shadow-sm"
//           />
//         ) : (
//           <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-medium text-gray-800">
//             {title.charAt(0)}
//           </div>
//         )}

//         <Button
//           variant="secondary"
//           size="sm"
//           className="absolute top-3 right-3 bg-white text-gray-800 hover:bg-gray-50 font-normal"
//           onClick={handleInstallClick}
//         >
//           {isInstalled ? "Launch" : "Install"}
//         </Button>
//       </div>

//       <div className="bg-white p-4">
//         <h3 className="text-base font-semibold text-gray-900">{title}</h3>
//         <p className="text-sm text-gray-500 mb-1">{description}</p>
//       </div>
//     </div>
//   );
// }

"use client";

import { Button } from "../../../components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

interface AgentCardProps {
  id: number;
  title: string;
  description: string;
  gradientFrom?: string;
  gradientTo?: string;
  isInstalled: boolean;
  image?: string; // optional image
  onInstall: () => void;
  onLaunch?: () => void;
}

export function AgentCard({
  id,
  title,
  description,
  gradientFrom = "from-emerald-400",
  gradientTo = "to-teal-500",
  isInstalled,
  image,
  onInstall,
  onLaunch,
}: AgentCardProps) {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInstalled) {
      setIsAnimating(true);
      setTimeout(() => {
        onInstall();
        setIsAnimating(false);
      }, 200);
    } else {
      onLaunch?.();
    }
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transform transition-all duration-200
        ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}
      `}
      onClick={() => router.push("/dashboard/agents/builder")}
    >
      <div
        className={`relative h-56 flex items-center justify-center bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
      >
        {/* Centered image or first letter */}
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white p-1">
            {image ? (
              <Image
                src={image}
                alt={`${title} logo`}
                width={54}
                height={54}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-800">
                {title.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="absolute top-3 right-3 bg-white text-gray-800 hover:bg-gray-50 font-normal"
          onClick={handleInstallClick}
        >
          {isInstalled ? "Launch" : "Install"}
        </Button>
      </div>

      <div className="bg-white p-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mb-1">{description}</p>
      </div>
    </div>
  );
}
