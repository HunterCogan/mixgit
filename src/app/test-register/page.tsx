"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setConfirmPasswordError("");

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/test-dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  font-sans">
      <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField>
          <Label className="text-2xl mb-4">Register</Label>
        </TextField>
        <TextField className="flex flex-col gap-1" isRequired>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </TextField>

        <TextField className="flex flex-col gap-1" isRequired>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setConfirmPasswordError("");
            }}
          />
        </TextField>

        <TextField
          className="flex flex-col gap-1"
          isRequired
          isInvalid={!!confirmPasswordError}
        >
          <Label>Confirm Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setConfirmPasswordError("");
            }}
          />
          {confirmPasswordError && (
            <FieldError>{confirmPasswordError}</FieldError>
          )}
        </TextField>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button type="submit" variant="primary" fullWidth isDisabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </Form>

      <div className="flex text-center text-sm mt-3">
        Already have an account?{" "}
        <Link href="/test-login" className="underline pl-2">
          Login
        </Link>
      </div>
    </div>
  );
}
