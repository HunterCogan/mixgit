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
import { useState, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [reservedUsernames, setReservedUsernames] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/reserved-usernames")
      .then((res) => res.json())
      .then(({ reserved }) => setReservedUsernames(reserved));
  }, []);

  async function checkUsername(value: string) {
    if (!value.trim()) {
      setUsernameError("");
      return;
    }

    if (reservedUsernames.includes(value.toLowerCase())) {
      setUsernameError("Username is not available");
      return;
    }

    const { data } = await authClient.isUsernameAvailable({ username: value });
    if (data?.available === false) {
      setUsernameError("Username is already taken");
    } else {
      setUsernameError("");
    }
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);

    const { error } = await authClient.signUp.email({
      email,
      password,
      name: displayName.trim() || username,
      username,
    });

    setLoading(false);

    if (error) {
      setError(error.message || "Failed to sign up");
    } else {
      router.push("/dashboard");
    }
  }

  function validate() {
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return false;
    }

    if (usernameError) {
      setError("Please choose a different username");
      return false;
    }

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
          <Label className="text-4xl sm:text-5xl mb-4">Sign Up</Label>
          <Card variant="default" className="shadow-lg w-full max-w-md">
            <Form
              onSubmit={handleSubmit}
              className="justify-center w-full max-w-md gap-6 flex flex-col p-1 sm:p-5"
            >
              <TextField className="flex flex-col gap-1" isRequired>
                <Label>Username</Label>
                <Input
                  variant="secondary"
                  value={username}
                  placeholder="Enter your username"
                  onChange={(e) => {
                    setUsername(e.target.value);
                    checkUsername(e.target.value);
                  }}
                  className="text-sm"
                />
                {usernameError && (
                  <p className="text-red-600 text-sm">{usernameError}</p>
                )}
              </TextField>

              <TextField className="flex flex-col gap-1">
                <Label>Display Name</Label>
                <Input
                  variant="secondary"
                  value={displayName}
                  placeholder="Enter your display name"
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-sm"
                />
              </TextField>

              <TextField className="flex flex-col gap-1" isRequired>
                <Label>Email</Label>
                <Input
                  variant="secondary"
                  type="email"
                  value={email}
                  placeholder="Enter your email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm"
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
                    className="text-sm rounded-tl-[inherit] rounded-bl-[inherit]"
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
                  className="text-sm"
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
