"use client";

import { useState } from "react";
import { Button, Card, Accordion, AccordionItem } from "@heroui/react";

export default function EmailVerification({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleResendVerification() {
    if (!email) return;

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error();

      setMessage("Verification email sent. Check your inbox.");
    } catch {
      setMessage("Failed to send verification email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid h-screen place-items-center p-12">
      <Accordion className="w-full max-w-md">
        <AccordionItem key="verify-email" aria-label="Verify Email">
          <Card>
            <Card.Content>
              <div className="flex flex-col gap-6 justify-center align-items-center text-center p-4 w-full">
                <p>Email: {email}</p>

                <Button
                  isDisabled={loading}
                  onPress={handleResendVerification}
                  className="justify-center align-items-center mx-auto"
                >
                  Verify Email
                </Button>

                {loading && (
                  <p className="text-sm text-default-500">
                    Sending verification email...
                  </p>
                )}

                {message && (
                  <p className="text-sm text-default-500">{message}</p>
                )}

                {!loading && (
                  <div className="text-sm">
                    Didn&apos;t receive the email?
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={handleResendVerification}
                    >
                      Resend
                    </Button>
                  </div>
                )}

                <Button variant="danger" className="absolute top-2 right-2">
                  ✕
                </Button>
              </div>
            </Card.Content>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
