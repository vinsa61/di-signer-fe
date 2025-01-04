"use client";

import React, { useState } from "react";
import Image from "next/image";
import FilterLogo from "../../../../public/images/portofolio/filter.svg";

type FilterStatus = "Unresolved" | "Accepted" | "Denied";

export default function FilterButton({
  onFilterApply,
}: {
  onFilterApply: (filters: FilterStatus[]) => void;
}) {
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<FilterStatus[]>([]);
  
    // Toggle the dropdown visibility
    const toggleDropdown = () => {
      setIsDropdownVisible(!isDropdownVisible);
    };
  
    // Handle checkbox changes for filters
    const handleCheckboxChange = (status: FilterStatus) => {
      setSelectedFilters((prevFilters) =>
        prevFilters.includes(status)
          ? prevFilters.filter((filter) => filter !== status)
          : [...prevFilters, status]
      );
    };
  
    // Apply selected filters
    const applyFilters = () => {
      onFilterApply(selectedFilters);
      setIsDropdownVisible(false); // Close the dropdown after applying filters
    };
    
  return (
    <div className="relative">
      <button className="flex items-center justify-center bg-[#EDEDED] hover:bg-gray-500 p-1.5 w-12 h-8 rounded-2xl" onClick={toggleDropdown}>
        <Image
          src={FilterLogo}
          alt="Filter"
          width={20}
          height={20}
          className="object-contain"
        />
      </button>
      {/* Modal for Filter Selection */}
      {isDropdownVisible && (
        <div className="absolute top-10 right-0 bg-black border rounded-lg shadow-lg p-3 w-40 z-50">
          <div className="flex flex-col space-y-2">
            {["Unresolved", "Accepted", "Denied"].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.includes(status as FilterStatus)}
                  onChange={() => handleCheckboxChange(status as FilterStatus)}
                  className="mr-2 hidden peer"
                />
                <span className="w-4 h-4 border-2 border-gray-400 rounded-md peer-checked:bg-white peer-checked:border-white mr-2"></span>
                <span>{status}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-sm">
            <button
              className="px-2 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
              onClick={applyFilters}
            >
              Apply
            </button>
            <button
              className="px-2 py-2 bg-black text-white rounded-lg hover:bg-gray-900"
              onClick={() => setIsDropdownVisible(false)} // Close dropdown on cancel
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
