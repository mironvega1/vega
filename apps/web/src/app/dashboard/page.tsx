"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAgencyId } from "@/hooks/useAgencyId";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const MERKEZLER = [
  {
    id: "analysis", title: "Analiz Merkezi", icon: "◎", href: "/analysis", accent: "#FFD700",
    desc: "Adres, fırsat ve bölge analizleri",
    features: ["Adres Analizi", "Deal Skoru", "Bölge Hakimiyeti", "Risk Analizi"],
  },
  {
    id: "sozlesme", title: "Sözleşme Merkezi", icon: "▣", href: "/sozlesme", accent: "#22c55e",
    desc: "TBK uyumlu sözleşme üretimi",
    features: ["Kira Sözleşmesi", "Satış Ön Sözleşmesi"],
  },
  {
    id: "report", title: "PDF Rapor Merkezi", icon: "▣", href: "/report", accent: "#60a5fa",
    desc: "Müşteriye hazır profesyonel rapor",
    features: ["AI Değerleme Raporu", "SHAP Faktör Analizi", "PDF İndirme"],
  },
];

const ARACLAR = [
  { id: "ai",       title: "Emlak Yapay Zekası", icon: "◈", href: "/ai",                 accent: "#FFD700", tag: "AI",  desc: "Piyasa analizi & yatırım tavsiyeleri" },
  { id: "valuation",title: "AI Değerleme",        icon: "⚡", href: "/valuation",          accent: "#a78bfa", tag: "ML",  desc: "Sokak bazlı ML fiyat tahmini" },
  { id: "map",      title: "Canlı Harita",        icon: "◉", href: "/map",                accent: "#38bdf8",             desc: "Fiyat ısı haritası & yoğunluk" },
  { id: "listings", title: "İlan Yönetimi",       icon: "▦", href: "/listings",            accent: "#fb923c",             desc: "Portföy yönetimi & CSV yükleme" },
  { id: "zone",     title: "Bölge Skoru",         icon: "◐", href: "/zone-scores",         accent: "#f472b6",             desc: "İlçe bazlı A/B/C/D yatırım skoru" },
  { id: "bina",     title: "Kat Analizi",         icon: "▤", href: "/bina-karsilastirma",  accent: "#34d399",             desc: "Bina içi kat fiyat farkları" },
  { id: "emsal",    title: "Emsal İstihbarat",    icon: "◭", href: "/emsal",               accent: "#e879f9",             desc: "Komşu satış ve emsal veritabanı" },
];

const MARKET_ITEMS = [
  { label: "İstanbul m²",       value: "₺89.400", change: "+4.2%", up: true },
  { label: "Ankara m²",         value: "₺42.800", change: "+3.1%", up: true },
  { label: "İzmir m²",          value: "₺61.200", change: "+2.7%", up: true },
  { label: "Kira/Satış Çarpanı",value: "×210",    change: "-0.8%", up: false },
  { label: "Ort. Satış Süresi", value: "47 gün",  change: "-3 gün", up: true },
];

export default function Dashboard() {
  const { agencyId } = useAgencyId();
  const [stats, setStats] = useState({ total: 0, avg: 0, cities: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [hov, setHov] = useState<string | null>(null);

  useEffect(() => {
    if (!agencyId) return;
    fetch(`${API_URL}/api/v1/listings?limit=500`, { headers: { "agency-id": agencyId } })
      .then(r => r.json())
      .then(d => {
        const l = d.listings || [];
        const avg    = l.length ? Math.round(l.reduce((a: number, b: any) => a + Number(b.fiyat), 0) / l.length) : 0;
        const cities = new Set(l.map((x: any) => x.il).filter(Boolean)).size;
        const active = l.filter((x: any) => x.durum === "active").length;
        setStats({ total: l.length, avg, cities, active });
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [agencyId]);

  const fmt = (n: number) => n.toLocaleString("tr-TR");

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e0e0e0", fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", overflowY: "auto" }}>

      {/* ── Header ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, height: 54, background: "rgba(8,8,8,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid #111", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 18, color: "#FFD700", letterSpacing: 5, fontWeight: 200 }}>VEGA</span>
          <span style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 3 }}>INTELLIGENCE</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { label: "Toplam", value: loading ? "—" : fmt(stats.total), color: "#FFD700" },
            { label: "Aktif",  value: loading ? "—" : fmt(stats.active), color: "#22c55e" },
            { label: "Ort. Fiyat", value: loading ? "—" : `₺${(stats.avg / 1_000_000).toFixed(1)}M`, color: "#c0c0c0" },
            { label: "Şehir",  value: loading ? "—" : String(stats.cities), color: "#555" },
          ].map(s => (
            <div key={s.label} style={{ padding: "5px 12px", background: "#0a0a0a", border: "1px solid #141414", borderRadius: 7, textAlign: "center", minWidth: 54 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#2a2a2a", marginTop: 3, letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px 80px" }}>

        {/* ── Piyasa Bandı ── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
          {MARKET_ITEMS.map(item => (
            <div key={item.label} style={{ flex: 1, background: "#0a0a0a", border: "1px solid #141414", borderRadius: 10, padding: "13px 16px" }}>
              <div style={{ fontSize: 9, color: "#222", letterSpacing: 1, marginBottom: 7 }}>{item.label.toUpperCase()}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: "#c0c0c0", lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: 10, color: item.up ? "#22c55e" : "#ef4444", marginTop: 5 }}>{item.change}</div>
            </div>
          ))}
        </div>

        {/* ── MERKEZLER ── */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 3, marginBottom: 14 }}>MERKEZLER</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {MERKEZLER.map(m => (
              <Link key={m.id} href={m.href} style={{ textDecoration: "none" }}>
                <div
                  onMouseEnter={() => setHov(m.id)}
                  onMouseLeave={() => setHov(null)}
                  style={{
                    background: hov === m.id ? `${m.accent}08` : "rgba(255,255,255,0.015)",
                    border: `1px solid ${hov === m.id ? `${m.accent}30` : "#141414"}`,
                    borderRadius: 14, padding: "22px 20px",
                    cursor: "pointer", transition: "all 0.15s",
                    transform: hov === m.id ? "translateY(-2px)" : "none",
                  }}
                >
                  {/* Icon + title */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: `${m.accent}12`, border: `1px solid ${m.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: m.accent, flexShrink: 0 }}>{m.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#d0d0d0" }}>{m.title}</div>
                      <div style={{ fontSize: 10, color: "#2a2a2a", marginTop: 2 }}>{m.desc}</div>
                    </div>
                  </div>
                  {/* Sub-features */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                    {m.features.map(f => (
                      <span key={f} style={{ fontSize: 10, color: hov === m.id ? m.accent : "#2e2e2e", background: hov === m.id ? `${m.accent}10` : "rgba(255,255,255,0.02)", border: `1px solid ${hov === m.id ? `${m.accent}20` : "#161616"}`, borderRadius: 4, padding: "2px 8px", transition: "all 0.15s" }}>
                        {f}
                      </span>
                    ))}
                  </div>
                  {/* Feature count */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 10, color: "#2a2a2a" }}>{m.features.length} özellik</div>
                    <div style={{ fontSize: 11, color: m.accent, opacity: hov === m.id ? 0.9 : 0.3, transition: "opacity 0.15s" }}>Merkeze Gir →</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── ARAÇLAR ── */}
        <div>
          <div style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 3, marginBottom: 14 }}>ARAÇLAR</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {ARACLAR.map(mod => (
              <Link key={mod.id} href={mod.href} style={{ textDecoration: "none" }}>
                <div
                  onMouseEnter={() => setHov(mod.id)}
                  onMouseLeave={() => setHov(null)}
                  style={{
                    background: hov === mod.id ? "rgba(255,255,255,0.025)" : "rgba(255,255,255,0.01)",
                    border: `1px solid ${hov === mod.id ? "rgba(255,255,255,0.08)" : "#141414"}`,
                    borderRadius: 12, padding: "16px",
                    cursor: "pointer", transition: "all 0.15s",
                    transform: hov === mod.id ? "translateY(-2px)" : "none",
                    position: "relative",
                  }}
                >
                  {"tag" in mod && mod.tag && (
                    <span style={{ position: "absolute", top: 10, right: 10, fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 3, background: `${mod.accent}18`, color: mod.accent, border: `1px solid ${mod.accent}28` }}>{mod.tag}</span>
                  )}
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${mod.accent}12`, border: `1px solid ${mod.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: mod.accent, marginBottom: 10 }}>{mod.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#b0b0b0", marginBottom: 4 }}>{mod.title}</div>
                  <div style={{ fontSize: 10, color: "#262626", lineHeight: 1.5 }}>{mod.desc}</div>
                  <div style={{ fontSize: 10, color: mod.accent, opacity: hov === mod.id ? 0.8 : 0.2, marginTop: 10, transition: "opacity 0.15s" }}>Aç →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
