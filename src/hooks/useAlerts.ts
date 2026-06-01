import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { alertService } from "@/services";
import { Alert } from "@/types";
import { notify } from "@/lib/notify";
import { useStore } from "@/data/store";

const KEY = ["alerts"];

export const useAlerts = () => useQuery({ queryKey: KEY, queryFn: alertService.list });

export const useAddAlert = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Alert, "id" | "created_at">) => alertService.create(payload),
    onSuccess: (_data, payload) => {
      qc.invalidateQueries({ queryKey: KEY });
      notify.success("Alert created");
      try {
        useStore.getState().addActivity({ type: "alert", message: (payload as any).message });
      } catch (e) {}
    },
    onError: (e: unknown) => notify.apiError(e),
  });
};

export const useMarkAlertRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertService.markRead(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData(KEY as any);
      qc.setQueryData(KEY as any, (old: any) => (old || []).map((a: any) => (a.id === id ? { ...a, status: "read" } : a)));
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) qc.setQueryData(KEY as any, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useMarkAllAlertsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => alertService.markAllRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData(KEY as any);
      qc.setQueryData(KEY as any, (old: any) => (old || []).map((a: any) => ({ ...a, status: "read" })));
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) qc.setQueryData(KEY as any, context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};