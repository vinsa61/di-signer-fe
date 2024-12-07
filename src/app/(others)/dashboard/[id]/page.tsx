"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";

export default function ShowDataPage() {
  const path = usePathname();
  const pathId = path.split("/").pop();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [scaledX, setScaledX] = useState(0);
  const [scaledY, setScaledY] = useState(0);
  const [scaledW, setScaledW] = useState(0);
  const [scaledH, setScaledH] = useState(50);

  const isSender = data?.IsSender;
  const isAccepted = data?.Status === "Accepted";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/sign/${pathId}`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        setData(result.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [backendUrl, pathId]);

  useEffect(() => {
    if (data?.Position) {
      const checkPageExists = () => {
        const page = document.getElementById("preview-page");
        if (page) {
          const { x, y, w } = data.Position;
          const rect = page.getBoundingClientRect();
          const scaleX = 595 / rect.width;
          const scaleY = 842 / rect.height;

          setScaledX(x / scaleX);
          setScaledY(y / scaleY);
          setScaledW(w / scaleX);
          setScaledH(50 / scaleY);
        }
      };

      const intervalId = setInterval(checkPageExists, 100);
      return () => clearInterval(intervalId);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const renderPage = (props: any) => (
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

      <div
        className={`${isSender && !isAccepted ? "flex" : "hidden"}`}
        style={{
          position: "absolute",
          left: scaledX,
          top: scaledY,
          width: scaledW,
          height: scaledH,
          border: "2px dashed blue",
          backgroundColor: "rgba(0, 0, 255, 0.1)",
          pointerEvents: "none",
        }}
      />
    </div>
  );

  return (
    <section className="p-6 pb-12 text-white">
      <div className="relative w-full h-full rounded-[15px] min-h-[64px] overflow-hidden">
        <div className="absolute z-10 top-4 left-6 max-md:top-2 max-md:left-3 max-md:mb-0">
          <span className="font-semibold text-white max-md:-pt-1">
            Detail Ajuan Tanda Tangan
          </span>
        </div>
      </div>
      <div className="w-full pt-[30px]">
        <div className="flex max-md:flex-col justify-between">
          <h1 className="font-bold text-xl">{data?.Topic || "No Topic"}</h1>
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
              {data?.Status || "Unknown"}
            </span>
          </div>
        </div>
        <p className="text-sm mt-3">
          {isSender ? "To: " : "From: "} {data?.Username} {"<"}
          {data?.Email}
          {">"}
        </p>
        <p className="text-md mt-[30px] max-w-full break-words">
          {data?.CoverLetter || "No additional details provided."}
        </p>
        <div className="flex items-center justify-between mt-8 gap-2 mb-4 lg:w-[75%] w-full 2xl:w-[50%]">
          <h1>File Preview</h1>
          <a
            href={data?.Document}
            download
            className={`${isAccepted ? "flex" : "hidden"}`}
            target="blank"
          >
            <button className="bg-black py-2 px-3">Download File</button>
          </a>
        </div>

        <div className="lg:w-[75%] w-full 2xl:w-[50%] max-md:h-[45vh] h-[80vh] bg-gray-100 p-4 border-2 border-gray-700 overflow-auto">
          {data?.Document ? (
            <Worker
              workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
            >
              <Viewer
                fileUrl={data.Document}
                defaultScale={SpecialZoomLevel.PageFit}
                renderPage={renderPage}
              />
            </Worker>
          ) : (
            <p className="text-center text-gray-500">No file available</p>
          )}
        </div>
      </div>
    </section>
  );
}
