import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-2.5-flash-lite";

export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.

Format each flashcard exactly like this:
Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with "---".

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const generatedText = response.text;

    const flashcards = [];
    const cards = generatedText.split("---").filter(c => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");

      let question = "";
      let answer = "";
      let difficulty = "medium";

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("A:")) {
          answer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} MCQs from the following text.

Format each question exactly like this:
Q: [Question]
O1: [Option 1]
O2: [Option 2]
O3: [Option 3]
O4: [Option 4]
C: [Correct option number only: 1, 2, 3, or 4]
E: [Brief explanation]
D: [Difficulty: easy, medium, or hard]

Separate questions with "---".

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const generatedText = response.text;

    const questions = [];
    const questionBlocks = generatedText.split("---").filter(c => c.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split("\n");

      let question = "";
      const options = [];
      let correctAnswerIndex = -1;
      let explanation = "";
      let difficulty = "medium";

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (/^O\d:/.test(trimmed)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith("C:")) {
          const raw = trimmed.substring(2).trim();
          const match = raw.match(/[1-4]/);
        
          if (match) {
            correctAnswerIndex = Number(match[0]) - 1;
          }
        } else if (trimmed.startsWith("E:")) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswerIndex >= 0 && correctAnswerIndex <= 3) {
        questions.push({
          question,
          options,
          correctAnswer: options[correctAnswerIndex],
          correctAnswerIndex,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate quiz");
  }
};

export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text.
Highlight key concepts, main ideas, and important points.
Keep the summary clear and structured.

Text:
${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate summary");
  }
};

export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  const prompt = `Based on the following document context, answer the user's question.
If the answer is not in the context, say that clearly.

Context:
${context}

Question:
${question}

Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to process chat request");
  }
};

export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept "${concept}" based on the following context.
Provide a clear educational explanation.
Include examples if relevant.

Context:
${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to explain concept");
  }
};