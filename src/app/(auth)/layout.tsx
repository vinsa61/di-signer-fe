import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";
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

export const metadata: Metadata = {
  title: "Diner",
  description: "Digital Signature Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Diner</title>
        <link rel="icon" href="/d-logo-white.svg" type="image/x-icon" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} ${spaceMonoBold.variable} antialiased bg-black dark`}
      >
        <ToasterCustom />
        <div className="flex flex-col items-center justify-center min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
