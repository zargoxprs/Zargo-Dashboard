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

export const crmFollowUps: CrmFollowUp[] = [
  {
    id: "FU-001",
    customerName: "Priya Sharma",
    phone: "+919876543210",
    vehicle: "Zargo E-Scooter 12",
    bookingId: "BKG-1001",
    reason: "Renewal reminder",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0],
    status: "pending",
    assignedStaff: "Asha Patel",
    notes: ["Discuss extension options"],
  },
  {
    id: "FU-002",
    customerName: "Rahul Verma",
    phone: "+919812345678",
    vehicle: "Zargo EV Car 07",
    bookingId: "BKG-1008",
    reason: "Payment reminder",
    dueDate: new Date().toISOString().split("T")[0],
    status: "pending",
    assignedStaff: "Nikhil Singh",
    notes: ["Confirm invoice details"],
  },
  {
    id: "FU-003",
    customerName: "Meera Iyer",
    phone: "+919700112233",
    vehicle: "Zargo E-Scooter 05",
    bookingId: "BKG-1012",
    reason: "Renewal due in 7 days",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
    status: "pending",
    assignedStaff: "Rohit Kumar",
    notes: ["Verify vehicle condition before renewal"],
  },
  {
    id: "FU-004",
    customerName: "Anita Desai",
    phone: "+919999887766",
    vehicle: "Zargo EV Car 02",
    bookingId: "BKG-1004",
    reason: "Missed renewal follow-up",
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0],
    status: "overdue",
    assignedStaff: "Asha Patel",
    notes: ["Reschedule call immediately"],
  },
  {
    id: "FU-005",
    customerName: "Suresh Nair",
    phone: "+919666554433",
    vehicle: "Zargo E-Bike 08",
    bookingId: "BKG-1015",
    reason: "Payment due today",
    dueDate: new Date().toISOString().split("T")[0],
    status: "pending",
    assignedStaff: "Nikhil Singh",
    notes: ["Confirm payment method"],
  },
];

export const crmTimeline: CrmTimelineEvent[] = [
  {
    id: "TL-001",
    customerName: "Priya Sharma",
    date: "2026-05-24 10:12",
    event: "Lead Created",
    details: "New inquiry recorded for a long-term EV rental.",
  },
  {
    id: "TL-002",
    customerName: "Priya Sharma",
    date: "2026-05-26 14:03",
    event: "KYC Approved",
    details: "Customer documents verified and approved.",
  },
  {
    id: "TL-003",
    customerName: "Rahul Verma",
    date: "2026-05-20 09:45",
    event: "Vehicle Assigned",
    details: "Zargo EV Car 07 assigned for monthly rental.",
  },
  {
    id: "TL-004",
    customerName: "Rahul Verma",
    date: "2026-05-23 15:20",
    event: "Booking Created",
    details: "Booking confirmed with payment details pending.",
  },
  {
    id: "TL-005",
    customerName: "Meera Iyer",
    date: "2026-05-17 08:30",
    event: "Renewal Reminder",
    details: "Schedule follow-up for next billing cycle.",
  },
  {
    id: "TL-006",
    customerName: "Anita Desai",
    date: "2026-05-25 11:10",
    event: "Payment Received",
    details: "Invoice settled for current rental period.",
  },
  {
    id: "TL-007",
    customerName: "Suresh Nair",
    date: "2026-05-28 17:05",
    event: "Vehicle Returned",
    details: "Return completed with inspection notes logged.",
  },
  {
    id: "TL-008",
    customerName: "Meera Iyer",
    date: "2026-05-29 13:50",
    event: "Recovery Initiated",
    details: "Follow up issued for overdue payment collection.",
  },
];

export const crmRecoveryQueue: CrmRecoveryItem[] = [
  {
    id: "RQ-001",
    customerName: "Anita Desai",
    phone: "+919999887766",
    vehicle: "Zargo EV Car 02",
    bookingId: "BKG-1004",
    reason: "Renewal Due in 3 Days",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split("T")[0],
    status: "pending-call",
    assignedStaff: "Asha Patel",
    comments: "Awaiting response from customer to confirm renewal.",
  },
  {
    id: "RQ-002",
    customerName: "Rahul Verma",
    phone: "+919812345678",
    vehicle: "Zargo EV Car 07",
    bookingId: "BKG-1008",
    reason: "Payment Due Today",
    dueDate: new Date().toISOString().split("T")[0],
    status: "follow-up-done",
    assignedStaff: "Nikhil Singh",
    comments: "Customer requested payment link via WhatsApp.",
  },
  {
    id: "RQ-003",
    customerName: "Meera Iyer",
    phone: "+919700112233",
    vehicle: "Zargo E-Scooter 05",
    bookingId: "BKG-1012",
    reason: "1 Day Overdue",
    dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split("T")[0],
    status: "recovery-visit-required",
    assignedStaff: "Rohit Kumar",
    comments: "Vehicle return pending, team scheduled site visit.",
  },
  {
    id: "RQ-004",
    customerName: "Suresh Nair",
    phone: "+919666554433",
    vehicle: "Zargo E-Bike 08",
    bookingId: "BKG-1015",
    reason: "3 Days Overdue",
    dueDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString().split("T")[0],
    status: "legal-escalation",
    assignedStaff: "Nikhil Singh",
    comments: "Legal team notified for asset recovery process.",
  },
  {
    id: "RQ-005",
    customerName: "Priya Sharma",
    phone: "+919876543210",
    vehicle: "Zargo E-Scooter 12",
    bookingId: "BKG-1001",
    reason: "Renewal Due in 7 Days",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
    status: "pending-call",
    assignedStaff: "Asha Patel",
    comments: "Prepare renewal options and pricing notes.",
  },
];
