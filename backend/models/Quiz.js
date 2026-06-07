import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true
    },

    title: {
      type: String,
      required: true
    },

    questions: [
      {
        question: {
          type: String,
          required: true
        },
        options: {
          type: [String],
          required: true,
          validate: [
            array => array.length === 4,
            'Options must be an array of 4 strings'
          ]
        },
        correctAnswer: {
          type: String,
          required: true
        },
        correctAnswerIndex: {
          type: Number,
          required: true
        },
        explanation: {
          type: String,
          required: true
        },
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium'
        }
      }
    ],

    userAnswers: [
      {
        questionIndex: {
          type: Number,
          required: true
        },
        selectedAnswer: {
          type: String,
          default: null
        },
        isCorrect: {
          type: Boolean,
          default: false
        },
        answeredAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    score: {
      type: Number,
      default: 0
    },

    totalQuestions: {
      type: Number,
      default: 0
    },

    completionTime: {
      type: Number,
      default: 0
    },

    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

quizSchema.index({ userId: 1, documentId: 1 });

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);

export default Quiz;