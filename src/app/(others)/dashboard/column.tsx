"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Request = {
  id: string;
  time: string;
  status: "pending" | "processing" | "success" | "failed";
  receiver: string;
};

export type Inbox = {
  id: string;
  status: "pending" | "processing" | "success" | "failed";
  sender: string;
  message: string;
  time: string;
}

export const columns1: ColumnDef<Request>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "senderUsername",
    header: "Sender",
  },
  {
    accessorKey: "content",
    header: "Message",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex gap-3">
        <button 
          onClick={() => handleAccept(row.original.id)} 
          className="py-1 px-3 border border-white bg-black"
        >
          Accept
        </button>
        <button 
          onClick={() => handleDeny(row.original.id)} 
          className="py-1 px-3 border border-white bg-black"
        >
          Deny
        </button>
      </div>
    ),
  },
];

export const columns2: ColumnDef<Inbox>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "receiverUsername",
    header: "Receiver",
  },
  {
    accessorKey: "content",
    header: "Message",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
];

const handleAccept = (id: string) => {
  console.log("Accepted request with id:", id);
  // Add your accept logic here
};

const handleDeny = (id: string) => {
  console.log("Denied request with id:", id);
  // Add your deny logic here
};
