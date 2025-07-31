import React from "react";

export const WorkflowTypeSelector = () => {
  return (
    <div className="mt-6">
      <div className="inline-flex bg-white rounded-lg p-1 border border-gray-200">
        <button className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 bg-gray-50 text-gray-900">
          Triage emails
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 text-gray-600 hover:text-gray-900">
          Create decks
        </button>
        <button className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 text-gray-600 hover:text-gray-900">
          Gather internal data
        </button>
      </div>
    </div>
  );
};
