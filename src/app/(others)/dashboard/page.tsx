"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Request, Inbox, columns1, columns2 } from "./column";
import { DataTable } from "./data-table";
import Image from "next/image";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SearchBar from "@/app/components/dashboard/searchbar";
import FilterButton from "@/app/components/dashboard/filterbutton";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
async function getInboxData(): Promise<Request[]> {
  const token = localStorage.getItem("token");
  const data = await fetch(`${backendUrl}/api/search/mail`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!data.ok) {
    toast.error("Error in fetching request data");
    throw new Error("Failed to fetch Request data");
  }
  return data.json();
}

async function getRequestData(): Promise<Inbox[]> {
  const token = localStorage.getItem("token");
  const data = await fetch(`${backendUrl}/api/search/requests`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!data.ok) {
    toast.error("Error in fetching request data");
    throw new Error("Failed to fetch Request data");
  }
  return data.json();
}

const Dashboard = () => {
  const [activeTable, setActiveTable] = useState<"first" | "second">("first");
  const [data1, setData1] = useState<Request[]>([]);
  const [data2, setData2] = useState<Inbox[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const inboxData = await getInboxData();
      setData1(inboxData);
      const requestData = await getRequestData();
      setData2(requestData);
    };
    fetchData();
  }, []);

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/${id}`);
  };
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleSuccessMessage = (param: string, message: string) => {
      if (searchParams.get(param) === "true") {
        toast.success(message);
        const url = new URL(window.location.href);
        url.searchParams.delete(param);
        window.history.replaceState({}, document.title, url.toString());
      }
    };

    handleSuccessMessage("loginSuccess", "Welcome back!");
    handleSuccessMessage("registerSuccess", "Registration Successful!");
    handleSuccessMessage("requestSuccess", "Request Successful!");
    handleSuccessMessage("acceptSuccess", "Accept Successful!");
    handleSuccessMessage("denySuccess", "Deny Successful!");
  }, [searchParams]);

  const handleFilterApply = (filters: string[]) => {
    setSelectedFilters(filters);
  };

  const filteredData1 = data1.filter(
    (item) =>
      (item.id?.toLowerCase().includes(searchQuery) ||
        item.senderUsername?.toLowerCase().includes(searchQuery) ||
        item.content?.toLowerCase().includes(searchQuery)) &&
      (selectedFilters.length > 0 ? selectedFilters.includes(item.status) : true)
  );

  const filteredData2 = data2.filter(
    (item) =>
      (item.id?.toLowerCase().includes(searchQuery) ||
        item.receiverUsername?.toLowerCase().includes(searchQuery) ||
        item.content?.toLowerCase().includes(searchQuery)) &&
      (selectedFilters.length > 0 ? selectedFilters.includes(item.status) : true)
  );

  useEffect(() => {
    console.log("Data1: ", data1);
    console.log("Data2: ", data2);
  }, [data1, data2]);

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  const resetSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="container md:w-[98%] w-[92%] mx-auto py-10">
      <div className="flex gap-2 mb-4">
        <button
          className={`flex items-center justify-center ${
            activeTable === "first" ? "bg-gray-700" : "bg-[#EDEDED]"
          } hover:bg-gray-500 p-1.5 w-12 rounded-2xl`}
          onClick={() => setActiveTable("first")}
        >
          <Image
            src="/letter.svg"
            alt="Inbox"
            width={20}
            height={20}
            className={`object-contain ${
              activeTable === "first" ? "filter-white" : "filter-black"
            }`}
          />
        </button>
        <button
          className={`flex items-center justify-center ${
            activeTable === "second" ? "bg-gray-700" : "bg-[#EDEDED]"
          } hover:bg-gray-500 p-1.5 w-12 rounded-2xl`}
          onClick={() => setActiveTable("second")}
        >
          <Image
            src="/send.svg"
            alt="Send"
            width={20}
            height={20}
            className={`object-contain ${
              activeTable === "second" ? "filter-white" : "filter-black"
            }`}
          />
        </button>
      </div>
      <div className="flex w-full justify-between">
        <SearchBar
          onSearch={handleSearch}
          onReset={resetSearch}
          searchQuery={searchQuery}
        />
        <FilterButton onFilterApply={handleFilterApply} />
      </div>

      {activeTable === "first" ? (
        <DataTable
          columns={columns1}
          data={filteredData1}
          rowClickHandler={handleRowClick}
        />
      ) : (
        <DataTable
          columns={columns2}
          data={filteredData2}
          rowClickHandler={handleRowClick}
        />
      )}
    </div>
  );
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}
