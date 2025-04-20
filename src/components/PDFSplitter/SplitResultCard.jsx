"use client";
import { motion } from "framer-motion";
import Button from "../UI/Button/Button";
import { Trash2, File, Download } from "react-feather";
import "./SplitResultCard.css";

function SplitResultCard({ split, index, onRemove, onDownload }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="split-result-card"
    >
      <div className="card-remove-button">
        <Button
          variant="icon"
          onClick={() => onRemove(split.id)}
          className="remove-button"
        >
          <Trash2 className="icon-small" />
        </Button>
      </div>

      <div className="card-header">
        <File className="card-icon" />
        <h4 className="card-title">Split {index + 1}</h4>
      </div>

      <div className="card-info">
        <p>
          Pages: {split.fromPage} to {split.toPage}
        </p>
        <p>
          Total: {split.pageCount} page{split.pageCount !== 1 ? "s" : ""}
        </p>
      </div>

      <Button
        onClick={() => onDownload(split)}
        className="card-download-button"
      >
        <Download className="icon-small" /> Download
      </Button>
    </motion.div>
  );
}

export default SplitResultCard;
