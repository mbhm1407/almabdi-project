import { Check, Clock, Circle } from "lucide-react";
import type { TimelineEvent } from "@/lib/data";

interface RequestTimelineProps {
  events: TimelineEvent[];
}

export function RequestTimeline({ events }: RequestTimelineProps) {
  const visibleEvents = events.filter((e, i) => {
    if (e.status !== "pending") return true;
    return !events.slice(i + 1).some((later) => later.status === "completed" || later.status === "current");
  });
  return (
    <div className="relative">
      <div className="absolute end-4 top-0 bottom-0 w-0.5 bg-border" />
      <div className="space-y-6">
        {visibleEvents.map((event, index) => (
          <div key={event.id} className="relative flex items-start gap-4 pe-12">
            <div className="absolute end-0 flex items-center justify-center w-8 h-8 rounded-full border-2 bg-background z-10"
              style={{
                borderColor: event.status === "completed" ? "#075e4a" : event.status === "current" ? "#187860" : "#ebebeb",
                background: event.status === "completed" ? "#075e4a20" : event.status === "current" ? "#18786020" : undefined,
              }}>
              {event.status === "completed" ? (
                <Check className="w-4 h-4 text-[#075e4a]" />
              ) : event.status === "current" ? (
                <Clock className="w-4 h-4" style={{ color: "#187860" }} />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/40" />
              )}
            </div>
            <div className={`flex-1 pb-2 ${event.status === "pending" ? "opacity-40" : ""}`}>
              <p className="font-bold text-foreground text-sm">{event.title}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{event.description}</p>
              {event.date && (
                <p className="text-muted-foreground/60 text-xs mt-1">{event.date}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
