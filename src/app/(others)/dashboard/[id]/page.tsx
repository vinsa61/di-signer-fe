"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import toast from "react-hot-toast";
import { set } from "react-hook-form";

export default function ShowDataPage() {
  const path = usePathname();
  const pathId = path.split("/").pop();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isSender, setIsSender] = useState(0);
  const [selection, setSelection] = useState<{
    // [pageNumber: number]: {
    x: number;
    y: number;
    w: number;
    h: number;
    page: number;
    // };
  } | null>(null);

  const [scaledX, setScaledX] = useState(0);
  const [scaledY, setScaledY] = useState(0);
  const [scaledW, setScaledW] = useState(0);
  const [scaledH, setScaledH] = useState(50);
  const [isAccepted, setIsAccepted] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleDownload = async () => {
    console.log("Downloading request with id:", pathId);

    try {
      const response = await fetch(
        `${backendUrl}/api/generate/download-signed/${pathId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(`Error: ${error.message}`);
        console.error("Download failed:", error);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `signed-${pathId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("File should be downloading shortly!");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(`Failed to download requested file: ${error}`);
    }
  };

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${backendUrl}/api/search/mail-data`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token} ${pathId}`,
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error(`Failed to fetch data ${pathId}`);

        const result = await response.json();

        setData(result.data);

        if (result.data.x && result.data.y && result.data.w && result.data.h) {
          console.log(
            "Values:",
            result.data.x,
            result.data.y,
            result.data.w,
            result.data.h,
            result.data.page
          );
          setSelection(() => ({
            // [result.data.page]: {
            x: result.data.x,
            y: result.data.y,
            w: result.data.w,
            h: result.data.h,
            page: result.data.page,
            // },
          }));
          setScaledX(result.data.x);
          setScaledY(result.data.y);
          setScaledW(result.data.w);
          setScaledH(result.data.h);
        }

        if (result.data.file) {
          const pdfFile = `data:application/pdf;base64,${result.data.file}`;

          setFileUrl(pdfFile);
        }

        setIsSender(result.data.isSender);
        setIsAccepted(result.data.status);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [pathId]);

  useEffect(() => {
    const page = document.getElementById("preview-page");
    if (!page) {
      return;
    }
    const rect = page.getBoundingClientRect();
    const scaleX = 595 / rect.width;
    const scaleY = 842 / rect.height;
    console.log("Scale values:", scaleX, scaleY);
    if (selection) {
      setScaledX(scaledX / scaleX);
      setScaledY(scaledY / scaleY);
      setScaledW(scaledW / scaleX);
      setScaledH(scaledH / scaleY);
      console.log(
        "Scaled values:",
        scaledX,
        scaledY,
        scaledW,
        scaledH,
        selection.page
      );
    }
  }, [selection]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const renderPage = (props: any) => {
    console.log(scaledX, scaledY, scaledW, scaledH);
    return (
      <div
        id="preview-page"
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: "default",
          zIndex: 100,
        }}
      >
        {props.canvasLayer.children}
        {props.textLayer.children}
        {props.annotationLayer.children}
        <div
          className="flex left"
          style={{
            position: "absolute",
            left: `${scaledX}px`,
            top: `${scaledY}px`,
            width: `${scaledW}px`,
            height: `${scaledH}px`,
            border: "2px groove black",
            backgroundColor: "rgba(0, 0, 255, 0.1)",
            pointerEvents: "none",
          }}
        />
      </div>
    );
  };

  const handleBase64Download = async (base64Data: string, fileName: string) => {
    try {
      const byteCharacters = atob(base64Data.split(",")[1]);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("File is downloading...");
    } catch (error) {
      console.error("Error downloading the file:", error);
      toast.error("Failed to download the file.");
    }
  };

  return (
    <section className="p-6 pb-12 text-white">
      <div className="w-full h-full rounded-[15px] min-h-[64px] overflow-hidden">
        <div className="mt-8">
          <h2 className="text-white text-xl font-[family-name:var(--space-mono-bold)]">
            Detail Ajuan Tanda Tangan
          </h2>
        </div>
      </div>
      <div className="w-full pt-[30px]">
        <div className="flex max-md:flex-col justify-between">
          <h1 className="font-bold text-xl">{data?.content || "No Topic"}</h1>
          <div
            className={
              data?.Status === "Accepted"
                ? "text-green-500"
                : data?.Status === "Pending" || data?.Status === "Modified"
                ? "text-orange-500"
                : "text-red-500"
            }
          >
            <span className="text-sm font-medium">
              {data?.status || "Unknown"}
            </span>
          </div>
        </div>
        <p className="text-base mt-3">
          {isSender ? "To: " : "From: "} {data?.receiverUsername}
          {data?.senderEmail}
        </p>
        <div className="flex items-center justify-between mt-8 gap-2 mb-4 lg:w-[75%] w-full 2xl:w-[50%]">
          <h1>File Preview</h1>
        </div>

        <div className="lg:w-[75%] w-full 2xl:w-[50%] max-md:h-[45vh] h-[80vh] bg-gray-100 p-4 border-2 border-gray-700 overflow-auto">
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}
          >
            {fileUrl ? (
              <Viewer
                fileUrl={fileUrl}
                defaultScale={SpecialZoomLevel.PageFit}
                renderPage={renderPage}
              />
            ) : (
              <p className="text-center text-gray-500">No file available</p>
            )}
          </Worker>
        </div>
        <div className="lg:w-[75%] w-full 2xl:w-[50%] max-md:h-[45vh mt-7 flex justify-between">
          <a href={data?.Document} download className="flex" target="blank">
            <button
              onClick={() => {
                if (data?.file) {
                  const pdfFile = `data:application/pdf;base64,${data.file}`;
                  const fileName = `base-${data?.id}.pdf`;
                  handleBase64Download(pdfFile, fileName);
                } else {
                  toast.error("No file found to download.");
                }
              }}
              className="px-4 py-2 bg-black text-[#EDEDED] border border-white transition"
            >
              Download Base File
            </button>
          </a>
          {isAccepted === "Accepted" && (
            <a href="">
              <button
                onClick={() => handleDownload()}
                className="px-4 py-2 bg-black text-[#EDEDED] border border-white transition"
              >
                Download Signed File
              </button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
