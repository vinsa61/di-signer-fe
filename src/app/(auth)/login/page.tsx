"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "../../components/login-form";

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      // Redirect to dashboard if user is already logged in
      router.push("/dashboard");
    }
  }, [router]);

  return <LoginForm />;
}
