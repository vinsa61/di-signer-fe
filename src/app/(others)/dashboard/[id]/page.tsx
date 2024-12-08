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

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isSender, setIsSender] = useState(0);

  const [scaledX, setScaledX] = useState(0);
  const [scaledY, setScaledY] = useState(0);
  const [scaledW, setScaledW] = useState(0);
  const [scaledH, setScaledH] = useState(50);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // let isSender = 0;
  let isAccepted = "";

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${backendUrl}/1/api/search/mail-data`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token} ${pathId}`,
          },
        });

        if (!response.ok) throw new Error(`Failed to fetch data ${pathId}`);

        const result = await response.json();

        setData(result.data);

        if (result.data.file) {
          const pdfFile = `data:application/pdf;base64,${result.data.file}`;

          setFileUrl(pdfFile);
        }

        console.log(result.data);

        setIsSender(result.data.isSender);
        // isAccepted = data?.Status === "Accepted";

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [pathId]);

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
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
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
      </div>
    </section>
  );
}
