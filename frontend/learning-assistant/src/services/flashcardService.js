import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const getAllFlashcardSets = async () => {
  const response = await axiosInstance.get(
    API_PATHS.FLASHCARDS.GET_ALL_FLASHCARD_SETS
  );
  return response.data;
};

const getAllFlashcardForDocument = async (documentId) => {
  const response = await axiosInstance.get(
    API_PATHS.FLASHCARDS.GET_FLASHCARDS_FOR_DOC(documentId)
  );
  return response.data;
};

const reviewFlashcard = async (cardId, difficulty = "reviewed") => {
  const response = await axiosInstance.post(
    API_PATHS.FLASHCARDS.REVIEW_FLASHCARD(cardId),
    { difficulty }
  );
  return response.data;
};

const toggleStarFlashcard = async (cardId) => {
  const response = await axiosInstance.put(
    API_PATHS.FLASHCARDS.TOGGLE_STAR(cardId)
  );
  return response.data;
};

const deleteFlashcardSet = async (id) => {
  const response = await axiosInstance.delete(
    API_PATHS.FLASHCARDS.DELETE_FLASHCARD_SET(id)
  );
  return response.data;
};

const flashcardService = {
  getAllFlashcardSets,
  getAllFlashcardForDocument,
  reviewFlashcard,
  toggleStarFlashcard,
  deleteFlashcardSet,
};

export default flashcardService;