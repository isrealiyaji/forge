"use client";

import { useState, type FormEvent } from "react";
import FormField from "@/components/ui/FormField";
import Toggle from "@/components/ui/Toggle";
import Button from "@/components/ui/Button";
import SettingsSection from "@/components/ui/SettingsSection";
import RosterRow from "@/components/ui/RosterRow";
import { adminProfile, adminStats, pendingInvites } from "@/lib/mock-data";

const AdminSettingsPage = () => {
  const [name, setName] = useState(adminProfile.name);
  const [email, setEmail] = useState(adminProfile.email);
  const [phone, setPhone] = useState(adminProfile.phone);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    nutritionReview: true,
    pastDue: true,
    waitlistOverflow: false,
    weeklySummary: true,
  });

  const [assignmentCap, setAssignmentCap] = useState(String(adminStats.assignmentCap));
  const [gracePeriodDays, setGracePeriodDays] = useState("3");
  const [gymSettingsSaved, setGymSettingsSaved] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Instructor");
  const [inviteSent, setInviteSent] = useState(false);

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    // No backend yet — this will PATCH the admin's profile.
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const savePassword = (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError("Use at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    setPasswordError("");
    // No backend yet — this will verify currentPassword and update it.
    setPasswordSaved(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const saveGymSettings = (e: FormEvent) => {
    e.preventDefault();
    // No backend yet — this will update the shared `settings` table.
    setGymSettingsSaved(true);
    setTimeout(() => setGymSettingsSaved(false), 2000);
  };

  const sendInvite = (e: FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    // No backend yet — this will create an invite row and email the token link.
    setInviteSent(true);
    setInviteEmail("");
    setTimeout(() => setInviteSent(false), 2000);
  };

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse">Settings</h1>
        <p className="mt-2 text-muted-inverse">Manage your profile, the gym, and your team.</p>
      </header>

      <SettingsSection title="Profile">
        <form onSubmit={saveProfile} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Full Name" name="name" value={name} onChange={setName} required />
            <FormField label="Phone" name="phone" value={phone} onChange={setPhone} />
          </div>
          <FormField label="Email" name="email" type="email" value={email} onChange={setEmail} required />
          <div className="flex items-center gap-4">
            <Button type="submit">Save Changes</Button>
            {profileSaved ? <span className="text-sm font-semibold text-accent">Saved.</span> : null}
          </div>
        </form>
      </SettingsSection>

      <SettingsSection title="Password">
        <form onSubmit={savePassword} className="space-y-5">
          <FormField
            label="Current Password"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            required
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="New Password"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              error={passwordError && passwordError.includes("8 characters") ? passwordError : undefined}
              required
            />
            <FormField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              error={passwordError && passwordError.includes("match") ? passwordError : undefined}
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <Button type="submit">Update Password</Button>
            {passwordSaved ? <span className="text-sm font-semibold text-accent">Password updated.</span> : null}
          </div>
        </form>
      </SettingsSection>

      <SettingsSection title="Notifications">
        <div className="divide-y divide-line">
          <Toggle
            label="Nutrition plans awaiting review"
            description="When an instructor proposes or revises a plan."
            checked={notifications.nutritionReview}
            onChange={(v) => setNotifications((n) => ({ ...n, nutritionReview: v }))}
          />
          <Toggle
            label="Subscriptions past due"
            description="When a member's renewal fails and enters the grace period."
            checked={notifications.pastDue}
            onChange={(v) => setNotifications((n) => ({ ...n, pastDue: v }))}
          />
          <Toggle
            label="Waitlist overflow"
            description="When a class waitlist grows past capacity."
            checked={notifications.waitlistOverflow}
            onChange={(v) => setNotifications((n) => ({ ...n, waitlistOverflow: v }))}
          />
          <Toggle
            label="Weekly analytics summary"
            description="A digest of members, revenue, and attendance every Monday."
            checked={notifications.weeklySummary}
            onChange={(v) => setNotifications((n) => ({ ...n, weeklySummary: v }))}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Gym Settings" description="Rules the app applies automatically across the gym.">
        <form onSubmit={saveGymSettings} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Members per Instructor"
              name="assignmentCap"
              type="number"
              value={assignmentCap}
              onChange={setAssignmentCap}
              hint="New members auto-assign evenly up to this cap."
            />
            <FormField
              label="Payment Grace Period (days)"
              name="gracePeriodDays"
              type="number"
              value={gracePeriodDays}
              onChange={setGracePeriodDays}
              hint="How long access stays on after a failed renewal."
            />
          </div>
          <div className="flex items-center gap-4">
            <Button type="submit">Save Settings</Button>
            {gymSettingsSaved ? <span className="text-sm font-semibold text-accent">Saved.</span> : null}
          </div>
        </form>
      </SettingsSection>

      <SettingsSection title="Team & Invites" description="Invite instructors or other admins to join.">
        <form onSubmit={sendInvite} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <FormField
              label="Email"
              name="inviteEmail"
              type="email"
              value={inviteEmail}
              onChange={setInviteEmail}
              placeholder="name@forgeathletic.club"
            />
          </div>
          <label className="block sm:w-44">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">Role</span>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full rounded-sm border border-line bg-panel px-3.5 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option>Instructor</option>
              <option>Admin</option>
            </select>
          </label>
          <Button type="submit">Send Invite</Button>
        </form>
        {inviteSent ? <p className="mb-4 text-sm font-semibold text-accent">Invite sent.</p> : null}

        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">Pending Invites</p>
        <div className="border-t border-line">
          {pendingInvites.map((invite) => (
            <RosterRow
              key={invite.id}
              title={invite.title}
              meta={invite.meta}
              tone={invite.tone}
              statusLabel={invite.statusLabel}
              keyStat={invite.keyStat}
              action={
                <a
                  href="#"
                  className="rounded-sm border border-line px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink transition-colors hover:bg-line/10"
                >
                  Revoke
                </a>
              }
            />
          ))}
        </div>
      </SettingsSection>
    </>
  );
};

export default AdminSettingsPage;
