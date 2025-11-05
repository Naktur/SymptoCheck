import React, { useState } from "react";
import { Send, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
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
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col h-[70vh] font-sans">
      {/* HEADER */}
      <div className="border-b border-gray-200 pb-3 px-5 pt-4 mb-3">
        <h2 className="text-2xl font-semibold text-blue-700 flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          Symptom Chat
        </h2>
        <div className="h-1 w-20 bg-blue-200 rounded-full mt-2" />
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto space-y-3 px-5 py-2 scrollbar-thin scrollbar-thumb-gray-200">
        {messages.length === 0 && (
          <div className="text-gray-500 italic text-sm text-center mt-5">
            Cześć! Jestem Twoim asystentem medycznym. Opisz swoje objawy, aby rozpocząć rozmowę.
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    msg.role === "user"
                        ? "bg-white text-gray-800 border border-blue-200"
                        : "bg-blue-50 text-gray-800 border border-blue-100"
                }`}
            >

              <div className="flex items-start gap-2">
                {msg.role === "assistant" && (
                    <Bot className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0"/>
                )}
                {msg.role === "user" && (
                    <User className="w-4 h-4 mt-1 text-blue-100 flex-shrink-0"/>
                )}
                <div
                    className="prose prose-sm max-w-none text-gray-800 prose-p:my-1 prose-strong:font-semibold prose-li:my-0">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
            <div className="flex justify-start">
              <div
                  className="bg-blue-50 border border-blue-100 text-gray-600 px-4 py-3 rounded-2xl text-sm shadow-sm flex items-center gap-2">
              <span className="animate-pulse">AI pisze</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.1s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="mt-4 border-t border-gray-200 pt-3 flex gap-2 px-5 pb-4 bg-gray-50 rounded-b-2xl">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Opisz swoje objawy..."
          className="flex-1 border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Wyślij
        </button>
      </div>
    </div>
  );
}
