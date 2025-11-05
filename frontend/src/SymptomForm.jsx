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
      setError("Wpisz swoje objawy, aby rozpocząć analizę.");
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
      const jsonMatch = text.match(/```json\s*([\s\S]*?)```/);
      let conf = null;

      if (jsonMatch) {
        try {
          conf = JSON.parse(jsonMatch[1]);
        } catch {}
        text = text.replace(/```json[\s\S]*?```/, "").trim();
      }

      setAnalysis(text);
      setConfidence(conf?.items || conf?.confidence?.items || null);
    } catch (e) {
      setError(e.message || "Wystąpił błąd podczas analizy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-blue-50 text-gray-900">
      {/* HEADER */}
      <header className="text-center pt-8 pb-4 mb-10">
        <div className="flex justify-center items-center gap-2 mb-3">
          <Stethoscope className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-black">SymptoCheck</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          Opisz swoje objawy, a sztuczna inteligencja zasugeruje potencjalne
          diagnozy. <br />
          <span className="font-medium">
            To narzędzie do uzyskania wstępnych informacji, a nie substytut
            profesjonalnej porady medycznej.
          </span>
        </p>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 pb-10">
        <div className="w-full max-w-7xl grid md:grid-cols-2 gap-8 mb-8">
          {/* INPUT CARD */}
          <div
              className="bg-white shadow-md rounded-xl p-6 border border-gray-100 flex flex-col justify-between transition-all hover:shadow-lg">
            <div>
              <h2 className="text-2xl font-semibold mb-2 text-black">
                Wprowadzanie objawów
              </h2>
              <p className="text-gray-500 mb-4 text-sm leading-relaxed">
                Podaj szczegółowy opis tego, czego doświadczasz.
              </p>

              <textarea
                  rows={5}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="np. Mam uporczywy kaszel, lekką gorączkę i czuję się bardzo zmęczony."
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all resize-none"
              />
              <p className="text-gray-400 text-xs mt-1">
                Im więcej szczegółów podasz, tym lepsza będzie analiza.
              </p>
            </div>

            <button
                onClick={handleAnalyze}
                disabled={loading}
                className="mt-5 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-60"
            >
              {loading ? "Analizuję..." : "Analizuj objawy"}
            </button>

            {error && (
                <p className="text-red-600 mt-3 text-sm bg-red-50 p-2 rounded-md border border-red-200">
                  {error}
                </p>
            )}
          </div>

          {/* CONFIDENCE CARD */}
          <div
              className="bg-white shadow-md rounded-xl p-6 border border-gray-100 flex flex-col transition-all hover:shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-blue-500"/>
              <h2 className="text-2xl font-semibold text-black">
                Pewność diagnoz
              </h2>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Szacowane prawdopodobieństwo rozpoznania na podstawie analizy AI.
            </p>

            {confidence?.length > 0 ? (
                <div className="space-y-3">
                  {confidence.map((it, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                          <span>{it.name}</span>
                          <span className="text-blue-700">{(it.prob * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                              className={`bg-gradient-to-r ${getBarColor(
                                  it.prob
                              )} h-2.5 rounded-full transition-[width] duration-700 ease-out`}
                              style={{width: `${it.prob * 100}%`}}
                          ></div>
                        </div>
                      </div>
                  ))}
                </div>
            ) : (
                <p className="text-gray-400 italic text-center mt-6">
                  Brak danych o pewności diagnoz.
                </p>
            )}
          </div>
        </div>

        {/* ANALYSIS CARD (pełna szerokość) */}
        <div
            className="w-full max-w-7xl bg-white shadow-md rounded-xl p-6 border border-gray-100 transition-all hover:shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-green-500"/>
            <h2 className="text-2xl font-semibold text-black">Analiza AI</h2>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Potencjalne schorzenia na podstawie Twoich objawów.
          </p>

          {loading && (
              <div className="text-center text-gray-500 italic py-5">
                Trwa analiza objawów...
              </div>
          )}

          {!loading && analysis && (
              <div className="prose max-w-none text-gray-800 leading-relaxed animate-fadeIn">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{analysis}</ReactMarkdown>
              </div>
          )}

          {!loading && !analysis && !error && (
              <p className="text-gray-400 italic mt-4 flex justify-center">
                Twoja analiza pojawi się tutaj.
              </p>
          )}

          <div
              className="mt-6 text-sm text-gray-700 rounded-md p-3"
              style={{
                backgroundColor: "#FFF5F5",
                border: "1px solid #fbc2c4",
                color: "#ff1818",
              }}
          >
            <strong>To nie jest porada medyczna.</strong>{" "}
            Skonsultuj się z lekarzem w celu uzyskania właściwej diagnozy.
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="text-center text-gray-500 text-xs py-4">
        SymptoCheck © 2025. Tylko w celach informacyjnych.
      </footer>
    </div>
  );
}
