import React from "react";
import { BookOpen, BrainCircuit, Trash2, FileText, Clock } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "N/A";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <div
      onClick={handleNavigate}
      className="group cursor-pointer bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
          <FileText className="w-6 h-6 text-white" strokeWidth={2} />
        </div>

        <button
          onClick={handleDelete}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          aria-label="Delete document"
        >
          <Trash2 className="w-4 h-4" strokeWidth={2.2} />
        </button>
      </div>

      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mb-2">
        {document?.title || "Untitled Document"}
      </h3>

        <p className="text-xs text-slate-500 mb-5 line-clamp-1">
            {document?.originalName || document?.fileName || "PDF Document"} •{" "}
            {formatFileSize(document?.fileSize || document?.size)}
        </p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700">
            <BookOpen className="w-4 h-4 text-purple-700" strokeWidth={2} />
            <span>{document?.flashcardCount || 0} Flashcards</span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <BrainCircuit className="w-4 h-4 text-emerald-700" strokeWidth={2} />
          <span>{document?.quizCount || 0} quizzes</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-4 h-4 text-slate-400" strokeWidth={2} />
          <span>
            {document?.createdAt
              ? moment(document.createdAt).fromNow()
              : "Recently"}
          </span>
        </div>

        <span className="text-xs font-medium text-slate-400">
          {formatFileSize(document?.fileSize || document?.size)}
        </span>
      </div>
    </div>
  );
};

export default DocumentCard;