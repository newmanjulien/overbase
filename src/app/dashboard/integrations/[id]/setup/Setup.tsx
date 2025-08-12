"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../../../components/ui/button";
import type { Integration } from "../../DummyData";

interface SetupProps {
  integration: Integration;
}

export default function Setup({ integration }: SetupProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    apiKey: "",
    workspaceName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // For now, just log the data
    console.log("Setup data:", formData);

    // Later you can trigger install logic here

    // Redirect back to integrations list
    router.push("/dashboard/integrations");
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Setup {integration.title}</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <input
            type="text"
            name="apiKey"
            value={formData.apiKey}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter your API key"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Workspace Name
          </label>
          <input
            type="text"
            name="workspaceName"
            value={formData.workspaceName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Enter workspace name"
          />
        </div>

        <Button
          onClick={handleSubmit}
          className="bg-black text-white hover:bg-black/90"
        >
          Create
        </Button>
      </div>
    </div>
  );
}
