import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadService } from "@/services";
import { Lead } from "@/types";
import { notify } from "@/lib/notify";

const KEY = ["leads"];

export const useLeads = () => useQuery({ queryKey: KEY, queryFn: leadService.list });

export const useCreateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Lead, "id" | "createdAt">) => leadService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      notify.success("Lead created", "The lead has been saved successfully.");
    },
    onError: (e: { message: string }) => notify.error("Failed to create lead", e.message),
  });
};

export const useUpdateLead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Lead> }) => leadService.update(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      notify.success("Lead updated", "Lead status has been updated.");
    },
    onError: (e: { message: string }) => notify.error("Failed to update lead", e.message),
  });
};
