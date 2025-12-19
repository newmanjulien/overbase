"use client";

import React from "react";

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
  return (
    <div className="px-4 pb-4">
      <div 
        className="border border-gray-200 rounded-xl overflow-hidden bg-white" 
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed
          [&_td]:p-1.5 [&_td]:text-xs [&_td]:font-mono 
          [&_td]:overflow-hidden [&_td]:whitespace-nowrap 
          [&_td]:border-r [&_td]:border-gray-200 [&_td]:max-w-[200px]
          [&_td:last-child]:border-r-0
          [&_tr]:border-b [&_tr]:border-gray-200 [&_tr:last-child]:border-0
          [&_tr:last-child_td]:text-gray-300 [&_tr]:text-gray-900"
        >
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i}>
                  <td title={row.api_id}>{row.api_id}</td>
                  <td title={row.name}>{row.name}</td>
                  <td title={row.first_name}>{row.first_name}</td>
                  <td title={row.last_name}>{row.last_name}</td>
                  <td title={row.email}>{row.email}</td>
                  <td className="w-12"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
