import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Stethoscope, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export default function SymptomForm() {
  const [symptoms, setSymptoms] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Kolor paska w zależności od poziomu pewności
  const getBarColor = (p) => {
    if (p > 0.7) return "from-green-400 to-green-600";
    if (p > 0.4) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  const handleAnalyze = async () => {
    setError("");
    setAnalysis("");
    setConfidence(null);

    if (!symptoms.trim()) {
      setError("Wpisz swoje objawy.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/diagnose/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Błąd serwera");
      }

      const data = await res.json();
      let text = data.result_md || "";

      // --- WYCIĄGNIJ JSON Z TEKSTU ---
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
      let conf = null;

      if (jsonMatch) {
        try {
          conf = JSON.parse(jsonMatch[1]);
        } catch (err) {
          console.warn("Nie udało się sparsować JSON:", err);
        }
        // usuń blok json z tekstu markdown
        text = text.replace(/```json[\s\S]*?```/, "").trim();
      }

      setAnalysis(text);
      setConfidence(conf?.items || conf?.confidence?.items || null);
    } catch (e) {
      console.error(e);
      setError(e.message || "Wystąpił błąd podczas analizy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900 p-6">
      {/* HEADER */}
      <header className="max-w-4xl mx-auto text-center mb-10">
        <div className="flex justify-center items-center gap-2 mb-3">
          <Stethoscope className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-blue-700">SymptoCheck</h1>
        </div>
        <p className="text-gray-600">
          Opisz swoje objawy, a AI zasugeruje potencjalne diagnozy. <br />
          <span className="font-medium">
            To narzędzie informacyjne, nie porada medyczna.
          </span>
        </p>
      </header>

      {/* GRID Z KARTAMI */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {/* KARTA INPUT */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold mb-2 text-blue-700">
            Wprowadzanie objawów
          </h2>
          <p className="text-gray-500 mb-4">
            Podaj szczegóły (czas trwania, nasilenie, temperatura, inne choroby).
          </p>

          <textarea
            rows={6}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="np. Uporczywy kaszel od 3 dni, gorączka 38.2, ból gardła, zmęczenie."
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Analizuję..." : "Analizuj objawy"}
          </button>

          {error && (
            <p className="text-red-600 mt-3 text-sm bg-red-50 p-2 rounded-md border border-red-100">
              {error}
            </p>
          )}
        </div>

        {/* KARTA WYNIKU */}
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-semibold text-blue-700">Analiza AI</h2>
          </div>

          {loading && <p className="text-gray-500 italic">Analizuję objawy…</p>}

          {!loading && analysis && (
            <>
              <div className="prose max-w-none text-gray-800 mb-6">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {analysis}
                </ReactMarkdown>
              </div>

              {/* --- ŁADNA SEKCJA PEWNOŚCI --- */}
              {confidence?.length > 0 && (
                <div className="mt-6 bg-blue-50 rounded-xl p-5 border border-blue-100 shadow-inner">
                  <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    🔍 Szacowane prawdopodobieństwo diagnozy
                  </h3>

                  <div className="space-y-3">
                    {confidence.map((it, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                          <span>{it.name}</span>
                          <span className="text-blue-700">
                            {(it.prob * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${getBarColor(
                              it.prob
                            )} h-2.5 rounded-full transition-[width] duration-700 ease-out`}
                            style={{ width: `${it.prob * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !analysis && !error && (
            <p className="text-gray-400 italic mt-4">
              Twoja analiza pojawi się tutaj.
            </p>
          )}

          <div className="mt-6 text-sm text-gray-600 border-t pt-4">
            <strong className="text-red-600">
              To nie jest porada medyczna.
            </strong>
            <br />
            W razie objawów alarmowych skontaktuj się z pogotowiem.
          </div>
        </div>
      </div>

      <footer className="text-center text-gray-500 text-sm mt-10">
        SymptoCheck © 2025
      </footer>
    </div>
  );
}
