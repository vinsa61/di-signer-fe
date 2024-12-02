"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar({
  username,
  toggleNav,
}: {
  username: string | null;
  toggleNav: () => void;
}) {
  const router = useRouter();

  // Logout function
  const handleLogout = () => {
    // Remove the JWT token from localStorage
    localStorage.removeItem("token");

    // Redirect to login page
    router.push("/login");
  };

  return (
    <nav className="z-30 bg-black md:w-[98%] w-[92%] mx-auto mt-4 border border-gray-700 border-[0.5] h-[70px] font-[family-name:var(--space-mono)]">
      <div className="flex items-center h-full justify-between md:justify-between lg:justify-between px-4 md:px-10 text-white md:text-sm lg:text-base">
        <div className="flex h-full items-center">
          <Link href="/">
            <Image
              src="/logo-white.svg"
              alt="Di-Signer Logo"
              width={125}
              height={50}
              className="object-contain w-24 max-w-full h-auto"
            />
          </Link>
        </div>
        <div className="hidden md:flex items-center justify-center gap-x-4 lg:gap-x-6">
          <Link href="/">Home</Link>
          <Link href="/#about">About</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/upload">Upload File</Link>
        </div>
        <div className="hidden md:flex">
          {username ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="text-white">
                <div className="flex">
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
                  <Link href="/user">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex space-x-2 items-center justify-center gap-x-2">
              <Link href="/login">Login</Link>
              <Link href="/signup">Signup</Link>
            </div>
          )}
        </div>
        <div className="flex md:hidden">
          <Image
            src="/hamburger-menu.svg"
            alt="hamburger"
            width={32}
            height={32}
            className="w-8 h-auto cursor-pointer filter-white"
            onClick={toggleNav}
          />
        </div>
      </div>
    </nav>
  );
}
