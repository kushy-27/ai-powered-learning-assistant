import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/spinner";
import toast from "react-hot-toast";
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Trophy,
    Target,
    BookOpen,
} from "lucide-react";

const QuizResultPage = () => {
    const { quizId } = useParams();

    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const data = await quizService.getQuizResults(quizId);
                setResults(data);
            } catch (error) {
                toast.error("Failed to fetch quiz results");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [quizId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner />
            </div>
        );
    }

    if (!results || !results.data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-slate-600 text-lg">
                        Quiz results not found
                    </p>
                </div>
            </div>
        );
    }

    const {
        data: { quiz, results: detailedResults },
    } = results;

    const score = quiz?.score ?? 0;
    const totalQuestions = detailedResults?.length || 0;
    const correctAnswers = detailedResults.filter((r) => r.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;

    const getScoreColor = (score) => {
        if (score >= 80) return "from-emerald-500 to-teal-500";
        if (score >= 60) return "from-amber-500 to-orange-500";
        return "from-rose-500 to-red-500";
    };

    const getScoreMessage = (score) => {
        if (score >= 90) return "Outstanding!";
        if (score >= 80) return "Great job!";
        if (score >= 70) return "Good work!";
        if (score >= 60) return "Not bad!";
        return "Keep practicing!";
    };

    const getCorrectAnswerIndex = (result) => {
        if (typeof result.correctAnswerIndex === "number") {
            return result.correctAnswerIndex;
        }
    
        if (typeof result.correctAnswerIndex === "string") {
            const parsed = Number(result.correctAnswerIndex);
    
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
    
        if (typeof result.correctAnswer === "number") {
            return result.correctAnswer;
        }
    
        if (typeof result.correctAnswer === "string") {
            const trimmed = result.correctAnswer.trim();
    
            // If backend sends "0", "1", "2", "3"
            if (!Number.isNaN(Number(trimmed))) {
                return Number(trimmed);
            }
    
            // If backend sends "A", "B", "C", "D"
            const letterIndex = ["A", "B", "C", "D"].indexOf(trimmed.toUpperCase());
    
            if (letterIndex !== -1) {
                return letterIndex;
            }
    
            // If backend sends exact option text
            return result.options.findIndex((opt) => opt === result.correctAnswer);
        }
    
        return -1;
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6">
                <Link
                    to={`/documents/${quiz.document?._id || quiz.document}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                    Back to Document
                </Link>
            </div>

            <PageHeader title={`${quiz.title || "Quiz"} Results`} />

            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 mb-8">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-5">
                        <Trophy className="w-8 h-8 text-white" strokeWidth={2} />
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-slate-500 mb-2">
                            Your Score
                        </p>

                        <div
                            className={`inline-block text-5xl font-bold bg-linear-to-r ${getScoreColor(
                                score
                            )} bg-clip-text text-transparent mb-2`}
                        >
                            {score}%
                        </div>

                        <p className="text-lg font-semibold text-slate-700">
                            {getScoreMessage(score)}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mt-8">
                        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <Target className="w-5 h-5 text-slate-600" strokeWidth={2} />
                            <span className="font-semibold text-slate-700">
                                {totalQuestions} Total
                            </span>
                        </div>

                        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                            <CheckCircle2
                                className="w-5 h-5 text-emerald-600"
                                strokeWidth={2}
                            />
                            <span className="font-semibold text-emerald-700">
                                {correctAnswers} Correct
                            </span>
                        </div>

                        <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200">
                            <XCircle
                                className="w-5 h-5 text-rose-600"
                                strokeWidth={2}
                            />
                            <span className="font-semibold text-rose-700">
                                {incorrectAnswers} Incorrect
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-slate-700" strokeWidth={2} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900">
                        Detailed Review
                    </h3>
                </div>

                <div className="space-y-5">
                    {detailedResults.map((result, index) => {
                        const isCorrect = result.isCorrect;

                        const userAnswerIndex = result.options.findIndex(
                            (opt) => opt === result.selectedAnswer
                        );

                        const correctAnswerIndex =
                            typeof result.correctAnswerIndex === "number"
                                ? result.correctAnswerIndex
                                : result.options.findIndex(
                                      (opt) => opt === result.correctAnswer
                                  );

                        return (
                            <div
                                key={index}
                                className={`rounded-2xl border-2 p-5 ${
                                    isCorrect
                                        ? "border-emerald-200 bg-emerald-50/40"
                                        : "border-rose-200 bg-rose-50/40"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    <div>
                                        <div className="mb-2">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600">
                                                Question {index + 1}
                                            </span>
                                        </div>

                                        <h4 className="text-base font-semibold text-slate-900 leading-relaxed">
                                            {result.question}
                                        </h4>
                                    </div>

                                    <div
                                        className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                                            isCorrect
                                                ? "bg-emerald-50 border-2 border-emerald-200"
                                                : "bg-rose-50 border-2 border-rose-200"
                                        }`}
                                    >
                                        {isCorrect ? (
                                            <CheckCircle2
                                                className="w-5 h-5 text-emerald-600"
                                                strokeWidth={2}
                                            />
                                        ) : (
                                            <XCircle
                                                className="w-5 h-5 text-rose-600"
                                                strokeWidth={2}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {result.options.map((option, optIndex) => {
                                        const isCorrectOption =
                                            optIndex === correctAnswerIndex;

                                        const isUserAnswer =
                                            optIndex === userAnswerIndex;

                                        const isWrongAnswer =
                                            isUserAnswer && !isCorrectOption;

                                        return (
                                            <div
                                                key={optIndex}
                                                className={`relative px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                                                    isCorrectOption
                                                        ? "bg-emerald-50 border-emerald-300 shadow-lg shadow-emerald-500/10"
                                                        : isWrongAnswer
                                                        ? "bg-rose-50 border-rose-300"
                                                        : "bg-slate-50 border-slate-200"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <span
                                                        className={`text-sm font-medium ${
                                                            isCorrectOption
                                                                ? "text-emerald-900"
                                                                : isWrongAnswer
                                                                ? "text-rose-900"
                                                                : "text-slate-700"
                                                        }`}
                                                    >
                                                        {option}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        {isCorrectOption && (
                                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                                                                <CheckCircle2
                                                                    className="w-4 h-4"
                                                                    strokeWidth={2.5}
                                                                />
                                                                Correct
                                                            </span>
                                                        )}

                                                        {isWrongAnswer && (
                                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700">
                                                                <XCircle
                                                                    className="w-4 h-4"
                                                                    strokeWidth={2.5}
                                                                />
                                                                Your Answer
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {result.explanation && (
                                    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="shrink-0 w-9 h-9 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center">
                                                <BookOpen
                                                    className="w-5 h-5 text-sky-600"
                                                    strokeWidth={2}
                                                />
                                            </div>

                                            <div>
                                                <p className="text-sm font-bold text-sky-800 mb-1">
                                                    Explanation
                                                </p>

                                                <p className="text-sm leading-relaxed text-slate-700">
                                                    {result.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <Link to={`/documents/${quiz.document?._id || quiz.document}`}>
                    <button className="group relative px-8 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95 overflow-hidden">
                        <span className="relative z-10 flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={2.5}/>
                            Return to Document
                        </span>
                        <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/20 -translate-x-full group-hover:translate-x-full transition-transform-700"/>
                    </button>
                </Link>
            </div>
        </div>
    );
};

export default QuizResultPage;