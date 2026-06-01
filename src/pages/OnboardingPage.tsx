import { useMemo, useState } from "react";
import { CheckCircle2, Camera, Truck } from "lucide-react";
import { onboardings } from "@/data/workflows";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LocalOnboarding = typeof onboardings[number] & {
  odometerPhotoUrl?: string;
  vehiclePhotoUrls: string[];
};

const OnboardingPage = () => {
  const { role } = useAuth();
  const [workflows, setWorkflows] = useState<LocalOnboarding[]>(
    onboardings.map((item) => ({ ...item, odometerPhotoUrl: undefined, vehiclePhotoUrls: [] }))
  );

  const completedCount = workflows.filter((item) => item.stage === "available").length;
  const pendingCount = workflows.filter((item) => item.stage !== "available").length;

  const handleToggleChecklist = (id: string, index: number) => {
    setWorkflows((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        const checklist = item.checklist.map((entry, idx) => idx === index ? { ...entry, done: !entry.done } : entry);
        return { ...item, checklist };
      })
    );
  };

  const handleOdometerUpload = (id: string, files: FileList | null) => {
    if (!files?.[0]) return;
    const url = URL.createObjectURL(files[0]);
    setWorkflows((items) => items.map((item) => (item.id === id ? { ...item, odometerPhotoUrl: url } : item)));
  };

  const handleVehiclePhotosUpload = (id: string, files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setWorkflows((items) => items.map((item) => (item.id === id ? { ...item, vehiclePhotoUrls: urls } : item)));
  };

  const handleApprove = (id: string) => {
    setWorkflows((items) =>
      items.map((item) => {
        if (item.id !== id) return item;
        return { ...item, stage: "available", status: "Ready for booking" };
      })
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Onboarding Workflow</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage vehicle handoff from assignment to availability.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Vehicles in workflow</p>
          <p className="text-3xl font-semibold mt-3">{workflows.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Pending tasks</p>
          <p className="text-3xl font-semibold mt-3">{pendingCount}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-3xl font-semibold mt-3">{completedCount}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {workflows.map((item) => {
          const checklistDoneCount = item.checklist.filter((step) => step.done).length;
          const totalSteps = item.checklist.length + 2;
          const completedSteps = checklistDoneCount + (item.odometerPhotoUrl ? 1 : 0) + (item.vehiclePhotoUrls.length > 0 ? 1 : 0);
          const progress = Math.round((completedSteps / totalSteps) * 100);
          const completeForApproval = checklistDoneCount === item.checklist.length && !!item.odometerPhotoUrl && item.vehiclePhotoUrls.length > 0;

          return (
            <div key={item.id} className="bg-card rounded-3xl border border-border p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.id}</p>
                  <h2 className="text-lg font-semibold mt-2">{item.vehicleId} — {item.model}</h2>
                  <p className="text-sm text-muted-foreground mt-1">Assigned to {item.assignedTo} · {item.hub}</p>
                </div>
                <StatusBadge status={item.status.toLowerCase()} />
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Progress</p>
                      <p className="mt-2 text-sm font-semibold">{progress}% complete</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{checklistDoneCount}/{item.checklist.length} checklist ✓</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Stage</p>
                    <p className="mt-2 font-semibold capitalize">{item.stage.replace("-", " ")}</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Media status</p>
                    <div className="mt-2 flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Camera size={16} /> Odometer photo {item.odometerPhotoUrl ? "uploaded" : "pending"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck size={16} /> Vehicle photos {item.vehiclePhotoUrls.length > 0 ? `${item.vehiclePhotoUrls.length} uploaded` : "pending"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Checkpoint checklist</p>
                  <div className="grid gap-2">
                    {item.checklist.map((node, index) => (
                      <button
                        key={`${item.id}-${node.label}`}
                        type="button"
                        onClick={() => handleToggleChecklist(item.id, index)}
                        className="flex items-center justify-between rounded-2xl border border-border p-3 text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={node.done ? "text-success" : "text-muted-foreground"}>{node.done ? "✓" : "○"}</span>
                          <span>{node.label}</span>
                        </div>
                        {node.done ? <CheckCircle2 size={16} className="text-success" /> : <span className="text-xs text-muted-foreground">Tap to complete</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border p-4">
                    <Label htmlFor={`odometer-${item.id}`}>Upload odometer photo</Label>
                    <Input
                      id={`odometer-${item.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleOdometerUpload(item.id, e.target.files)}
                    />
                    {item.odometerPhotoUrl && <img src={item.odometerPhotoUrl} alt="Odometer" className="mt-3 h-28 w-full rounded-xl object-cover" />}
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <Label htmlFor={`vehicle-photos-${item.id}`}>Upload vehicle photos</Label>
                    <Input
                      id={`vehicle-photos-${item.id}`}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleVehiclePhotosUpload(item.id, e.target.files)}
                    />
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {item.vehiclePhotoUrls.map((url) => (
                        <img key={url} src={url} alt="Vehicle" className="h-20 w-full rounded-xl object-cover" />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 justify-end">
                  {role === "admin" && (
                    <Button
                      className="min-w-[160px]"
                      disabled={!completeForApproval || item.status === "Ready for booking"}
                      onClick={() => handleApprove(item.id)}
                    >
                      Approve availability
                    </Button>
                  )}
                  <span className="text-xs text-muted-foreground">
                    Approval is enabled when all checklist items are complete and media is uploaded.
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {workflows.length === 0 && <EmptyState title="No onboarding tasks" description="Add a vehicle assignment to start the workflow." />}
    </div>
  );
};

export default OnboardingPage;
