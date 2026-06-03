import { useState } from "react";
import { onboardings } from "@/data/workflows";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PdiAuditRecord = {
  id: string;
  action: string;
  details?: string;
  timestamp: string;
};

type LocalOnboarding = typeof onboardings[number] & {
  status: "Added" | "PDI Pending" | "PDI Checklist" | "Available" | "Service";
  odometerPhotoUrl?: string;
  vehiclePhotoUrls: string[];
  kycLicenseUrl?: string;
  kycAadhaarUrl?: string;
  comments: string;
  history: PdiAuditRecord[];
};

const DEFAULT_CHECKLIST = [
  { label: "Battery Health", done: false },
  { label: "Tyre Pressure", done: false },
  { label: "Charger", done: false },
  { label: "Brakes", done: false },
  { label: "Lights", done: false },
  { label: "Indicators", done: false },
  { label: "Horn", done: false },
];

const normalizeStatus = (item: typeof onboardings[number]): LocalOnboarding["status"] => {
  if (item.stage === "available") return "Available";
  if (item.status.toLowerCase().includes("service")) return "Service";
  if (item.status.toLowerCase().includes("pdi checklist") || item.status.toLowerCase().includes("approval")) return "PDI Checklist";
  return "PDI Pending";
};

const OnboardingPage = () => {
  const [workflows, setWorkflows] = useState<LocalOnboarding[]>(
    onboardings.map((item) => ({
      ...item,
      status: normalizeStatus(item),
      checklist: DEFAULT_CHECKLIST,
      odometerPhotoUrl: item.odometerPhotoUrl,
      vehiclePhotoUrls: item.vehiclePhotoUrls || [],
      kycLicenseUrl: undefined,
      kycAadhaarUrl: undefined,
      comments: "",
      history: [
        {
          id: `${item.id}-history-1`,
          action: "Vehicle added",
          details: item.status,
          timestamp: item.createdAt,
        },
      ],
    }))
  );

  const [selectedVehicle, setSelectedVehicle] = useState<LocalOnboarding | null>(null);
  const [openPdiDialog, setOpenPdiDialog] = useState(false);

  const pendingCount = workflows.filter((item) => item.status === "PDI Pending" || item.status === "PDI Checklist").length;
  const availableCount = workflows.filter((item) => item.status === "Available").length;
  const serviceCount = workflows.filter((item) => item.status === "Service").length;

  const handleOpenPdi = (vehicleId: string) => {
    setWorkflows((items) =>
      items.map((item) =>
        item.id === vehicleId && item.status === "PDI Pending"
          ? { ...item, status: "PDI Checklist" }
          : item
      )
    );
    const vehicle = workflows.find((item) => item.id === vehicleId);
    if (vehicle) {
      setSelectedVehicle({ ...vehicle, status: vehicle.status === "PDI Pending" ? "PDI Checklist" : vehicle.status });
      setOpenPdiDialog(true);
    }
  };

  const getProgress = (vehicle: LocalOnboarding) => {
    const doneCount = vehicle.checklist.filter((step) => step.done).length;
    const mediaCount = Number(Boolean(vehicle.kycLicenseUrl)) + Number(Boolean(vehicle.kycAadhaarUrl)) + Number(Boolean(vehicle.odometerPhotoUrl)) + Number(Boolean(vehicle.vehiclePhotoUrls.length > 0));
    const total = DEFAULT_CHECKLIST.length + 4;
    return Math.round(((doneCount + mediaCount) / total) * 100);
  };

  const updateVehicle = (updated: LocalOnboarding) => {
    setWorkflows((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedVehicle(updated);
  };

  const handleToggleChecklist = (index: number) => {
    if (!selectedVehicle) return;
    const checklist = selectedVehicle.checklist.map((item, idx) => idx === index ? { ...item, done: !item.done } : item);
    updateVehicle({ ...selectedVehicle, checklist, status: "PDI Checklist" });
  };

  const handleFileUpload = (field: "kycLicenseUrl" | "kycAadhaarUrl" | "odometerPhotoUrl" | "vehiclePhotoUrls", fileList: FileList | null) => {
    if (!selectedVehicle || !fileList) return;
    if (field === "vehiclePhotoUrls") {
      const urls = Array.from(fileList).map((file) => URL.createObjectURL(file));
      updateVehicle({ ...selectedVehicle, vehiclePhotoUrls: urls, status: "PDI Checklist" });
      return;
    }
    const url = URL.createObjectURL(fileList[0]);
    updateVehicle({ ...selectedVehicle, [field]: url, status: "PDI Checklist" } as LocalOnboarding);
  };

  const addHistory = (vehicle: LocalOnboarding, action: string, details?: string) => {
    const record: PdiAuditRecord = {
      id: `${vehicle.id}-history-${vehicle.history.length + 1}`,
      action,
      details,
      timestamp: new Date().toISOString().split("T")[0],
    };
    return { ...vehicle, history: [record, ...vehicle.history] };
  };

  const handleSaveDraft = () => {
    if (!selectedVehicle) return;
    const updated = addHistory({ ...selectedVehicle, status: "PDI Checklist" }, "Draft saved", `Progress ${getProgress(selectedVehicle)}%`);
    updateVehicle(updated);
  };

  const handleMarkComplete = () => {
    if (!selectedVehicle) return;
    const updated = addHistory({ ...selectedVehicle, status: "Available" }, "PDI complete", "Vehicle ready for booking");
    updateVehicle(updated);
  };

  const handleSendToService = () => {
    if (!selectedVehicle) return;
    const updated = addHistory({ ...selectedVehicle, status: "Service" }, "Sent to service", "Vehicle moved to service workflow");
    updateVehicle(updated);
  };

  const canComplete = selectedVehicle
    ? selectedVehicle.checklist.every((step) => step.done) &&
      selectedVehicle.kycLicenseUrl &&
      selectedVehicle.kycAadhaarUrl &&
      selectedVehicle.odometerPhotoUrl &&
      selectedVehicle.vehiclePhotoUrls.length > 0
    : false;


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">PDI Check</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage vehicle PDI operations in a scalable table workflow. Start checks, upload required documents, and complete or send vehicles to service.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Vehicles in workflow</p>
          <p className="text-3xl font-semibold mt-3">{workflows.length}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Pending PDI</p>
          <p className="text-3xl font-semibold mt-3">{pendingCount}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Available</p>
          <p className="text-3xl font-semibold mt-3">{availableCount}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border p-5">
          <p className="text-sm text-muted-foreground">Service</p>
          <p className="text-3xl font-semibold mt-3">{serviceCount}</p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <tr>
              <th className="px-5 py-3 w-[10rem]">Vehicle ID</th>
              <th className="px-5 py-3">Vehicle</th>
              <th className="px-5 py-3 w-[10rem]">Hub</th>
              <th className="px-5 py-3 w-[11rem]">Status</th>
              <th className="px-5 py-3 w-[12rem]">Progress</th>
              <th className="px-5 py-3 w-[14rem]">Action</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((item) => {
              const progress = getProgress(item);
              return (
                <tr key={item.id} className="border-t border-border hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-4 font-medium truncate">{item.vehicleId}</td>
                  <td className="px-5 py-4 truncate">
                    <div className="font-medium">{item.model}</div>
                    <div className="text-xs text-muted-foreground">Assigned to {item.assignedTo}</div>
                  </td>
                  <td className="px-5 py-4 truncate">{item.hub}</td>
                  <td className="px-5 py-4"><StatusBadge status={item.status.toLowerCase().replace(/\s+/g, "_")} /></td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-muted-foreground mb-2">{progress}%</div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Button
                      variant={item.status === "Available" ? "secondary" : "default"}
                      onClick={() => handleOpenPdi(item.id)}
                    >
                      {item.status === "Available" || item.status === "Service" ? "View" : "Start PDI"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={openPdiDialog} onOpenChange={setOpenPdiDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedVehicle ? `${selectedVehicle.vehicleId} PDI` : "PDI details"}</DialogTitle>
          </DialogHeader>

          {selectedVehicle ? (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold">Vehicle</p>
                  <p className="text-muted-foreground">{selectedVehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Hub</p>
                  <p className="text-muted-foreground">{selectedVehicle.hub}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Assigned Staff</p>
                  <p className="text-muted-foreground">{selectedVehicle.assignedTo}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">Status</p>
                  <StatusBadge status={selectedVehicle.status.toLowerCase().replace(/\s+/g, "_")} />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold">Checklist</p>
                <div className="grid gap-2 mt-3">
                  {selectedVehicle.checklist.map((step, index) => (
                    <button
                      key={step.label}
                      type="button"
                      onClick={() => handleToggleChecklist(index)}
                      className="flex items-center justify-between rounded-2xl border border-border p-3 text-left hover:bg-muted transition-colors"
                    >
                      <span>{step.label}</span>
                      <span className={step.done ? "text-success font-semibold" : "text-muted-foreground"}>
                        {step.done ? "Done" : "Pending"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="pdi-comments">Comments</Label>
                  <Textarea
                    id="pdi-comments"
                    value={selectedVehicle.comments}
                    onChange={(e) => updateVehicle({ ...selectedVehicle, comments: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-semibold">KYC</p>
                    <div className="mt-4 space-y-3">
                      <div>
                        <Label htmlFor="kyc-license">Driving Licence Upload</Label>
                        <Input
                          id="kyc-license"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload("kycLicenseUrl", e.target.files)}
                        />
                        {selectedVehicle.kycLicenseUrl && (
                          <img src={selectedVehicle.kycLicenseUrl} alt="Driving Licence" className="mt-3 h-28 w-full rounded-xl object-cover" />
                        )}
                      </div>
                      <div>
                        <Label htmlFor="kyc-aadhaar">Aadhaar Upload</Label>
                        <Input
                          id="kyc-aadhaar"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload("kycAadhaarUrl", e.target.files)}
                        />
                        {selectedVehicle.kycAadhaarUrl && (
                          <img src={selectedVehicle.kycAadhaarUrl} alt="Aadhaar" className="mt-3 h-28 w-full rounded-xl object-cover" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-semibold">Vehicle Uploads</p>
                    <div className="mt-4 space-y-3">
                      <div>
                        <Label htmlFor="odometer-upload">Odometer Photo Upload</Label>
                        <Input
                          id="odometer-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload("odometerPhotoUrl", e.target.files)}
                        />
                        {selectedVehicle.odometerPhotoUrl && (
                          <img src={selectedVehicle.odometerPhotoUrl} alt="Odometer" className="mt-3 h-28 w-full rounded-xl object-cover" />
                        )}
                      </div>
                      <div>
                        <Label htmlFor="vehicle-photos-upload">Vehicle Photos Upload</Label>
                        <Input
                          id="vehicle-photos-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleFileUpload("vehiclePhotoUrls", e.target.files)}
                        />
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {selectedVehicle.vehiclePhotoUrls.map((url) => (
                            <img key={url} src={url} alt="Vehicle" className="h-20 w-full rounded-xl object-cover" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border p-4 bg-muted/50">
                <p className="text-sm font-semibold">PDI Audit trail</p>
                <div className="mt-3 space-y-2 text-sm">
                  {selectedVehicle.history.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-border bg-background p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{entry.action}</p>
                        <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                      </div>
                      {entry.details && <p className="text-xs text-muted-foreground mt-1">{entry.details}</p>}
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="secondary" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
                <Button variant="outline" onClick={handleSendToService}>
                  Send To Service
                </Button>
                <Button disabled={!canComplete} onClick={handleMarkComplete}>
                  Mark PDI Complete
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a vehicle to begin PDI.</p>
          )}
        </DialogContent>
      </Dialog>

      {workflows.length === 0 && <EmptyState title="No onboarding tasks" description="Add a vehicle assignment to start the workflow." />}
    </div>
  );
};

export default OnboardingPage;
