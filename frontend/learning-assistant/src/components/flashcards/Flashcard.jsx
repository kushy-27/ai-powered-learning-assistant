import React, { useState } from "react";
import { Star, RotateCcw } from "lucide-react";

const Flashcard = ({ flashcard, onToggleStar }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcard) return null;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleStarClick = (e) => {
    e.stopPropagation();
    onToggleStar?.(flashcard._id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[340px] perspective-[1000px]">
      <div
        onClick={handleFlip}
        className="relative w-full h-full cursor-pointer transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Question
              </span>

              <button
                onClick={handleStarClick}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  flashcard.isStarred
                    ? "bg-linear-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/25"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-500"
                }`}
              >
                <Star
                  className="h-5 w-5"
                  strokeWidth={2}
                  fill={flashcard.isStarred ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <p className="text-xl font-semibold leading-relaxed text-slate-800">
                {flashcard.question}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              <span>Click to reveal answer</span>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-xl shadow-emerald-100/70"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Answer
              </span>

              <button
                onClick={handleStarClick}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  flashcard.isStarred
                    ? "bg-linear-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/25"
                    : "bg-white text-slate-400 hover:bg-slate-100 hover:text-amber-500"
                }`}
              >
                <Star
                  className="h-5 w-5"
                  strokeWidth={2}
                  fill={flashcard.isStarred ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div className="flex flex-1 items-center justify-center px-6 text-center">
              <p className="text-lg leading-relaxed text-slate-700">
                {flashcard.answer}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
              <RotateCcw className="h-4 w-4" strokeWidth={2} />
              <span>Click to see question</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;