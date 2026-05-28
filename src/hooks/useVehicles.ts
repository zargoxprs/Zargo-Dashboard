import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { vehicleService } from "@/services";
import { Vehicle } from "@/types";
import { notify } from "@/lib/notify";
import { useStore } from "@/data/store";

const KEY = ["vehicles"];

export const useVehicles = () => useQuery({ queryKey: KEY, queryFn: vehicleService.list });

export const useAddVehicle = () => {
  const qc = useQueryClient();
  return useMutation({

    mutationFn: (payload: Omit<Vehicle, "_id" | "createdAt" | "updatedAt">) => vehicleService.create(payload),
    onSuccess: (v) => {
      qc.invalidateQueries({ queryKey: KEY });
      notify.success("Vehicle added", `${v.numberPlate} added successfully.`);
      try {
        useStore.getState().addActivity({ type: "vehicle", message: `Vehicle ${v.numberPlate} added` });
      } catch (e) {}
    },
    onError: (e: { message: string }) => notify.error("Failed to add vehicle", e.message),
  });
};

export const useUpdateVehicle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Vehicle> }) => vehicleService.update(id, patch),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: KEY });
      try {
        const patch = (variables as any).patch as Partial<Vehicle>;
        if (patch?.status === "service") {
          const vehicle = useStore.getState().vehicles.find((v) => v.id === (variables as any).id);
          const plate = vehicle?.numberPlate ?? (variables as any).id;
          useStore.getState().addActivity({ type: "service", message: `Vehicle ${plate} moved to service` });
        }
      } catch (e) {}
    },
    onError: (e: { message: string }) => notify.error("Failed to update vehicle", e.message),
  });
};

export const useDeleteVehicle = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehicleService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      notify.success("Vehicle removed");
    },
    onError: (e: { message: string }) => notify.error("Failed to delete vehicle", e.message),
  });
};