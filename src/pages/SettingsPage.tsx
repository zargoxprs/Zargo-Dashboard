import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const SettingsPage = () => {
  const [profile, setProfile] = useState({ name: "Sarah Johnson", email: "sarah.johnson@zargo.com", phone: "+1 (555) 123-4567" });
  const [passwords, setPasswords] = useState({ current: "", new_pass: "", confirm: "" });
  const [business, setBusiness] = useState({ company: "Zargo EV Rentals" });
  const [notifications, setNotifications] = useState({ alerts: true, critical: true });

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Profile Settings */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Profile Settings</h2>
        <Separator />
        <div className="grid gap-4">
          <div>
            <Label>Name</Label>
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button>Save Profile</Button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <Separator />
        <div className="grid gap-4">
          <div>
            <Label>Current Password</Label>
            <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>New Password</Label>
              <Input type="password" value={passwords.new_pass} onChange={(e) => setPasswords({ ...passwords, new_pass: e.target.value })} />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button>Update Password</Button>
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Business Settings</h2>
        <Separator />
        <div>
          <Label>Company Name</Label>
          <Input value={business.company} onChange={(e) => setBusiness({ ...business, company: e.target.value })} />
        </div>
        <p className="text-xs text-muted-foreground">More business configurations coming soon.</p>
        <div className="flex justify-end">
          <Button>Save</Button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Notification Settings</h2>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Enable Alerts</p>
            <p className="text-xs text-muted-foreground">Receive notifications for bookings and vehicles</p>
          </div>
          <Switch checked={notifications.alerts} onCheckedChange={(v) => setNotifications({ ...notifications, alerts: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Critical Alert Priority</p>
            <p className="text-xs text-muted-foreground">Get priority notifications for critical events</p>
          </div>
          <Switch checked={notifications.critical} onCheckedChange={(v) => setNotifications({ ...notifications, critical: v })} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
