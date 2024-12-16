"use client";

import { useState, useRef, useEffect } from "react";
import "@react-pdf-viewer/core/lib/styles/index.css";
import {
  Worker,
  Viewer,
  SpecialZoomLevel,
  PageChangeEvent,
} from "@react-pdf-viewer/core";
import { useForm, FormProvider } from "react-hook-form";
import toast from "react-hot-toast";

type SignUpRequest = {
  recipient: string;
  topic: string;
  x: string;
  y: string;
  document: FileList | null;
};

export default function Request() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [selection, setSelection] = useState<{
    [pageNumber: number]: {
      x: number;
      y: number;
      w: number;
      height: number;
    };
  } | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isMdScreen, setIsMdScreen] = useState(false);
  const animationFrameId = useRef<number | null>(null);
  const methods = useForm<SignUpRequest>({ mode: "onChange" });
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [clickedPageIndex, setClickedPageIndex] = useState<number>(0);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const handleResize = () => {
      setIsMdScreen(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (searchTerm) {
        setLoading(true);
        fetch(`${backendUrl}/api/search/users?inputUsername=${searchTerm}`)
          .then((res) => res.json())
          .then((data) => {
            setResults(data.users || []);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceSearch);
  }, [searchTerm]);

  const handleUsernameClick = (username: string) => {
    setSearchTerm("");
    setSelectedUsername(username);
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputClick = () => {
    if (searchTerm) {
      setDropdownOpen(true);
    }
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setSelectedUsername("");
    setDropdownOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        setFileUrl(URL.createObjectURL(file));
        console.log(`huh ${fileUrl}`);
      } else {
        toast.error("Upload a valid PDF file.");
      }
    }
  };

  const handleSelection = (newSelection: {
    x: number;
    y: number;
    w: number;
    height: number;
  }) => {
    // Clear previous selection for the current page and set the new selection
    setSelection((prevSelection) => ({
      ...prevSelection,
      [pageIndex]: newSelection, // Update the selection for the current page
    }));
  };

  const handleUploadClick = (selection: {
    x: number;
    y: number;
    w: number;
    height: number;
  }) => {
    if (selectedFile && selection) {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("User is not logged in.");
        return;
      }

      const page = document.getElementById("preview-page");
      if (!page) return;

      const rect = page.getBoundingClientRect();

      const scaleX = 595 / rect.width;
      const scaleY = 842 / rect.height;

      const scaledX = selection.x * scaleX;
      const scaledY = selection.y * scaleY;
      const scaledW = selection.w * scaleX;
      const scaledH = selection.height * scaleY;
      console.log(`${scaledX} ${scaledY} ${scaledW} ${scaledH}`);

      setUploading(true);
      const formData = new FormData();
      formData.append("pdf", selectedFile);

      fetch(`${backendUrl}/api/upload/document`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token} ${selectedUsername} ${scaledX} ${scaledY} ${scaledW} ${scaledH} ${pageIndex}`,
          Message: topic,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // toast.success("File uploaded successfully!");
          window.location.href = "/dashboard?requestSuccess=true";
          setFileUrl(data.fileUrl);
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          toast.error(error);
        })
        .finally(() => {
          setUploading(false);
        });
    } else {
      toast.error("No file selected.");
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };
  const handleRemoveSelection = () => {
    setSelection(null);
    console.log("WOI");
  };
  const handleMouseDown = (e: React.MouseEvent, pageIndex: number) => {
    // document.body.style.userSelect = "none";
    // console.log(e.currentTarget);
    // if(e.currentTarget.id === "x-button") {
    //   handleRemoveSelection();
    //   return;
    // }
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPageIndex(pageIndex);
    setStartPoint({ x, y });

    setClickedPageIndex(pageIndex);

    console.log("Page Index:", pageIndex, "Coordinates:", { x, y });
  };

  const handleMouseMove = (e: React.MouseEvent, pageIndex: number) => {
    if (startPoint) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      if (clickedPageIndex === pageIndex) {
        animationFrameId.current = requestAnimationFrame(() => {
          setPageIndex(pageIndex);
          console.log(pageIndex);
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const currentX = e.clientX - rect.left;
          let currentY = e.clientY - rect.top;

          const w = currentX - startPoint.x;
          const height = currentY - startPoint.y;

          handleSelection({
            x: startPoint.x,
            y: startPoint.y,
            w,
            height,
          });
        });
      }
    }
  };

  const handleMouseUp = () => {
    document.body.style.userSelect = "";
    setStartPoint(null);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  };

  const [width, setWidth] = useState(60);
  const [height, setHeight] = useState(35);

  const handlePageClick = (e: React.MouseEvent, pageIndex: number) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Reset the selection for all pages except the current one
    setSelection((prevSelection) => ({
      [pageIndex]: { x, y, w: width, height: height },
    }));
  };
  // const handlePageChange = (e: PageChangeEvent) => {
  //   setPageIndex(e.currentPage);
  //   console.log("Current Page Index:", e.currentPage);
  // };

  const renderPage = (props: any) => {
    const { pageIndex } = props;

    const currentSelection = selection ? selection[pageIndex] : null;
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
          cursor: isMdScreen ? "crosshair" : "default",
          zIndex: 100,
        }}
        onMouseDown={
          isMdScreen ? (e) => handleMouseDown(e, pageIndex) : undefined
        }
        onMouseMove={
          isMdScreen ? (e) => handleMouseMove(e, pageIndex) : undefined
        }
        onMouseUp={isMdScreen ? handleMouseUp : undefined}
        onClick={!isMdScreen ? (e) => handlePageClick(e, pageIndex) : undefined}
      >
        {props.canvasLayer.children}
        {props.textLayer.children}
        {props.annotationLayer.children}
        {isMdScreen && selection && selection[pageIndex] && (
          <div
            style={{
              position: "absolute",
              left: `${selection[pageIndex].x}px`,
              top: `${selection[pageIndex].y}px`,
              width: `${selection[pageIndex].w}px`,
              height: `${selection[pageIndex].height}px`,
              border: "2px solid red",
            }}
          >
            {/* X button */}
            <button
              style={{
                position: "absolute",
                top: "0",
                right: "0",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                cursor: "pointer",
              }}
              onClick={handleRemoveSelection}
              className="hover:bg-black z-50"
            >
              X
            </button>
          </div>
        )}
        {!isMdScreen && selection && selection[pageIndex] && (
          <div
            style={{
              position: "absolute",
              left: selection[pageIndex].x,
              top: selection[pageIndex].y,
              width: selection[pageIndex].w,
              height: selection[pageIndex].height,
              border: "2px groove black",
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              pointerEvents: "none",
            }}
          />
        )}
        <button
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            cursor: "pointer",
          }}
          onClick={handleRemoveSelection}
        >
          X
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-auto md:h-[85vh] text-white w-[92%] md:w-[98%] mx-auto">
      <FormProvider {...methods}>
        <form className="w-full md:w-1/2 p-8 flex flex-col items-start border-x border-b border-gray-700">
          <h2 className="text-2xl md:text-3xl mb-6">Upload PDF</h2>
          {/* Search input */}
          <h2 className="text-base md:text-lg mb-2">Destination Username</h2>
          <div className="relative w-full mb-6">
            <input
              type="text"
              placeholder="Search for users..."
              value={selectedUsername || searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleInputClick();
              }}
              onFocus={() => {
                if (selectedUsername) {
                  setSearchTerm(selectedUsername);
                }
              }}
              onInput={() => {
                if (selectedUsername && searchTerm !== selectedUsername) {
                  setSelectedUsername("");
                }
              }}
              className="search-input text-black pl-4 pr-4 w-full border border-gray-300 rounded-md h-10"
            />
            {/* Search results dropdown */}
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearInput}
                className="absolute text-lg top-2 right-2 text-gray-600"
              >
                ×
              </button>
            )}
            {dropdownOpen && searchTerm && (
              <div
                ref={dropdownRef}
                className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {loading ? (
                  <div className="p-4 text-gray-500">Loading...</div>
                ) : (
                  <ul>
                    {results.length > 0 ? (
                      results.map((user) => (
                        <li
                          key={user._id}
                          className="p-2 hover:bg-gray-100 cursor-pointer text-black"
                          onClick={() => handleUsernameClick(user.username)}
                        >
                          {user.username}
                        </li>
                      ))
                    ) : (
                      <div className="p-4 text-gray-500">No users found</div>
                    )}
                  </ul>
                )}
              </div>
            )}
          </div>
          <h2 className="text-base md:text-lg mb-2">Topic</h2>
          <input
            type="text"
            placeholder="Your Topic..."
            className="search-input text-black pl-4 pr-4 w-full border border-gray-300 rounded-md h-10 mb-6"
            onChange={(e) => {
              setTopic(e.target.value);
            }}
          />
          <h2 className="text-base md:text-lg mb-2">Upload File</h2>
          <div
            className="border-2 border-gray-700 p-8 mb-4 w-full flex justify-center items-center bg-gray-800 cursor-pointer hover:bg-gray-700"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              id="fileInput"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="fileInput"
              className="text-base md:text-lg font-medium text-gray-400"
            >
              Drag and drop PDF here or click to upload
            </label>
          </div>
          {selectedFile && (
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-sm md:text-base">
                Selected File: {selectedFile.name}
              </p>
            </div>
          )}
          <div className="mt-4 text-gray-700">
            <h1>
              Selected Coordinates: X:{" "}
              {selection && selection[pageIndex]
                ? selection[pageIndex].x.toFixed(2)
                : 0}
              , Y:{" "}
              {selection && selection[pageIndex]
                ? selection[pageIndex].y.toFixed(2)
                : 0}
              ,{" "}
              {isMdScreen && (
                <>
                  Width:{" "}
                  {selection && selection[pageIndex]
                    ? selection[pageIndex].w.toFixed(2)
                    : 0}
                </>
              )}
            </h1>
          </div>
          <p>Clicked Page: {pageIndex + 1}</p> {/* Convert to 1-based index */}
          {/* {startPoint && (
              <p>Click Position: {`x: ${startPoint.x}, y: ${startPoint.y}`}</p>
            )} */}
          <div
            className="w-full md:hidden h-[45vh] bg-gray-100 mt-6 p-4 border-3 border-primary border-dashed rounded-lg overflow-auto"
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            {fileUrl ? (
              <Worker
                workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}
              >
                <Viewer
                  key={fileUrl}
                  fileUrl={fileUrl}
                  defaultScale={SpecialZoomLevel.PageFit}
                  renderPage={renderPage}
                  // onPageChange={handlePageChange}
                />
                <p>Current Page: {pageIndex + 1}</p>
              </Worker>
            ) : (
              <p className="text-center text-gray-500 text-sm md:text-base">
                File not uploaded
              </p>
            )}
          </div>
          <button
            onClick={() => selection && handleUploadClick(selection[pageIndex])}
            disabled={
              !selectedFile ||
              !selectedUsername ||
              !topic ||
              !selection ||
              uploading
            }
            className="mt-4 px-4 py-2 bg-black text-[#EDEDED] border border-white transition disabled:bg-gray-600"
          >
            {uploading ? "Uploading..." : "Send Request"}
          </button>
        </form>
      </FormProvider>
      <div
        className="w-1/2 max-md:hidden max-md:h-full bg-gray-900 h-[85vh] p-4 border-3 border-primary border-dashed rounded-lg overflow-auto"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        {fileUrl ? (
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}
          >
            <Viewer
              fileUrl={fileUrl}
              defaultScale={SpecialZoomLevel.PageFit}
              renderPage={renderPage}
              // onPageChange={handlePageChange}
            />
          </Worker>
        ) : (
          <p className="text-center text-gray-500">File not uploaded</p>
        )}
      </div>
    </div>
  );
}
