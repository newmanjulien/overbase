"use client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

export const handlerOptions = [
  { id: "5", name: "Tracy Zhao", avatar: "/images/profile-2.png" },
  { id: "2", name: "Mike Johnson" },
  { id: "4", name: "David Kim" },
];

interface HandlerSelectProps {
  value: string;
  onChange: (id: string) => void;
}

export function HandlerSelect({ value, onChange }: HandlerSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="text-gray-700 w-40 text-sm h-[34px] border border-gray-200/60 hover:border-gray-200">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {handlerOptions.map((h) => (
          <SelectItem key={h.id} value={h.id}>
            <div className="flex items-center gap-2">
              {h.avatar ? (
                <img
                  src={h.avatar}
                  alt={h.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-[10px] font-bold">
                  {h.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              )}
              <span>{h.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
