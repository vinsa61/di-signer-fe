"use client";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../components/nav";
import PopUpNav from "../components/pop-up-nav";
import ToasterCustom from "@/app/components/toaster-custom";

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

  const [isNavVisible, setIsNavVisible] = useState(false);
  const toggleNav = () => {
    setIsNavVisible((prev) => !prev);
    if (!isNavVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  };

  const [userData, setUserData] = useState<UserData | null>(null);

  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("token");

      fetch(`${backendUrl}/api/data/dashboard`, {
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
      <head>
        <title>Diner</title>
        <link rel="icon" href="/d-logo-white.svg" type="image/x-icon" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} ${spaceMonoBold.variable} antialiased bg-black dark font-[family-name:var(--space-mono)]`}
      >
        <ToasterCustom />
        <Navbar
          username={userData ? userData.username : ""}
          toggleNav={toggleNav}
        />
        <PopUpNav
          username={userData ? userData.username : ""}
          isNavVisible={isNavVisible}
          toggleNav={toggleNav}
        />
        {children}
      </body>
    </html>
  );
}
