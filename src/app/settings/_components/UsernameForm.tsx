"use client";

import { useState } from "react";
import {
  AlertDialog,
  Button,
  ErrorMessage,
  Input,
  Label,
  Spinner,
  TextField,
  useOverlayState,
} from "@heroui/react";

export default function UsernameForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const editState = useOverlayState();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Failed to update username",
        );
      }

      setMessage("Username updated successfully");

      editState.close();

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update username",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border p-4 bg-white">
      <h2 className="text-lg font-semibold">Username</h2>

      <div className="flex items-center justify-between mt-4">
        <div className="flex flex-col">
          <span className="text-xl font-semibold text-gray-900">{name}</span>
        </div>

        <Button variant="primary" onPress={editState.open}>
          Update Username
        </Button>
      </div>

      {message && (
        <p className="text-sm text-emerald-600 mt-4 font-medium">{message}</p>
      )}

      <ErrorMessage>{error}</ErrorMessage>

      <AlertDialog isOpen={editState.isOpen} onOpenChange={editState.setOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.CloseTrigger className="m-3" />

              <AlertDialog.Header>
                <AlertDialog.Heading>Update Username</AlertDialog.Heading>
              </AlertDialog.Header>

              <AlertDialog.Body>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <TextField value={name} onChange={setName}>
                    <Label>New Username</Label>

                    <Input
                      variant="secondary"
                      placeholder="Enter new username"
                    />
                  </TextField>

                  <div className="flex justify-end gap-3 mt-2">
                    <Button variant="outline" onPress={() => editState.close()}>
                      Cancel
                    </Button>

                    <Button
                      variant="primary"
                      type="submit"
                      isDisabled={loading}
                    >
                      {loading && <Spinner size="sm" />}
                      {loading ? "Saving..." : "Confirm"}
                    </Button>
                  </div>
                </form>
              </AlertDialog.Body>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </div>
  );
}
