import React from "react";
import { FileText, Plus } from "lucide-react";

const EmptyState = ({ onActionClick, title, description, buttonText }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-linear-to-br from-slate-50/50 to-white border-2 border-dashed border-slate-200 rounded-3xl">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
        <FileText className="w-8 h-8 text-slate-400" strokeWidth={2} />
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>

      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>

      {buttonText && onActionClick && (
        <button
          onClick={onActionClick}
          className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-200 active:scale-[0.98] overflow-hidden"
        >
          <span className="relative z-10 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            {buttonText}
          </span>

          <div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </button>
      )}
    </div>
  );
};

export default EmptyState;