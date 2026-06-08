"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";

export default function ProfilePictureForm({
  initialAvatarUrl,
}: {
  initialAvatarUrl?: string;
}) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/user/avatar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          avatarUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile picture");
      }

      setMessage("Profile picture updated successfully");
      setIsOpen(false);

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile picture",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-xl border p-4 bg-white">
      <h2 className="text-lg font-semibold">Profile Picture</h2>

      <div className="mt-4 flex items-start justify-between gap-6">
        <button
          type="button"
          onClick={() => avatarUrl && setIsPreviewOpen(true)}
          className="h-24 w-24 overflow-hidden rounded-full border cursor-pointer bg-white"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
        </button>

        <Button onPress={() => setIsOpen(true)}>Update Picture</Button>
      </div>

      {message && <p className="mt-4 text-sm text-green-600">{message}</p>}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Update Profile Picture</h3>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-2xl"
              >
                ×
              </button>
            </div>

            <p className="mt-3 text-sm text-gray-500">
              Upload a new profile picture.
            </p>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="flex flex-col items-start gap-4">
                <label
                  htmlFor="profile-picture"
                  className="
                    inline-flex
                    cursor-pointer
                    items-center
                    rounded-full
                    border
                    px-5
                    py-2
                    text-sm
                    font-medium
                    hover:bg-gray-100
                    transition
                  "
                >
                  Choose Picture
                </label>

                <input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {avatarUrl && (
                  <div className="pl-3">
                    <img
                      src={avatarUrl}
                      alt="Preview"
                      className="
                            h-32
                            w-32
                            rounded-full
                            border
                            bg-white
                            object-contain
                        "
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onPress={() => setIsOpen(false)}>
                  Cancel
                </Button>

                <Button isDisabled={loading} type="submit">
                  {loading ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPreviewOpen && avatarUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative rounded-3xl bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute right-4 top-2 text-2xl"
            ></button>

            <img
              src={avatarUrl}
              alt="Profile"
              className="max-h-[70vh] max-w-[70vw] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
