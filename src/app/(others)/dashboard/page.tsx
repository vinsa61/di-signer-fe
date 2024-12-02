"use client";

import { useEffect, useState } from "react";
import { Request, Inbox, columns1, columns2 } from "./column";
import { DataTable } from "./data-table";
import Image from "next/image";

// Mock function to fetch Request data
async function getRequestData(): Promise<Request[]> {
  return [
    {
      id: "728ed52f",
      time: "20:10",
      status: "pending",
      receiver: "m@example.com",
    },
    {
      id: "728ed52f",
      time: "20:10",
      status: "pending",
      receiver: "m@example.com",
    },
    {
      id: "728ed52f",
      time: "20:10",
      status: "pending",
      receiver: "m@example.com",
    },
  ];
}

// Mock function to fetch Inbox data
async function getInboxData(): Promise<Inbox[]> {
  return [
    {
      id: "728ed52f",
      status: "pending",
      sender: "test",
      message: "Hello",
      time: "20:10",
    },
    {
      id: "728ed52f",
      status: "pending",
      sender: "test",
      message: "Hello",
      time: "20:10",
    },
    {
      id: "728ed52f",
      status: "pending",
      sender: "test",
      message: "Hello",
      time: "20:10",
    },
  ];
}

export default function Dashboard() {
  const [activeTable, setActiveTable] = useState<"first" | "second">("first");
  const [data1, setData1] = useState<Request[]>([]);
  const [data2, setData2] = useState<Inbox[]>([]); // Correctly define state for Inbox data

  useEffect(() => {
    const fetchData = async () => {
      const requestData = await getRequestData(); // Fetch Request data
      setData1(requestData);
      const inboxData = await getInboxData(); // Fetch Inbox data
      setData2(inboxData);
    };
    fetchData();
  }, []);

  return (
    <div className="container md:w-[98%] w-[92%] mx-auto py-10">
      <div className="flex gap-2 mb-4">
        <button
          className={`flex items-center justify-center ${
            activeTable === "first" ? "bg-gray-700" : "bg-[#EDEDED]"
          } hover:bg-gray-500 p-1.5 w-12 rounded-2xl`}
          onClick={() => setActiveTable("first")} // Set to show the first table
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
          onClick={() => setActiveTable("second")} // Set to show the second table
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
        <DataTable columns={columns1} data={data1} />
      ) : (
        <DataTable columns={columns2} data={data2} />
      )}
    </div>
  );
}
