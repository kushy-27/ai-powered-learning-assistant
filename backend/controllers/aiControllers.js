import mongoose from "mongoose";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import ChatHistory from "../models/ChatHistory.js";
import * as geminiService from "../utils/geminiService.js";
import { findRelevantChunks } from "../utils/textChunker.js";

const parsePositiveInteger = (value) => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

export const generateFlashcards = async (req, res, next) => {
  try {
    const { documentId, count = 10 } = req.body || {};

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId",
        status: 400,
      });
    }

    if (!mongoose.isValidObjectId(documentId)) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        status: 404,
      });
    }

    const flashcardCount = parsePositiveInteger(count);

    if (flashcardCount === null) {
      return res.status(400).json({
        success: false,
        error: "Count must be a positive integer",
        status: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        status: 404,
      });
    }

    const cards = await geminiService.generateFlashcards(
      document.extractedText,
      flashcardCount
    );

    if (!Array.isArray(cards)) {
      throw new Error("Flashcard generation returned an invalid response");
    }

    const flashcardSet = await Flashcard.create({
      userId: req.user.id,
      documentId: document._id,
      cards: cards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,
      })),
    });

    return res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Flashcards generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const generateQuiz = async (req, res, next) => {
  try {
    const {
      documentId,
      numQuestions = 5,
      title,
    } = req.body || {};

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId",
        status: 400,
      });
    }

    if (!mongoose.isValidObjectId(documentId)) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        status: 404,
      });
    }

    const questionCount = parsePositiveInteger(numQuestions);

    if (questionCount === null) {
      return res.status(400).json({
        success: false,
        error: "numQuestions must be a positive integer",
        status: 400,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        status: 404,
      });
    }

    const questions = await geminiService.generateQuiz(
      document.extractedText,
      questionCount
    );

    if (!Array.isArray(questions)) {
      throw new Error("Quiz generation returned an invalid response");
    }

    const quizTitle =
      typeof title === "string" && title.trim()
        ? title.trim()
        : `${document.title} - Quiz`;

    const quiz = await Quiz.create({
      userId: req.user.id,
      documentId: document._id,
      title: quizTitle,
      questions: questions.map((question) => ({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        correctAnswerIndex: question.correctAnswerIndex,
        explanation: question.explanation,
        difficulty: question.difficulty || "medium",
      })),
      totalQuestions: questions.length,
      userAnswers: [],
      score: 0,
    });

    return res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const generateSummary = async (req, res, next) => {
  try {
    const { documentId } = req.body || {};

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId",
        status: 400,
      });
    }

    if (!mongoose.isValidObjectId(documentId)) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        status: 404,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        status: 404,
      });
    }

    const summary = await geminiService.generateSummary(
      document.extractedText
    );

    return res.status(201).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        summary,
      },
      message: "Summary generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const chat = async (req, res, next) => {
  try {
    const { documentId, question } = req.body || {};

    const normalizedQuestion =
      typeof question === "string" ? question.trim() : "";

    if (!documentId || !normalizedQuestion) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId and question",
        status: 400,
      });
    }

    if (!mongoose.isValidObjectId(documentId)) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        status: 404,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        status: 404,
      });
    }

    const chunks = Array.isArray(document.chunks)
      ? document.chunks
      : [];

    const relevantChunks = findRelevantChunks(
      chunks,
      normalizedQuestion,
      3
    );

    const chunkIndices = relevantChunks.map(
      (chunk) => chunk.chunkIndex
    );

    let chatHistory = await ChatHistory.findOne({
      userId: req.user.id,
      documentId: document._id,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user.id,
        documentId: document._id,
        messages: [],
      });
    }

    const answer = await geminiService.chatWithContext(
      normalizedQuestion,
      relevantChunks
    );

    const timestamp = new Date();

    chatHistory.messages.push(
      {
        role: "user",
        content: normalizedQuestion,
        timestamp,
        relevantChunks: chunkIndices,
      },
      {
        role: "assistant",
        content: answer,
        timestamp,
        relevantChunks: chunkIndices,
      }
    );

    await chatHistory.save();

    return res.status(201).json({
      success: true,
      data: {
        question: normalizedQuestion,
        answer,
        relevantChunks: chunkIndices,
        chatHistoryId: chatHistory._id,
      },
      message: "Response generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const explainConcept = async (req, res, next) => {
  try {
    const { documentId, concept } = req.body || {};

    const normalizedConcept =
      typeof concept === "string" ? concept.trim() : "";

    if (!documentId || !normalizedConcept) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId and concept",
        statusCode: 400,
      });
    }

    if (!mongoose.isValidObjectId(documentId)) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        statusCode: 404,
      });
    }

    const chunks = Array.isArray(document.chunks)
      ? document.chunks
      : [];

    const relevantChunks = findRelevantChunks(
      chunks,
      normalizedConcept,
      3
    );

    const context = relevantChunks
      .map((chunk) => chunk.content)
      .join("\n\n");

    const explanation = await geminiService.explainConcept(
      normalizedConcept,
      context
    );

    return res.status(200).json({
      success: true,
      data: {
        concept: normalizedConcept,
        explanation,
        relevantChunks: relevantChunks.map(
          (chunk) => chunk.chunkIndex
        ),
      },
      message: "Explanation generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const { documentId } = req.body || {};

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId",
        status: 400,
      });
    }

    if (!mongoose.isValidObjectId(documentId)) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        status: 404,
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user.id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
        status: 404,
      });
    }

    const chatHistory = await ChatHistory.findOne({
      userId: req.user.id,
      documentId: document._id,
    }).select("messages");

    if (!chatHistory) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Chat history retrieved successfully",
      });
    }

    return res.status(200).json({
      success: true,
      data: chatHistory.messages,
      message: "Chat history retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
