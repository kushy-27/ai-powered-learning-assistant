import React from "react";

const Spinner = ({ size = "md", text = "" }) => {
    const sizes = {
      sm: "w-4 h-4 border-2",
      md: "w-6 h-6 border-2",
      lg: "w-10 h-10 border-4",
    };
  
    return (
      <div className="flex items-center justify-center gap-3">
        <div
          className={`${sizes[size]} rounded-full border-slate-300 border-t-emerald-500 animate-spin`}
        />
        {text && <span className="text-sm text-slate-500">{text}</span>}
      </div>
    );
  };
  
  export default Spinner;