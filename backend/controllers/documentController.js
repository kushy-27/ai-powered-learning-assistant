import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
        statusCode: 400
      });
    }

    const { title } = req.body;

    if (!title) {
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: 'Title is required',
        statusCode: 400
      });
    }

    const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
    const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

    const document = await Document.create({
      userId: req.user.id,
      title,
      fileName: req.file.originalname,
      filePath: fileUrl,
      fileSize: req.file.size,
      status: 'processing'
    });

    processPDF(document._id, req.file.path).catch((err) => {
      console.error('Error processing PDF:', err);
    });

    return res.status(201).json({
      success: true,
      data: document,
      message: 'Document uploaded successfully and is being processed'
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path);
    }
    next(error);
  }
};

const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);
    const chunks = chunkText(text, 500, 50);

    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks,
      status: 'ready'
    });

    console.log(
      `Document ${documentId} processed successfully with ${chunks.length} chunks.`
    );
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);

    await Document.findByIdAndUpdate(documentId, {
      status: 'failed'
    });
  }
};

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id)
        }
      },
      {
        $lookup: {
          from: 'flashcards',
          localField: '_id',
          foreignField: 'documentId',
          as: 'flashcardSets'
        }
      },
      {
        $lookup: {
          from: 'quizzes',
          localField: '_id',
          foreignField: 'documentId',
          as: 'quizzes'
        }
      },
      {
        $addFields: {
          flashcardCount: { $size: '$flashcardSets' },
          quizCount: { $size: '$quizzes' }
        }
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0
        }
      },
      {
        $sort: { uploadDate: -1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
      message: 'Documents retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    document.lastAccessed = Date.now();
    await document.save();

    return res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req, res, next) => {
  try {
    const { title } = req.body;

    const document = await Document.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      { title },
      {
        new: true,
        runValidators: true
      }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: document,
      message: 'Document updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    await Flashcard.deleteMany({ documentId: document._id });
    await Quiz.deleteMany({ documentId: document._id });

    await document.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};