import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="relative flex min-h-screen items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>

          <div className="border-b border-slate-200 px-6 py-5 pr-16">
            <h3 className="text-lg font-semibold text-slate-800">
              {title}
            </h3>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;