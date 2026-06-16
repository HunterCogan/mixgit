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
  initialImagePath: string;
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
  initialImagePath,
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePath, setImagePath] = useState(initialImagePath);
  const [imageModalOpen, setImageModalOpen] = useState(false);

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

  const imageUrl = imagePath
    ? `https://scratchpad-profile-images.s3.us-east-1.amazonaws.com/${imagePath}`
    : undefined;

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

      router.push("/");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete account",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleAvatarUpload() {
    if (!selectedFile) return;

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/user/avatar/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || "Failed to upload image");
      }

      const saveResponse = await fetch("/api/user/avatar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imagePath: uploadData.imagePath,
        }),
      });

      router.refresh();

      if (!saveResponse.ok) {
        throw new Error("Failed to save avatar");
      }

      setImagePath(uploadData.imagePath);

      router.refresh();
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      setProfileError("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleRemoveProfileImage() {
    setProfileError(null);

    try {
      const response = await fetch("/api/user/avatar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imagePath: null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove image");
      }

      setImagePath("");
      setSelectedFile(null);
      setImageModalOpen(false);
      router.refresh();
    } catch {
      setProfileError("Failed to remove image");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label>Profile Picture</Label>

        <div className="flex flex-col items-start gap-3">
          <Button
            type="button"
            onPress={() => {
              if (imagePath) setImageModalOpen(true);
            }}
            variant="primary"
            className={`h-auto min-w-0 p-0 bg-transparent hover:bg-transparent ${!imagePath ? "cursor-default" : "cursor-pointer"}`}
          >
            <Avatar size="lg" className="h-28 w-28 rounded-3xl">
              <Avatar.Image src={imageUrl} alt={name} />
              <Avatar.Fallback
                style={{ backgroundColor: color }}
                className="text-2xl"
              >
                {avatarInitial}
              </Avatar.Fallback>
            </Avatar>
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onPress={() => {
                document.getElementById("avatar-upload")?.click();
              }}
            >
              Change Picture
            </Button>

            <Link href={`/users/${userId}`}>
              <Button variant="secondary" size="sm">
                View Profile
              </Button>
            </Link>
          </div>
        </div>

        <Input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              setSelectedFile(file);
            }
          }}
        />

        {selectedFile && (
          <div className="flex items-center gap-3">
            <p className="text-sm">{selectedFile.name}</p>

            <Button
              variant="primary"
              onPress={handleAvatarUpload}
              isDisabled={uploadingImage}
            >
              {uploadingImage ? "Uploading..." : "Upload"}
            </Button>
          </div>
        )}
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

        {!imagePath && (
          <div>
            <Label>Avatar color</Label>
            <div className="flex items-center gap-3">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-9 p-0 cursor-pointer rounded border border-default-200 bg-transparent"
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
        )}

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

        <div className="min-h-6">
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

      <Modal isOpen={imageModalOpen} onOpenChange={setImageModalOpen}>
        <Modal.Trigger className="sr-only" tabIndex={-1} />
        <Modal.Backdrop variant="blur">
          <Modal.Container>
            <Modal.Dialog>
              <Modal.CloseTrigger />

              <Modal.Body>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={name}
                    className="max-h-[85vh] max-w-full object-contain rounded-lg"
                  />
                )}
              </Modal.Body>

              <Modal.Footer>
                {imagePath && (
                  <Button
                    variant="danger-soft"
                    size="sm"
                    onPress={handleRemoveProfileImage}
                  >
                    Remove Picture
                  </Button>
                )}
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Modal state={passwordState}>
        <Modal.Trigger className="sr-only" tabIndex={-1} />
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
                    aria-label="Current Password"
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
                    aria-label="New password"
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
                    aria-label="Confirm new password"
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
        <Modal.Trigger className="sr-only" tabIndex={-1} />
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

                  <TextField
                    className="py-1"
                    aria-label="Password to confirm deletion"
                  >
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
