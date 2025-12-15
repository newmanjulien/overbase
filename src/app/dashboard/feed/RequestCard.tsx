"use client";

import React from "react";

interface TableRow {
  api_id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface RequestType {
  id: number;
  askedDate: string;
  title?: string;
  content: string;
  tableData?: TableRow[];
}

interface RequestCardProps {
  request: RequestType;
}

export default function RequestCard({ request }: RequestCardProps) {
  return (
    <a
      href={`/dashboard/feed/${request.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="p-4 pb-2">
        <span className="text-xs text-gray-500">
          Asked on {request.askedDate}
        </span>
        {request.title && (
          <h2 className="font-bold text-gray-900 mb-2">{request.title}</h2>
        )}
        <p className="text-gray-700 text-sm">{request.content}</p>
      </div>

      {request.tableData && (
        <div className="px-4 pb-4 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-mono text-xs">
                  API ID
                </th>
                <th className="text-left py-2 px-3 text-xs">Name</th>
                <th className="text-left py-2 px-3 text-xs">First Name</th>
                <th className="text-left py-2 px-3 text-xs">Last Name</th>
                <th className="text-left py-2 px-3 text-xs">Email</th>
              </tr>
            </thead>
            <tbody>
              {request.tableData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 text-gray-900"
                >
                  <td className="py-2 px-3 font-mono text-xs">{row.api_id}</td>
                  <td className="py-2 px-3">{row.name}</td>
                  <td className="py-2 px-3">{row.first_name}</td>
                  <td className="py-2 px-3">{row.last_name}</td>
                  <td className="py-2 px-3">{row.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </a>
  );
}
