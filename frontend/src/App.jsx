import React, { useState } from "react";
import SymptomForm from "./SymptomForm";
import HistoryList from "./HistoryList";
import ChatAssistant from "./ChatAssistant";

export default function App() {
  const [tab, setTab] = useState("form");

  return (
    <div className="min-h-screen bg-blue-50">
      <nav className="bg-white shadow-md border-b border-gray-100 p-4 flex justify-center gap-6">
        <button
          onClick={() => setTab("form")}
          className={`${
            tab === "form" ? "text-blue-700 font-semibold" : "text-gray-600"
          } hover:text-blue-700`}
        >
          🧠 Analiza objawów
        </button>
        <button
          onClick={() => setTab("history")}
          className={`${
            tab === "history" ? "text-blue-700 font-semibold" : "text-gray-600"
          } hover:text-blue-700`}
        >
          📜 Historia
        </button>
        <button
          onClick={() => setTab("chat")}
          className={`${
            tab === "chat" ? "text-blue-700 font-semibold" : "text-gray-600"
          } hover:text-blue-700`}
        >
          💬 Czat
        </button>
      </nav>

      <main className="max-w-5xl mx-auto p-6">
        {tab === "form" && <SymptomForm />}
        {tab === "history" && <HistoryList />}
        {tab === "chat" && <ChatAssistant />}
      </main>
    </div>
  );
}
