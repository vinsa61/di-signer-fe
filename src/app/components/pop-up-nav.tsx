"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PopUpNav({
  username,
  isNavVisible,
  toggleNav,
}: {
  username: string | null;
  isNavVisible: boolean;
  toggleNav: () => void;
}) {
  if (!isNavVisible) return null;
  const router = useRouter();

  // Logout function
  const handleLogout = () => {
    // Remove the JWT token from localStorage
    localStorage.removeItem("token");

    // Redirect to login page
    router.push("/login");
  };

  return (
    <div className="fixed z-50 flex items-center justify-center w-full h-full top-0 left-0 bg-black">
      <Image
        src="/logo-white.svg"
        alt="Di-Signer Logo"
        width={125}
        height={50}
        className="absolute top-10 left-4 w-24 h-auto"
      />
      <button
        className="absolute top-10 right-8 text-3xl h-auto filter-white"
        onClick={toggleNav}
      >
        ×
      </button>
      <div className="pt-8 h-3/4 w-full flex flex-col text-[#9a9a9a] text-base font-[family-name:var(--space-mono)]">
        <div className="w-full border-y border-gray-900 py-3 px-4">
          <Link href="/" onClick={toggleNav}>
            Home
          </Link>
        </div>
        <div className="w-full border-y border-gray-900 py-3 px-4">
          <Link href="/#about" onClick={toggleNav}>
            About
          </Link>
        </div>
        <div className="w-full border-y border-gray-900 py-3 px-4">
          <Link href="/dashboard" onClick={toggleNav}>
            Dashboard
          </Link>
        </div>
        <div className="w-full border-y border-gray-900 py-3 px-4">
          <Link href="/request" onClick={toggleNav}>
            Send Request
          </Link>
        </div>
        {username ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="text-white">
              <div className="flex w-full border-y border-gray-900 py-3 px-4">
                {username}
                <Image
                  src="/dropdown.svg"
                  width={20}
                  height={20}
                  className="filter-white"
                  alt="User"
                />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div>
            <div className="w-full border-y border-gray-900 py-3 px-4">
              <Link href="/login">Login</Link>
            </div>
            <div className="w-full border-y border-gray-900 py-3 px-4">
              <Link href="/register">Signup</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
