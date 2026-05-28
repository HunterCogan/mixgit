"use client";

import { useEffect, useState } from "react";
import { Avatar, Button, Card, Input, TextArea } from "@heroui/react";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/settings/me");
        const data = await res.json();

        if (data.user?.profileImage) {
          setProfileImage(data.user.profileImage);
        }

        if (data.user?.bio) {
          setBio(data.user.bio);
        }

        if (data.user?.username) {
          setUsername(data.user.username);
        }
      } catch (error) {
        console.error(error);
      }
    }

    loadUser();
  }, []);

  async function handleSaveSettings() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          bio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to save");
        return;
      }

      setMessage("Settings updated successfully");
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword() {
    try {
      setLoading(true);
      setMessage("");

      if (newPassword !== confirmPassword) {
        setMessage("New passwords do not match");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update password");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage("Password updated successfully");
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveBio() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to save bio");
        return;
      }

      setMessage("Bio updated successfully");
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = confirm(
      "Are you sure you want to permanently delete your account?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const res = await fetch("/api/settings/delete", {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete account");
        return;
      }

      window.location.href = "/";
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      const image = reader.result as string;

      setProfileImage(image);

      try {
        await fetch("/api/settings", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileImage: image,
          }),
        });
      } catch (error) {
        console.error(error);
      }
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Settings</h1>

        <p className="text-default-500 mt-2">
          Manage your account settings and profile.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Profile Section */}
        <Card className="p-6">
          <div className="flex items-center gap-5">
            <div className="bg-zinc-900 rounded-2xl p-6 flex items-center gap-6">
              <div className="w-28 h-28 rounded-3xl overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-zinc-500 text-sm">No Image</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="text-2xl font-bold">Profile Picture</h2>

                <div className="flex flex-col gap-2">
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <label htmlFor="profile-upload">
                    <Button
                      size="sm"
                      variant="primary"
                      onPress={() => {
                        document.getElementById("profile-upload")?.click();
                      }}
                    >
                      Update Picture
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Username */}
        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Username</h2>

          <p className="mb-2 font-medium">Username</p>

          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Button
            variant="primary"
            isDisabled={loading}
            onPress={handleSaveSettings}
          >
            {loading ? "Updating..." : "Update Username"}
          </Button>
          {message && <p className="text-sm text-default-500">{message}</p>}
        </Card>

        {/* Password */}
        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Change Password</h2>

          <p className="mb-2 font-medium">Current Password</p>

          <Input
            type="password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <p className="mb-2 font-medium mt-4">New Password</p>

          <Input
            type="password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <p className="mb-2 font-medium mt-4">Confirm New Password</p>

          <Input
            type="password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            variant="primary"
            isDisabled={loading}
            onPress={handleUpdatePassword}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>

          {message && <p className="text-sm text-default-500">{message}</p>}
        </Card>

        {/* Bio */}
        <Card className="p-6 flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Bio</h2>

          <p className="mb-2 font-medium">Bio</p>

          <TextArea
            placeholder="Tell us about yourself"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <Button
            variant="primary"
            isDisabled={loading}
            onPress={handleSaveBio}
          >
            {loading ? "Saving..." : "Save Bio"}
          </Button>
        </Card>

        {/* Deleting Account */}
        <Card className="p-6 border border-red-500">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">Delete Account</h2>

            <p className="text-sm text-default-500">
              Permanently delete your account and all associated data.
            </p>

            <Button
              variant="danger"
              isDisabled={loading}
              onPress={handleDeleteAccount}
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
