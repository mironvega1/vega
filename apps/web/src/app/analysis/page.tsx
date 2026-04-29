"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Ana Merkez",           icon: "◈" },
  { href: "/ai",                 label: "Emlak Yapay Zekası",   icon: "◈" },
  { href: "/sozlesme",           label: "Sözleşme Merkezi",     icon: "▣" },
  { href: "/analysis",           label: "Analiz Merkezi",       icon: "◎" },
  { href: "/valuation",          label: "AI Değerleme",         icon: "⚡" },
  { href: "/map",                label: "Canlı Harita",         icon: "◉" },
  { href: "/listings",           label: "İlan Yönetimi",        icon: "▦" },
  { href: "/zone-scores",        label: "Bölge Skoru",          icon: "◐" },
  { href: "/bina-karsilastirma", label: "Kat Analizi",          icon: "▤" },
  { href: "/emsal",              label: "Emsal İstihbarat",     icon: "◭" },
  { href: "/report",             label: "PDF Rapor",            icon: "▣" },
];

type AnalysisType = "adres" | "deal" | "bolge" | "risk";

const ANALYSIS_CARDS: { id: AnalysisType; title: string; desc: string; detail: string; accent: string; icon: string }[] = [
  {
    id: "adres",
    title: "Adres Analizi",
    desc: "Sokak ve mahalle bazında piyasa analizi alın.",
    detail: "Verilen adres için piyasa değeri, kira getirisi, rekabet durumu ve yatırım potansiyelini anlık veri ile hesaplar.",
    accent: "#FFD700",
    icon: "◉",
  },
  {
    id: "deal",
    title: "Deal Skoru",
    desc: "Mülk fiyatı uygun mu, pahalı mı öğrenin.",
    detail: "Girdiğiniz mülk özelliklerine göre fiyatın piyasaya kıyasla ne durumda olduğunu 0–100 skoru ile gösterir.",
    accent: "#22c55e",
    icon: "◈",
  },
  {
    id: "bolge",
    title: "Bölge Hakimiyeti",
    desc: "Seçili bölge için strateji raporu oluşturun.",
    detail: "İlçe veya mahalle bazında pazar payı analizi, rakip yoğunluğu ve hakimiyet stratejisi çıkarır.",
    accent: "#38bdf8",
    icon: "◭",
  },
  {
    id: "risk",
    title: "Risk Analizi",
    desc: "Yatırım riskini ve beklenen getiriyi hesaplayın.",
    detail: "Tutar, lokasyon ve hedef kombinasyonuna göre yatırım risk skoru, senaryo analizi ve tavsiye üretir.",
    accent: "#e879f9",
    icon: "◎",
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

const Inp = ({ label, val, onChange, ph = "", type = "text" }: any) => (
  <div style={fld}>
    <label style={lbl}>{label}</label>
    <input style={inp} type={type} value={val} onChange={onChange} placeholder={ph} />
  </div>
);

const Section = ({ title }: { title: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #1a1a1a" }}>
    <span style={{ fontSize: 11, color: D.gold, letterSpacing: 2, fontWeight: 500 }}>{title}</span>
  </div>
);

export default function AnalysisPage() {
  const pathname = usePathname();
  const [selected, setSelected] = useState<AnalysisType | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const [adres, setAdres] = useState({ il: "istanbul", ilce: "", mahalle: "", sokak: "", numara: "", analiz_turu: "piyasa", mulk_tipi: "daire" });
  const [deal, setDeal]   = useState({ fiyat: "", net_m2: "", il: "istanbul", ilce: "", mahalle: "", sokak: "", numara: "", oda_sayisi: "3+1", bina_yasi: "", kat_no: "", toplam_kat: "", esyali: "Hayır" });
  const [bolge, setBolge] = useState({ il: "istanbul", ilce: "", mahalle: "" });
  const [risk, setRisk]   = useState({ yatirim_tutari: "", il: "istanbul", ilce: "", mahalle: "", mulk_tipi: "daire", hedef: "kira_geliri" });

  const post = async (path: string, body: object) => {
    setLoading(true); setResult("");
    try {
      const res = await fetch(`${API_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      setResult(d.analiz || d.skor_analizi || d.strateji || d.risk_analizi || JSON.stringify(d, null, 2));
    } catch { setResult("Bağlantı hatası."); }
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const renderAdres = () => (
    <div>
      <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: D.gold }}>
        Mahalle + sokak + numara girerek sokak bazında analiz alın
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>IL *</label>
          <select style={inp} value={adres.il} onChange={e => setAdres({ ...adres, il: e.target.value })}>
            {ILLER.map(i => <option key={i}>{i}</option>)}
          </select></div>
        <Inp label="ILCE *" val={adres.ilce} onChange={(e: any) => setAdres({ ...adres, ilce: e.target.value })} ph="Kadıköy" />
      </div>
      <Inp label="MAHALLE *" val={adres.mahalle} onChange={(e: any) => setAdres({ ...adres, mahalle: e.target.value })} ph="Moda Mahallesi" />
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
        <Inp label="SOKAK / CADDE" val={adres.sokak} onChange={(e: any) => setAdres({ ...adres, sokak: e.target.value })} ph="Bahariye Cad." />
        <Inp label="KAPI NO" val={adres.numara} onChange={(e: any) => setAdres({ ...adres, numara: e.target.value })} ph="45" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>ANALIZ TURU</label>
          <select style={inp} value={adres.analiz_turu} onChange={e => setAdres({ ...adres, analiz_turu: e.target.value })}>
            <option value="piyasa">Piyasa Analizi</option>
            <option value="yatirim">Yatırım Analizi</option>
            <option value="kira_getiri">Kira Getiri Analizi</option>
            <option value="rekabet">Rekabet Analizi</option>
          </select></div>
        <div style={fld}><label style={lbl}>MULK TIPI</label>
          <select style={inp} value={adres.mulk_tipi} onChange={e => setAdres({ ...adres, mulk_tipi: e.target.value })}>
            {["daire", "villa", "ofis", "dükkan", "arsa"].map(o => <option key={o}>{o}</option>)}
          </select></div>
      </div>
      <button style={{ background: loading || !adres.ilce || !adres.mahalle ? D.brd : D.gold, color: loading || !adres.ilce || !adres.mahalle ? D.muted : "#000", border: "none", borderRadius: 8, padding: "12px", fontSize: 13, fontWeight: 700, cursor: loading || !adres.ilce || !adres.mahalle ? "not-allowed" : "pointer", width: "100%", marginTop: 8 }}
        onClick={() => post("/api/v1/analysis/adres-analiz", adres)} disabled={loading || !adres.ilce || !adres.mahalle}>
        {loading ? "Analiz Ediliyor..." : "Adres Analizi Yap"}
      </button>
    </div>
  );

  const renderDeal = () => (
    <div>
      <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#22c55e" }}>
        Tam adres + fiyat girerek o mülkün fırsatı mı pahalı mı olduğunu öğrenin
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="SATIS FIYATI (TL) *" val={deal.fiyat} onChange={(e: any) => setDeal({ ...deal, fiyat: e.target.value })} ph="4500000" />
        <Inp label="NET M² *" val={deal.net_m2} onChange={(e: any) => setDeal({ ...deal, net_m2: e.target.value })} ph="120" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>IL *</label>
          <select style={inp} value={deal.il} onChange={e => setDeal({ ...deal, il: e.target.value })}>
            {ILLER.map(i => <option key={i}>{i}</option>)}
          </select></div>
        <Inp label="ILCE *" val={deal.ilce} onChange={(e: any) => setDeal({ ...deal, ilce: e.target.value })} ph="Kadıköy" />
      </div>
      <Inp label="MAHALLE *" val={deal.mahalle} onChange={(e: any) => setDeal({ ...deal, mahalle: e.target.value })} ph="Moda" />
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
        <Inp label="SOKAK" val={deal.sokak} onChange={(e: any) => setDeal({ ...deal, sokak: e.target.value })} ph="Bahariye Cad." />
        <Inp label="NO" val={deal.numara} onChange={(e: any) => setDeal({ ...deal, numara: e.target.value })} ph="45" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Inp label="BINA YASI" val={deal.bina_yasi} onChange={(e: any) => setDeal({ ...deal, bina_yasi: e.target.value })} ph="10" />
        <Inp label="KAT NO" val={deal.kat_no} onChange={(e: any) => setDeal({ ...deal, kat_no: e.target.value })} ph="3" />
        <Inp label="TOPLAM KAT" val={deal.toplam_kat} onChange={(e: any) => setDeal({ ...deal, toplam_kat: e.target.value })} ph="8" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>ODA</label>
          <select style={inp} value={deal.oda_sayisi} onChange={e => setDeal({ ...deal, oda_sayisi: e.target.value })}>
            {["1+0", "1+1", "2+1", "3+1", "4+1", "5+1"].map(o => <option key={o}>{o}</option>)}
          </select></div>
        <div style={fld}><label style={lbl}>ESYALI</label>
          <select style={inp} value={deal.esyali} onChange={e => setDeal({ ...deal, esyali: e.target.value })}>
            {["Hayır", "Evet"].map(o => <option key={o}>{o}</option>)}
          </select></div>
      </div>
      <button style={{ background: loading || !deal.fiyat || !deal.ilce || !deal.mahalle ? D.brd : "#22c55e", color: loading || !deal.fiyat || !deal.ilce || !deal.mahalle ? D.muted : "#000", border: "none", borderRadius: 8, padding: "12px", fontSize: 13, fontWeight: 700, cursor: loading || !deal.fiyat || !deal.ilce || !deal.mahalle ? "not-allowed" : "pointer", width: "100%", marginTop: 8 }}
        onClick={() => post("/api/v1/analysis/deal-score", { ...deal, fiyat: parseFloat(deal.fiyat), net_m2: parseFloat(deal.net_m2), bina_yasi: parseInt(deal.bina_yasi), kat_no: parseInt(deal.kat_no), toplam_kat: parseInt(deal.toplam_kat) })}
        disabled={loading || !deal.fiyat || !deal.ilce || !deal.mahalle}>
        {loading ? "Skorlanıyor..." : "Deal Skoru Hesapla"}
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
        <Inp label="ILCE *" val={bolge.ilce} onChange={(e: any) => setBolge({ ...bolge, ilce: e.target.value })} ph="Esenyurt" />
      </div>
      <Inp label="MAHALLE (opsiyonel)" val={bolge.mahalle} onChange={(e: any) => setBolge({ ...bolge, mahalle: e.target.value })} ph="Birlik Mah." />
      <button style={{ background: loading || !bolge.ilce ? D.brd : "#38bdf8", color: loading || !bolge.ilce ? D.muted : "#000", border: "none", borderRadius: 8, padding: "12px", fontSize: 13, fontWeight: 700, cursor: loading || !bolge.ilce ? "not-allowed" : "pointer", width: "100%", marginTop: 8 }}
        onClick={() => post("/api/v1/analysis/bolge-hakimiyet", bolge)} disabled={loading || !bolge.ilce}>
        {loading ? "Strateji Oluşturuluyor..." : "Hakimiyet Stratejisi Oluştur"}
      </button>
    </div>
  );

  const renderRisk = () => (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="YATIRIM TUTARI (TL) *" val={risk.yatirim_tutari} onChange={(e: any) => setRisk({ ...risk, yatirim_tutari: e.target.value })} ph="5000000" />
        <div style={fld}><label style={lbl}>IL *</label>
          <select style={inp} value={risk.il} onChange={e => setRisk({ ...risk, il: e.target.value })}>
            {ILLER.map(i => <option key={i}>{i}</option>)}
          </select></div>
      </div>
      <Inp label="ILCE *" val={risk.ilce} onChange={(e: any) => setRisk({ ...risk, ilce: e.target.value })} ph="Sarıyer" />
      <Inp label="MAHALLE *" val={risk.mahalle} onChange={(e: any) => setRisk({ ...risk, mahalle: e.target.value })} ph="Zekeriyaköy" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>MULK TIPI</label>
          <select style={inp} value={risk.mulk_tipi} onChange={e => setRisk({ ...risk, mulk_tipi: e.target.value })}>
            {["daire", "villa", "ofis", "dükkan", "arsa"].map(o => <option key={o}>{o}</option>)}
          </select></div>
        <div style={fld}><label style={lbl}>HEDEF</label>
          <select style={inp} value={risk.hedef} onChange={e => setRisk({ ...risk, hedef: e.target.value })}>
            <option value="kira_geliri">Kira Geliri</option>
            <option value="deger_artisi">Değer Artışı</option>
            <option value="kisa_vadeli_satis">Kısa Vadeli Satış</option>
          </select></div>
      </div>
      <button style={{ background: loading || !risk.ilce || !risk.mahalle ? D.brd : "#e879f9", color: loading || !risk.ilce || !risk.mahalle ? D.muted : "#000", border: "none", borderRadius: 8, padding: "12px", fontSize: 13, fontWeight: 700, cursor: loading || !risk.ilce || !risk.mahalle ? "not-allowed" : "pointer", width: "100%", marginTop: 8 }}
        onClick={() => post("/api/v1/analysis/risk", { ...risk, yatirim_tutari: parseFloat(risk.yatirim_tutari) })} disabled={loading || !risk.ilce || !risk.mahalle}>
        {loading ? "Analiz Ediliyor..." : "Risk Analizi Yap"}
      </button>
    </div>
  );

  const renderMap: Record<AnalysisType, () => React.ReactNode> = { adres: renderAdres, deal: renderDeal, bolge: renderBolge, risk: renderRisk };
  const activeCard = ANALYSIS_CARDS.find(c => c.id === selected);

  return (
    <div style={{ display: "flex", height: "100vh", background: D.bg, color: D.text, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", overflow: "hidden" }}>

      {/* Sol Nav */}
      <div style={{ width: 220, borderRight: `1px solid ${D.brd}`, display: "flex", flexDirection: "column", background: "#0a0a0a", flexShrink: 0 }}>
        <div style={{ padding: "22px 18px 18px", borderBottom: `1px solid ${D.brd}` }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <div style={{ fontSize: 20, color: D.gold, letterSpacing: 4, fontWeight: 300 }}>VEGA</div>
            <div style={{ fontSize: 9, color: D.dim, marginTop: 3, letterSpacing: 4 }}>INTELLIGENCE</div>
          </Link>
        </div>
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", color: active ? D.gold : D.muted, textDecoration: "none", fontSize: 12, borderLeft: active ? `2px solid ${D.gold}` : "2px solid transparent", background: active ? "rgba(255,215,0,0.05)" : "transparent" }}>
                <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{item.icon}</span>
                <span style={{ fontWeight: active ? 500 : 400 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Ana Alan */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Başlık */}
        <div style={{ padding: "16px 28px", borderBottom: `1px solid ${D.brd}`, display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          {selected && (
            <button onClick={() => { setSelected(null); setResult(""); }}
              style={{ background: "transparent", border: `1px solid ${D.brd2}`, borderRadius: 6, padding: "5px 12px", color: D.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              ← Geri
            </button>
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{selected ? activeCard?.title : "Analiz Merkezi"}</div>
            <div style={{ fontSize: 11, color: D.muted, marginTop: 1 }}>{selected ? activeCard?.detail : "Hangi analizi yapmak istersiniz?"}</div>
          </div>
        </div>

        {/* Hub: Kart Seçimi */}
        {!selected && (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
            <div style={{ width: "100%", maxWidth: 800 }}>
              <div style={{ fontSize: 10, color: "#2a2a2a", letterSpacing: 3, marginBottom: 20, textAlign: "center" }}>ANALİZ TÜRÜ SEÇİN</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {ANALYSIS_CARDS.map(card => (
                  <div key={card.id} onClick={() => { setSelected(card.id); setResult(""); }}
                    style={{ background: `${card.accent}07`, border: `1px solid ${card.accent}20`, borderRadius: 16, padding: "28px 24px", cursor: "pointer", transition: "all 0.18s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${card.accent}50`; (e.currentTarget as HTMLDivElement).style.background = `${card.accent}12`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${card.accent}20`; (e.currentTarget as HTMLDivElement).style.background = `${card.accent}07`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${card.accent}14`, border: `1px solid ${card.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: card.accent, marginBottom: 16 }}>
                      {card.icon}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#d8d8d8", marginBottom: 8 }}>{card.title}</div>
                    <div style={{ fontSize: 12, color: "#3a3a3a", lineHeight: 1.65, marginBottom: 14 }}>{card.detail}</div>
                    <div style={{ fontSize: 12, color: card.accent, opacity: 0.7 }}>Analizi Baslat →</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analiz Formu + Sonuç */}
        {selected && (
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <div style={{ width: 460, borderRight: `1px solid ${D.brd}`, overflowY: "auto", padding: "20px 24px", flexShrink: 0 }}>
              {renderMap[selected]?.()}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: D.bg }}>
              {loading && (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, border: `2px solid ${D.gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <div style={{ fontSize: 12, color: D.muted }}>AI analiz ediyor...</div>
                </div>
              )}
              {!loading && !result && (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ fontSize: 36, color: D.brd }}>◎</div>
                  <div style={{ fontSize: 12, color: D.dim }}>Formu doldurun ve analizi başlatın</div>
                </div>
              )}
              {!loading && result && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: D.gold, fontWeight: 500, letterSpacing: 1 }}>SONUC</div>
                    <button onClick={copy} style={{ background: "transparent", border: `1px solid ${D.brd2}`, borderRadius: 6, padding: "5px 14px", color: copied ? D.gold : D.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                      {copied ? "Kopyalandı" : "Kopyala"}
                    </button>
                  </div>
                  <div style={{ background: D.bg2, border: `1px solid ${D.brd}`, borderRadius: 10, padding: "20px", fontSize: 13, lineHeight: 1.9, color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap" }}>
                    {result}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *::-webkit-scrollbar{width:4px} *::-webkit-scrollbar-track{background:transparent} *::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px}`}</style>
    </div>
  );
}
