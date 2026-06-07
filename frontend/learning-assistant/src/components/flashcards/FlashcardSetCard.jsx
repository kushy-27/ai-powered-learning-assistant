import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, TrendingUp } from "lucide-react";
import moment from "moment";

const FlashcardSetCard = ({ flashcardSet }) => {
    const navigate = useNavigate();

    const documentId = flashcardSet?.documentId?._id || flashcardSet?.documentId;

    const handleStudyNow = () => {
        if (!documentId) return;
        navigate(`/documents/${documentId}/flashcards`);
    };

    const cards = flashcardSet?.cards || [];
    const reviewedCount = cards.filter((card) => card.lastReviewed).length;
    const totalCards = cards.length;

    const progressPercentage =
        totalCards > 0 ? Math.round((reviewedCount / totalCards) * 100) : 0;

    return (
        <div className="group bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer">
            <div onClick={handleStudyNow}>
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                        <BookOpen
                            className="w-6 h-6 text-emerald-600"
                            strokeWidth={2}
                        />
                    </div>

                    <div className="min-w-0 flex-1">
                        <h3
                            className="text-base font-bold text-slate-900 truncate"
                            title={flashcardSet?.documentId?.title || "Untitled Document"}
                        >
                            {flashcardSet?.documentId?.title || "Untitled Document"}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Created{" "}
                            {flashcardSet?.createdAt
                                ? moment(flashcardSet.createdAt).fromNow()
                                : "recently"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                        <span className="text-xs font-semibold text-slate-700">
                            {totalCards} {totalCards === 1 ? "Card" : "Cards"}
                        </span>
                    </div>

                    {reviewedCount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                            <TrendingUp
                                className="w-4 h-4 text-emerald-600"
                                strokeWidth={2.5}
                            />
                            <span className="text-xs font-bold text-emerald-700">
                                {progressPercentage}%
                            </span>
                        </div>
                    )}
                </div>

                {totalCards > 0 && (
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">
                                Progress
                            </span>

                            <span className="text-xs font-semibold text-slate-600">
                                {reviewedCount}/{totalCards} reviewed
                            </span>
                        </div>

                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    handleStudyNow();
                }}
                disabled={!documentId}
                className="w-full h-11 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95"
            >
                <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                    Study Now
                </span>
            </button>
        </div>
    );
};

export default FlashcardSetCard;