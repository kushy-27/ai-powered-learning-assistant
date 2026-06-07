import React, { useEffect, useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import Flashcard from "./Flashcard";
import Modal from "../common/Modal";

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  const fetchFlashcardSets = async () => {
    setLoading(true);

    try {
      const response = await flashcardService.getAllFlashcardForDocument(
        documentId
      );

      setFlashcardSets(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch flashcard sets.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchFlashcardSets();
    }
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);

    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully!");
      fetchFlashcardSets();
    } catch (error) {
      toast.error(error.message || "Failed to generate flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrevCard = () => {
    if (!selectedSet) return;

    setCurrentCardIndex(
      (prevIndex) =>
        (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length
    );
  };

  const handleNextCard = () => {
    if (!selectedSet) return;

    setCurrentCardIndex(
      (prevIndex) => (prevIndex + 1) % selectedSet.cards.length
    );
  };

  const handleReview = async (difficulty = "reviewed") => {
    const currentCard = selectedSet?.cards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, difficulty);
      toast.success("Flashcard reviewed!");
    } catch (error) {
      toast.error("Failed to review flashcard.");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStarFlashcard(cardId);

      setSelectedSet((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          cards: prev.cards.map((card) =>
            card._id === cardId
              ? { ...card, isStarred: !card.isStarred }
              : card
          ),
        };
      });

      setFlashcardSets((prev) =>
        prev.map((set) =>
          set._id === selectedSet._id
            ? {
                ...set,
                cards: set.cards.map((card) =>
                  card._id === cardId
                    ? { ...card, isStarred: !card.isStarred }
                    : card
                ),
              }
            : set
        )
      );
    } catch (error) {
      toast.error("Failed to update star.");
    }
  };

  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;

    setDeleting(true);

    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);

      setFlashcardSets((prev) =>
        prev.filter((set) => set._id !== setToDelete._id)
      );

      if (selectedSet?._id === setToDelete._id) {
        setSelectedSet(null);
      }

      toast.success("Flashcard set deleted.");
      setIsDeleteModalOpen(false);
      setSetToDelete(null);
    } catch (error) {
      toast.error("Failed to delete flashcard set.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectSet = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  };

  const renderFlashcardViewer = () => {
    const currentCard = selectedSet?.cards?.[currentCardIndex];

    if (!currentCard) {
      return (
        <div className="text-center py-12">
          <p className="text-slate-500">No cards found in this set.</p>

          <button
            onClick={() => setSelectedSet(null)}
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            Go back
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedSet(null)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sets
          </button>

          <p className="text-sm text-slate-500">
            {currentCardIndex + 1} / {selectedSet.cards.length}
          </p>
        </div>

        <Flashcard
        flashcard={currentCard}
        onToggleStar={handleToggleStar}
        />

        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevCard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={() => handleReview("reviewed")}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition"
          >
            Mark Reviewed
          </button>

          <button
            onClick={handleNextCard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderSetList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      );
    }

    if (flashcardSets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-emerald-600" strokeWidth={2} />
          </div>

          <h3 className="text-lg font-semibold text-slate-800">
            No Flashcards Yet
          </h3>

          <p className="text-sm text-slate-500 mt-2 max-w-md">
            Generate flashcards from your document to start learning and
            reinforce your understanding.
          </p>

          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="mt-5 flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none transition"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" strokeWidth={2} />
                Generate Flashcards
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            Flashcard Sets
          </h3>

          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 disabled:bg-slate-300 disabled:shadow-none transition"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Generate New
              </>
            )}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {flashcardSets.map((set) => (
            <div
              key={set._id}
              onClick={() => handleSelectSet(set)}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-200/60 hover:shadow-xl hover:shadow-slate-200/80 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-800 line-clamp-2">
                  {set.title || set.name || `Flashcard Set cards`}
                  </h4>

                  <p className="text-sm text-slate-500 mt-1">
                    {set.cards?.length || 0} cards
                  </p>
                </div>

                <button
                  onClick={(e) => handleDeleteRequest(e, set)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-4">
                Created {moment(set.createdAt).fromNow()}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-5">
        {selectedSet ? renderFlashcardViewer() : renderSetList()}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Flashcard Set"
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this flashcard set? This action cannot
          be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-300 transition"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default FlashcardManager;