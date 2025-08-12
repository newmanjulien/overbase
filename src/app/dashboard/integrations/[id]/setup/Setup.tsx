// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "../../../../../components/ui/button";
// import type { Integration } from "../../DummyData";
// import { useIntegrationContext } from "../../../../../lib/integrationContext";

// interface SetupProps {
//   integration: Integration;
// }

// export default function Setup({ integration }: SetupProps) {
//   const router = useRouter();
//   const { addIntegration } = useIntegrationContext();

//   // Example form state (customize fields as needed)
//   const [customName, setCustomName] = useState(integration.title);
//   const [config, setConfig] = useState("");

//   const handleCreate = () => {
//     // Add integration with custom config/name and status active
//     addIntegration({
//       ...integration,
//       title: customName,
//       status: "active",
//       badge: "Billed Via Vercel",
//       lastUpdated: "just now",
//     });

//     // Navigate back to integrations list or integration detail page
//     router.push("/dashboard/integrations");
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-8 bg-white rounded shadow-md mt-12">
//       <h1 className="text-2xl font-semibold mb-6">Setup {integration.title}</h1>

//       <div className="mb-4">
//         <label className="block mb-1 font-medium text-gray-700" htmlFor="name">
//           Name
//         </label>
//         <input
//           id="name"
//           type="text"
//           value={customName}
//           onChange={(e) => setCustomName(e.target.value)}
//           className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       <div className="mb-6">
//         <label
//           className="block mb-1 font-medium text-gray-700"
//           htmlFor="config"
//         >
//           Configuration
//         </label>
//         <textarea
//           id="config"
//           rows={4}
//           value={config}
//           onChange={(e) => setConfig(e.target.value)}
//           placeholder="Enter any configuration or notes here..."
//           className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>

//       <Button
//         onClick={handleCreate}
//         variant="default"
//         className="bg-black text-white hover:bg-black/90"
//       >
//         Create
//       </Button>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import type { Integration } from "../../DummyData";
import { useIntegrationContext } from "../../../../../lib/integrationContext";

interface SetupProps {
  integration: Integration;
}

export default function Setup({ integration }: SetupProps) {
  const router = useRouter();
  const { addIntegration } = useIntegrationContext();

  // Example form state (customize fields as needed)
  const [customName, setCustomName] = useState(integration.title);
  const [config, setConfig] = useState("");

  const handleCreate = () => {
    // Add integration with custom config/name and status active
    addIntegration({
      ...integration,
      title: customName,
      status: "active",
      badge: "Billed Via Vercel",
      lastUpdated: "just now",
    });

    // Navigate back to integrations list
    router.push("/dashboard/integrations");
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded shadow-md mt-12">
      {/* Top back button */}
      <div className="mb-6">
        <Button
          variant="default"
          className="bg-gray-100 text-gray-800 hover:bg-gray-200"
          onClick={() => router.push("/dashboard/integrations")}
        >
          Back to Integrations
        </Button>
      </div>

      <h1 className="text-2xl font-semibold mb-6">Setup {integration.title}</h1>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label
          className="block mb-1 font-medium text-gray-700"
          htmlFor="config"
        >
          Configuration
        </label>
        <textarea
          id="config"
          rows={4}
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          placeholder="Enter any configuration or notes here..."
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Buttons container */}
      <div className="flex gap-4">
        <Button
          onClick={handleCreate}
          variant="default"
          className="bg-black text-white hover:bg-black/90"
        >
          Create
        </Button>

        <Button
          variant="default"
          className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          onClick={() =>
            router.push(`/dashboard/integrations/${integration.id}`)
          }
        >
          Back
        </Button>
      </div>
    </div>
  );
}
