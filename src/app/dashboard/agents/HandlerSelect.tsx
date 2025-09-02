"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

export interface Handler {
  id: string;
  name: string;
}

interface HandlerSelectProps {
  value: string;
  onChange: (newHandlerId: string) => void | Promise<void>;
  handlers: Handler[];
  loading: boolean;
}

export function HandlerSelect({
  value,
  onChange,
  handlers,
  loading,
}: HandlerSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={loading ? "Loading..." : "Select handler"} />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
          <SelectItem value="loading" disabled>
            Loading handlers...
          </SelectItem>
        ) : handlers.length ? (
          handlers.map((handler) => (
            <SelectItem key={handler.id} value={handler.id}>
              {handler.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="none" disabled>
            No handlers available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
