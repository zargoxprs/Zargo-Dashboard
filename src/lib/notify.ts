import { toast } from "sonner";

export const notify = {
  success: (title: string, description?: string) => toast.success(title, { description }),
  error: (title: string, description?: string) => toast.error(title, { description }),
  info: (title: string, description?: string) => toast(title, { description }),
  added: (entity: string, name?: string) => toast.success(`${entity} added`, { description: name }),
  updated: (entity: string) => toast.success(`${entity} updated`),
  deleted: (entity: string) => toast.success(`${entity} deleted`),
  apiError: (e: unknown) =>
    toast.error("Request failed", {
      description: (e as { message?: string })?.message || "Please try again.",
    }),
};