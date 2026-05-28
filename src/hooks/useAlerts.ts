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
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};