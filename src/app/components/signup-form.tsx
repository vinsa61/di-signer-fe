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
import toast from "react-hot-toast";

export function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !username || !email || !password) {
      setError("All fields are required.");
      toast.error("All fields are required.");
      return;
    }

    if (/\s/.test(username)) {
      setError("Username cannot contain spaces.");
      toast.error("Username cannot contain spaces.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("username", username);
      formData.append("password", password);

      if (selectedFile) {
        formData.append("signature", selectedFile);
      }
      if (!selectedFile) {
        setError("Signature not uploaded.");
        toast.error("Please upload your signature!");
        return;
      }

      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard?registerSuccess=true";
      } else {
        setError(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("An error occurred during register.");
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const maxFileSize = 2 * 1024 * 1024; // 2MB
      if (file.type === "image/png" && file.size <= maxFileSize) {
        setSelectedFile(file);
        const blobUrl = URL.createObjectURL(file);
        // setFileUrl(blobUrl);
      } else if (file.size > maxFileSize) {
        toast.error("File size exceeds the 2MB limit.");
      } else {
        toast.error("Please upload a valid png file.");
      }
    }
  };

  const isRegisterDisabled =
    !firstName ||
    !lastName ||
    !username ||
    /\s/.test(username) ||
    !email ||
    !password;

  return (
    <div className="w-[85%] md:w-full my-8 md:my-12 lg:my-16 max-w-md font-[family-name:var(--space-mono)]">
      <a href="/">
        <button className="px-4 py-2 rounded-xl bg-gray-800 mb-4">Back</button>
      </a>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Register</CardTitle>
            <CardDescription>
              Enter your details to create a new account
            </CardDescription>

            {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              {/\s/.test(username) && (
                <p className="text-red-500 text-sm mt-2">
                  Username cannot contain spaces.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
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
          <div
            className="border-2 border-gray-700 p-8 mb-4 w-full flex justify-center items-center bg-gray-800 cursor-pointer hover:bg-gray-700"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              id="fileInput"
              type="file"
              accept="image/png"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="fileInput"
              className="text-base md:text-lg font-medium text-gray-400"
            >
              Drag and drop PNG here or click to upload
            </label>
          </div>
          {selectedFile && (
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm md:text-base mb-4">
                Selected File: {selectedFile.name}
              </p>
              <div>
                {/* Preview the image if it's a PNG */}
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="File Preview"
                  className="max-w-[200px] bg-white mx-auto rounded-lg mb-4"
                />
              </div>
            </div>
          )}
          <CardFooter className="flex flex-col">
            <button
              className={`w-full border-2 border-gray-300 rounded-md py-2 transition-all duration-500 ease-in-out hover:text-white hover:border-blue-600 ${
                isRegisterDisabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isRegisterDisabled}
            >
              Register
            </button>
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm">
          Have an account?
          <Link className="underline ml-2" href="login">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
