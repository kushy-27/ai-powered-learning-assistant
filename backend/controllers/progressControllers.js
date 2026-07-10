import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getUtcDay = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
};

const calculateStudyStreak = (activityDates) => {
  const activeDays = new Set(
    activityDates
      .map(getUtcDay)
      .filter((date) => date !== null)
  );

  if (activeDays.size === 0) {
    return 0;
  }

  const today = getUtcDay(new Date());
  const yesterday = today - DAY_IN_MS;

  let currentDay;

  if (activeDays.has(today)) {
    currentDay = today;
  } else if (activeDays.has(yesterday)) {
    currentDay = yesterday;
  } else {
    return 0;
  }

  let streak = 0;

  while (activeDays.has(currentDay)) {
    streak++;
    currentDay -= DAY_IN_MS;
  }

  return streak;
};

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      totalDocuments,
      totalQuizzes,
      flashcardSets,
      completedQuizzes,
      recentDocuments,
      recentQuizzes,
      accessedDocuments,
    ] = await Promise.all([
      Document.countDocuments({ userId }),

      Quiz.countDocuments({ userId }),

      Flashcard.find({ userId })
        .select("cards.reviewCount cards.isStarred cards.lastReviewed")
        .lean(),

      Quiz.find({
        userId,
        completedAt: { $ne: null },
      })
        .select("score completedAt")
        .lean(),

      Document.find({
        userId,
        lastAccessed: { $ne: null },
      })
        .sort({ lastAccessed: -1 })
        .limit(5)
        .select("title fileName lastAccessed status")
        .lean(),

      Quiz.find({
        userId,
        completedAt: { $ne: null },
      })
        .sort({ completedAt: -1 })
        .limit(5)
        .populate("documentId", "title")
        .select(
          "title score totalQuestions completedAt updatedAt documentId"
        )
        .lean(),

      Document.find({
        userId,
        lastAccessed: { $ne: null },
      })
        .select("lastAccessed")
        .lean(),
    ]);

    const totalFlashcardSets = flashcardSets.length;
    const completeQuizzes = completedQuizzes.length;

    let totalFlashcards = 0;
    let reviewedFlashcards = 0;
    let starredFlashcards = 0;

    const activityDates = [];

    flashcardSets.forEach((set) => {
      const cards = Array.isArray(set.cards) ? set.cards : [];

      totalFlashcards += cards.length;

      cards.forEach((card) => {
        if ((card.reviewCount || 0) > 0) {
          reviewedFlashcards++;
        }

        if (card.isStarred === true) {
          starredFlashcards++;
        }

        if (card.lastReviewed) {
          activityDates.push(card.lastReviewed);
        }
      });
    });

    const validScores = completedQuizzes
      .map((quiz) => Number(quiz.score))
      .filter((score) => Number.isFinite(score));

    const averageScore =
      validScores.length > 0
        ? Math.round(
            validScores.reduce((sum, score) => sum + score, 0) /
              validScores.length
          )
        : 0;

    completedQuizzes.forEach((quiz) => {
      if (quiz.completedAt) {
        activityDates.push(quiz.completedAt);
      }
    });

    accessedDocuments.forEach((document) => {
      if (document.lastAccessed) {
        activityDates.push(document.lastAccessed);
      }
    });

    const studyStreak = calculateStudyStreak(activityDates);

    const recentActivity = [
      ...recentDocuments.map((doc) => ({
        type: "document",
        title:
          doc.title ||
          doc.fileName ||
          "Untitled Document",
        message: `Document accessed: ${
          doc.title ||
          doc.fileName ||
          "Untitled Document"
        }`,
        createdAt: doc.lastAccessed,
      })),

      ...recentQuizzes.map((quiz) => {
        const quizTitle =
          quiz.title ||
          quiz.documentId?.title ||
          "Untitled Quiz";

        return {
          type: "quiz",
          title: quizTitle,
          message: `Quiz attempted: ${quizTitle}`,
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          createdAt:
            quiz.completedAt ||
            quiz.updatedAt,
        };
      }),
    ]
      .sort((a, b) => {
        const firstDate = new Date(a.createdAt).getTime();
        const secondDate = new Date(b.createdAt).getTime();

        const safeFirstDate = Number.isNaN(firstDate)
          ? 0
          : firstDate;

        const safeSecondDate = Number.isNaN(secondDate)
          ? 0
          : secondDate;

        return safeSecondDate - safeFirstDate;
      })
      .slice(0, 5);

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
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
