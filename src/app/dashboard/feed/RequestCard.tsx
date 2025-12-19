"use client";

import DataTable, { TableRow } from "../../../components/blocks/DataTable";
import { Download } from "lucide-react";

export interface RequestType {
  id: number;
  askedDate: string;
  title?: string;
  content: string;
  tableData?: TableRow[];
  status: "in-progress" | "completed";
}

interface RequestCardProps {
  request: RequestType;
}

export default function RequestCard({ request }: RequestCardProps) {
  const handleCardClick = () => {
    window.open(`/dashboard/feed/${request.id}`, "_blank");
  };

  return (
    <div
      onClick={handleCardClick}
      className="block bg-white rounded-2xl border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader request={request} />

      {request.tableData && <DataTable tableData={request.tableData} />}
    </div>
  );
}

// -------------------- Subcomponents --------------------

function CardHeader({ request }: { request: RequestType }) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400">
          Asked on {request.askedDate}
        </span>
        {request.status === "in-progress" && (
          <span
            className="px-2 py-1 rounded-lg text-xs text-gray-800"
            style={{ backgroundColor: "#FFFF00" }}
          >
            In Progress
          </span>
        )}
        {request.status === "completed" && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Download logic could go here
            }}
            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors group"
            aria-label="Download"
          >
            <Download className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        )}
      </div>
      {request.title && <h2 className="text-gray-900 mb-2">{request.title}</h2>}
      <p className="text-gray-700 text-sm line-clamp-2 overflow-hidden">{request.content}</p>
    </div>
  );
}