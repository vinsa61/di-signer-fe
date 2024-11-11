import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export default function Navbar() {
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
          Blank
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
        <DropdownMenuItem><Link href="/profile">Profile</Link></DropdownMenuItem>
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
