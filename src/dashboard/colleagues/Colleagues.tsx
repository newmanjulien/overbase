// "use client";

// import { useState } from "react";
// import { Button } from "../../components/ui/button";
// import { Checkbox } from "../../components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "../../components/ui/dropdown-menu";
// import { ExternalLink, MoreHorizontal } from "lucide-react";
// import { WorkflowCard } from "../../components/WorkflowCard";

// interface Colleague {
//   id: string;
//   name: string;
//   role: string;
// }

// const mockColleagues: Colleague[] = [
//   {
//     id: "1",
//     name: "John Smith",
//     role: "Developer",
//   },
//   {
//     id: "2",
//     name: "Sarah Wilson",
//     role: "Designer",
//   },
//   {
//     id: "3",
//     name: "Mike Johnson",
//     role: "Product Manager",
//   },
// ];

// export function Colleagues() {
//   const [selectedColleagues, setSelectedColleagues] = useState<string[]>([]);
//   const [selectAll, setSelectAll] = useState(false);

//   const handleSelectAll = (checked: boolean | "indeterminate") => {
//     const isChecked = checked === true;
//     setSelectAll(isChecked);
//     if (isChecked) {
//       setSelectedColleagues(mockColleagues.map((c) => c.id));
//     } else {
//       setSelectedColleagues([]);
//     }
//   };

//   const handleSelectColleague = (colleagueId: string, checked: boolean) => {
//     if (checked) {
//       setSelectedColleagues((prev) => [...prev, colleagueId]);
//     } else {
//       setSelectedColleagues((prev) => prev.filter((id) => id !== colleagueId));
//       setSelectAll(false);
//     }
//   };

//   return (
//     <div>
//       {/* Header Section */}
//       <div
//         className="border-b border-gray-200/60"
//         style={{ backgroundColor: "#FAFAFA" }}
//       >
//         <div className="max-w-7xl mx-auto px-6 py-10">
//           <div className="flex items-center justify-between mb-4">
//             {/* Left: stacked h1 and subtitle with link */}
//             <div className="flex flex-col leading-tight max-w-[calc(100%-180px)]">
//               <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight mb-4">
//                 Colleagues
//               </h1>
//               <h2 className="text-gray-600 text-sm font-normal mt-1">
//                 Add colleagues so you can reference them in workflows and so
//                 your AI can collaborate with them on your tasks.{" "}
//                 <a
//                   href="#"
//                   className="inline-flex items-center text-[#1A69FF] hover:text-[#1A69FF]/80 ml-1 transition-colors"
//                 >
//                   <span>Learn more</span>
//                   <ExternalLink className="ml-1 h-4 w-4" />
//                 </a>
//               </h2>
//             </div>

//             {/* Right: create workflow button */}
//             <Button
//               onClick={() => {
//                 /* does nothing */
//               }}
//               className="font-normal bg-black text-white hover:bg-black/90 border border-transparent"
//             >
//               Add colleague
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content Section */}
//       <div style={{ backgroundColor: "#FAFAFA" }}>
//         <div className="max-w-7xl mx-auto px-6 py-16">
//           <div className="w-full flex flex-col gap-3">
//             {/* Select All card */}
//             <WorkflowCard
//               title="Select all"
//               titleClassName="text-gray-500 font-normal"
//               subtitle=""
//               buttonLabel=""
//               buttonOnClick={undefined}
//               leading={
//                 <Checkbox
//                   checked={selectAll}
//                   onCheckedChange={handleSelectAll}
//                   className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 rounded-sm"
//                 />
//               }
//               actions={
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-transparent"
//                     >
//                       <MoreHorizontal className="h-4 w-4" />
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent
//                     align="end"
//                     className="w-32 bg-white border border-gray-300 shadow-lg"
//                   >
//                     <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100">
//                       Delete
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               }
//               image={undefined}
//             />

//             {/* Colleague cards */}
//             {mockColleagues.map((colleague) => (
//               <WorkflowCard
//                 key={colleague.id}
//                 title={colleague.name}
//                 subtitle={colleague.role}
//                 image={undefined}
//                 buttonLabel=""
//                 buttonOnClick={undefined}
//                 onEdit={undefined}
//                 leading={
//                   <Checkbox
//                     checked={selectedColleagues.includes(colleague.id)}
//                     onCheckedChange={(checked) =>
//                       handleSelectColleague(colleague.id, checked as boolean)
//                     }
//                     className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 rounded-sm"
//                   />
//                 }
//                 actions={
//                   <DropdownMenu>
//                     <DropdownMenuTrigger asChild>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-transparent"
//                       >
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </DropdownMenuTrigger>
//                     <DropdownMenuContent
//                       align="end"
//                       className="w-32 bg-white border border-gray-300 shadow-lg"
//                     >
//                       <DropdownMenuItem className="text-gray-700 focus:bg-gray-100">
//                         Edit
//                       </DropdownMenuItem>
//                       <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100">
//                         Delete
//                       </DropdownMenuItem>
//                     </DropdownMenuContent>
//                   </DropdownMenu>
//                 }
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { ExternalLink, MoreHorizontal } from "lucide-react";
import { WorkflowCard } from "../../components/WorkflowCard";
import { InfoCard } from "../../components/InfoCard";
import { useSection } from "../Dashboard";

interface Colleague {
  id: string;
  name: string;
  role: string;
}

const mockColleagues: Colleague[] = [
  {
    id: "1",
    name: "John Smith",
    role: "Developer",
  },
  {
    id: "2",
    name: "Sarah Wilson",
    role: "Designer",
  },
  {
    id: "3",
    name: "Mike Johnson",
    role: "Product Manager",
  },
];

export function Colleagues() {
  const [selectedColleagues, setSelectedColleagues] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const { setActiveSection } = useSection(); // <-- use the same hook here

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedColleagues(mockColleagues.map((c) => c.id));
    } else {
      setSelectedColleagues([]);
    }
  };

  const handleSelectColleague = (colleagueId: string, checked: boolean) => {
    if (checked) {
      setSelectedColleagues((prev) => [...prev, colleagueId]);
    } else {
      setSelectedColleagues((prev) => prev.filter((id) => id !== colleagueId));
      setSelectAll(false);
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-4">
            {/* Left: stacked h1 and subtitle with link */}
            <div className="flex flex-col leading-tight max-w-[calc(100%-180px)]">
              <h1 className="text-[2rem] font-medium text-gray-800 tracking-tight mb-4">
                Colleagues
              </h1>
              <h2 className="text-gray-600 text-sm font-normal mt-1">
                Add colleagues so you can reference them in workflows and so
                your AI can collaborate with them on your tasks.{" "}
                <a
                  href="#"
                  className="inline-flex items-center text-[#1A69FF] hover:text-[#1A69FF]/80 ml-1 transition-colors"
                >
                  <span>Learn more</span>
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </h2>
            </div>

            {/* Right: create workflow button */}
            <Button
              onClick={() => {
                /* does nothing */
              }}
              className="font-normal bg-black text-white hover:bg-black/90 border border-transparent"
            >
              Add colleague
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div style={{ backgroundColor: "#FAFAFA" }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="w-full flex flex-col gap-3">
            {/* Select All card */}
            <WorkflowCard
              title="Select all"
              titleClassName="text-gray-500 font-normal"
              subtitle=""
              buttonLabel=""
              buttonOnClick={undefined}
              leading={
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                  className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 rounded-sm"
                />
              }
              actions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-32 bg-white border border-gray-300 shadow-lg"
                  >
                    <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
              image={undefined}
            />

            {/* Colleague cards */}
            {mockColleagues.map((colleague) => (
              <WorkflowCard
                key={colleague.id}
                title={colleague.name}
                subtitle={colleague.role}
                image={undefined}
                buttonLabel=""
                buttonOnClick={undefined}
                onEdit={undefined}
                leading={
                  <Checkbox
                    checked={selectedColleagues.includes(colleague.id)}
                    onCheckedChange={(checked) =>
                      handleSelectColleague(colleague.id, checked as boolean)
                    }
                    className="w-4 h-4 border-gray-300 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800 rounded-sm"
                  />
                }
                actions={
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-32 bg-white border border-gray-300 shadow-lg"
                    >
                      <DropdownMenuItem className="text-gray-700 focus:bg-gray-100">
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-100">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                }
              />
            ))}
          </div>

          {/* InfoCard at the bottom, same as in Emails */}
          <div className="mt-8 w-full">
            <InfoCard
              text="Copy email & Slack workflows which other CEOs created then easily customize them"
              linkText="Templates"
              onClick={() => setActiveSection("templates")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
