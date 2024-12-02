"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

// export const metadata: Metadata = {
//   title: "Diner",
//   description: "Digital Signature Protocol",
// };

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
            // console.error("Failed to fetch user data");
            return null;
          }
          return response.json();
        })
        .then((data) => {
          if (data) {
            console.log(data);
            setUserData(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  const user_name = userData?.username || "Guest";
  // const user_name = userData;

  return (
    <html lang="en">
      <head></head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} ${spaceMonoBold.variable} antialiased bg-black dark`}
      >
        <div className="h-screen overflow-hidden font-[family-name:var(--space-mono)]">
        <Navbar
          username={userData ? userData.username : "Loading..."}
          toggleNav={toggleNav}
        />
        <PopUpNav isNavVisible={isNavVisible} toggleNav={toggleNav} />
          <Video />
        </div>
        {children}
      </body>
    </html>
  );
}
