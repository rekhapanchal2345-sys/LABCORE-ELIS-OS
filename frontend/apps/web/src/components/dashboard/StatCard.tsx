import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  onClick?: () => void;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  onClick,
  loading = false,
}: StatCardProps) {
  const changeColors = {
    positive: "text-[var(--success)]",
    negative: "text-[var(--danger)]",
    neutral: "text-[var(--text-tertiary)]",
  };

  return (
    <div
      onClick={onClick}
      className={`stat-card ${onClick ? "cursor-pointer hover:shadow-md" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-card-label">
            {title}
          </p>

          {loading ? (
            <div className="mt-2 h-8 w-24 loading-skeleton" />
          ) : (
            <p className="stat-card-value">
              {value}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--primary-light)] text-[var(--primary)]">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {change && !loading && (
        <p className={`stat-card-change ${changeColors[changeType]}`}>
          {change}
        </p>
      )}
    </div>
  );
}