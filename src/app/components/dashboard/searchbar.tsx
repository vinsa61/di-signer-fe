import React from "react";
import Image from "next/image";
import SearchLogo from "../../../../public/images/portofolio/search.svg";
import CloseLogo from "../../../../public/images/portofolio/close.svg";

export default function SearchBar({
  onSearch,
  onReset,
  searchQuery,
}: {
  onSearch: (query: string) => void;
  onReset: () => void;
  searchQuery: string;
}) {
  return (
    <div className="w-48 sm:w-56 md:w-64 lg:w-80 h-10 p-2 mb-4 flex items-center gap-2 focus-within:border-[#DDD] border transition-all duration-300">
      <Image src={SearchLogo} alt="Search" />
      <input
        className="w-full focus:outline-none bg-black"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
      ></input>
      <Image
        src={CloseLogo}
        alt="Close"
        onClick={onReset}
        className="hover:brightness-[0.6] active:brightness-150 w-4"
      />
    </div>
  );
}
