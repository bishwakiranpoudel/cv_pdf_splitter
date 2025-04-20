
## PDF Splitter Documentation

This documentation covers the main components and functions in the PDF splitting feature, specifically the `PDFSplitter` and `SplitResultCard` React components. It explains what each function does, its props, and return values.

---

### **PDFSplitter.jsx**

The main component for uploading, previewing, and splitting PDF files.

#### **Props**

- None (this is a top-level component).


#### **State Variables**

- `file`: Stores the uploaded PDF file.
- `pageCount`: Number of pages in the uploaded PDF.
- `previewUrl`: URL for PDF preview.
- `currentViewPage`: Currently viewed page in the preview.
- `fromPage`, `toPage`: Start and end pages for splitting.
- `fromPageInput`, `toPageInput`: Input values for page selection.
- `isProcessing`: Indicates if a split operation is in progress.
- `errorMessage`, `inputError`: Error messages for UI feedback.
- `isFullscreenPreview`: Boolean for fullscreen preview modal.
- `splitResults`: Array of split PDF results.
- Various `useRef` hooks for file and UI references.


#### **Main Functions**

| Function Name | Purpose | Props/Args | Returns |
| :-- | :-- | :-- | :-- |
| `handleManualFileUpload` | Opens the manual file input dialog. | None | void |
| `handleFileChange` | Handles file input change, validates and loads PDF, sets preview. | event | void |
| `handleFromPageInputChange` | Updates "From Page" input, validates, sets state. | event | void |
| `handleToPageInputChange` | Updates "To Page" input, validates, sets state. | event | void |
| `handleFromPageInputBlur` | Validates "From Page" on blur, resets if invalid. | None | void |
| `handleToPageInputBlur` | Validates "To Page" on blur, resets if invalid. | None | void |
| `handleSplitPDF` | Splits the PDF using selected page range, creates new split result. | None | void |
| `handleRemoveSplit` | Removes a split result and revokes its URL. | split id | void |
| `handleDownloadSplit` | Downloads a specific split PDF. | split object | void |
| `handleDownloadAll` | Downloads all split PDFs in sequence. | None | void |
| `resetForm` | Resets all state and cleans up URLs. | None | void |
| `goToNextPage` | Advances the preview to the next page. | None | void |
| `goToPrevPage` | Goes back to the previous preview page. | None | void |
| `toggleFullscreenPreview` | Toggles fullscreen preview modal. | None | void |
| `getPdfViewUrl` | Returns the preview URL with the current page parameter. | None | string |

#### **Split Result Object Structure**

Each split result in `splitResults` has:

- `id`: Unique identifier.
- `fromPage`, `toPage`: Page range.
- `url`: Blob URL for the split PDF.
- `pageCount`: Number of pages in the split.


#### **Returns**

- Renders the PDF splitter UI, file upload, page range selection, PDF preview, and split results list[^2].

---

### **SplitResultCard.jsx**

A presentational component for displaying a single split PDF result.

#### **Props**

- `split`: The split result object (see structure above).
- `index`: Index of the split in the list.
- `onRemove`: Callback to remove this split (expects split id).
- `onDownload`: Callback to download this split (expects split object).


#### **What it Does**

- Displays the split's page range and total pages.
- Provides a button to download the split.
- Provides a button to remove the split from the list.


#### **Returns**

- Renders a card UI showing the split summary and action buttons[^1].

---

## **Component and Function Overview Table**

| Component/Function | Props/Args | Description | Returns |
| :-- | :-- | :-- | :-- |
| PDFSplitter | None | Main PDF splitting logic and UI. | PDF splitter UI |
| handleManualFileUpload | None | Opens manual file upload dialog. | void |
| handleFileChange | event | Handles file selection, validates, loads PDF, sets preview. | void |
| handleFromPageInputChange | event | Handles "From Page" input, validates and updates state. | void |
| handleToPageInputChange | event | Handles "To Page" input, validates and updates state. | void |
| handleSplitPDF | None | Splits PDF based on selected range, updates split results. | void |
| handleRemoveSplit | split id | Removes a split result and cleans up its URL. | void |
| handleDownloadSplit | split object | Triggers download of a split PDF. | void |
| handleDownloadAll | None | Downloads all split PDFs sequentially. | void |
| resetForm | None | Resets all state and cleans up. | void |
| goToNextPage | None | Moves preview to the next page. | void |
| goToPrevPage | None | Moves preview to the previous page. | void |
| toggleFullscreenPreview | None | Toggles fullscreen preview modal. | void |
| getPdfViewUrl | None | Returns preview URL with current page. | string |
| SplitResultCard | split, index, onRemove, onDownload | Displays a split result card with actions. | Card UI |

---

### **Usage Flow**

1. **Upload PDF**: User drags and drops or selects a PDF file.
2. **Select Pages**: User chooses a page range to split.
3. **Split PDF**: User clicks split, a new split result appears.
4. **Download/Remove**: User can download or remove individual splits, or download all at once.
5. **Reset**: User can reset the form to start over.

