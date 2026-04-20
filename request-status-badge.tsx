import { STATUS_CONFIG, type RequestStatus } from "@/lib/data";

interface RequestStatusBadgeProps {
  status: RequestStatus;
  size?: "sm" | "md";
}

export function RequestStatusBadge({ status, size = "md" }: RequestStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    color: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-medium ${config.color} ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"}`}>
      <span className={`w-1 h-1 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
