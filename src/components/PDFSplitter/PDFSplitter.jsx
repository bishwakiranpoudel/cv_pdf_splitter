"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import { useDropzone } from "react-dropzone";
import Button from "../UI/Button/Button";
import Slider from "../UI/Slider/Slider";
import Input from "../UI/Input/Input";
import Modal from "../UI/Modal/Modal";
import SplitResultCard from "./SplitResultCard";
import "./PDFSplitter.css";

// Import icons
import {
  Upload,
  Download,
  BookOpen,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Maximize,
  X,
  Plus,
} from "react-feather";

function PDFSplitter() {
  // File and PDF state
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentViewPage, setCurrentViewPage] = useState(1);

  // Page selection state
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(1);
  const [fromPageInput, setFromPageInput] = useState("1");
  const [toPageInput, setToPageInput] = useState("1");

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [inputError, setInputError] = useState(null);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  // Results state
  const [splitResults, setSplitResults] = useState([]);

  // Refs
  const fileInputRef = useRef(null);
  const manualFileInputRef = useRef(null);
  const pdfContainerRef = useRef(null);

  // Reset current view page when a new file is loaded
  useEffect(() => {
    if (file) {
      setCurrentViewPage(1);
    }
  }, [file]);

  // Clean up URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      splitResults.forEach((result) => {
        URL.revokeObjectURL(result.url);
      });
    };
  }, []);

  // Force PDF reload when page changes
  useEffect(() => {
    if (!previewUrl || !file) return;

    // We need to force a reload of the PDF viewer by recreating the URL
    // This ensures the page change is recognized
    const pdfBlob = new Blob([file], { type: "application/pdf" });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const newUrl = URL.createObjectURL(pdfBlob);
    setPreviewUrl(newUrl);
  }, [currentViewPage]);

  // Update input fields when slider values change
  useEffect(() => {
    setFromPageInput(fromPage.toString());
    setToPageInput(toPage.toString());
  }, [fromPage, toPage]);

  /**
   * Dropzone configuration for PDF file uploads
   */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      // Clear previous errors
      setErrorMessage(null);
      setInputError(null);

      // Handle rejected files (wrong format, etc.)
      if (rejectedFiles && rejectedFiles.length > 0) {
        setErrorMessage("Please upload a valid PDF file.");
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Clean up previous URL if exists
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        // Clean up previous split results
        splitResults.forEach((result) => {
          URL.revokeObjectURL(result.url);
        });
        setSplitResults([]);

        setFile(file);

        // Create preview URL
        const fileUrl = URL.createObjectURL(file);
        setPreviewUrl(fileUrl);

        // Get page count
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          const count = pdfDoc.getPageCount();
          setPageCount(count);
          setFromPage(1);
          setToPage(count);
          setFromPageInput("1");
          setToPageInput(count.toString());
        } catch (error) {
          console.error("Error loading PDF:", error);
          setErrorMessage(
            "Could not read the PDF file. The file might be corrupted or password-protected."
          );
          setFile(null);
          setPreviewUrl(null);
        }
      }
    },
  });

  /**
   * Handles manual file upload button click
   */
  const handleManualFileUpload = () => {
    if (manualFileInputRef.current) {
      manualFileInputRef.current.click();
    }
  };

  /**
   * Handles file input change event
   */
  const handleFileChange = async (e) => {
    setErrorMessage(null);
    setInputError(null);

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.type !== "application/pdf") {
        setErrorMessage("Please upload a valid PDF file.");
        return;
      }

      // Clean up previous URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Clean up previous split results
      splitResults.forEach((result) => {
        URL.revokeObjectURL(result.url);
      });
      setSplitResults([]);

      setFile(file);

      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);

      // Get page count
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        setPageCount(count);
        setFromPage(1);
        setToPage(count);
        setFromPageInput("1");
        setToPageInput(count.toString());
      } catch (error) {
        console.error("Error loading PDF:", error);
        setErrorMessage(
          "Could not read the PDF file. The file might be corrupted or password-protected."
        );
        setFile(null);
        setPreviewUrl(null);
      }
    }
  };

  /**
   * Handles changes to the "From Page" input field
   */
  const handleFromPageInputChange = (e) => {
    setInputError(null);
    const value = e.target.value;
    setFromPageInput(value);

    // Validate input
    const pageNum = Number.parseInt(value);
    if (isNaN(pageNum)) return;

    if (pageNum < 1) {
      setInputError("From page cannot be less than 1");
      return;
    }

    if (pageNum > pageCount) {
      setInputError("From page cannot exceed total pages");
      return;
    }

    if (pageNum > toPage) {
      // If from page is greater than to page, update to page as well
      setToPage(pageNum);
      setToPageInput(pageNum.toString());
    }

    setFromPage(pageNum);
    setCurrentViewPage(pageNum);
  };

  /**
   * Handles changes to the "To Page" input field
   */
  const handleToPageInputChange = (e) => {
    setInputError(null);
    const value = e.target.value;
    setToPageInput(value);

    // Validate input
    const pageNum = Number.parseInt(value);
    if (isNaN(pageNum)) return;

    if (pageNum < fromPage) {
      setInputError("To page cannot be less than from page");
      return;
    }

    if (pageNum > pageCount) {
      setInputError("To page cannot exceed total pages");
      return;
    }

    setToPage(pageNum);
    setCurrentViewPage(pageNum);
  };

  /**
   * Validates the "From Page" input when focus is lost
   */
  const handleFromPageInputBlur = () => {
    // Ensure the input is a valid number on blur
    const pageNum = Number.parseInt(fromPageInput);
    if (isNaN(pageNum) || pageNum < 1) {
      setFromPageInput(fromPage.toString());
      setInputError(null);
    }
  };

  /**
   * Validates the "To Page" input when focus is lost
   */
  const handleToPageInputBlur = () => {
    // Ensure the input is a valid number on blur
    const pageNum = Number.parseInt(toPageInput);
    if (isNaN(pageNum) || pageNum < fromPage || pageNum > pageCount) {
      setToPageInput(toPage.toString());
      setInputError(null);
    }
  };

  /**
   * Handles the PDF splitting process
   */
  const handleSplitPDF = async () => {
    if (!file) return;

    // Validate page range
    if (fromPage > toPage) {
      setInputError("From page cannot be greater than to page");
      return;
    }

    if (fromPage < 1 || toPage > pageCount) {
      setInputError("Page range is invalid");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setInputError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newPdfDoc = await PDFDocument.create();

      // PDF pages are 0-indexed, but UI is 1-indexed
      for (let i = fromPage - 1; i < toPage; i++) {
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Add to split results
      const newSplit = {
        id: Date.now().toString(),
        fromPage,
        toPage,
        url,
        pageCount: toPage - fromPage + 1,
      };

      setSplitResults((prev) => [...prev, newSplit]);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      setErrorMessage(
        "Failed to split the PDF. Please try again with a different file."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Removes a split result from the list
   */
  const handleRemoveSplit = (id) => {
    setSplitResults((prev) => {
      const newResults = prev.filter((result) => result.id !== id);

      // Revoke the URL of the removed split
      const removedSplit = prev.find((result) => result.id === id);
      if (removedSplit) {
        URL.revokeObjectURL(removedSplit.url);
      }

      return newResults;
    });
  };

  /**
   * Downloads a specific split result
   */
  const handleDownloadSplit = (split) => {
    if (!split || !split.url || !file) {
      console.error("Invalid split data or missing file");
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = split.url;
      link.download = `split_${split.fromPage}-${split.toPage}_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading split:", error);
      setErrorMessage("Failed to download the split PDF. Please try again.");
    }
  };

  /**
   * Downloads all split results
   */
  const handleDownloadAll = () => {
    // Download each split one by one
    splitResults.forEach((split, index) => {
      setTimeout(() => {
        handleDownloadSplit(split);
      }, 300 * index); // Small delay to prevent browser issues
    });
  };

  /**
   * Resets the form and clears all state
   */
  const resetForm = () => {
    // Clean up URLs
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Clean up split results
    splitResults.forEach((result) => {
      URL.revokeObjectURL(result.url);
    });

    setFile(null);
    setPageCount(0);
    setFromPage(1);
    setToPage(1);
    setFromPageInput("1");
    setToPageInput("1");
    setSplitResults([]);
    setPreviewUrl(null);
    setErrorMessage(null);
    setInputError(null);
    setCurrentViewPage(1);
    setIsFullscreenPreview(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (manualFileInputRef.current) {
      manualFileInputRef.current.value = "";
    }
  };

  /**
   * Navigates to the next page in the PDF preview
   */
  const goToNextPage = () => {
    if (currentViewPage < pageCount) {
      setCurrentViewPage((prev) => prev + 1);
    }
  };

  /**
   * Navigates to the previous page in the PDF preview
   */
  const goToPrevPage = () => {
    if (currentViewPage > 1) {
      setCurrentViewPage((prev) => prev - 1);
    }
  };

  /**
   * Toggles the fullscreen preview modal
   */
  const toggleFullscreenPreview = () => {
    setIsFullscreenPreview(!isFullscreenPreview);
  };

  /**
   * Creates a URL for the PDF viewer with the current page parameter
   */
  const getPdfViewUrl = () => {
    if (!previewUrl) return "";
    return `${previewUrl}#page=${currentViewPage}`;
  };

  return (
    <div className="pdf-splitter">
      <div className="background-elements">
        {/* Background decorative elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-icon"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 40 + 20}px`,
              transform: `rotate(${Math.random() * 40 - 20}deg)`,
            }}
            animate={{
              y: [0, -10, 0],
              rotate: [
                `${Math.random() * 10 - 5}deg`,
                `${Math.random() * 10 - 5}deg`,
              ],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          >
            <Upload />
          </motion.div>
        ))}

        {/* Decorative circles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`circle-${i}`}
            className="floating-circle"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container"
      >
        <div className="header">
          <div className="mascot-container">
            <motion.img
              src="/mascot.png"
              alt="PDF Monkey Mascot"
              className="mascot"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
          </div>
          <motion.h1
            className="title"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            PDF Splitter
          </motion.h1>
          <p className="subtitle">Split your PDF files into multiple pieces!</p>
        </div>

        <div className="main-content">
          <div className="content-wrapper">
            <AnimatePresence mode="wait">
              {!file && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="upload-section"
                >
                  <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? "active" : ""}`}
                  >
                    <input {...getInputProps()} ref={fileInputRef} />
                    <motion.div
                      className="dropzone-content"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Upload className="upload-icon" />
                      <h3 className="upload-title">Upload a PDF File</h3>
                      <p className="upload-subtitle">
                        Drag and drop your file here, or click to select
                      </p>
                      <Button
                        className="upload-button"
                        onClick={handleManualFileUpload}
                      >
                        Choose File
                      </Button>
                      <input
                        type="file"
                        ref={manualFileInputRef}
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="hidden-input"
                      />
                    </motion.div>
                  </div>

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="error-message"
                    >
                      <AlertCircle className="error-icon" />
                      <p>{errorMessage}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {file && (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="editor-section"
                >
                  <div className="editor-grid">
                    <div className="pdf-preview-section">
                      <div className="section-header">
                        <h3 className="section-title">Your PDF</h3>
                        <Button
                          variant="icon"
                          onClick={toggleFullscreenPreview}
                          className="fullscreen-button"
                        >
                          <Maximize className="icon-small" />
                        </Button>
                      </div>

                      <div className="pdf-container" ref={pdfContainerRef}>
                        {previewUrl ? (
                          <>
                            <div className="pdf-viewer">
                              <iframe
                                src={getPdfViewUrl()}
                                className="pdf-iframe"
                                title="PDF Preview"
                              />
                            </div>

                            <div className="pdf-navigation">
                              <Button
                                variant="icon"
                                onClick={goToPrevPage}
                                disabled={currentViewPage <= 1}
                                className="nav-button"
                              >
                                <ChevronLeft className="icon-small" />
                              </Button>

                              <div className="page-indicator">
                                <span className="current-page">
                                  {currentViewPage}
                                </span>
                                <span className="page-separator">/</span>
                                <span className="total-pages">{pageCount}</span>
                              </div>

                              <Button
                                variant="icon"
                                onClick={goToNextPage}
                                disabled={currentViewPage >= pageCount}
                                className="nav-button"
                              >
                                <ChevronRight className="icon-small" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="pdf-placeholder">
                            <BookOpen className="placeholder-icon" />
                          </div>
                        )}
                      </div>

                      <div className="file-info">
                        <p>Filename: {file.name}</p>
                        <p>Pages: {pageCount}</p>
                      </div>
                    </div>

                    <div className="page-selection-section">
                      <h3 className="section-title selection-title">
                        Select Pages
                      </h3>
                      <div className="selection-container">
                        {/* From Page Selection with Input */}
                        <div className="range-selector">
                          <div className="range-header">
                            <label className="range-label">From Page:</label>
                            <div className="range-input-container">
                              <Input
                                type="number"
                                value={fromPageInput}
                                onChange={handleFromPageInputChange}
                                onBlur={handleFromPageInputBlur}
                                min={1}
                                max={pageCount}
                                className="page-input"
                              />
                              <span className="page-count">/ {pageCount}</span>
                            </div>
                          </div>
                          <Slider
                            value={fromPage}
                            min={1}
                            max={pageCount}
                            step={1}
                            onChange={(value) => {
                              const newFromPage = value;
                              setFromPage(newFromPage);
                              setFromPageInput(newFromPage.toString());
                              if (newFromPage > toPage) {
                                setToPage(newFromPage);
                                setToPageInput(newFromPage.toString());
                              }
                              // Update the current view to match the from page
                              setCurrentViewPage(newFromPage);
                            }}
                            className="range-slider"
                          />
                        </div>

                        {/* To Page Selection with Input */}
                        <div className="range-selector">
                          <div className="range-header">
                            <label className="range-label">To Page:</label>
                            <div className="range-input-container">
                              <Input
                                type="number"
                                value={toPageInput}
                                onChange={handleToPageInputChange}
                                onBlur={handleToPageInputBlur}
                                min={fromPage}
                                max={pageCount}
                                className="page-input"
                              />
                              <span className="page-count">/ {pageCount}</span>
                            </div>
                          </div>
                          <Slider
                            value={toPage}
                            min={fromPage}
                            max={pageCount}
                            step={1}
                            onChange={(value) => {
                              const newToPage = value;
                              setToPage(newToPage);
                              setToPageInput(newToPage.toString());
                              // Update the current view to match the to page
                              setCurrentViewPage(newToPage);
                            }}
                            className="range-slider"
                          />
                        </div>

                        {/* Input Error Message */}
                        {inputError && (
                          <div className="input-error">{inputError}</div>
                        )}

                        <div className="page-summary">
                          <p>
                            You will get pages {fromPage} to {toPage} (
                            {toPage - fromPage + 1} pages)
                          </p>
                        </div>

                        <div className="action-buttons">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="button-container"
                          >
                            <Button
                              onClick={handleSplitPDF}
                              disabled={isProcessing || !!inputError}
                              className="split-button"
                            >
                              {isProcessing ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                      duration: 1,
                                      repeat: Number.POSITIVE_INFINITY,
                                      ease: "linear",
                                    }}
                                    className="loading-icon"
                                  >
                                    <RefreshCw className="icon-small" />
                                  </motion.div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Plus className="icon-small" /> Add Split
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Split Results Section */}
                  {splitResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="results-section"
                    >
                      <div className="results-header">
                        <h3 className="section-title">Your Splits</h3>
                        {splitResults.length > 1 && (
                          <Button
                            variant="outline"
                            onClick={handleDownloadAll}
                            className="download-all-button"
                          >
                            <Download className="icon-small" /> Download All
                          </Button>
                        )}
                      </div>

                      <div className="results-grid">
                        {splitResults.map((split, index) => (
                          <SplitResultCard
                            key={split.id}
                            split={split}
                            index={index}
                            onRemove={handleRemoveSplit}
                            onDownload={handleDownloadSplit}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="error-message"
                    >
                      <AlertCircle className="error-icon" />
                      <p>{errorMessage}</p>
                    </motion.div>
                  )}

                  <div className="reset-container">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline"
                        onClick={resetForm}
                        className="reset-button"
                      >
                        <RefreshCw className="icon-small" /> Start Over
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Decorative footer */}
          <div className="decorative-footer">
            <motion.div
              animate={{
                x: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="footer-animation"
            >
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="footer-particle"
                  style={{
                    left: `${i * 5}%`,
                    top: Math.random() * 100 + "%",
                  }}
                  animate={{
                    y: ["-100%", "100%", "-100%"],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Preview Modal */}
      <Modal
        isOpen={isFullscreenPreview}
        onClose={() => setIsFullscreenPreview(false)}
        className="fullscreen-modal"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">PDF Preview</h3>
            <Button
              variant="icon"
              onClick={() => setIsFullscreenPreview(false)}
              className="close-button"
            >
              <X className="icon-small" />
            </Button>
          </div>

          <div className="modal-body">
            {previewUrl && (
              <div className="modal-pdf-container">
                <iframe
                  src={getPdfViewUrl()}
                  className="modal-pdf-iframe"
                  title="PDF Preview Fullscreen"
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <div className="modal-navigation">
              <Button
                variant="outline"
                onClick={goToPrevPage}
                disabled={currentViewPage <= 1}
                className="modal-nav-button"
              >
                <ChevronLeft className="icon-small" />
              </Button>

              <div className="modal-page-indicator">
                <span className="modal-current-page">{currentViewPage}</span>
                <span className="modal-page-separator">/</span>
                <span className="modal-total-pages">{pageCount}</span>
              </div>

              <Button
                variant="outline"
                onClick={goToNextPage}
                disabled={currentViewPage >= pageCount}
                className="modal-nav-button"
              >
                <ChevronRight className="icon-small" />
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default PDFSplitter;
