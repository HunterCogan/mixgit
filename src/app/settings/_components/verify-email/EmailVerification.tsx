"use client";

import { useState, useEffect } from "react";
import { Button, Modal, useOverlayState } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

type EmailVerificationProps = {
  email: string;
  state: ReturnType<typeof useOverlayState>;
};

type Session = {
  user?: {
    emailVerified?: boolean;
  };
};

export default function EmailVerification({
  email,
  state,
}: EmailVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await authClient.getSession();
        setSession(res?.data ?? null);
      } catch {
        setMessage("Failed to load session.");
      }
    }

    loadSession();
  }, []);

  const isVerified = session?.user?.emailVerified;

  async function handleResendVerification() {
    if (!email) return;

    try {
      setLoading(true);
      setMessage("");

      await authClient.sendVerificationEmail({ email });

      setMessage("Verification email sent. Check your inbox.");
    } catch {
      setMessage("Email not found.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal state={state}>
      <Modal.Trigger className="sr-only" tabIndex={-1} />

      <Modal.Backdrop variant="blur">
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Heading>Verify Email</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <div className="flex flex-col gap-6 justify-center items-center text-center p-4 w-full text-black">
                <p>Email: {email}</p>

                {!isVerified ? (
                  <Button
                    isDisabled={loading}
                    onPress={handleResendVerification}
                  >
                    Verify Email
                  </Button>
                ) : (
                  <p className="text-green-600 font-medium">Email Verified</p>
                )}

                {message && (
                  <p className="text-sm text-default-500">{message}</p>
                )}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
