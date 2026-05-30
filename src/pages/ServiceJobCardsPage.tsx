import { useMemo, useState } from "react";
import { Wrench, Clock, TrendingUp } from "lucide-react";
import { serviceJobs } from "@/data/workflows";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";

const ServiceJobCardsPage = () => {
  const [status, setStatus] = useState<"all" | "scheduled" | "in-progress" | "completed" | "inspection">("all");
  const filtered = useMemo(
    () => serviceJobs.filter((job) => status === "all" || job.status === status),
    [status]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Service Job Cards</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track service and inspection work for your fleet.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Open cards</p>
          <p className="text-3xl font-semibold mt-3">{serviceJobs.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">In progress</p>
          <p className="text-3xl font-semibold mt-3">{serviceJobs.filter((job) => job.status === "in-progress").length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-3xl font-semibold mt-3">{serviceJobs.filter((job) => job.status === "completed").length}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {(["all", "scheduled", "in-progress", "completed", "inspection"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setStatus(option)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${status === option ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}
          >
            {option}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No service cards" description="Service job cards are created when vehicles enter maintenance." />
      ) : (
        <div className="grid gap-6">
          {filtered.map((job) => (
            <div key={job.id} className="bg-card rounded-3xl border border-border p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{job.id}</p>
                  <h2 className="text-lg font-semibold mt-2">{job.vehicle}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{job.jobType}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Priority</p>
                  <p className="mt-2 font-semibold">{job.priority}</p>
                </div>
                <div className="rounded-2xl border border-border p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Assigned</p>
                  <p className="mt-2 font-semibold">{job.assignedTo}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
                <Wrench size={18} /> {job.reportedIssue}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceJobCardsPage;
