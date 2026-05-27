"use client";

import Link from "next/link";
import { Button, Form, Input, Label, TextField } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validate()) {
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/dashboard");
    } else {
      let data;

      try {
        data = await res.json();
      } catch {
        data = { error: "Failed to sign up" };
      }

      setError(data.error || "Failed to sign up");
    }
  }

  function validate() {
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return false;
    }

    if (!password.trim()) {
      setError("Password is required");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (!confirmPassword.trim()) {
      setError("Please confirm your password");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center w-full">
        <Label className="text-5xl mb-9"> Sign Up </Label>

        <Form
          onSubmit={handleSubmit}
          className="p-10 rounded-2xl justify-center shadow-xl w-full max-w-md gap-6 flex flex-col"
        >
          <TextField className="flex flex-col gap-1" isRequired>
            <Label> Email </Label>

            <Input
              type="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </TextField>

          <TextField className="flex flex-col gap-1" isRequired>
            <Label> Password </Label>
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded-md px-4 py-2 pr-16 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />

              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm z-10 shadow-none bg-transparent text-black"
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </div>
          </TextField>

          <TextField className="flex flex-col gap-1" isRequired>
            <Label> Confirm Password </Label>

            <Input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </TextField>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isDisabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </Form>

        <div className="text-sm text-center mt-6">
          Don’t have an account?{" "}
          <Link className="text-blue-500" href="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
