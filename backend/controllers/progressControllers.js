import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalDocuments = await Document.countDocuments({ userId });
    const totalFlashcardSets = await Flashcard.countDocuments({ userId });
    const totalQuizzes = await Quiz.countDocuments({ userId });
    const completeQuizzes = await Quiz.countDocuments({
      userId,
      completedAt: { $ne: null },
    });

    const flashcardSets = await Flashcard.find({ userId });

    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    flashcardSets.forEach((set) => {
      totalFlashcards += set.cards.length;
      reviewedFlashcards += set.cards.filter((c) => c.reviewCount > 0).length;
      starredFlashcards += set.cards.filter((c) => c.isStarred).length;
    });

    const quizzes = await Quiz.find({
      userId,
      completedAt: { $ne: null },
    });

    const averageScore =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length
          )
        : 0;

    const recentDocuments = await Document.find({ userId })
      .sort({ lastAccessed: -1 })
      .limit(5)
      .select("title fileName lastAccessed status");

      const recentQuizzes = await Quiz.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate("documentId", "title")
      .select("title score totalQuestions completedAt updatedAt");

    const studyStreak = Math.floor(Math.random() * 7) + 1;

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalDocuments,
          totalFlashcardSets,
          totalFlashcards,
          reviewedFlashcards,
          starredFlashcards,
          totalQuizzes,
          completeQuizzes,
          averageScore,
          studyStreak,
        },
        recentActivity: [
          ...recentDocuments.map((doc) => ({
            type: "document",
            title: doc.title || doc.fileName || "Untitled Document",
            message: `Document accessed: ${doc.title || doc.fileName || "Untitled Document"}`,
            createdAt: doc.lastAccessed,
          })),
    
          ...recentQuizzes.map((quiz) => ({
            type: "quiz",
            title: quiz.title || "Untitled Quiz",
            message: `Quiz attempted: ${quiz.title || "Untitled Quiz"}`,
            score: quiz.score,
            totalQuestions: quiz.totalQuestions,
            createdAt: quiz.completedAt || quiz.updatedAt,
          })),
        ]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};