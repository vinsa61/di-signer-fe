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
import { useState, useEffect } from "react";

export default function Navbar({ username }: { username: string }) {
  const router = useRouter();
  console.log("Username in Navbar:", username);  // Check what is being passed to Navbar

  // Logout function
  const handleLogout = () => {
    // Remove the JWT token from localStorage
    localStorage.removeItem("jwtToken"); // Ensure your JWT token key matches your setup
    
    // Redirect to login page
    router.push("/login");
  
  };
  interface UserData {
    message: string;
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
  }

  const [userData, setUserData] = useState<UserData | null>(null);

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
    <nav className="z-30 bg-black md:w-[98%] w-[92%] mx-auto mt-4 border border-gray-700 border-[0.5] h-[70px] font-[family-name:var(--font-geist-sans)]">
      <div className="flex items-center h-full md:justify-between px-4 md:px-10 justify-around">
        <div className="flex h-full items-center">
          <Link href="/">
            <Image
              src="/logo-white.svg"
              alt="Di-Signer Logo"
              width={125}
              height={50}
              className="object-contain max-w-full h-auto"
            />
          </Link>
        </div>
        <div className="flex">
          <Link
            className="text-white flex items-center justify-center h-full px-4"
            href="/dashboard"
          >
            Dashboard
          </Link>
        </div>
        <div className="flex">

          {/* <Dropdown /> */}
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
        <DropdownMenuItem><Link href="/user">Profile</Link></DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
