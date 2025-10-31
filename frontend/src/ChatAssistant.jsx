import React, { useState } from "react";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export default function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
  if (!input.trim()) return;
  const newMsg = { role: "user", content: input };
  const newHistory = [...messages, newMsg];

  setMessages(newHistory);
  setInput("");
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/chat/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: input,
        history: newHistory.filter((m) => m.role && m.content),
      }),
    });

    const data = await res.json();
    if (data.reply) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.reply },
      ]);
    } else {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Błąd: brak odpowiedzi AI." },
      ]);
    }
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 flex flex-col h-[70vh]">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">Symptom Chat 💬</h2>

      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-100 text-gray-800 self-end"
                : "bg-gray-100 text-gray-700 self-start"
            } max-w-[80%]`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Opisz swoje objawy..."
          className="flex-1 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "..." : "Wyślij"}
        </button>
      </div>
    </div>
  );
}
