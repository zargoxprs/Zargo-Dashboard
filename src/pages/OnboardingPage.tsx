import { CheckCircle2, Camera, ShieldCheck, Truck } from "lucide-react";
import { onboardings } from "@/data/workflows";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const OnboardingPage = () => {
  const { role } = useAuth();
  const completed = onboardings.filter((item) => item.stage === "available").length;
  const pending = onboardings.filter((item) => item.stage !== "available").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Onboarding Workflow</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage vehicle handoff from assignment to availability.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Vehicles in workflow</p>
          <p className="text-3xl font-semibold mt-3">{onboardings.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Pending tasks</p>
          <p className="text-3xl font-semibold mt-3">{pending}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-3xl font-semibold mt-3">{completed}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {onboardings.map((item) => (
          <div key={item.id} className="bg-card rounded-3xl border border-border p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.id}</p>
                <h2 className="text-lg font-semibold mt-2">{item.vehicleId} — {item.model}</h2>
                <p className="text-sm text-muted-foreground mt-1">Assigned to {item.assignedTo} · {item.hub}</p>
              </div>
              <StatusBadge status={item.status.toLowerCase()} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Stage</p>
                <p className="mt-2 font-semibold capitalize">{item.stage.replace("-", " ")}</p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Required media</p>
                <div className="mt-2 flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2"><Camera size={16} /> Odometer photo {item.odometerPhotoRequired ? "required" : "not required"}</div>
                  <div className="flex items-center gap-2"><Truck size={16} /> Vehicle photos {item.photosRequired ? "required" : "not required"}</div>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Checkpoint checklist</p>
              <div className="grid gap-2">
                {item.checklist.map((node) => (
                  <div key={node.label} className="flex items-center justify-between rounded-2xl border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span className={node.done ? "text-success" : "text-muted-foreground"}>{node.done ? "✓" : "○"}</span>
                      <span>{node.label}</span>
                    </div>
                    {node.done ? <CheckCircle2 size={16} className="text-success" /> : <span className="text-muted-foreground">Pending</span>}
                  </div>
                ))}
              </div>
            </div>

            {role === "admin" && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button variant="secondary" className="min-w-[130px]">Review submission</Button>
                <Button className="min-w-[130px]">Approve availability</Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {onboardings.length === 0 && <EmptyState title="No onboarding tasks" description="Add a vehicle assignment to start the workflow." />}
    </div>
  );
};

export default OnboardingPage;
