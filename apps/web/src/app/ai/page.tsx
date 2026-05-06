"use client";
import { useState, useEffect, useRef } from "react";
import { useAgencyId } from "@/hooks/useAgencyId";
import { CenterSidebar } from "@/components/navigation/CenterSidebar";
import { analyzeCommandCenter } from "@/lib/analysisEngine";
import { readCommandCenterData } from "@/lib/commandCenterStore";
import { buildFeatureTraining } from "@/lib/featureTraining";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const SUGGESTIONS = [
  "Beşiktaş'ta 100m² daire değeri nedir?",
  "Esenyurt vs Kadıköy fiyat farkı",
  "İstanbul'da en değerli 5 ilçe",
  "Bodrum'da yatırım yapmalı mıyım?",
  "Ev alırken nelere dikkat etmeliyim?",
  "Kiraya vermek mi, satmak mı daha kârlı?",
];

type Listing = {
  fiyat?: number | string;
  il?: string;
};

export default function AiPage() {
  const { agencyId } = useAgencyId();
  const [stats, setStats] = useState({ total: 0, avg: 0, cities: 0 });
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content:
        "Merhaba! Ben Vega AI — Türkiye gayrimenkul piyasasının en kapsamlı AI asistanıyım.\n\nFiyat analizi, bölge karşılaştırması, yatırım tavsiyeleri ve piyasa trendleri konusunda yardımcı olabilirim.\n\nNe öğrenmek istersiniz?",
    },
  ]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!agencyId) return;
    fetch(`${API_URL}/api/v1/listings?limit=500`, { headers: { "agency-id": agencyId } })
      .then(r => r.json())
      .then(d => {
        const l: Listing[] = Array.isArray(d.listings) ? d.listings : [];
        const avg = l.length ? Math.round(l.reduce((a, b) => a + Number(b.fiyat), 0) / l.length) : 0;
        const cities = new Set(l.map((x) => x.il).filter(Boolean)).size;
        setStats({ total: l.length, avg, cities });
      }).catch(() => {});
  }, [agencyId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setAiLoading(true);
    const commandContext = buildCommandCenterContext();
    try {
      const res = await fetch(`${API_URL}/api/v1/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMsg }],
          context: `Sen Vega AI'sin. Türkiye gayrimenkul uzmanısın. Platform: ${stats.total} ilan, ort. ₺${stats.avg.toLocaleString("tr-TR")}, ${stats.cities} şehir. Kullanıcının Command Center verisi: ${commandContext}. Kısa, net ve kullanıcının kendi verisine bağlı Türkçe yanıt ver. Veri yoksa bunu açıkça söyle; sahte sonuç uydurma.`,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "Yanıt alınamadı." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Şu an bağlantı sorunu var. Lütfen tekrar deneyin." }]);
    }
    setAiLoading(false);
  };

  return (
    <div style={{
      display: "flex", height: "100vh",
      background: "#080808", color: "#e0e0e0",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      overflow: "hidden",
    }}>

      <CenterSidebar center="ai" />

      {/* Chat Alanı */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Başlık */}
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #161616", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, color: "#FFD700",
          }}>◈</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0" }}>Emlak Yapay Zekası</div>
            <div style={{ fontSize: 11, color: "#333" }}>Türkiye gayrimenkul uzmanı · v0.2</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            <span style={{ fontSize: 11, color: "#333" }}>Aktif</span>
          </div>
        </div>

        {/* Mesajlar */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              marginBottom: 16, display: "flex", gap: 10,
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-start",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                background: msg.role === "user" ? "rgba(255,255,255,0.06)" : "rgba(255,215,0,0.12)",
                border: msg.role === "user" ? "1px solid #1e1e1e" : "1px solid rgba(255,215,0,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: msg.role === "user" ? "#555" : "#FFD700", fontWeight: 600,
              }}>
                {msg.role === "user" ? "S" : "V"}
              </div>
              <div style={{
                maxWidth: "72%",
                background: msg.role === "user" ? "rgba(255,255,255,0.03)" : "rgba(255,215,0,0.02)",
                border: msg.role === "user" ? "1px solid #1a1a1a" : "1px solid rgba(255,215,0,0.08)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, lineHeight: 1.75,
                color: msg.role === "user" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.82)",
                whiteSpace: "pre-wrap",
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-start" }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#FFD700",
              }}>V</div>
              <div style={{
                background: "rgba(255,215,0,0.02)", border: "1px solid rgba(255,215,0,0.08)",
                borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#444",
              }}>Analiz ediliyor…</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Öneriler */}
        <div style={{ padding: "0 24px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)}
              style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid #1a1a1a",
                borderRadius: 16, padding: "5px 12px", fontSize: 11, color: "#444",
                cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#FFD700"; e.currentTarget.style.borderColor = "rgba(255,215,0,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#444"; e.currentTarget.style.borderColor = "#1a1a1a"; }}>
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "8px 24px 20px" }}>
          <div style={{
            display: "flex", gap: 10,
            background: "rgba(255,255,255,0.02)", border: "1px solid #1e1e1e",
            borderRadius: 10, padding: "10px 14px",
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Emlak sorunuzu sorun…"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={aiLoading || !input.trim()}
              style={{
                background: input.trim() ? "#FFD700" : "#161616",
                color: input.trim() ? "#000" : "#333",
                border: "none", borderRadius: 7, padding: "7px 18px",
                fontSize: 12, fontWeight: 500,
                cursor: input.trim() ? "pointer" : "default",
                transition: "all 0.15s", fontFamily: "inherit",
              }}>
              Sor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildCommandCenterContext() {
  const data = readCommandCenterData();
  const analysis = analyzeCommandCenter(data);
  const training = buildFeatureTraining(data);
  const topAction = analysis.actions[0];
  const highRisks = analysis.risks.filter((risk) => risk.level === "high").map((risk) => risk.label).join(", ") || "kritik risk yok";
  const weakestFeature = [...training].sort((a, b) => a.readiness - b.readiness)[0];
  const strongestFeature = [...training].sort((a, b) => b.readiness - a.readiness)[0];

  return [
    `${data.customers.length} müşteri`,
    `${data.portfolios.length} portföy`,
    `${data.deals.length} işlem`,
    `${data.analysisResults.length} analiz sonucu`,
    `tahmini kapanma %${Math.round(analysis.forecast.estimatedCloseRate * 100)}`,
    `beklenen sonuç ${analysis.forecast.expectedResult}`,
    `yüksek riskler: ${highRisks}`,
    topAction ? `öncelikli aksiyon: ${topAction.command} - ${topAction.title}` : "öncelikli aksiyon yok",
    weakestFeature ? `en zayıf eğitim: ${weakestFeature.title} ${weakestFeature.readiness}/100` : "özellik eğitimi yok",
    strongestFeature ? `en güçlü eğitim: ${strongestFeature.title} ${strongestFeature.readiness}/100` : "güçlü özellik yok",
  ].join("; ");
}
