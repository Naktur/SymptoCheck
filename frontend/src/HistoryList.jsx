import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

export default function HistoryList() {
  const [analyses, setAnalyses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [parsedConfidence, setParsedConfidence] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/analyses/`)
      .then((res) => res.json())
      .then(setAnalyses)
      .catch((e) => console.error(e));
  }, []);

  const openAnalysis = (a) => {
    setSelected(a);
    if (a.result_md) {
      const jsonMatch = a.result_md.match(/```json\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          const conf = JSON.parse(jsonMatch[1]);
          setParsedConfidence(conf.items || conf.confidence?.items || null);
        } catch {
          setParsedConfidence(null);
        }
      }
    }
  };

  const closeModal = () => {
    setSelected(null);
    setParsedConfidence(null);
  };

  const getBarColor = (p) => {
    if (p > 0.7) return "from-green-400 to-green-600";
    if (p > 0.4) return "from-yellow-400 to-yellow-600";
    return "from-red-400 to-red-600";
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
      <h2 className="text-2xl font-semibold text-blue-700 mb-4">Historia analiz</h2>
      {analyses.length === 0 ? (
        <p className="text-gray-500 italic">Brak zapisanych analiz.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {analyses.map((a) => (
            <li
              key={a.id}
              onClick={() => openAnalysis(a)}
              className="py-3 cursor-pointer hover:bg-blue-50 rounded transition"
            >
              <p className="text-sm text-gray-500">
                {new Date(a.created_at).toLocaleString()}
              </p>
              <p className="font-medium text-gray-800 line-clamp-2">
                {a.symptoms}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <h3 className="text-2xl font-semibold text-blue-700 mb-4">
              Szczegóły analizy
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Data: {new Date(selected.created_at).toLocaleString()}
            </p>

            <div className="prose max-w-none text-gray-800 mb-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selected.result_md?.replace(/```json[\s\S]*?```/, "")}
              </ReactMarkdown>
            </div>

            {parsedConfidence && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-3">
                  🔍 Szacowane prawdopodobieństwo diagnozy
                </h4>
                <div className="space-y-3">
                  {parsedConfidence.map((it, idx) => (
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
          </div>
        </div>
      )}
    </div>
  );
}
