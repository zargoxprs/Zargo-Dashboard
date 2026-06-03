import { apiClient, mockOr } from "@/api/client";
import { Lead } from "@/types";
import { useStore } from "@/data/store";

const normalizeLead = (lead: any): Lead => ({
  ...lead,
  id: lead.id ?? lead._id,
  leadId: lead.leadId ?? lead.lead_id,
});

export const leadService = {
  async list(): Promise<Lead[]> {
    return mockOr(
      () => useStore.getState().leads,
      async () => (await apiClient.get<Lead[]>('/leads')).data.map(normalizeLead),
    );
  },

  async create(payload: Omit<Lead, "id" | "createdAt">): Promise<Lead> {
    return mockOr(
      () => {
        useStore.getState().addLead(payload);
        const list = useStore.getState().leads;
        return list[list.length - 1];
      },
      async () => normalizeLead((await apiClient.post<Lead>("/leads", payload)).data),
    );
  },

  async update(id: string, patch: Partial<Lead>): Promise<Lead> {
    return mockOr(
      () => {
        useStore.getState().updateLead(id, patch);
        const lead = useStore.getState().leads.find((item) => item.id === id);
        if (!lead) throw new Error("Lead not found");
        return lead;
      },
      async () => normalizeLead((await apiClient.patch<Lead>(`/leads/${id}`, patch)).data),
    );
  },
};
