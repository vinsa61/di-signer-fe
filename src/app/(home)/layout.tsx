"use client";
import { useState } from "react";
// import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
import Navbar from "../components/nav";
import PopUpNav from "../components/pop-up-nav";
import Video from "../components/video";

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

  return (
    <html lang="en">
      <head>
        <title>Diner</title>
        <link rel="icon" href="/d-logo-white.svg" type="image/x-icon" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} ${spaceMonoBold.variable} antialiased bg-black dark`}
      >
        <div className="h-screen overflow-hidden font-[family-name:var(--space-mono)]">
          <Navbar
            username={userData ? userData.username : null}
            toggleNav={toggleNav}
          />
          <PopUpNav
            username={userData ? userData.username : ""}
            isNavVisible={isNavVisible}
            toggleNav={toggleNav}
          />
          <Video />
        </div>
        {children}
      </body>
    </html>
  );
}
