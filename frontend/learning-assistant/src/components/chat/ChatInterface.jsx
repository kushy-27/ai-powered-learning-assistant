import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { useAuth } from "../../context/Authcontext";
import Spinner from "../common/Spinner";
import MarkdownRenderer from "../common/MarkdownRenderer";

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const messageEndRef = useRef(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);

      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date(),
        relevantChunks: response.data.relevantChunks,
      };

      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };

      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === "user";

    return (
      <div
        key={index}
        className={`flex gap-3 mb-5 ${isUser ? "justify-end" : "justify-start"}`}
      >
        {!isUser && (
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-emerald-600" strokeWidth={2} />
          </div>
        )}

        <div
          className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-emerald-600 text-white rounded-br-md"
              : "bg-slate-100 text-slate-800 rounded-bl-md"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <MarkdownRenderer content={msg.content} />
          )}
        </div>

        {isUser && (
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 text-white font-semibold">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl items-center justify-center shadow-xl shadow-slate-200/50">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-emerald-600" strokeWidth={2} />
        </div>
        <Spinner />
        <p className="text-sm text-slate-500 mt-3 font-medium">
          Loading chat history....
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-xl shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-emerald-600" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
              Start a conversation
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Ask me anything about the document!
            </p>
          </div>
        ) : (
          history.map(renderMessage)
        )}

        {loading && (
          <div className="flex gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-emerald-600" strokeWidth={2} />
            </div>

            <div className="bg-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-200/70 p-4 bg-white/70"
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about this document..."
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
          >
            <Send className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;