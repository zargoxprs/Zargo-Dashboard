import { Lead, OnboardingWorkflow, RenewalTask, RecoveryCase, ReturnWorkflow, PaymentRecord, InsuranceCase, ServiceJobCard, WorkflowTask } from "@/types";

export const leads: Lead[] = [
  { id: "L-1001", customerName: "Amit Patel", contact: "+91 98765 43210", source: "Website", stage: "contacted", assignedTo: "Ravi", createdAt: "2026-05-18" },
  { id: "L-1002", customerName: "Nisha Gupta", contact: "+91 91234 56789", source: "Referral", stage: "qualified", assignedTo: "Meera", createdAt: "2026-05-22" },
  { id: "L-1003", customerName: "Rohan Singh", contact: "+91 99887 77665", source: "Walk-in", stage: "new", assignedTo: "Ravi", createdAt: "2026-05-28" },
];

export const onboardings: OnboardingWorkflow[] = [
  {
    id: "ONB-2101",
    vehicleId: "ZRG-303",
    model: "Zargo X1",
    hub: "East Hub",
    assignedTo: "Ravi",
    stage: "pdi",
    checklist: [
      { label: "Battery health verified", done: true },
      { label: "Brake inspection", done: true },
      { label: "Interior cleanliness", done: false },
      { label: "Electrical systems check", done: false },
    ],
    odometerPhotoRequired: true,
    photosRequired: true,
    status: "PDI Checklist",
    createdAt: "2026-05-20",
  },
  {
    id: "ONB-2102",
    vehicleId: "ZRG-304",
    model: "Zargo Y2",
    hub: "West Hub",
    assignedTo: "Meera",
    stage: "submitted",
    checklist: [
      { label: "PDI completed", done: true },
      { label: "Odometer photo captured", done: true },
      { label: "Vehicle photos captured", done: true },
      { label: "Staff submission completed", done: true },
    ],
    odometerPhotoRequired: true,
    photosRequired: true,
    status: "Awaiting admin approval",
    createdAt: "2026-05-24",
  },
];

export const renewals: RenewalTask[] = [
  { id: "RNW-501", customer: "Deepa Sharma", vehicleModel: "Zargo X1", dueDate: "2026-06-05", status: "upcoming", assignedTo: "Meera", amount: 12000, createdAt: "2026-05-06" },
  { id: "RNW-502", customer: "Vikram Rao", vehicleModel: "Zargo Z3", dueDate: "2026-05-25", status: "overdue", assignedTo: "Ravi", amount: 15200, createdAt: "2026-04-25" },
];

export const recoveries: RecoveryCase[] = [
  { id: "REC-401", customer: "Anita Joshi", vehicleModel: "Zargo Y2", overdueBy: "4 days", status: "open", assignedTo: "Ravi", createdAt: "2026-05-14" },
  { id: "REC-402", customer: "Karan Mehta", vehicleModel: "Zargo X1", overdueBy: "11 days", status: "contacted", assignedTo: "Meera", createdAt: "2026-05-02" },
];

export const returns: ReturnWorkflow[] = [
  {
    id: "RTN-801",
    bookingId: "BKG-301",
    vehicle: "Zargo X1",
    returnOdometer: 21450,
    photosSubmitted: true,
    pdiChecklistCompleted: false,
    refundRequested: true,
    refundApproved: false,
    accountClosed: false,
    status: "refund-requested",
    assignedTo: "Ravi",
    createdAt: "2026-05-27",
  },
  {
    id: "RTN-802",
    bookingId: "BKG-302",
    vehicle: "Zargo Z3",
    returnOdometer: 8250,
    photosSubmitted: true,
    pdiChecklistCompleted: true,
    refundRequested: false,
    refundApproved: false,
    accountClosed: true,
    status: "closed",
    assignedTo: "Meera",
    createdAt: "2026-05-25",
  },
];

export const payments: PaymentRecord[] = [
  { id: "PMT-701", customer: "Deepa Sharma", type: "rental", amount: 12000, dueDate: "2026-06-05", status: "pending", assignedTo: "Finance", createdAt: "2026-05-06" },
  { id: "PMT-702", customer: "Vikram Rao", type: "security-deposit", amount: 5000, dueDate: "2026-05-25", status: "paid", assignedTo: "Finance", createdAt: "2026-04-25" },
  { id: "PMT-703", customer: "Anita Joshi", type: "refund", amount: 3200, dueDate: "2026-05-28", status: "pending", assignedTo: "Finance", createdAt: "2026-05-27" },
];

export const insurances: InsuranceCase[] = [
  { id: "INS-902", policyNumber: "POL-5082", vehicle: "Zargo X1", type: "policy", status: "expiring", premium: 18000, renewalDate: "2026-06-20", assignedTo: "Meera", createdAt: "2026-05-12" },
  { id: "INS-903", policyNumber: "CLA-7012", vehicle: "Zargo Z3", type: "claim", status: "active", premium: 0, renewalDate: "2026-08-15", assignedTo: "Ravi", createdAt: "2026-05-21" },
];

export const serviceJobs: ServiceJobCard[] = [
  { id: "JOB-110", vehicle: "Zargo Y2", jobType: "Battery inspection", assignedTo: "Ravi", status: "in-progress", priority: "high", reportedIssue: "Battery cell voltage variance", createdAt: "2026-05-23" },
  { id: "JOB-111", vehicle: "Zargo X1", jobType: "Brake pad replacement", assignedTo: "Meera", status: "scheduled", priority: "medium", reportedIssue: "Routine wear check", createdAt: "2026-05-25" },
];

export const workflowTasks: WorkflowTask[] = [
  { id: "TASK-610", title: "Complete vehicle PDI for Zargo X1", description: "Finish the pre-delivery inspection and submit odometer/photo evidence.", module: "Onboarding", assignedTo: "Ravi", dueDate: "2026-05-30", status: "in-progress", createdAt: "2026-05-20" },
  { id: "TASK-611", title: "Approve refund request for RTN-801", description: "Review the return submission and approve refund to close the account.", module: "Returns", assignedTo: "Meera", dueDate: "2026-05-29", status: "awaiting-approval", createdAt: "2026-05-27" },
  { id: "TASK-612", title: "Contact overdue recovery case REC-402", description: "Follow up with the late customer and recover the vehicle." , module: "Recovery", assignedTo: "Ravi", dueDate: "2026-05-31", status: "assigned", createdAt: "2026-05-02" },
];
