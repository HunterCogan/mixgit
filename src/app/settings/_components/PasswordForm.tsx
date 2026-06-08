"use client";

import { useState } from "react";
import { Button, ErrorMessage, Form, Input, TextField } from "@heroui/react";

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage("Password updated successfully");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border p-5 bg-white">
      <h2 className="text-lg font-semibold">Change Password</h2>

      <Form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
        <TextField value={currentPassword} onChange={setCurrentPassword}>
          <Input
            type="password"
            variant="secondary"
            placeholder="Current Password"
          />
        </TextField>

        <TextField value={newPassword} onChange={setNewPassword}>
          <Input
            type="password"
            variant="secondary"
            placeholder="New Password"
          />
        </TextField>

        <TextField value={confirmPassword} onChange={setConfirmPassword}>
          <Input
            type="password"
            variant="secondary"
            placeholder="Confirm Password"
          />
        </TextField>

        {message && <p className="text-sm text-green-600">{message}</p>}

        <ErrorMessage>{error}</ErrorMessage>

        <div className="flex justify-end w-full">
          <Button type="submit" variant="primary" isPending={loading}>
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
