import React, { useState } from "react";
import SymptomForm from "./SymptomForm";
import HistoryList from "./HistoryList";
import ChatAssistant from "./ChatAssistant";
import { Brain, Scroll, MessageSquare } from "lucide-react";

export default function App() {
  const [tab, setTab] = useState("form");

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      {/* --- HEADER --- */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto flex justify-center items-center gap-10 py-3 text-gray-700">
          <button
            onClick={() => setTab("form")}
            className={`flex items-center gap-2 pb-1 border-b-2 transition-all ${
              tab === "form"
                ? "text-blue-700 font-semibold border-blue-600"
                : "text-gray-600 border-transparent hover:text-blue-700"
            }`}
          >
            <Brain className="w-5 h-5 text-pink-500" />
            Analiza objawów
          </button>

          <button
            onClick={() => setTab("history")}
            className={`flex items-center gap-2 pb-1 border-b-2 transition-all ${
              tab === "history"
                ? "text-blue-700 font-semibold border-blue-600"
                : "text-gray-600 border-transparent hover:text-blue-700"
            }`}
          >
            <Scroll className="w-5 h-5 text-amber-600" />
            Historia
          </button>

          <button
            onClick={() => setTab("chat")}
            className={`flex items-center gap-2 pb-1 border-b-2 transition-all ${
              tab === "chat"
                ? "text-blue-700 font-semibold border-blue-600"
                : "text-gray-600 border-transparent hover:text-blue-700"
            }`}
          >
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Czat
          </button>
        </div>
      </nav>

      {/* --- CONTENT --- */}
      <main className="max-w-5xl mx-auto p-6">
        {tab === "form" && <SymptomForm />}
        {tab === "history" && <HistoryList />}
        {tab === "chat" && <ChatAssistant />}
      </main>
    </div>
  );
}
