"use client";

import { ColumnDef } from "@tanstack/react-table";

export type Request = {
  id: string;
  time: string;
  status: "Unresolved" | "Accepted" | "Denied";
  receiver: string;
};

export type Inbox = {
  id: string;
  status: "Unresolved" | "Accepted" | "Denied";
  sender: string;
  message: string;
  time: string;
};

export const columns1: ColumnDef<Request>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
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
        {row.original.status === "Unresolved" ? (
          <>
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
          </>
        ) : (
          <span className="text-gray-500 italic">No actions available</span>
        )}
      </div>
    ),
  },
];

export const columns2: ColumnDef<Inbox>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
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
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex gap-3">
        {row.original.status === "Accepted" ? (
          <button
            onClick={() => handleDownload(row.original.id)}
            className="py-1 px-3 border border-white bg-black"
          >
            Download
          </button>
        ) : (
          <span className="text-gray-500 italic">No actions available</span>
        )}
      </div>
    ),
  },
];

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const handleAccept = (id: string) => {
  console.log("Accepted request with id:", id);

  try {
    fetch(`${backendUrl}/api/generate/signed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("File signed successfully");
      })
      .catch((error) => {
        console.error("Error signing file:", error);
        alert(error);
      })
      .finally(() => {
        // setUploading(false);
      });
  } catch (error) {
    console.log(error);
    alert(error);
  }
};

const handleDeny = (id: string) => {
  console.log("Denied request with id:", id);

  try {
    fetch(`${backendUrl}/api/generate/deny`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => response.json())
      .then((data) => {
        alert("Request denied successfully");
      })
      .catch((error) => {
        console.error("Error denying file:", error);
        alert(error);
      });
  } catch (error) {
    console.log(error);
    alert(error);
  }
};

const handleDownload = async (id: string) => {
  console.log("Downloading request with id:", id);

  try {
    const response = await fetch(`${backendUrl}/api/generate/download/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      alert(`Error: ${error.message}`);
      console.error("Download failed:", error);
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    alert("File should be downloading shortly!");
  } catch (error) {
    console.error("Error downloading file:", error);
    alert(`Failed to download requested file: ${error}`);
  }
};
