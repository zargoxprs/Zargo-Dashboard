import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { notify } from "@/lib/notify";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const requireOld = !user?.forcePasswordChange;

  const submit = async () => {
    if (!newPassword || newPassword.length < 6) return notify.error("Password must be at least 6 characters");
    if (newPassword !== confirm) return notify.error("Passwords do not match");
    setLoading(true);
    try {
      await authService.changePassword(requireOld ? oldPassword : undefined, newPassword);
      notify.success("Password updated");
      // reload to refresh user state
      window.location.href = "/";
    } catch (e: any) {
      notify.apiError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-2xl border p-6">
        <h2 className="text-lg font-semibold mb-2">Change Password</h2>
        <p className="text-sm text-muted-foreground mb-4">{user?.forcePasswordChange ? "Please change your temporary password" : "Change your password"}</p>
        <div className="space-y-3">
          {!requireOld ? null : (
            <div>
              <Label>Old Password</Label>
              <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>
          )}
          <div>
            <Label>New Password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button onClick={submit} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
