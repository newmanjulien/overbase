"use client";
import {
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Select,
} from "../../../components/ui/select";

export const handlerOptions = [
  { id: "1", name: "Henry Brown", avatar: "/images/profile-1.png" },
  { id: "2", name: "Tracy Zhao", avatar: "/images/profile-2.png" },
  { id: "3", name: "Eric Clarke", avatar: "/images/profile-3.png" },
  { id: "4", name: "Henri Feiteshans", avatar: "/images/profile-4.png" },
];

import Image from "next/image";

interface HandlerSelectProps {
  value: string;
  onChange: (id: string) => void;
}

export function HandlerSelect({ value, onChange }: HandlerSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="text-gray-700 w-full text-sm h-[34px] border border-gray-200/60 hover:border-gray-200">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {handlerOptions.map((h) => (
          <SelectItem key={h.id} value={h.id}>
            <div className="flex items-center gap-2 min-w-0">
              {h.avatar ? (
                <Image
                  src={h.avatar}
                  alt={h.name}
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {h.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              )}
              <span className="truncate">{h.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
