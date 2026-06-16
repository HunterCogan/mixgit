"use client";

import Link from "next/link";
import {
  Button,
  Card,
  Form,
  Input,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

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
    <div className="grid h-screen place-items-center p-12">
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col items-center w-full">
          <Label className="text-5xl mb-8">Sign Up</Label>
          <Card variant="default" className="shadow-lg w-full max-w-md">
            <Form
              onSubmit={handleSubmit}
              className="justify-center w-full max-w-md gap-6 flex flex-col p-1 sm:p-5"
            >
              <TextField className="flex flex-col gap-1" isRequired>
                <Label>Email</Label>
                <Input
                  variant="secondary"
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </TextField>

              <TextField className="flex flex-col gap-1" isRequired>
                <Label>Password</Label>
                <InputGroup variant="secondary">
                  <InputGroup.Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <InputGroup.Suffix className="pr-0">
                    <Button
                      type="button"
                      variant="ghost"
                      excludeFromTabOrder
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeIcon className="w-5 h-5" />
                      ) : (
                        <EyeSlashIcon className="w-5 h-5" />
                      )}
                    </Button>
                  </InputGroup.Suffix>
                </InputGroup>
              </TextField>

              <TextField className="flex flex-col gap-1" isRequired>
                <Label>Confirm Password</Label>
                <Input
                  variant="secondary"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
          </Card>

          <div className="text-sm text-center mt-6">
            Already have an account?{" "}
            <Link className="text-blue-500" href="/login">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
