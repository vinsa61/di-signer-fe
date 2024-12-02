"use client";

import { useState, useRef, useEffect } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure the PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function UploadPDFPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false); // State for dropdown visibility
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Reference for the dropdown container

  useEffect(() => {
    const debounceSearch = setTimeout(() => {
      if (searchTerm) {
        setLoading(true);
        fetch(
          `http://localhost:3001/api/search/users?inputUsername=${searchTerm}`
        )
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
    setSearchTerm(username); // Set the clicked username to the input field
    setSelectedUsername(username); // Optionally save the selected username
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Type assertion to narrow the type of event.target to Node
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false); // Close the dropdown if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleInputClick = () => {
    if (searchTerm) {
      setDropdownOpen(true); // Open dropdown when the input is clicked and there is a search term
    }
  };
  const handleClearInput = () => {
    setSearchTerm(""); // Clear the search term
    setSelectedUsername(""); // Clear the selected username
    setDropdownOpen(false); // Close the dropdown
  };
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const adjustZoomToFit = () => {
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      const pdfPageWidth = 600; // Typical PDF width in points
      const pdfPageHeight = 800; // Typical PDF height in points

      const widthScale = containerWidth / pdfPageWidth - 100;
      const heightScale = containerHeight / pdfPageHeight;
      setScale(Math.min(widthScale, heightScale));
    };

    // Create a ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      adjustZoomToFit();
    });

    // Start observing the container for size changes
    resizeObserver.observe(container);

    // Cleanup on component unmount
    return () => resizeObserver.disconnect();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        alert("Upload a valid PDF file.");
      }
    }
  };

  const onLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("pdf", selectedFile);
      fetch("http://localhost:3001/api/upload/document", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          alert("File uploaded successfully!");
          const link = document.createElement("a");
          link.href = "/dashboard";
          link.click();
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          alert("Failed to upload file.");
        });
    } else {
      alert("No file selected.");
    }

    setUploading(false);
  };

  // Drag-and-drop handler
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="flex h-[85vh] text-white px-4">
      {/* Left Section: Form and File Upload */}
      <div className="w-1/2 p-8 flex flex-col items-start bg-gray-900 border-r border-gray-700">
        <h2 className="text-3xl mb-6">Upload PDF</h2>

        {/* Search input */}
        <h2 className="text-lg mb-2">Destination Username</h2>
        <div className="relative w-full mb-6">
          <input
            type="text"
            placeholder="Search for users..."
            value={selectedUsername || searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value); // Update search term
              handleInputClick(); // Handle input click to show dropdown
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
        <h2 className="text-lg mb-2">Topic</h2>
        <input
          type="text"
          placeholder="Your Topic..."
          className="search-input text-black pl-4 pr-4 w-full border border-gray-300 rounded-md h-10 mb-6"
        />
        <h2 className="text-lg mb-2">Upload File</h2>
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
            className="text-xl font-medium text-gray-400"
          >
            Drag and drop PDF here or click to upload
          </label>
        </div>

        {selectedFile && (
          <div className="mt-4 text-center">
            <p className="text-gray-400">Selected File: {selectedFile.name}</p>
          </div>
        )}

        <button
          onClick={handleUploadClick}
          disabled={!selectedFile || uploading}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded disabled:bg-gray-500"
        >
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>

      {/* Right Section: Canvas for PDF Preview */}
      <div
        ref={containerRef}
        className="overflow- w-1/2 bg-gray-800 m-7 p-4 border-l border-gray-700 flex items-center justify-center flex-col"
      >
        {selectedFile ? (
          <Document file={selectedFile} onLoadSuccess={onLoadSuccess}>
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        ) : (
          <p className="text-center text-gray-500">No PDF file selected</p>
        )}

        {/* Pagination Controls */}
        {selectedFile && numPages > 1 && (
          <div className="pagination flex justify-between mt-4 w-3/4 max-w-3xl">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="text-lg">
              Page {pageNumber} of {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
