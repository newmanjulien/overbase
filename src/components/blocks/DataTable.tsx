"use client";

import React, { useState } from "react";
import { Download, Forward } from "lucide-react";

export interface TableRow {
  api_id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface DataTableProps {
  tableData: TableRow[];
}

export default function DataTable({ tableData }: DataTableProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="px-4 pb-4">
      <div
        className="relative border border-gray-200 rounded-xl overflow-hidden bg-white"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Hover Action Bar */}
        <div
          className={`absolute top-2 right-2 z-10 flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1.5 transition-opacity duration-150 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => {}}
          >
            <Forward size={16} />
          </button>
          <button
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => {}}
          >
            <Download size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table
            className="w-full text-left border-collapse table-fixed
          [&_td]:p-1.5 [&_td]:text-xs [&_td]:font-mono 
          [&_td]:overflow-hidden [&_td]:whitespace-nowrap 
          [&_td]:border-r [&_td]:border-gray-200 [&_td]:max-w-[200px]
          [&_td:last-child]:border-r-0
          [&_tr]:border-b [&_tr]:border-gray-200 [&_tr:last-child]:border-0
          [&_tr]:text-gray-900"
          >
            <tbody>
              {tableData.map((row, i) => {
                const isLastRow = i === tableData.length - 1;
                return (
                  <tr
                    key={i}
                    className={isLastRow ? "relative" : ""}
                    style={
                      isLastRow
                        ? {
                            maskImage:
                              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
                            WebkitMaskImage:
                              "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
                          }
                        : undefined
                    }
                  >
                    <td title={row.api_id}>{row.api_id}</td>
                    <td title={row.name}>{row.name}</td>
                    <td title={row.first_name}>{row.first_name}</td>
                    <td title={row.last_name}>{row.last_name}</td>
                    <td title={row.email}>{row.email}</td>
                    <td className="w-12"></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
