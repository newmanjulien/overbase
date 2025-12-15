"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";

interface TableRow {
  api_id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface FollowUpQuestion {
  id: string;
  question: string;
}

export interface RequestType {
  id: number;
  askedDate: string;
  title?: string;
  content: string;
  tableData?: TableRow[];
  status: "in-progress" | "completed";
  followUpQuestions?: FollowUpQuestion[];
}

interface RequestCardProps {
  request: RequestType;
}

export default function RequestCard({ request }: RequestCardProps) {
  const handleCardClick = () => {
    // Navigate to the detail page
    window.open(`/dashboard/feed/${request.id}`, "_blank");
  };

  return (
    <div
      onClick={handleCardClick}
      className="block bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader request={request} />

      {request.status === "in-progress" ? (
        <FollowUpQuestions request={request} />
      ) : (
        request.tableData && <RequestTable tableData={request.tableData} />
      )}
    </div>
  );
}

// -------------------- Subcomponents --------------------

function CardHeader({ request }: { request: RequestType }) {
  return (
    <div className="p-4 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">
          Asked on {request.askedDate}
        </span>
        {request.status === "in-progress" && (
          <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-gray-500">
            In Progress
          </span>
        )}
      </div>
      {request.title && (
        <h2 className="font-bold text-gray-900 mb-2">{request.title}</h2>
      )}
      <p className="text-gray-700 text-sm">{request.content}</p>
    </div>
  );
}

function FollowUpQuestions({ request }: { request: RequestType }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswerChange = (id: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card click
    console.log(`Submitted answer for ${id}:`, answers[id]);
  };

  const questions = request.followUpQuestions || [];
  if (questions.length === 0) return null;

  return (
    <div className="px-4 pb-4">
      <div className="border-t border-gray-100 pt-3 mt-2">
        <p className="text-xs font-medium text-gray-500 mb-3">
          Optional follow-up questions:
        </p>
        <div className="space-y-3">
          {questions.map((fq) => (
            <div
              key={fq.id}
              className="bg-gray-50 rounded-md p-3"
              onClick={(e) => e.stopPropagation()} // prevent card click
            >
              <p className="text-sm text-gray-700 mb-2">{fq.question}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your answer..."
                  value={answers[fq.id] || ""}
                  onChange={(e) => handleAnswerChange(fq.id, e.target.value)}
                  className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={(e) => handleSubmit(e, fq.id)}
                  disabled={!answers[fq.id]?.trim()}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Submit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RequestTable({ tableData }: { tableData: TableRow[] }) {
  return (
    <div className="px-4 pt-4 pb-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead onClick={(e) => e.stopPropagation()}>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-2 px-3 font-mono text-xs">API ID</th>
            <th className="text-left py-2 px-3 text-xs">Name</th>
            <th className="text-left py-2 px-3 text-xs">First Name</th>
            <th className="text-left py-2 px-3 text-xs">Last Name</th>
            <th className="text-left py-2 px-3 text-xs">Email</th>
            <th className="text-right py-2 px-3 text-xs">
              <button
                aria-label="Download table data"
                onClick={(e) => e.stopPropagation()}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Download className="h-4 w-4 text-gray-500" />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr
              key={row.api_id}
              className="border-b border-gray-100 text-gray-900"
              onClick={(e) => e.stopPropagation()} // prevent card click
            >
              <td className="py-2 px-3 font-mono text-xs">{row.api_id}</td>
              <td className="py-2 px-3">{row.name}</td>
              <td className="py-2 px-3">{row.first_name}</td>
              <td className="py-2 px-3">{row.last_name}</td>
              <td className="py-2 px-3">{row.email}</td>
              <td className="py-2 px-3 text-right">
                {/* Placeholder for future row-specific action if needed */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
