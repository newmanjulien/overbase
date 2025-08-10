// "use client";

// import { useState } from "react";
// import { ExternalLink } from "lucide-react";
// import { Button } from "../../components/ui/button";
// import { Badge } from "../../components/ui/badge";

// const categories = [
//   "Browse All",
//   "AI",
//   "Analytics",
//   "Authentication",
//   "CMS",
//   "Commerce",
//   "DevTools",
//   "Experimentation",
//   "Flags",
//   "Logging",
//   "Messaging",
//   "Monitoring",
//   "Observability",
//   "Productivity",
// ];

// const templateData = [
//   {
//     id: 1,
//     title: "Neon",
//     description: "Ship faster with Serverless Postgres",
//     category: "Analytics",
//     createdBy: "Sarah Chen",
//     creatorPhoto: "/professional-woman-headshot.png",
//   },
//   {
//     id: 2,
//     title: "Upstash",
//     description: "Serverless DB (Redis, Vector, Queue)",
//     category: "Analytics",
//     createdBy: "Marcus Johnson",
//     creatorPhoto: "/professional-man-headshot.png",
//   },
//   {
//     id: 3,
//     title: "Supabase",
//     description: "Open source Firebase alternative",
//     category: "Authentication",
//     createdBy: "Elena Rodriguez",
//     creatorPhoto: "/professional-woman-headshot.png",
//   },
//   {
//     id: 4,
//     title: "Notion",
//     description: "All-in-one workspace for notes",
//     category: "Productivity",
//     createdBy: "Amanda Foster",
//     creatorPhoto: "/professional-woman-headshot.png",
//   },
//   // ... add more as needed
// ];

// export function Templates() {
//   const [selectedCategory, setSelectedCategory] = useState("Browse All");

//   const filteredTemplates =
//     selectedCategory === "Browse All"
//       ? templateData
//       : templateData.filter(
//           (template) => template.category === selectedCategory
//         );

//   return (
//     <div>
//       {/* Header Section */}
//       <div
//         className="border-b border-gray-200/60"
//         style={{ backgroundColor: "#FAFAFA" }}
//       >
//         <div className="max-w-7xl mx-auto px-6 py-10">
//           <h1 className="text-[2rem] font-medium text-gray-800 mb-4 tracking-tight">
//             Templates
//           </h1>
//           <div className="flex items-center text-gray-800 text-sm">
//             <span>
//               Copy templates other execs created then easily edit and customize
//               them.
//             </span>
//             <a
//               href="#"
//               className="inline-flex items-center text-[#1A69FF] hover:text-[#1A69FF]/80 ml-1 transition-colors"
//             >
//               <span>Learn more</span>
//               <ExternalLink className="ml-1 h-4 w-4" />
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div style={{ backgroundColor: "#FAFAFA" }}>
//         <div className="max-w-7xl mx-auto px-6 py-16 flex gap-8">
//           {/* Sidebar Categories */}
//           <div className="w-56 flex-shrink-0">
//             <nav className="space-y-0.5">
//               {categories.map((category) => (
//                 <button
//                   key={category}
//                   onClick={() => setSelectedCategory(category)}
//                   className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
//                     selectedCategory === category
//                       ? "bg-white border border-gray-200 font-medium text-gray-800"
//                       : "text-gray-700 hover:text-gray-900 hover:bg-white border border-transparent"
//                   }`}
//                 >
//                   <span>{category}</span>
//                   {category === "Experimentation" && (
//                     <Badge
//                       variant="secondary"
//                       className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 font-medium"
//                     >
//                       New
//                     </Badge>
//                   )}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           {/* Template Grid */}
//           <div className="flex-1">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredTemplates.map((template) => (
//                 <div
//                   key={template.id}
//                   className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between"
//                 >
//                   <div>
//                     <h3 className="font-medium text-gray-900 text-lg">
//                       {template.title}
//                     </h3>
//                     <p className="text-sm text-gray-600 mb-3">
//                       {template.description}
//                     </p>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <img
//                         src={template.creatorPhoto || "/placeholder.svg"}
//                         alt={template.createdBy}
//                         className="w-6 h-6 rounded-full object-cover"
//                       />
//                       <p className="text-xs text-gray-500">
//                         {template.createdBy}
//                       </p>
//                     </div>
//                     <Button
//                       size="sm"
//                       className="bg-[#FC3636] hover:bg-[#e52e2e]"
//                     >
//                       Copy
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { TemplateCard } from "../../components/TemplateCard"; // adjust path as needed

const categories = [
  "Browse All",
  "AI",
  "Analytics",
  "Authentication",
  "CMS",
  "Commerce",
  "DevTools",
  "Experimentation",
  "Flags",
  "Logging",
  "Messaging",
  "Monitoring",
  "Observability",
  "Productivity",
];

const templateData = [
  {
    id: 1,
    title: "Neon",
    description: "Ship faster with Serverless Postgres",
    category: "Analytics",
    createdBy: "Sarah Chen",
    creatorPhoto: "/professional-woman-headshot.png",
  },
  {
    id: 2,
    title: "Upstash",
    description: "Serverless DB (Redis, Vector, Queue)",
    category: "Analytics",
    createdBy: "Marcus Johnson",
    creatorPhoto: "/professional-man-headshot.png",
  },
  {
    id: 3,
    title: "Supabase",
    description: "Open source Firebase alternative",
    category: "Authentication",
    createdBy: "Elena Rodriguez",
    creatorPhoto: "/professional-woman-headshot.png",
  },
  {
    id: 4,
    title: "Notion",
    description: "All-in-one workspace for notes",
    category: "Productivity",
    createdBy: "Amanda Foster",
    creatorPhoto: "/professional-woman-headshot.png",
  },
  // ... add more as needed
];

// Updated TemplateCard to accept props (I'll add this below)
interface TemplateCardProps {
  title: string;
  description: string;
  createdBy: string;
  creatorPhoto: string;
}

export function Templates() {
  const [selectedCategory, setSelectedCategory] = useState("Browse All");

  const filteredTemplates =
    selectedCategory === "Browse All"
      ? templateData
      : templateData.filter(
          (template) => template.category === selectedCategory
        );

  return (
    <div>
      {/* Header Section */}
      <div
        className="border-b border-gray-200/60"
        style={{ backgroundColor: "#FAFAFA" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-[2rem] font-medium text-gray-800 mb-4 tracking-tight">
            Templates
          </h1>
          <div className="flex items-center text-gray-800 text-sm">
            <span>
              Copy templates other execs created then easily edit and customize
              them.
            </span>
            <a
              href="#"
              className="inline-flex items-center text-[#1A69FF] hover:text-[#1A69FF]/80 ml-1 transition-colors"
            >
              <span>Learn more</span>
              <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ backgroundColor: "#FAFAFA" }}>
        <div className="max-w-7xl mx-auto px-6 py-16 flex gap-8">
          {/* Sidebar Categories */}
          <div className="w-56 flex-shrink-0">
            <nav className="space-y-0.5">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                    selectedCategory === category
                      ? "bg-white border border-gray-200 font-medium text-gray-800"
                      : "text-gray-700 hover:text-gray-900 hover:bg-white border border-transparent"
                  }`}
                >
                  <span>{category}</span>
                  {category === "Experimentation" && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 font-medium"
                    >
                      New
                    </Badge>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Template Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  title={template.title}
                  description={template.description}
                  createdBy={template.createdBy}
                  creatorPhoto={template.creatorPhoto}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
