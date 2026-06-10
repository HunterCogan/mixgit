"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Form,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
  Modal,
  useOverlayState,
} from "@heroui/react";

type SettingsFormProps = {
  userId: string;
  initialName: string;
  initialColor: string;
  initialAbout: string;
};

function normalizeHexColor(value: string) {
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed}`;
  return trimmed;
}

export default function SettingsForm({
  userId,
  initialName,
  initialColor,
  initialAbout,
}: SettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [about, setAbout] = useState(initialAbout);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordState = useOverlayState();
  const deleteState = useOverlayState();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [deletePassword, setDeletePassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  const avatarInitial = useMemo(
    () => name.substring(0, 2).toUpperCase() || "??",
    [name],
  );

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setProfileError(null);
    setSuccess(false);

    if (!name.trim()) {
      setProfileError("Name is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          color: normalizeHexColor(color),
          about,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const fieldErrors = data.error;
        if (fieldErrors && typeof fieldErrors === "object") {
          const first = Object.values(fieldErrors).flat()[0];
          setProfileError(
            typeof first === "string" ? first : "Failed to save profile",
          );
        } else {
          setProfileError(
            typeof data.error === "string"
              ? data.error
              : "Failed to save profile",
          );
        }
        return;
      }

      setSuccess(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }

    if (!confirmPassword) {
      setPasswordError("Please confirm your password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
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
        throw new Error(data.error || "Failed to change password");
      }

      passwordState.close();

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError(null);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteError(null);

    if (!deletePassword.trim()) {
      setDeleteError("Password is required");
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch("/api/user/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      window.location.href = "/login";
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          <Avatar.Fallback style={{ backgroundColor: color }}>
            {avatarInitial}
          </Avatar.Fallback>
        </Avatar>
        <div>
          <p className="text-sm text-default-500">Profile preview</p>
          <Link
            href={`/users/${userId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            View your profile
          </Link>
        </div>
      </div>

      <Form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField isRequired>
          <Label>Display name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </TextField>

        <div className="flex flex-col gap-2">
          <Label>Avatar color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-default-200 bg-transparent"
              aria-label="Pick avatar color"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#808080"
              className="flex-1"
            />
          </div>
        </div>

        <TextField>
          <Label>About me</Label>
          <TextArea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell others a little about yourself"
            rows={4}
          />
          <p className="text-xs text-default-400 mt-1">
            {about.length}/500 characters
          </p>
        </TextField>

        <div className="flex flex-col gap-3 w-full">
          <h3 className="text-lg font-semibold">Security</h3>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onPress={() => {
                setPasswordError(null);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                passwordState.open();
              }}
            >
              Change Password
            </Button>

            <Button
              variant="danger"
              onPress={() => {
                setDeleteError(null);
                setDeletePassword("");
                deleteState.open();
              }}
            >
              Delete Account
            </Button>
          </div>
        </div>

        <div className="min-h-[24px]">
          {profileError && (
            <p className="text-sm text-red-500">{profileError}</p>
          )}

          {success && (
            <p className="text-sm text-green-600">
              Profile saved successfully.
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          isDisabled={loading}
          className="self-start"
        >
          {loading && <Spinner size="sm" />}
          {loading ? "Saving..." : "Save profile"}
        </Button>
      </Form>

      <Modal state={passwordState}>
        <Modal.Backdrop variant="blur">
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger />

              <Modal.Header className="px-3">
                <Modal.Heading>Change Password</Modal.Heading>
              </Modal.Header>

              <Modal.Body>
                <div className="flex flex-col gap-3 px-2">
                  <TextField
                    value={currentPassword}
                    onChange={(value) => {
                      setCurrentPassword(value);
                      setPasswordError(null);
                    }}
                    className="py-1"
                  >
                    <Input
                      type="password"
                      variant="secondary"
                      placeholder="Current password"
                    />
                  </TextField>

                  <TextField
                    value={newPassword}
                    onChange={(value) => {
                      setNewPassword(value);
                      setPasswordError(null);
                    }}
                    className="py-1"
                  >
                    <Input
                      type="password"
                      variant="secondary"
                      placeholder="New password"
                    />
                  </TextField>

                  <TextField
                    value={confirmPassword}
                    onChange={(value) => {
                      setConfirmPassword(value);
                      setPasswordError(null);
                    }}
                    className="py-1"
                  >
                    <Input
                      type="password"
                      variant="secondary"
                      placeholder="Confirm new password"
                    />
                  </TextField>

                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                </div>
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" onPress={passwordState.close}>
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  isDisabled={passwordLoading}
                  onPress={handleChangePassword}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal state={deleteState}>
        <Modal.Backdrop variant="blur">
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger />

              <Modal.Header className="px-2">
                <Modal.Heading>Delete Account</Modal.Heading>
              </Modal.Header>

              <Modal.Body>
                <div className="flex flex-col gap-3 px-2">
                  <p className="text-sm text-red-500">
                    This action cannot be undone.
                  </p>

                  <TextField className="py-1">
                    <Input
                      type="password"
                      variant="secondary"
                      placeholder="Enter Password To Confirm"
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        setDeleteError(null);
                      }}
                    />
                  </TextField>

                  {deleteError && (
                    <p className="text-sm text-red-500">{deleteError}</p>
                  )}
                </div>
              </Modal.Body>

              <Modal.Footer>
                <Button variant="secondary" onPress={deleteState.close}>
                  Cancel
                </Button>

                <Button
                  variant="danger"
                  isDisabled={deleteLoading}
                  onPress={handleDeleteAccount}
                >
                  {deleteLoading ? "Deleting..." : "Delete Account"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
