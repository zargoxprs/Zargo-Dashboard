import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { workflowTasks } from "@/data/workflows";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { Briefcase, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const TasksPage = () => {
  const { role, user } = useAuth();
  const assignedTasks = useMemo(() => {
    if (role === "staff" && user?.name) {
      return workflowTasks.filter((task) => task.assignedTo.toLowerCase() === user.name.toLowerCase());
    }
    return workflowTasks;
  }, [role, user]);

  const grouped = assignedTasks.reduce<Record<string, typeof workflowTasks>>((acc, task) => {
    acc[task.module] = acc[task.module] ? [...acc[task.module], task] : [task];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Assigned operational work items for your role.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Assigned tasks</p>
          <p className="text-3xl font-semibold mt-3">{assignedTasks.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Awaiting approval</p>
          <p className="text-3xl font-semibold mt-3">{assignedTasks.filter((task) => task.status === "awaiting-approval").length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">In progress</p>
          <p className="text-3xl font-semibold mt-3">{assignedTasks.filter((task) => task.status === "in-progress").length}</p>
        </div>
      </div>

      {assignedTasks.length === 0 ? (
        <EmptyState title="No assigned tasks" description="Check back when new operational work items are routed to you." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {Object.entries(grouped).map(([module, tasks]) => (
            <div key={module} className="bg-card rounded-3xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{module}</p>
                  <h2 className="text-lg font-semibold mt-2">{tasks.length} tasks</h2>
                </div>
                <span className="text-sm text-muted-foreground">{module}</span>
              </div>

              <div className="mt-5 space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="rounded-3xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{task.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">Due {task.dueDate}</p>
                      </div>
                      <StatusBadge status={task.status.replace("-", " ")} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">{task.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
