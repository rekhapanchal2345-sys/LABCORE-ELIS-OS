import { Calendar } from "lucide-react";

interface DateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const dateRanges = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days", label: "Last 7 Days" },
  { value: "30days", label: "Last 30 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];

export default function DateRangeSelector({
  value,
  onChange,
}: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-[var(--text-tertiary)]" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="form-select"
      >
        {dateRanges.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
    </div>
  );
}