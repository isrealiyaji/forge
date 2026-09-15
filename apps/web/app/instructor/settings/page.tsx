"use client";

import { useState, type FormEvent } from "react";
import FormField from "@/components/ui/FormField";
import Toggle from "@/components/ui/Toggle";
import Button from "@/components/ui/Button";
import SettingsSection from "@/components/ui/SettingsSection";
import { instructorToday } from "@/lib/mock-data";

const InstructorSettingsPage = () => {
  const [name, setName] = useState(instructorToday.name);
  const [email, setEmail] = useState(instructorToday.email);
  const [phone, setPhone] = useState(instructorToday.phone);
  const [specialty, setSpecialty] = useState(instructorToday.specialty);
  const [bio, setBio] = useState(instructorToday.bio);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    newAssignment: true,
    nutritionStatusChanges: true,
    rosterChanges: false,
  });

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    // No backend yet — this will PATCH the instructor's profile.
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

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-4xl tracking-poster text-ink-inverse">Settings</h1>
        <p className="mt-2 text-muted-inverse">Manage your profile, password, and notifications.</p>
      </header>

      <SettingsSection title="Profile">
        <form onSubmit={saveProfile} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Full Name" name="name" value={name} onChange={setName} required />
            <FormField label="Phone" name="phone" value={phone} onChange={setPhone} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Email" name="email" type="email" value={email} onChange={setEmail} required />
            <FormField label="Specialty" name="specialty" value={specialty} onChange={setSpecialty} />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-sm border border-line bg-panel px-3.5 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span className="mt-1 block text-xs text-muted">Shown to members you're assigned to.</span>
          </label>
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
            label="New member assigned"
            description="When admin assigns a new member to your roster."
            checked={notifications.newAssignment}
            onChange={(v) => setNotifications((n) => ({ ...n, newAssignment: v }))}
          />
          <Toggle
            label="Nutrition plan status changes"
            description="When admin approves or rejects a plan you proposed."
            checked={notifications.nutritionStatusChanges}
            onChange={(v) => setNotifications((n) => ({ ...n, nutritionStatusChanges: v }))}
          />
          <Toggle
            label="Class roster changes"
            description="When a member books or cancels a class you're teaching."
            checked={notifications.rosterChanges}
            onChange={(v) => setNotifications((n) => ({ ...n, rosterChanges: v }))}
          />
        </div>
      </SettingsSection>
    </>
  );
};

export default InstructorSettingsPage;
