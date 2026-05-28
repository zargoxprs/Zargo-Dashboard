import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Props {
  initialStart?: string;
  initialEnd?: string;
  onApply: (start?: string, end?: string) => void;
  onCancel?: () => void;
}

export default function DateRangePicker({ initialStart, initialEnd, onApply, onCancel }: Props) {
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({
    from: initialStart ? new Date(initialStart) : undefined,
    to: initialEnd ? new Date(initialEnd) : undefined,
  });

  const apply = () => {
    onApply(range.from ? range.from.toISOString() : undefined, range.to ? range.to.toISOString() : undefined);
  };

  return (
    <div className="p-3">
      <DayPicker
        mode="range"
        selected={range}
        onSelect={(r: any) => setRange(r || {})}
      />
      <div className="flex gap-2 mt-2 justify-end">
        <button className="px-3 py-1 rounded-md" onClick={onCancel}>Cancel</button>
        <button className="px-3 py-1 rounded-md bg-primary text-white" onClick={apply}>Apply</button>
      </div>
    </div>
  );
}
