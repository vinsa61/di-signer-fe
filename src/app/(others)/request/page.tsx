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
    [pageNumber: number]: Array<{
      x: number;
      y: number;
      w: number;
      height: number;
    }>;
  }>({});

  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isMdScreen, setIsMdScreen] = useState(false);
  const animationFrameId = useRef<number | null>(null);
  const methods = useForm<SignUpRequest>({ mode: "onChange" });
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [clickedPageIndex, setClickedPageIndex] = useState<number>(0);
  const [currentSelection, setCurrentSelection] = useState<{
    x: number;
    y: number;
    w: number;
    height: number;
  } | null>(null);

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
    setSelection((prevSelection) => {
      const pageSelections = prevSelection[pageIndex] || []; // Retrieve existing selections for the page or default to an empty array
      return {
        ...prevSelection,
        [pageIndex]: [...pageSelections, newSelection], // Add the new selection to the array for the page
      };
    });
  };

  const handleUploadClick = () => {
    if (selectedFile && selection) {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("User is not logged in.");
        return;
      }

      setUploading(true);

      const page = document.getElementById("preview-page");
      if (!page) return;

      const rect = page.getBoundingClientRect();

      const scaleX = 595 / rect.width;
      const scaleY = 842 / rect.height;

      const scaledSelections = Object.entries(selection).map(
        ([pageIndex, boxes]) => ({
          pageIndex: Number(pageIndex),
          boxes: boxes.map((box) => ({
            x: box.x * scaleX,
            y: box.y * scaleY,
            w: box.w * scaleX,
            h: box.height * scaleY,
          })),
        })
      );

      const formData = new FormData();
      formData.append("pdf", selectedFile);
      formData.append(
        "metadata",
        JSON.stringify({
          username: selectedUsername,
          topic,
          scaledSelections, // Add all scaled boxes
          originalDimensions: {
            width: rect.width,
            height: rect.height,
          },
        })
      );

      fetch(`${backendUrl}/api/upload/document`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to upload document.");
          }
          return response.json();
        })
        .then((data) => {
          toast.success("File uploaded successfully!");
          setFileUrl(data.fileUrl);
          window.location.href = "/dashboard?requestSuccess=true";
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          toast.error("Failed to upload file.");
        })
        .finally(() => {
          setUploading(false);
        });
    } else {
      toast.error("No file selected or no selections made.");
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
  const handleRemoveSelection = (
    event: React.MouseEvent,
    pageIndex: number,
    index: number
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setSelection((prevSelection) => {
      const pageSelections = prevSelection[pageIndex] || [];
      const updatedSelections = pageSelections.filter((_, i) => i !== index);

      // If no selections remain on the page, remove the key entirely.
      if (updatedSelections.length === 0) {
        const { [pageIndex]: _, ...rest } = prevSelection;
        return rest;
      }

      return {
        ...prevSelection,
        [pageIndex]: updatedSelections,
      };
    });
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    page: HTMLElement,
    pageIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = page.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPoint({ x, y });
    setPageIndex(pageIndex);
    setClickedPageIndex(pageIndex);
  };

  const handleMouseMove = (
    e: React.MouseEvent,
    page: HTMLElement,
    pageIndex: number
  ) => {
    if (startPoint && clickedPageIndex === pageIndex) {
      const rect = page.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const x = Math.min(startPoint.x, currentX);
      const y = Math.min(startPoint.y, currentY);
      const w = Math.abs(currentX - startPoint.x);
      const height = Math.abs(currentY - startPoint.y);

      if (w > 0 && height > 0) {
        setCurrentSelection({ x, y, w, height });
      }
    }
  };

  const handleMouseUp = () => {
    if (currentSelection) {
      setSelection((prevSelection) => {
        const pageSelections = prevSelection[pageIndex] || [];
        return {
          ...prevSelection,
          [pageIndex]: [...pageSelections, currentSelection],
        };
      });
    }

    setCurrentSelection(null);
    setStartPoint(null);

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  };

  const [width, setWidth] = useState(60);
  const [height, setHeight] = useState(35);

  const handlePageClick = (
    e: React.MouseEvent,
    page: HTMLElement,
    pageIndex: number
  ) => {
    const rect = page.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log("Page Index:", pageIndex, "Coordinates:", { x, y });

    setSelection((prevSelection) => {
      const pageSelections = prevSelection[pageIndex] || [];
      const newSelection = { x, y, w: width, height: height };

      return {
        ...prevSelection,
        [pageIndex]: [...pageSelections, newSelection],
      };
    });
  };

  const renderPage = (props: any) => {
    const { pageIndex } = props;
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
          isMdScreen
            ? (e) => handleMouseDown(e, e.currentTarget, pageIndex)
            : undefined
        }
        onMouseMove={
          isMdScreen
            ? (e) => handleMouseMove(e, e.currentTarget, pageIndex)
            : undefined
        }
        onMouseUp={isMdScreen ? handleMouseUp : undefined}
        onClick={
          !isMdScreen
            ? (e) => handlePageClick(e, e.currentTarget, pageIndex)
            : undefined
        }
      >
        {props.canvasLayer.children}
        {props.textLayer.children}
        {props.annotationLayer.children}
        {isMdScreen && (
          <>
            {selection[pageIndex]?.map((sel, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: `${sel.x}px`,
                  top: `${sel.y}px`,
                  width: `${sel.w}px`,
                  height: `${sel.height}px`,
                  border: "2px groove black",
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                }}
              >
                <button
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    background: "black",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                  }}
                  onClick={(e) => handleRemoveSelection(e, pageIndex, index)}
                  className="hover:bg-black z-50 flex items-center justify-center text-sm"
                >
                  <span>×</span>
                </button>
              </div>
            ))}
            {currentSelection &&
              currentSelection.w > 0 &&
              currentSelection.height > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${currentSelection.x}px`,
                    top: `${currentSelection.y}px`,
                    width: `${currentSelection.w}px`,
                    height: `${currentSelection.height}px`,
                    border: "2px groove black",
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                  }}
                ></div>
              )}
          </>
        )}

        {!isMdScreen && (
          <>
            {selection[pageIndex]?.map((sel, index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: `${sel.x}px`,
                  top: `${sel.y}px`,
                  width: `${sel.w}px`,
                  height: `${sel.height}px`,
                  border: "2px groove black",
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                }}
              ></div>
            ))}
            {currentSelection &&
              currentSelection.w > 0 &&
              currentSelection.height > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: `${currentSelection.x}px`,
                    top: `${currentSelection.y}px`,
                    width: `${currentSelection.w}px`,
                    height: `${currentSelection.height}px`,
                    border: "2px groove black",
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                  }}
                ></div>
              )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-auto md:h-[85vh] text-white w-[92%] md:w-[98%] mx-auto">
      <FormProvider {...methods}>
        <form className="w-full md:w-1/2 p-8 flex flex-col items-start border-x border-b border-gray-700 overflow-auto">
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
          <div
            className={`w-full h-auto mt-4 text-gray-200 ${
              isMdScreen ? "text-lg" : "text-sm"
            }`}
          >
            <h1 className="text-base">All Selected Coordinates:</h1>
            {selection && Object.keys(selection).length > 0 ? (
              <ul>
                {Object.entries(selection).map(([page, selections]) => (
                  <li key={page} className="mb-4">
                    <h2 className="font-bold">Page {Number(page) + 1}:</h2>
                    {selections.length > 0 ? (
                      <ul className="ml-4">
                        {selections.map((sel, index) => (
                          <li key={index}>
                            <span>
                              Box {index + 1}: X: {sel.x.toFixed(2)}, Y:{" "}
                              {sel.y.toFixed(2)}, Width: {sel.w.toFixed(2)},
                              Height: {sel.height.toFixed(2)}
                            </span>
                            <button
                              onClick={(e) =>
                                handleRemoveSelection(e, Number(page), index)
                              }
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No selections made on this page.</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No selections made on any page.</p>
            )}
          </div>
          <button
            onClick={() =>
              selection &&
              selection[pageIndex] &&
              handleUploadClick()
            }
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
              key={fileUrl}
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
