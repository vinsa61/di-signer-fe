"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SignupForm } from "../../components/signup-form";

export default function SignUp() {
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      // Redirect to dashboard if user is already logged in
      router.push("/dashboard");
    }
  }, [router]);

  return <SignupForm />;
}
