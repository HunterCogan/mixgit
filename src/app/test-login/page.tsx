"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Form, Input, Label, TextField } from "@heroui/react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/test-dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center flex-col font-sans">
      <Label className="text-2xl mb-6">Login</Label>
      <Form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            onChange={(e) => setPassword(e.target.value)}
          />
        </TextField>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Button type="submit" variant="primary" fullWidth isDisabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </Form>

      <div className="flex text-center text-sm mt-3">
        Do not have an account?{" "}
        <Link href="/test-register" className="underline pl-2">
          Register
        </Link>
      </div>
    </div>
  );
}
