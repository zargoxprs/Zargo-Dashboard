import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customerService";
import { Customer } from "@/types";
import { notify } from "@/lib/notify";

const KEY = ["customers"];

export const useCustomers = () => useQuery({ queryKey: KEY, queryFn: customerService.list });

export const useCreateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Customer, "id" | "customerId" | "createdAt">) => customerService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      notify.success("Customer created", "The customer record has been saved successfully.");
    },
    onError: (e: { message: string }) => notify.error("Failed to create customer", e.message),
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Customer> }) => customerService.update(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      notify.success("Customer updated", "Customer record has been updated.");
    },
    onError: (e: { message: string }) => notify.error("Failed to update customer", e.message),
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      notify.success("Customer deleted", "The customer record has been removed.");
    },
    onError: (e: { message: string }) => notify.error("Failed to delete customer", e.message),
  });
};
