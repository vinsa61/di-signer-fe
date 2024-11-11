"use client";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import Navbar from "../components/nav";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const geistSans = localFont({
  src: "../fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "../fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const spaceMono = localFont({
  src: "../fonts/SpaceMono-Regular.woff",
  variable: "--space-mono",
  weight: "100 900",
});

const spaceMonoBold = localFont({
  src: [
    {
      path: "../fonts/SpaceMono-Bold.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--space-mono-bold",
  display: "swap", // Optional for better font rendering
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  interface UserData {
    message: string;
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  }

  const [userData, setUserData] = useState<UserData | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token");

      fetch("http://localhost:3001/api/data/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`, // Pass the token in the header
        },
      })
        .then((response) => {
          if (!response.ok) {
            router.push("/login");
            throw new Error("Unauthorized");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setUserData(data);
        })
        .catch((error) => {
          console.log(error);
          router.push("/login");
        });
    }
  }, [router]);

  return (
    <html lang="en">
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} ${spaceMonoBold.variable} antialiased bg-black dark`}
      >
        <Navbar username={userData ? userData.username : "Loading..."} />
        {children}
      </body>
    </html>
  );
}
