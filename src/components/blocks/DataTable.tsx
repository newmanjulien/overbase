"use client";

import { useState } from "react";
import { Download, Forward } from "lucide-react";
import type { TableRow as TableRowType } from "@/lib/questions";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  // TableHeader,
  // TableHead,
} from "@/components/ui/table";

// Re-export for backward compatibility
export type { TableRowType as TableRow };

interface DataTableProps {
  tableData: TableRowType[];
  onForward?: () => void;
}

export default function DataTable({ tableData, onForward }: DataTableProps) {
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
          className={`absolute top-2 right-2 z-10 flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-1.5 py-1 transition-opacity duration-150 ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onForward?.();
            }}
          >
            <Forward size={17} />
          </button>
          <button
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Download size={17} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table
            className="w-full text-left border-collapse table-fixed
          [&_td]:!p-1.5 [&_td]:text-xs [&_td]:font-mono 
          [&_td]:overflow-hidden [&_td]:whitespace-nowrap 
          [&_td]:border-r [&_td]:border-gray-200
          [&_td:last-child]:border-r-0
          [&_tr]:border-b [&_tr]:border-gray-200 [&_tr:last-child]:border-0
          [&_tr]:text-gray-900"
          >
            <TableBody>
              {tableData.map((row, i) => {
                const isLastRow = i === tableData.length - 1;
                return (
                  <TableRow
                    key={i}
                    className={`hover:bg-transparent ${isLastRow ? "relative" : ""}`}
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
                    <TableCell title={row.column1}>{row.column1}</TableCell>
                    <TableCell title={row.column2}>{row.column2}</TableCell>
                    <TableCell title={row.column3}>{row.column3}</TableCell>
                    <TableCell title={row.column4}>{row.column4}</TableCell>
                    <TableCell title={row.column5}>{row.column5}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
