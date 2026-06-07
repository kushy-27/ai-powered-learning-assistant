import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { Play, BarChart2, Trash2, Award } from "lucide-react";

const QuizCard = ({ quiz, onDelete }) => {
  return (
    <div className="group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between min-h-\[260px]">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(quiz);
        }}
        className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" strokeWidth={2} />
      </button>

      <div className="space-y-4">
        <div className="flex items-center justify-between pr-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <Award className="w-4 h-4" strokeWidth={2.5} />
            <span className="text-sm font-semibold">
              Score: {quiz?.score ?? "Not attempted"}
            </span>
          </div>
        </div>

        <div>
          <h3
            className="text-lg font-bold text-slate-800 line-clamp-2"
            title={quiz.title}
          >
            {quiz.title ||
              `Quiz - ${moment(quiz.createdAt).format("MMM D, YYYY")}`}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            Created {moment(quiz.createdAt).format("MMM D, YYYY")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium">
            <span>
              {quiz.questions?.length || 0}{" "}
              {(quiz.questions?.length || 0) === 1 ? "Question" : "Questions"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        {quiz?.userAnswers?.length > 0 ? (
          <Link to={`/quizzes/${quiz._id}/results`}>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all duration-200">
              <BarChart2 className="w-5 h-5" strokeWidth={2.5} />
              View Results
            </button>
          </Link>
        ) : (
          <Link to={`/quizzes/${quiz._id}`}>
            <button className="w-full relative overflow-hidden flex items-center justify-center px-4 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all duration-200">
              <span className="flex items-center gap-2 relative z-10">
                <Play className="w-5 h-5" strokeWidth={2.5} />
                Start Quiz
              </span>
              <div className="absolute inset-0 bg-white/10 translate-x-\[-100%] group-hover:translate-x-\[100%] transition-transform duration-700" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default QuizCard;