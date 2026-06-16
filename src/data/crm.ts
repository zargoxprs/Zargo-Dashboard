export type CrmFollowUp = {
  id: string;
  customerName: string;
  phone: string;
  vehicle: string;
  bookingId: string;
  reason: string;
  dueDate: string;
  status: "pending" | "completed" | "overdue";
  assignedStaff: string;
  notes?: string[];
};

export type CrmTimelineEvent = {
  id: string;
  customerName: string;
  date: string;
  event: string;
  details: string;
};

export type CrmRecoveryItem = {
  id: string;
  customerName: string;
  phone: string;
  vehicle: string;
  bookingId: string;
  reason: string;
  dueDate: string;
  status: "pending-call" | "follow-up-done" | "recovery-visit-required" | "resolved" | "legal-escalation";
  assignedStaff: string;
  comments: string;
};

export const crmFollowUps: CrmFollowUp[] = [];
export const crmTimeline: CrmTimelineEvent[] = [];
export const crmRecoveryQueue: CrmRecoveryItem[] = [];
