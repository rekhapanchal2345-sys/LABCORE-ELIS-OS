import { Activity, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface OperationStep {
  label: string;
  count: number;
  total: number;
  status: "completed" | "in-progress" | "pending" | "alert";
}

interface LabOperationsOverviewProps {
  operations: OperationStep[];
}

export default function LabOperationsOverview({
  operations,
}: LabOperationsOverviewProps) {
  const getStatusIcon = (status: OperationStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-[var(--success)]" />;
      case "in-progress":
        return <Activity className="h-4 w-4 text-[var(--primary)]" />;
      case "pending":
        return <Clock className="h-4 w-4 text-[var(--warning)]" />;
      case "alert":
        return <AlertCircle className="h-4 w-4 text-[var(--danger)]" />;
    }
  };

  const getStatusColor = (status: OperationStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-[var(--success)]";
      case "in-progress":
        return "bg-[var(--primary)]";
      case "pending":
        return "bg-[var(--warning)]";
      case "alert":
        return "bg-[var(--danger)]";
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            Laboratory Operations Overview
          </h2>
          <p className="card-subtitle">
            Today's workflow progress
          </p>
        </div>
      </div>

      <div className="card-body space-y-5">
        {operations.map((operation, index) => {
          const percentage = operation.total > 0 
            ? Math.round((operation.count / operation.total) * 100) 
            : 0;

          return (
            <div key={index}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(operation.status)}
                  <span className="text-[var(--text-secondary)]">
                    {operation.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--text-primary)]">
                    {operation.count}
                  </span>
                  <span className="text-[var(--text-tertiary)]">
                    / {operation.total}
                  </span>
                  <span className="font-medium text-[var(--text-primary)]">
                    ({percentage}%)
                  </span>
                </div>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-[var(--background-tertiary)]">
                <div
                  className={`h-full rounded-full ${getStatusColor(operation.status)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}