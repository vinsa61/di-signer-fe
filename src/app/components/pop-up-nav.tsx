import Image from "next/image";
import Link from "next/link";

interface PopUpNavProps {
  isNavVisible: boolean;
  toggleNav: () => void;
}

export default function PopUpNav({ isNavVisible, toggleNav }: PopUpNavProps) {
  if (!isNavVisible) return null;

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
        <div className="w-full border-y border-gray-900 py-3 px-4"><Link href="/" onClick={toggleNav}>Home</Link></div>
        <div className="w-full border-y border-gray-900 py-3 px-4"><Link href="/#about" onClick={toggleNav}>About</Link></div>
        <div className="w-full border-y border-gray-900 py-3 px-4"><Link href="/dashboard" onClick={toggleNav}>Dashboard</Link></div>
        <div className="w-full border-y border-gray-900 py-3 px-4"><Link href="/upload" onClick={toggleNav}>Upload File</Link></div>
      </div>
    </div>
  );
}
