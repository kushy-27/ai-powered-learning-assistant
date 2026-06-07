import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  Lightbulb,
  X,
} from "lucide-react";

import aiService from "../../services/aiService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";

const AIActions = () => {
  const { id: documentId } = useParams();

  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");

    try {
      const response = await aiService.generateSummary(documentId);

      setModalTitle("Generated Summary");
      setModalContent(response.data.summary);

      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate summary.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();

    if (!concept.trim()) {
      toast.error("Please enter a concept to explain.");
      return;
    }

    setLoadingAction("explain");

    try {
      const response = await aiService.explainConcept(
        documentId,
        concept
      );

      setModalTitle(`Explanation of "${concept}"`);
      setModalContent(response.data.explanation);

      setIsModalOpen(true);
      setConcept("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to explain concept.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/40 overflow-hidden">
        
        <div className="p-5 border-b border-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-600" strokeWidth={2} />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                AI Assistant
              </h3>

              <p className="text-sm text-slate-500">
                Powered by advanced AI
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          
          <div className="border border-slate-200 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <BookOpen
                      className="w-5 h-5 text-emerald-600"
                      strokeWidth={2}
                    />
                  </div>

                  <h4 className="font-semibold text-slate-800">
                    Generate Summary
                  </h4>
                </div>

                <p className="text-sm text-slate-500">
                  Get a concise summary of the entire document.
                </p>
              </div>

              <button
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-2xl text-sm font-medium hover:bg-emerald-700 disabled:bg-slate-300 transition"
              >
                {loadingAction === "summary" ? "Loading..." : "Summarize"}
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5">
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Lightbulb
                  className="w-5 h-5 text-blue-600"
                  strokeWidth={2}
                />
              </div>

              <div>
                <h4 className="font-semibold text-slate-800">
                  Explain Concept
                </h4>

                <p className="text-sm text-slate-500">
                  Ask AI to explain a concept from the document.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleExplainConcept}
              className="flex gap-3"
            >
              <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="Enter a concept..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />

              <button
                type="submit"
                disabled={loadingAction === "explain"}
                className="px-5 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-xl transition disabled:bg-slate-300 disabled:shadow-none"
              >
                {loadingAction === "explain" ? "Loading..." : "Explain"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {modalTitle}
              </h3>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <MarkdownRenderer content={modalContent} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIActions;