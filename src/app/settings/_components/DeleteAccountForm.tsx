"use client";

import { useState } from "react";
import {
  AlertDialog,
  Button,
  ErrorMessage,
  Spinner,
  useOverlayState,
} from "@heroui/react";

export default function DeleteAccountForm() {
  const deleteState = useOverlayState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      window.location.href = "/login";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 p-5 bg-white">
      <h2 className="text-lg font-semibold text-red-600">Delete Account</h2>

      <p className="text-sm text-gray-500 mt-2">
        Permanently delete your account.
      </p>

      <div className="flex justify-end mt-4">
        <Button variant="danger" onPress={deleteState.open}>
          Delete Account
        </Button>
      </div>

      <ErrorMessage>{error}</ErrorMessage>

      <AlertDialog
        isOpen={deleteState.isOpen}
        onOpenChange={deleteState.setOpen}
      >
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.CloseTrigger className="m-3" />

              <AlertDialog.Header>
                <AlertDialog.Heading className="flex items-center gap-2 text-2xl mb-3">
                  <AlertDialog.Icon />
                  Delete Account?
                </AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body>
                This action cannot be undone. Your account and associated data
                will be permanently deleted.
              </AlertDialog.Body>

              <AlertDialog.Footer>
                <Button variant="outline" onPress={deleteState.close}>
                  Cancel
                </Button>

                <Button
                  variant="danger"
                  isDisabled={loading}
                  onPress={handleDelete}
                >
                  {loading && <Spinner size="sm" />}
                  {loading ? "Deleting..." : "Delete Account"}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}
