import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/spinner";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";

const QuizTakePage = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const response = await quizService.getQuizById(quizId);
                setQuiz(response.data);
            } catch (error) {
                toast.error("Failed to fetch Quiz");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId]);

    const handleOptionChange = (questionId, optionIndex) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: optionIndex,
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        setSubmitting(true);
        try {
            const formattedAnswers = Object.keys(selectedAnswers).map(questionId => {
                const question = quiz.questions.find(q => q._id === questionId);
                const questionIndex = quiz.questions.findIndex(q => q._id === questionId);
                const optionIndex = selectedAnswers[questionId];
                const selectedAnswer = question.options[optionIndex];
                return { questionIndex, selectedAnswer };
            })

            await quizService.submitQuiz(quizId, formattedAnswers);
            toast.success('Quiz submitted succesfully!');
            navigate(`/quizzes/${quizId}/results`);
        } catch (error) {
            toast.error(error.message || "Failed to submit quiz");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Spinner />
            </div>
        );
    }

    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-slate-600 text-lg">
                        Quiz not found or has no questions.
                    </p>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isAnswered = Object.prototype.hasOwnProperty.call(
        selectedAnswers,
        currentQuestion._id
    );
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader title={quiz.title || "Take Quiz"} />

            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                        Question {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>

                    <span className="text-sm font-medium text-slate-500">
                        {answeredCount} answered
                    </span>
                </div>

                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                        }}
                    />
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-6 mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl mb-6">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />

                    <span className="text-sm font-semibold text-emerald-700">
                        Question {currentQuestionIndex + 1}
                    </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-6 leading-relaxed">
                    {currentQuestion.question}
                </h3>

                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                        const isSelected =
                            selectedAnswers[currentQuestion._id] === index;

                        return (
                            <label
                                key={index}
                                className={`group relative flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                    isSelected
                                        ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10"
                                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white hover:shadow-md"
                                }`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${currentQuestion._id}`}
                                    value={index}
                                    checked={isSelected}
                                    onChange={() =>
                                        handleOptionChange(currentQuestion._id, index)
                                    }
                                    className="sr-only"
                                />

                                <div
                                    className={`shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                                        isSelected
                                            ? "border-emerald-500 bg-emerald-500"
                                            : "border-slate-300 bg-white group-hover:border-emerald-400"
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>

                                <span
                                    className={`ml-4 text-sm font-medium transition-colors duration-200 ${
                                        isSelected
                                            ? "text-emerald-700"
                                            : "text-slate-700 group-hover:text-slate-900"
                                    }`}
                                >
                                    {option}
                                </span>

                                {isSelected && (
                                    <CheckCircle2
                                        className="ml-auto w-5 h-5 text-emerald-500"
                                        strokeWidth={2.5}
                                    />
                                )}
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center justify-between mb-8">
                <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0 || submitting}
                    variant="blue"
                >
                    <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                    Previous
                </Button>

                {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <button
                        onClick={handleSubmitQuiz}
                        disabled={submitting || answeredCount === 0}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" strokeWidth={2.5} />
                                Submit Quiz
                            </>
                        )}
                    </button>
                ) : (
                    <Button
                        onClick={handleNextQuestion}
                        disabled={submitting}
                        variant="blue"
                    >
                        Next
                        <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                {quiz.questions.map((question, index) => {
                    const isCurrent = currentQuestionIndex === index;
                    const isQuestionAnswered =
                        selectedAnswers[question._id] !== undefined;

                    return (
                        <button
                            key={question._id || index}
                            onClick={() => setCurrentQuestionIndex(index)}
                            disabled={submitting}
                            className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all duration-200 ${
                                isCurrent
                                    ? "bg-emerald-600 text-white shadow-md"
                                    : isQuestionAnswered
                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                            }`}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default QuizTakePage;