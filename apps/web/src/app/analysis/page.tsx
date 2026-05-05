"use client";
import React, { useState } from "react";
import Link from "next/link";
import { appendCapturedAnalysis } from "@/lib/commandCenterStore";
import type { AnalysisSource, CapturedAnalysis } from "@/lib/commandCenterTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

type AnalysisType = "adres" | "deal" | "bolge" | "risk";

const ANALYSIS_CARDS: { id: AnalysisType; title: string; detail: string; accent: string }[] = [
  {
    id: "adres",
    title: "Adres Analizi",
    detail: "Sokak ve mahalle bazında piyasa, kira getirisi ve rekabet analizi.",
    accent: "#FFD700",
  },
  {
    id: "deal",
    title: "Deal Skoru",
    detail: "Mulk fiyatinin piyasaya kiyasla konumunu 0-100 skoru ile gosterir.",
    accent: "#22c55e",
  },
  {
    id: "bolge",
    title: "Bolge Hakimiyeti",
    detail: "Ilce ve mahalle bazinda pazar payi ve hakimiyet stratejisi raporu.",
    accent: "#38bdf8",
  },
  {
    id: "risk",
    title: "Risk Analizi",
    detail: "Yatirim tutari, lokasyon ve hedefe gore risk skoru ve senaryo analizi.",
    accent: "#e879f9",
  },
];

const D = {
  bg: "#080808", bg2: "#0d0d0d", bg3: "#111",
  brd: "#1a1a1a", brd2: "#222",
  gold: "#FFD700", text: "#e0e0e0", muted: "#555", dim: "#333",
};

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 7, border: `1px solid ${D.brd2}`,
  background: D.bg3, color: D.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const lbl: React.CSSProperties = { fontSize: 11, color: D.muted, display: "block", marginBottom: 5, letterSpacing: 1 };
const fld: React.CSSProperties = { marginBottom: 14 };
const ILLER = ["istanbul","ankara","izmir","bursa","antalya","adana","konya","gaziantep","mugla","kayseri","mersin"];

type InpProps = {
  label: string;
  val: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  ph?: string;
  type?: string;
};

const Inp = ({ label, val, onChange, ph = "", type = "text" }: InpProps) => (
  <div style={fld}>
    <label style={lbl}>{label}</label>
    <input style={inp} type={type} value={val} onChange={onChange} placeholder={ph} />
  </div>
);

function buildCapturedAnalysis(
  capture: { source: AnalysisSource; title: string; location?: string; price?: number },
  output: string,
  raw: Record<string, unknown>,
): CapturedAnalysis {
  const numericValues = Object.values(raw).filter((value): value is number => typeof value === "number");
  const score = pickNumber(raw, ["score", "skor", "deal_score", "dealScore", "puan"]) ?? numericValues.find((value) => value >= 0 && value <= 100);
  const riskScore = pickNumber(raw, ["risk", "risk_score", "riskScore"]);
  const marketPrice = pickNumber(raw, ["market_price", "marketPrice", "piyasa_fiyati", "tahmini_deger"]);

  return {
    id: crypto.randomUUID(),
    source: capture.source,
    title: capture.title,
    createdAt: new Date().toISOString(),
    location: capture.location,
    score,
    riskScore,
    price: capture.price,
    marketPrice,
    summary: output.split("\n").find(Boolean)?.slice(0, 220) || "Analiz sonucu kaydedildi.",
    raw: output,
  };
}

function pickNumber(raw: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = raw[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^\d.-]/g, ""));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}

export default function AnalysisPage() {
  const [selected, setSelected] = useState<AnalysisType | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const [adres, setAdres] = useState({ il: "istanbul", ilce: "", mahalle: "", sokak: "", numara: "", analiz_turu: "piyasa", mulk_tipi: "daire" });
  const [deal, setDeal]   = useState({ fiyat: "", net_m2: "", il: "istanbul", ilce: "", mahalle: "", sokak: "", numara: "", oda_sayisi: "3+1", bina_yasi: "", kat_no: "", toplam_kat: "", esyali: "Hayir" });
  const [bolge, setBolge] = useState({ il: "istanbul", ilce: "", mahalle: "" });
  const [risk, setRisk]   = useState({ yatirim_tutari: "", il: "istanbul", ilce: "", mahalle: "", mulk_tipi: "daire", hedef: "kira_geliri" });

  const post = async (
    path: string,
    body: object,
    capture: {
      source: AnalysisSource;
      title: string;
      location?: string;
      price?: number;
    },
  ) => {
    setLoading(true); setResult("");
    try {
      const res = await fetch(`${API_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      const output = d.analiz || d.skor_analizi || d.strateji || d.risk_analizi || JSON.stringify(d, null, 2);
      setResult(output);
      appendCapturedAnalysis(buildCapturedAnalysis(capture, output, d));
    } catch { setResult("Baglanti hatasi."); }
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const renderAdres = () => (
    <div>
      <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: D.gold }}>
        Mahalle + sokak + numara girerek sokak bazinda analiz alin
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>IL *</label>
          <select style={inp} value={adres.il} onChange={e => setAdres({ ...adres, il: e.target.value })}>
            {ILLER.map(i => <option key={i}>{i}</option>)}
          </select></div>
        <Inp label="ILCE *" val={adres.ilce} onChange={(e) => setAdres({ ...adres, ilce: e.target.value })} ph="Kadikoy" />
      </div>
      <Inp label="MAHALLE *" val={adres.mahalle} onChange={(e) => setAdres({ ...adres, mahalle: e.target.value })} ph="Moda Mahallesi" />
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
        <Inp label="SOKAK / CADDE" val={adres.sokak} onChange={(e) => setAdres({ ...adres, sokak: e.target.value })} ph="Bahariye Cad." />
        <Inp label="KAPI NO" val={adres.numara} onChange={(e) => setAdres({ ...adres, numara: e.target.value })} ph="45" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>ANALIZ TURU</label>
          <select style={inp} value={adres.analiz_turu} onChange={e => setAdres({ ...adres, analiz_turu: e.target.value })}>
            <option value="piyasa">Piyasa Analizi</option>
            <option value="yatirim">Yatirim Analizi</option>
            <option value="kira_getiri">Kira Getiri Analizi</option>
            <option value="rekabet">Rekabet Analizi</option>
          </select></div>
        <div style={fld}><label style={lbl}>MULK TIPI</label>
          <select style={inp} value={adres.mulk_tipi} onChange={e => setAdres({ ...adres, mulk_tipi: e.target.value })}>
            {["daire", "villa", "ofis", "dukkan", "arsa"].map(o => <option key={o}>{o}</option>)}
          </select></div>
      </div>
      <button style={{ background: loading || !adres.ilce || !adres.mahalle ? D.brd : D.gold, color: loading || !adres.ilce || !adres.mahalle ? D.muted : "#000", border: "none", borderRadius: 8, padding: "12px", fontSize: 13, fontWeight: 700, cursor: loading || !adres.ilce || !adres.mahalle ? "not-allowed" : "pointer", width: "100%", marginTop: 8 }}
        onClick={() => post("/api/v1/analysis/adres-analiz", adres, {
          source: "adres",
          title: `${adres.mahalle} adres analizi`,
          location: `${adres.il}/${adres.ilce}/${adres.mahalle}${adres.sokak ? `/${adres.sokak}` : ""}`,
        })} disabled={loading || !adres.ilce || !adres.mahalle}>
        {loading ? "Analiz Ediliyor..." : "Adres Analizi Yap"}
      </button>
    </div>
  );

  const renderDeal = () => (
    <div>
      <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#22c55e" }}>
        Tam adres + fiyat girerek o mulkun firsati mi pahali mi oldugunu ogrenin
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="SATIS FIYATI (TL) *" val={deal.fiyat} onChange={(e) => setDeal({ ...deal, fiyat: e.target.value })} ph="4500000" />
        <Inp label="NET M2 *" val={deal.net_m2} onChange={(e) => setDeal({ ...deal, net_m2: e.target.value })} ph="120" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>IL *</label>
          <select style={inp} value={deal.il} onChange={e => setDeal({ ...deal, il: e.target.value })}>
            {ILLER.map(i => <option key={i}>{i}</option>)}
          </select></div>
        <Inp label="ILCE *" val={deal.ilce} onChange={(e) => setDeal({ ...deal, ilce: e.target.value })} ph="Kadikoy" />
      </div>
      <Inp label="MAHALLE *" val={deal.mahalle} onChange={(e) => setDeal({ ...deal, mahalle: e.target.value })} ph="Moda" />
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
        <Inp label="SOKAK" val={deal.sokak} onChange={(e) => setDeal({ ...deal, sokak: e.target.value })} ph="Bahariye Cad." />
        <Inp label="NO" val={deal.numara} onChange={(e) => setDeal({ ...deal, numara: e.target.value })} ph="45" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Inp label="BINA YASI" val={deal.bina_yasi} onChange={(e) => setDeal({ ...deal, bina_yasi: e.target.value })} ph="10" />
        <Inp label="KAT NO" val={deal.kat_no} onChange={(e) => setDeal({ ...deal, kat_no: e.target.value })} ph="3" />
        <Inp label="TOPLAM KAT" val={deal.toplam_kat} onChange={(e) => setDeal({ ...deal, toplam_kat: e.target.value })} ph="8" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>ODA</label>
          <select style={inp} value={deal.oda_sayisi} onChange={e => setDeal({ ...deal, oda_sayisi: e.target.value })}>
            {["1+0", "1+1", "2+1", "3+1", "4+1", "5+1"].map(o => <option key={o}>{o}</option>)}
          </select></div>
        <div style={fld}><label style={lbl}>ESYALI</label>
          <select style={inp} value={deal.esyali} onChange={e => setDeal({ ...deal, esyali: e.target.value })}>
            {["Hayir", "Evet"].map(o => <option key={o}>{o}</option>)}
          </select></div>
      </div>
      <button style={{ background: loading || !deal.fiyat || !deal.ilce || !deal.mahalle ? D.brd : "#22c55e", color: loading || !deal.fiyat || !deal.ilce || !deal.mahalle ? D.muted : "#000", border: "none", borderRadius: 8, padding: "12px", fontSize: 13, fontWeight: 700, cursor: loading || !deal.fiyat || !deal.ilce || !deal.mahalle ? "not-allowed" : "pointer", width: "100%", marginTop: 8 }}
        onClick={() => post("/api/v1/analysis/deal-score", { ...deal, fiyat: parseFloat(deal.fiyat), net_m2: parseFloat(deal.net_m2), bina_yasi: parseInt(deal.bina_yasi), kat_no: parseInt(deal.kat_no), toplam_kat: parseInt(deal.toplam_kat) }, {
          source: "deal",
          title: `${deal.mahalle} ${deal.oda_sayisi} deal skoru`,
          location: `${deal.il}/${deal.ilce}/${deal.mahalle}`,
          price: parseFloat(deal.fiyat),
        })}
        disabled={loading || !deal.fiyat || !deal.ilce || !deal.mahalle}>
        {loading ? "Skorlaniyor..." : "Deal Skoru Hesapla"}
      </button>
    </div>
  );

  const renderBolge = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>IL *</label>
          <select style={inp} value={bolge.il} onChange={e => setBolge({ ...bolge, il: e.target.value })}>
            {ILLER.map(i => <option key={i}>{i}</option>)}
          </select></div>
        <Inp label="ILCE *" val={bolge.ilce} onChange={(e) => setBolge({ ...bolge, ilce: e.target.value })} ph="Esenyurt" />
      </div>
      <Inp label="MAHALLE (opsiyonel)" val={bolge.mahalle} onChange={(e) => setBolge({ ...bolge, mahalle: e.target.value })} ph="Birlik Mah." />
      <button style={{ background: loading || !bolge.ilce ? D.brd : "#38bdf8", color: loading || !bolge.ilce ? D.muted : "#000", border: "none", borderRadius: 8, padding: "12px", fontSize: 13, fontWeight: 700, cursor: loading || !bolge.ilce ? "not-allowed" : "pointer", width: "100%", marginTop: 8 }}
        onClick={() => post("/api/v1/analysis/bolge-hakimiyet", bolge, {
          source: "bolge",
          title: `${bolge.ilce} bölge hakimiyeti`,
          location: `${bolge.il}/${bolge.ilce}${bolge.mahalle ? `/${bolge.mahalle}` : ""}`,
        })} disabled={loading || !bolge.ilce}>
        {loading ? "Strateji Olusturuluyor..." : "Hakimiyet Stratejisi Olustur"}
      </button>
    </div>
  );

  const renderRisk = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="YATIRIM TUTARI (TL) *" val={risk.yatirim_tutari} onChange={(e) => setRisk({ ...risk, yatirim_tutari: e.target.value })} ph="5000000" />
        <div style={fld}><label style={lbl}>IL *</label>
          <select style={inp} value={risk.il} onChange={e => setRisk({ ...risk, il: e.target.value })}>
            {ILLER.map(i => <option key={i}>{i}</option>)}
          </select></div>
      </div>
      <Inp label="ILCE *" val={risk.ilce} onChange={(e) => setRisk({ ...risk, ilce: e.target.value })} ph="Sarıyer" />
      <Inp label="MAHALLE *" val={risk.mahalle} onChange={(e) => setRisk({ ...risk, mahalle: e.target.value })} ph="Zekeriyakoy" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>MULK TIPI</label>
          <select style={inp} value={risk.mulk_tipi} onChange={e => setRisk({ ...risk, mulk_tipi: e.target.value })}>
            {["daire", "villa", "ofis", "dukkan", "arsa"].map(o => <option key={o}>{o}</option>)}
          </select></div>
        <div style={fld}><label style={lbl}>HEDEF</label>
          <select style={inp} value={risk.hedef} onChange={e => setRisk({ ...risk, hedef: e.target.value })}>
            <option value="kira_geliri">Kira Geliri</option>
            <option value="deger_artisi">Deger Artisi</option>
            <option value="kisa_vadeli_satis">Kisa Vadeli Satis</option>
          </select></div>
      </div>
      <button style={{ background: loading || !risk.ilce || !risk.mahalle ? D.brd : "#e879f9", color: loading || !risk.ilce || !risk.mahalle ? D.muted : "#000", border: "none", borderRadius: 8, padding: "12px", fontSize: 13, fontWeight: 700, cursor: loading || !risk.ilce || !risk.mahalle ? "not-allowed" : "pointer", width: "100%", marginTop: 8 }}
        onClick={() => post("/api/v1/analysis/risk", { ...risk, yatirim_tutari: parseFloat(risk.yatirim_tutari) }, {
          source: "risk",
          title: `${risk.mahalle} risk analizi`,
          location: `${risk.il}/${risk.ilce}/${risk.mahalle}`,
          price: parseFloat(risk.yatirim_tutari),
        })} disabled={loading || !risk.ilce || !risk.mahalle}>
        {loading ? "Analiz Ediliyor..." : "Risk Analizi Yap"}
      </button>
    </div>
  );

  const renderMap: Record<AnalysisType, () => React.ReactNode> = { adres: renderAdres, deal: renderDeal, bolge: renderBolge, risk: renderRisk };
  const activeCard = ANALYSIS_CARDS.find(c => c.id === selected);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: D.bg, color: D.text, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", overflow: "hidden" }}>

      {/* Sticky Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 44, borderBottom: `1px solid ${D.brd}`, background: D.bg, flexShrink: 0, position: "sticky", top: 0, zIndex: 10 }}>
        <Link href="/dashboard" style={{ textDecoration: "none", color: "#444", fontSize: 12 }}>
          {"<-"} Ana Merkez
        </Link>
        <div style={{ fontSize: 16, color: D.gold, letterSpacing: 4, fontWeight: 300 }}>VEGA</div>
        <div style={{ fontSize: 13, color: "#555" }}>Analiz Merkezi</div>
      </div>

      {/* Hub view */}
      {!selected && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 860 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {ANALYSIS_CARDS.map(card => (
                <div key={card.id} onClick={() => { setSelected(card.id); setResult(""); }}
                  style={{ background: `${card.accent}07`, border: `1px solid ${card.accent}20`, borderRadius: 16, padding: "32px 28px", cursor: "pointer", transition: "all 0.18s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${card.accent}50`; (e.currentTarget as HTMLDivElement).style.background = `${card.accent}12`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${card.accent}20`; (e.currentTarget as HTMLDivElement).style.background = `${card.accent}07`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                >
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: card.accent, marginBottom: 20, opacity: 0.8 }} />
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#d8d8d8", marginBottom: 10 }}>{card.title}</div>
                  <div style={{ fontSize: 13, color: "#3a3a3a", lineHeight: 1.65, marginBottom: 18 }}>{card.detail}</div>
                  <div style={{ fontSize: 12, color: card.accent, opacity: 0.7 }}>Analizi Baslat</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Work view */}
      {selected && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Work header */}
          <div style={{ padding: "12px 24px", borderBottom: `1px solid ${D.brd}`, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <button onClick={() => { setSelected(null); setResult(""); }}
              style={{ background: "transparent", border: `1px solid ${D.brd2}`, borderRadius: 6, padding: "5px 12px", color: D.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {"<-"} Geri
            </button>
            <div style={{ fontSize: 14, fontWeight: 500, color: D.text }}>{activeCard?.title}</div>
          </div>

          {/* Form + Result */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* Form */}
            <div style={{ width: 480, borderRight: `1px solid ${D.brd}`, overflowY: "auto", padding: "20px 24px", flexShrink: 0 }}>
              {renderMap[selected]?.()}
            </div>

            {/* Result */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: D.bg }}>
              {loading && (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, border: `2px solid ${D.gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <div style={{ fontSize: 12, color: D.muted }}>AI analiz ediyor...</div>
                </div>
              )}
              {!loading && !result && (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, border: `1px solid ${D.brd2}`, borderRadius: 8 }} />
                  <div style={{ fontSize: 12, color: D.dim }}>Formu doldurun ve analizi baslatin</div>
                </div>
              )}
              {!loading && result && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: D.gold, fontWeight: 500, letterSpacing: 1 }}>SONUC</div>
                    <button onClick={copy} style={{ background: "transparent", border: `1px solid ${D.brd2}`, borderRadius: 6, padding: "5px 14px", color: copied ? D.gold : D.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                      {copied ? "Kopyalandi" : "Kopyala"}
                    </button>
                  </div>
                  <div style={{ background: D.bg2, border: `1px solid ${D.brd}`, borderRadius: 10, padding: "20px", fontSize: 13, lineHeight: 1.9, color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap" }}>
                    {result}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *::-webkit-scrollbar{width:4px} *::-webkit-scrollbar-track{background:transparent} *::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px}`}</style>
    </div>
  );
}
