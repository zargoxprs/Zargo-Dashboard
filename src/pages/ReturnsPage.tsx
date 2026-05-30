import { ShieldCheck, Camera, CheckCircle2, RefreshCcw, UserCheck } from "lucide-react";
import { returns as returnWorkflows } from "@/data/workflows";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { useMemo } from "react";

const ReturnsPage = () => {
  const pendingReturns = returnWorkflows.filter((r) => r.status !== "closed").length;
  const refundsPending = returnWorkflows.filter((r) => r.refundRequested && !r.refundApproved).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Return Workflow</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Process vehicle returns, post-return inspection, and refund approval.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Active return jobs</p>
          <p className="text-3xl font-semibold mt-3">{returnWorkflows.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Pending reviews</p>
          <p className="text-3xl font-semibold mt-3">{pendingReturns}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Refund approvals</p>
          <p className="text-3xl font-semibold mt-3">{refundsPending}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {returnWorkflows.map((item) => (
          <div key={item.id} className="bg-card rounded-3xl border border-border p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.id}</p>
                <h2 className="text-lg font-semibold mt-2">{item.vehicle}</h2>
                <p className="text-sm text-muted-foreground mt-1">Booking {item.bookingId} · Assigned to {item.assignedTo}</p>
              </div>
              <StatusBadge status={item.status.replace("-", " ")} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Odometer</p>
                <p className="mt-2 text-lg font-semibold">{item.returnOdometer ?? "Pending"}</p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Photos</p>
                <p className="mt-2 text-lg font-semibold">{item.photosSubmitted ? "Completed" : "Pending"}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
                <Camera size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-medium">Post Return PDI Checklist</p>
                  <p className="text-xs text-muted-foreground">{item.pdiChecklistCompleted ? "Complete" : "Incomplete"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border p-4">
                <ShieldCheck size={18} className="text-success" />
                <div>
                  <p className="text-sm font-medium">Refund request</p>
                  <p className="text-xs text-muted-foreground">{item.refundRequested ? (item.refundApproved ? "Approved" : "Awaiting admin approval") : "Not requested"}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-border p-4 flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Account Status</p>
                <p className="mt-2 font-semibold">{item.accountClosed ? "Closed" : "Open"}</p>
              </div>
              <div className="rounded-2xl border border-border p-4 flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-[0.18em]">Workflow next step</p>
                <p className="mt-2 font-semibold">{item.refundRequested ? (item.refundApproved ? "Complete" : "Approve refund") : "Collect return media"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {returnWorkflows.length === 0 && <EmptyState title="No return workflows yet" description="Pending vehicle returns will appear here." />}
    </div>
  );
};

export default ReturnsPage;
