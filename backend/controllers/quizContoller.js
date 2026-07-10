import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';

export const getQuizzes = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.documentId)) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }

    const quizzes = await Quiz.find({
      userId: req.user.id,
      documentId: req.params.documentId,
    })
      .populate('documentId', 'title fileName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found.',
        statusCode: 404
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found.',
        statusCode: 404
      });
    }

    return res.status(200).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body || {};

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide answers array.',
        statusCode: 400
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found.',
        statusCode: 404
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found.',
        statusCode: 404
      });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: 'Quiz already completed',
        statusCode: 400
      });
    }

    let correctCount = 0;
    const userAnswers = [];

    const uniqueAnswers = new Map();

    answers.forEach((answer) => {
      if (!answer || typeof answer !== 'object') {
        return;
      }

      const { questionIndex, selectedAnswer } = answer;

      if (
        Number.isInteger(questionIndex) &&
        questionIndex >= 0 &&
        questionIndex < quiz.questions.length &&
        Object.prototype.hasOwnProperty.call(answer, 'selectedAnswer')
      ) {
        uniqueAnswers.set(questionIndex, selectedAnswer);
      }
    });

    uniqueAnswers.forEach((selectedAnswer, questionIndex) => {
      const question = quiz.questions[questionIndex];

      const isCorrect =
        selectedAnswer === question.correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      userAnswers.push({
        questionIndex,
        selectedAnswer,
        isCorrect,
        answeredAt: new Date()
      });
    });

    const totalQuestions =
      quiz.totalQuestions || quiz.questions.length;

    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();

    return res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        score,
        correctCount,
        totalQuestions,
        percentage: score,
        userAnswers
      },
      message: 'Quiz submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizResults = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found.',
        statusCode: 404
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found.',
        statusCode: 404
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: 'Quiz not completed yet',
        statusCode: 400
      });
    }

    const userAnswerMap = new Map(
      quiz.userAnswers.map((answer) => [
        answer.questionIndex,
        answer
      ])
    );

    const detailedResults = quiz.questions.map((question, index) => {
      const userAnswer = userAnswerMap.get(index);

      return {
        questionIndex: index,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        correctAnswerIndex: question.correctAnswerIndex,

        selectedAnswer:
          userAnswer?.selectedAnswer ?? null,

        isCorrect:
          userAnswer?.isCorrect ?? false,

        explanation: question.explanation
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          document: quiz.documentId,
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          completedAt: quiz.completedAt
        },
        results: detailedResults
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found.',
        statusCode: 404
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found.',
        statusCode: 404
      });
    }

    await quiz.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
