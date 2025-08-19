// "use client";

// import { useState } from "react";
// import { AgentCard } from "./AgentCard";
// import { LaunchModal } from "./LaunchModal";
// import { Header } from "../../../components/Header";

// // Import data from DummyData.ts
// import { categoriesConfig, initialAgents, Agent } from "./DummyData";

// export function Agents() {
//   const [selectedCategory, setSelectedCategory] = useState("installed");
//   const [agents, setAgents] = useState<Agent[]>(initialAgents);
//   const [launchingAgent, setLaunchingAgent] = useState<Agent | null>(null);

//   const handleInstall = (agentId: number) => {
//     setAgents((previousAgents) =>
//       previousAgents.map((agent) =>
//         agent.id === agentId
//           ? {
//               ...agent,
//               categories: Array.from(
//                 new Set([...agent.categories, "installed"])
//               ),
//             }
//           : agent
//       )
//     );
//     setSelectedCategory("installed");
//   };

//   const filteredAgents = agents
//     .filter((agent) =>
//       selectedCategory === "installed"
//         ? agent.categories.includes("installed")
//         : !agent.categories.includes("installed") &&
//           agent.categories.includes(selectedCategory)
//     )
//     .sort((a, b) => a.id - b.id);

//   const selectedCategoryData = categoriesConfig.find(
//     (category) => category.key === selectedCategory
//   );

//   const gridTitle = selectedCategoryData?.header ?? "Explore Agents";
//   const gridSubtitle =
//     selectedCategoryData?.subheader ??
//     "Browse and install agents to help you automate tasks.";

//   return (
//     <div className="bg-[#FAFAFA] min-h-screen">
//       <Header
//         title="Agents"
//         subtitle="Easily install agents then assign a handler and customize the instructions."
//       />

//       <div className="max-w-7xl mx-auto px-6 py-10 flex gap-18">
//         <div className="w-56 flex-shrink-0">
//           <nav className="space-y-0.5">
//             {categoriesConfig.map((category) => (
//               <button
//                 key={category.key}
//                 onClick={() => setSelectedCategory(category.key)}
//                 className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
//                   selectedCategory === category.key
//                     ? "bg-white border border-gray-200/60 font-medium text-gray-800"
//                     : "text-gray-700 hover:text-gray-900 hover:bg-white border border-transparent"
//                 }`}
//               >
//                 <span>{category.name}</span>
//               </button>
//             ))}
//           </nav>
//         </div>

//         <div className="flex-1">
//           <div className="mb-8">
//             <h2 className="text-2xl font-medium text-gray-800">{gridTitle}</h2>
//             <p className="text-gray-500 text-sm mt-1">{gridSubtitle}</p>
//           </div>

//           <div
//             className={`rounded-md ${
//               selectedCategory === "installed" ? "p-6 bg-white" : ""
//             }`}
//           >
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredAgents.map((agent) => (
//                 <AgentCard
//                   key={agent.id}
//                   id={agent.id}
//                   title={agent.title}
//                   description={agent.description}
//                   gradientFrom={agent.gradientFrom}
//                   gradientTo={agent.gradientTo}
//                   isInstalled={agent.categories.includes("installed")}
//                   image={agent.image}
//                   onInstall={() => handleInstall(agent.id)}
//                   onLaunch={() => setLaunchingAgent(agent)}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {launchingAgent && (
//         <LaunchModal
//           isOpen={!!launchingAgent}
//           onClose={() => setLaunchingAgent(null)}
//         />
//       )}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { AgentCard } from "./AgentCard";
import { LaunchModal } from "./LaunchModal";
import { Header } from "../../../components/Header";

// Import data from DummyData.ts
import { skillsConfig, initialAgents, Agent } from "./DummyData";

export function Agents() {
  const [selectedSkill, setSelectedSkill] = useState("installed");
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [launchingAgent, setLaunchingAgent] = useState<Agent | null>(null);

  const handleInstall = (agentId: number) => {
    setAgents((previousAgents) =>
      previousAgents.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              skills: Array.from(new Set([...agent.skills, "installed"])),
            }
          : agent
      )
    );
    setSelectedSkill("installed");
  };

  const filteredAgents = agents
    .filter((agent) =>
      selectedSkill === "installed"
        ? agent.skills.includes("installed")
        : !agent.skills.includes("installed") &&
          agent.skills.includes(selectedSkill)
    )
    .sort((a, b) => a.id - b.id);

  const selectedSkillData = skillsConfig.find(
    (skill) => skill.key === selectedSkill
  );

  const gridTitle = selectedSkillData?.header ?? "Explore Agents";
  const gridSubtitle =
    selectedSkillData?.subheader ??
    "Browse and install agents to help you automate tasks.";

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <Header
        title="Agents"
        subtitle="Easily install agents then assign a handler and customize the instructions."
      />

      <div className="max-w-7xl mx-auto px-6 py-10 flex gap-18">
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-0.5">
            {skillsConfig.map((skill) => (
              <button
                key={skill.key}
                onClick={() => setSelectedSkill(skill.key)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                  selectedSkill === skill.key
                    ? "bg-white border border-gray-200/60 font-medium text-gray-800"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white border border-transparent"
                }`}
              >
                <span>{skill.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-800">{gridTitle}</h2>
            <p className="text-gray-500 text-sm mt-1">{gridSubtitle}</p>
          </div>

          <div
            className={`rounded-md ${
              selectedSkill === "installed" ? "p-6 bg-white" : ""
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  id={agent.id}
                  title={agent.title}
                  description={agent.description}
                  gradientFrom={agent.gradientFrom}
                  gradientTo={agent.gradientTo}
                  isInstalled={agent.skills.includes("installed")}
                  image={agent.image}
                  onInstall={() => handleInstall(agent.id)}
                  onLaunch={() => setLaunchingAgent(agent)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {launchingAgent && (
        <LaunchModal
          isOpen={!!launchingAgent}
          onClose={() => setLaunchingAgent(null)}
        />
      )}
    </div>
  );
}
