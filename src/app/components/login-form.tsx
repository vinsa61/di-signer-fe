"use client";

import Link from "next/link";
import { useState } from "react";

import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      console.log(data.message);

      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard?loginSuccess=true";
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("An error occurred during login.");
    }
  };

  return (
    <div className="w-[85%] md:w-full my-8 md:my-12 lg:my-16  max-w-md font-[family-name:var(--space-mono)]">
      <a href="/">
        <button className="px-4 py-2 rounded-xl bg-gray-800 mb-4">Back</button>
      </a>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Login</CardTitle>
            <CardDescription>
              Enter your details to login to your account
            </CardDescription>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="text"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <button className="w-full border-2 border-gray-300 rounded-md py-2 transition-all duration-500 ease-in-out hover:text-white hover:border-blue-600">
              Login
            </button>
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm">
          Don't have an account?
          <Link className="underline ml-2" href="register">
            Register
          </Link>
        </div>
      </form>
    </div>
  );
}
