"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Request, Inbox, columns1, columns2 } from "./column";
import { DataTable } from "./data-table";
import Image from "next/image";
import toast from "react-hot-toast";

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

// Mock function to fetch Inbox data
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

export default function Dashboard() {
  const [activeTable, setActiveTable] = useState<"first" | "second">("first");
  const [data1, setData1] = useState<Request[]>([]);
  const [data2, setData2] = useState<Inbox[]>([]);
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

      {activeTable === "first" ? (
        <DataTable
          columns={columns1}
          data={data1}
          rowClickHandler={handleRowClick}
        />
      ) : (
        <DataTable
          columns={columns2}
          data={data2}
          rowClickHandler={handleRowClick}
        />
      )}
    </div>
  );
}
