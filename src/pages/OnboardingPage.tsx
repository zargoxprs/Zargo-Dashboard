import { useMemo, useState } from "react";
import { Bike, AlertTriangle, Battery, Wrench, Plus, Check, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from "lucide-react";
import { useVehicles, useUpdateVehicle, useAddVehicle } from "@/hooks/useVehicles";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/states/EmptyState";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vehicle } from "@/types";

type PdiAuditRecord = {
  id: string;
  action: string;
  details?: string;
  timestamp: string;
};

type UploadFile = {
  url: string;
  name: string;
  file?: File;
};

type PdiVehicle = Vehicle & {
  comments: string;
  checklist: { label: string; done: boolean }[];
  history: PdiAuditRecord[];
  odometerPhoto?: UploadFile;
  vehiclePhotos: UploadFile[];
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

const getVehicleKey = (vehicle: Vehicle) => vehicle.id ?? vehicle._id ?? vehicle.vehicleId;
const getVehicleCreatedAt = (vehicle: Vehicle) => vehicle.createdAt ?? (vehicle as any).created_at ?? new Date().toISOString().split("T")[0];

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const buildPersistableUpload = async (upload?: UploadFile): Promise<UploadFile | undefined> => {
  if (!upload) return undefined;
  if (upload.file) {
    return { name: upload.name, url: await fileToDataUrl(upload.file) };
  }
  return { name: upload.name, url: upload.url };
};

const buildPdiPatch = async (vehicle: PdiVehicle): Promise<Partial<Vehicle>> => {
  const [odometerPhoto, vehiclePhotos] = await Promise.all([
    buildPersistableUpload(vehicle.odometerPhoto),
    Promise.all(vehicle.vehiclePhotos.map(buildPersistableUpload)),
  ]);
  return {
    status: vehicle.status,
    pdiComments: vehicle.comments,
    pdiChecklist: vehicle.checklist,
    pdiHistory: vehicle.history,
    pdiOdometerPhoto: odometerPhoto,
    pdiVehiclePhotos: vehiclePhotos.filter(Boolean) as UploadFile[],
    completedAt: vehicle.completedAt,
    completedBy: vehicle.completedBy,
  };
};

const OnboardingPage = () => {
  const { data: vehicles = [], isLoading } = useVehicles();
  const updateVehicleMutation = useUpdateVehicle();
  const addVehicle = useAddVehicle();
  const { user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState<PdiVehicle | null>(null);
  const [openPdiDialog, setOpenPdiDialog] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [pdiCache, setPdiCache] = useState<Record<string, PdiVehicle>>({});
  const [previewImage, setPreviewImage] = useState<UploadFile | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState<number>(0);
  const [previewImageList, setPreviewImageList] = useState<UploadFile[]>([]);
  const [isPreviewZoomed, setIsPreviewZoomed] = useState(false);

  const activePdiVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === "pdi_pending"),
    [vehicles]
  );
  const readyForBookingVehicles = useMemo(
    () => vehicles.filter((vehicle) => vehicle.status === "available"),
    [vehicles]
  );

  const pendingCount = activePdiVehicles.length;
  const availableCount = readyForBookingVehicles.length;
  const serviceCount = vehicles.filter((vehicle) => vehicle.status === "service").length;
  const completedCount = readyForBookingVehicles.length;

  const buildPdiVehicle = (vehicle: Vehicle, existing?: Partial<PdiVehicle>): PdiVehicle => ({
    ...vehicle,
    comments: existing?.comments ?? vehicle.pdiComments ?? "",
    checklist: existing?.checklist?.length
      ? existing.checklist
      : vehicle.pdiChecklist?.length
        ? vehicle.pdiChecklist
        : DEFAULT_CHECKLIST,
    history: existing?.history ?? vehicle.pdiHistory ?? [
      {
        id: `${getVehicleKey(vehicle)}-history-1`,
        action: "Vehicle added",
        details: vehicle.status === "pdi_pending" ? "PDI Pending" : "Vehicle record",
        timestamp: vehicle.completedAt ?? getVehicleCreatedAt(vehicle),
      },
    ],
    odometerPhoto: existing?.odometerPhoto ?? vehicle.pdiOdometerPhoto,
    vehiclePhotos: existing?.vehiclePhotos ?? vehicle.pdiVehiclePhotos ?? [],
  });

  const getProgress = (vehicle: PdiVehicle) => {
    const doneCount = vehicle.checklist.filter((step) => step.done).length;
    const mediaCount = Number(Boolean(vehicle.odometerPhoto)) + Number(Boolean(vehicle.vehiclePhotos.length > 0));
    const total = DEFAULT_CHECKLIST.length + 2;
    return Math.round(((doneCount + mediaCount) / total) * 100);
  };

  const openPdiModal = (vehicleId: string, readOnly = false) => {
    const vehicle = vehicles.find((item) => getVehicleKey(item) === vehicleId);
    if (!vehicle) return;
    const existing = pdiCache[vehicleId];
    const selected = buildPdiVehicle(vehicle, existing);
    setPdiCache((prev) => ({ ...prev, [vehicleId]: selected }));
    setSelectedVehicle(selected);
    setIsReadOnly(Boolean(readOnly));
    setOpenPdiDialog(true);
  };

  const saveVehicleState = (updated: PdiVehicle) => {
    setPdiCache((prev) => ({ ...prev, [getVehicleKey(updated)]: updated }));
    setSelectedVehicle(updated);
  };

  const updateSelectedVehicle = (patch: Partial<PdiVehicle>) => {
    if (!selectedVehicle) return;
    const updated = { ...selectedVehicle, ...patch };
    saveVehicleState(updated);
  };

  const handleToggleChecklist = (index: number) => {
    if (!selectedVehicle) return;
    const checklist = selectedVehicle.checklist.map((item, idx) =>
      idx === index ? { ...item, done: !item.done } : item
    );
    updateSelectedVehicle({ checklist });
  };

  const createUploadItem = (file: File): UploadFile => ({
    url: URL.createObjectURL(file),
    name: file.name,
    file,
  });

  const handleFileUpload = (field: "odometerPhoto" | "vehiclePhotos", fileList: FileList | null) => {
    if (!selectedVehicle || !fileList) return;
    if (field === "vehiclePhotos") {
      const uploads = Array.from(fileList).map(createUploadItem);
      updateSelectedVehicle({ vehiclePhotos: [...selectedVehicle.vehiclePhotos, ...uploads] });
      return;
    }
    updateSelectedVehicle({ [field]: createUploadItem(fileList[0]) } as Partial<PdiVehicle>);
  };

  const openImageViewer = (images: UploadFile[], index = 0) => {
    setPreviewImageList(images);
    setPreviewImageIndex(index);
    setPreviewImage(images[index]);
    setIsPreviewZoomed(false);
  };

  const closeImageViewer = () => {
    setPreviewImage(null);
    setPreviewImageList([]);
    setPreviewImageIndex(0);
    setIsPreviewZoomed(false);
  };

  const showPrevImage = () => {
    if (previewImageList.length <= 1) return;
    const nextIndex = (previewImageIndex + previewImageList.length - 1) % previewImageList.length;
    setPreviewImageIndex(nextIndex);
    setPreviewImage(previewImageList[nextIndex]);
    setIsPreviewZoomed(false);
  };

  const showNextImage = () => {
    if (previewImageList.length <= 1) return;
    const nextIndex = (previewImageIndex + 1) % previewImageList.length;
    setPreviewImageIndex(nextIndex);
    setPreviewImage(previewImageList[nextIndex]);
    setIsPreviewZoomed(false);
  };

  const togglePreviewZoom = () => {
    setIsPreviewZoomed((state) => !state);
  };

  const addHistory = (vehicle: PdiVehicle, action: string, details?: string) => {
    const record: PdiAuditRecord = {
      id: `${getVehicleKey(vehicle)}-history-${vehicle.history.length + 1}`,
      action,
      details,
      timestamp: new Date().toISOString().split("T")[0],
    };
    return { ...vehicle, history: [record, ...vehicle.history] };
  };

  const handleSaveDraft = async () => {
    if (!selectedVehicle) return;
    const updated = addHistory(selectedVehicle, "Draft saved", `Progress ${getProgress(selectedVehicle)}%`);
    saveVehicleState(updated);
    const patch = await buildPdiPatch(updated);
    updateVehicleMutation.mutate({ id: getVehicleKey(updated), patch });
  };

  const handleMarkComplete = async () => {
    if (!selectedVehicle) return;
    const vehicleKey = getVehicleKey(selectedVehicle);
    const completedBy = user?.name || user?.username || "System";
    const updated = addHistory({ ...selectedVehicle, status: "available", completedAt: new Date().toISOString(), completedBy }, "PDI complete", "Vehicle available for bookings");
    saveVehicleState(updated);
    const patch = await buildPdiPatch(updated);
    updateVehicleMutation.mutate({ id: vehicleKey, patch });
    setOpenPdiDialog(false);
  };

  const handleSendToService = async () => {
    if (!selectedVehicle) return;
    const vehicleKey = getVehicleKey(selectedVehicle);
    const updated = addHistory({ ...selectedVehicle, status: "service" }, "Sent to service", "Vehicle moved to service workflow");
    saveVehicleState(updated);
    const patch = await buildPdiPatch(updated);
    updateVehicleMutation.mutate({ id: vehicleKey, patch });
    setOpenPdiDialog(false);
  };

  // Add vehicle form - searchable dropdown
  const [addForm, setAddForm] = useState({ vehicleId: "", searchText: "" });
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  
  const eligibleVehicles = useMemo(
    () => vehicles.filter((v) => ["available", "pdi_pending"].includes(v.status) && !activePdiVehicles.some((pv) => getVehicleKey(pv) === getVehicleKey(v))),
    [vehicles, activePdiVehicles]
  );
  
  const filteredVehicles = useMemo(
    () => eligibleVehicles.filter((v) => {
      const search = addForm.searchText.toLowerCase();
      return v.vehicleId?.toLowerCase().includes(search) || v.numberPlate?.toLowerCase().includes(search) || v.model?.toLowerCase().includes(search);
    }),
    [eligibleVehicles, addForm.searchText]
  );
  
  const selectedVehicleForAdd = vehicles.find((v) => getVehicleKey(v) === addForm.vehicleId);
  
  const handleSelectVehicle = (vehicleId: string) => {
    setAddForm((s) => ({ ...s, vehicleId }));
    setShowVehicleDropdown(false);
  };
  
  const handleAddVehicle = () => {
    if (!addForm.vehicleId) return;
    updateVehicleMutation.mutate({ id: addForm.vehicleId, patch: { status: "pdi_pending" } }, {
      onSuccess: () => {
        setOpenAddDialog(false);
        setAddForm({ vehicleId: "", searchText: "" });
        setTimeout(() => openPdiModal(addForm.vehicleId), 250);
      },
    });
  };

  const handleRemoveUpload = (field: "odometerPhoto" | "vehiclePhotos", index?: number) => {
    if (!selectedVehicle) return;
    if (field === "vehiclePhotos") {
      const updatedPhotos = selectedVehicle.vehiclePhotos.filter((_, idx) => idx !== index);
      updateSelectedVehicle({ vehiclePhotos: updatedPhotos });
      return;
    }
    updateSelectedVehicle({ [field]: undefined } as Partial<PdiVehicle>);
  };

  const canComplete = selectedVehicle
    ? selectedVehicle.checklist.every((step) => step.done) &&
      selectedVehicle.odometerPhoto &&
      selectedVehicle.vehiclePhotos.length > 0
    : false;

  const tableVehicles = activePdiVehicles.map((vehicle) => {
    const key = getVehicleKey(vehicle);
    return pdiCache[key] ?? buildPdiVehicle(vehicle);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">PDI Check</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage vehicle PDI operations in a scalable table workflow. Start checks, upload required documents, and complete or send vehicles to service.</p>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setOpenAddDialog(true)}>
          <Plus size={14} className="mr-2" /> Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Vehicles" value={vehicles.length} icon={Bike} accent="primary" subtitle="Fleet size" />
        <StatCard title="Pending PDI" value={pendingCount} icon={AlertTriangle} accent="warning" subtitle="Awaiting inspection" />
        <StatCard title="Available" value={availableCount} icon={Battery} accent="success" subtitle="Ready for booking" />
        <StatCard title="Service" value={serviceCount} icon={Wrench} accent="destructive" subtitle="Maintenance queue" />
      </div>

      <div className="bg-card rounded-3xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
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
              {tableVehicles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <Button variant="default" onClick={() => setOpenAddDialog(true)}>
                        <Plus size={14} className="mr-2" /> Add Vehicle To PDI
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                tableVehicles.map((item) => {
                  const progress = getProgress(item);
                  return (
                    <tr key={getVehicleKey(item)} className="border-t border-border hover:bg-muted/40 transition-colors">
                      <td className="px-5 py-4 font-medium truncate">{item.vehicleId}</td>
                      <td className="px-5 py-4 truncate">
                        <div className="font-medium">{item.model}</div>
                        <div className="text-xs text-muted-foreground">{item.numberPlate ?? "No plate"}</div>
                      </td>
                      <td className="px-5 py-4 truncate">{item.hub ?? "—"}</td>
                      <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                      <td className="px-5 py-4">
                        <div className="text-xs text-muted-foreground mb-2">{progress}%</div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Button variant="default" onClick={() => openPdiModal(getVehicleKey(item))}>
                          Start PDI
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={openPdiDialog} onOpenChange={(open) => { if (!open) setIsReadOnly(false); setOpenPdiDialog(open); }}>
        <DialogContent className="max-w-[980px] w-full max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-none">
            <DialogTitle>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-lg font-semibold">PDI checklist — {selectedVehicle?.vehicleId ?? "details"}</span>
                {selectedVehicle && (
                  isReadOnly ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">Completed</span>
                  ) : (
                    <StatusBadge status={selectedVehicle.status} />
                  )
                )}
              </div>
            </DialogTitle>
            {selectedVehicle && (
              <div className="mt-4 rounded-3xl border border-border bg-muted/50 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Vehicle</p>
                    <p className="mt-2 font-medium">{selectedVehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Plate</p>
                    <p className="mt-2 font-medium">{selectedVehicle.numberPlate ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Hub</p>
                    <p className="mt-2 font-medium">{selectedVehicle.hub ?? "—"}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{getProgress(selectedVehicle)}% · {selectedVehicle.checklist.filter((step) => step.done).length} of {selectedVehicle.checklist.length + 2} checks passed</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${getProgress(selectedVehicle)}%` }} />
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {selectedVehicle ? (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <div className="space-y-4">
                    <div className="rounded-3xl border border-border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold">Checklist</p>
                        <span className="text-xs text-muted-foreground">{selectedVehicle.checklist.filter((step) => step.done).length}/{selectedVehicle.checklist.length}</span>
                      </div>
                      <div className="space-y-2">
                        {isReadOnly ? (
                          selectedVehicle.checklist.map((step) => (
                            <div key={step.label} className="w-full flex items-center gap-3 rounded-2xl border border-border px-3 py-3 text-sm bg-background">
                              <Check size={16} className={step.done ? "text-success" : "text-muted-foreground"} />
                              <span className={step.done ? "text-success font-semibold" : "text-muted-foreground"}>{step.label}</span>
                              <span className={`ml-auto text-xs font-semibold ${step.done ? "text-success" : "text-destructive"}`}>
                                {step.done ? "PASS" : "FAIL"}
                              </span>
                            </div>
                          ))
                        ) : (
                          selectedVehicle.checklist.map((step, index) => (
                            <button
                              key={step.label}
                              type="button"
                              onClick={() => handleToggleChecklist(index)}
                              className="w-full flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-left text-sm hover:bg-muted transition-colors"
                            >
                              <span className="flex-1">{step.label}</span>
                              <span className={`ml-3 flex-shrink-0 font-semibold ${step.done ? "text-success" : "text-destructive"}`}>
                                {step.done ? "PASS" : "FAIL"}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-border p-4 min-h-[180px]">
                      <p className="text-sm font-semibold mb-3">Comments</p>
                      {isReadOnly ? (
                        <div className="min-h-[180px] rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">{selectedVehicle.comments || "—"}</div>
                      ) : (
                        <Textarea id="pdi-comments" value={selectedVehicle.comments} onChange={(e) => updateSelectedVehicle({ comments: e.target.value })} className="min-h-[180px]" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-3xl border border-border p-4 min-h-[420px]">
                      <p className="text-sm font-semibold mb-4">Vehicle Evidence</p>
                      <div className="space-y-4">
                        <div className="space-y-2">

                          {!isReadOnly && (
                            <Input id="odometer-upload" type="file" accept="image/*" onChange={(e) => handleFileUpload("odometerPhoto", e.target.files)} />
                          )}
                          {selectedVehicle.odometerPhoto ? (
                            <div className="mt-2 rounded-2xl border border-border bg-background p-3 text-sm text-muted-foreground">
                              <button type="button" onClick={() => openImageViewer([selectedVehicle.odometerPhoto!], 0)} className="group block overflow-hidden rounded-2xl">
                                <img src={selectedVehicle.odometerPhoto.url} alt={selectedVehicle.odometerPhoto.name} className="h-20 w-full object-cover rounded-2xl" />
                              </button>
                              <p className="mt-2 truncate">{selectedVehicle.odometerPhoto.name}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No file uploaded</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Vehicle Photos</p>
                          {!isReadOnly && (
                            <Input id="vehicle-photos-upload" type="file" accept="image/*" multiple onChange={(e) => handleFileUpload("vehiclePhotos", e.target.files)} />
                          )}
                          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {selectedVehicle.vehiclePhotos.map((file, index) => (
                              <div key={`${file.url}-${index}`} className="aspect-square overflow-hidden rounded-2xl border border-border bg-background">
                                <button type="button" onClick={() => openImageViewer(selectedVehicle.vehiclePhotos, index)} className="h-full w-full overflow-hidden">
                                  <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-sm text-muted-foreground">Select a vehicle to begin PDI.</div>
            )}
          </div>

          {selectedVehicle && !isReadOnly && (
            <div className="flex-none bg-background border-t border-border p-3">
              <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={handleSaveDraft}>
                  Save Draft
                </Button>
                <Button variant="outline" onClick={handleSendToService}>
                  Send To Service
                </Button>
                <Button disabled={!canComplete || updateVehicleMutation.isLoading} onClick={handleMarkComplete}>
                  Mark PDI Complete
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vehicle to PDI</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label>Vehicle</Label>
              <div className="relative">
                <Input
                  placeholder="Search by plate, ID, or model..."
                  value={addForm.searchText}
                  onChange={(e) => { setAddForm((s) => ({ ...s, searchText: e.target.value })); setShowVehicleDropdown(true); }}
                  onFocus={() => setShowVehicleDropdown(true)}
                  className="pr-8"
                />
                {showVehicleDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 border border-border rounded-2xl bg-background shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredVehicles.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">No available vehicles</div>
                    ) : (
                      filteredVehicles.map((v) => (
                        <button
                          key={getVehicleKey(v)}
                          type="button"
                          onClick={() => handleSelectVehicle(getVehicleKey(v))}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{v.vehicleId}</p>
                            <p className="text-xs text-muted-foreground">{v.numberPlate} • {v.model}</p>
                          </div>
                          {addForm.vehicleId === getVehicleKey(v) && <Check size={16} className="text-success" />}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedVehicleForAdd && (
                <div className="mt-2 p-2 bg-muted rounded-2xl text-sm">
                  <p className="font-medium">{selectedVehicleForAdd.vehicleId}</p>
                  <p className="text-xs text-muted-foreground">{selectedVehicleForAdd.numberPlate} • {selectedVehicleForAdd.model} • {selectedVehicleForAdd.hub}</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="secondary" onClick={() => setOpenAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddVehicle} disabled={!addForm.vehicleId || updateVehicleMutation.isLoading} className="ml-2">Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {previewImage && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <button type="button" onClick={showPrevImage} disabled={previewImageList.length <= 1} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground disabled:opacity-40 hover:bg-muted">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" onClick={showNextImage} disabled={previewImageList.length <= 1} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground disabled:opacity-40 hover:bg-muted">
                  <ChevronRight size={18} />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{previewImage.name}</p>
                  <p className="text-xs text-muted-foreground">{previewImageIndex + 1}/{previewImageList.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={togglePreviewZoom} className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-3 text-sm text-muted-foreground hover:bg-muted">
                  {isPreviewZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
                  {isPreviewZoomed ? "Zoom out" : "Zoom"}
                </button>
                <button
                  type="button"
                  onClick={closeImageViewer}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="mx-auto max-h-[80vh] max-w-[92vw] overflow-hidden rounded-3xl bg-black/10">
                <img
                  src={previewImage.url}
                  alt={previewImage.name}
                  onClick={togglePreviewZoom}
                  className={`mx-auto block max-h-[80vh] max-w-[92vw] object-contain transition-transform duration-200 ${isPreviewZoomed ? "scale-125" : "scale-100"}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {completedCount > 0 && (
        <div className="bg-card rounded-3xl border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="font-semibold">Completed PDI ({completedCount})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm">
              <thead className="bg-muted/70 text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 w-[10rem]">Vehicle ID</th>
                  <th className="px-5 py-3">Vehicle</th>
                  <th className="px-5 py-3 w-[10rem]">Hub</th>
                  <th className="px-5 py-3 w-[12rem]">Completed Date</th>
                  <th className="px-5 py-3 w-[14rem]">Completed By</th>
                  <th className="px-5 py-3 w-[10rem]">Action</th>
                </tr>
              </thead>
              <tbody>
                {readyForBookingVehicles.map((item) => (
                  <tr key={getVehicleKey(item)} className="border-t border-border hover:bg-muted/40 transition-colors">
                    <td className="px-5 py-4 font-medium truncate">{item.vehicleId}</td>
                    <td className="px-5 py-4 truncate">
                      <div className="font-medium">{item.model}</div>
                      <div className="text-xs text-muted-foreground">{item.numberPlate ?? "No plate"}</div>
                    </td>
                    <td className="px-5 py-4 truncate">{item.hub ?? "—"}</td>
                    <td className="px-5 py-4 truncate">{item.completedAt ? new Date(item.completedAt).toLocaleDateString() : "—"}</td>
                    <td className="px-5 py-4 truncate">{item.completedBy ?? "—"}</td>
                    <td className="px-5 py-4">
                      <Button variant="secondary" onClick={() => openPdiModal(getVehicleKey(item), true)}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {vehicles.length === 0 && !isLoading && (
        <EmptyState
          title="No vehicles available"
          description="Add vehicles in the Vehicles module and set status to PDI Pending to start the workflow."
        />
      )}
    </div>
  );
};

export default OnboardingPage;
