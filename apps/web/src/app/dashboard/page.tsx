"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAgencyId } from "@/hooks/useAgencyId";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Ana Merkez",        icon: "◈" },
  { href: "/analysis",           label: "Analiz Merkezi",    icon: "◎" },
  { href: "/valuation",          label: "AI Değerleme",      icon: "⚡" },
  { href: "/map",                label: "Canlı Harita",      icon: "◉" },
  { href: "/listings",           label: "İlan Yönetimi",     icon: "▦" },
  { href: "/zone-scores",        label: "Bölge Skoru",       icon: "◐" },
  { href: "/bina-karsilastirma", label: "Kat Analizi",       icon: "▤" },
  { href: "/emsal",              label: "Emsal İstihbarat",  icon: "◭" },
  { href: "/report",             label: "PDF Rapor",         icon: "▣" },
];

const MODULES = [
  {
    id: "analysis",
    title: "Analiz Merkezi",
    desc: "Piyasa trendleri, bölgesel veriler ve portföy performansını derinlemesine analiz edin.",
    icon: "◎",
    href: "/analysis",
    accent: "#FFD700",
    bg: "rgba(255,215,0,0.04)",
    border: "rgba(255,215,0,0.15)",
    tag: null,
  },
  {
    id: "contract",
    title: "Sözleşme Merkezi",
    desc: "Kira ve satış sözleşmelerini dijital ortamda oluşturun, imzalayın ve arşivleyin.",
    icon: "▣",
    href: "/report",
    accent: "#22c55e",
    bg: "rgba(34,197,94,0.04)",
    border: "rgba(34,197,94,0.15)",
    tag: "Yakında",
  },
  {
    id: "valuation",
    title: "AI Değerleme",
    desc: "Yapay zeka destekli fiyat analizi ile mülklerinizi saniyeler içinde doğru değerlendirin.",
    icon: "⚡",
    href: "/valuation",
    accent: "#a78bfa",
    bg: "rgba(167,139,250,0.04)",
    border: "rgba(167,139,250,0.15)",
    tag: "AI",
  },
  {
    id: "map",
    title: "Canlı Harita",
    desc: "İlanlarınızı ve bölgesel fırsatları interaktif harita üzerinde koordinat bazlı keşfedin.",
    icon: "◉",
    href: "/map",
    accent: "#38bdf8",
    bg: "rgba(56,189,248,0.04)",
    border: "rgba(56,189,248,0.15)",
    tag: null,
  },
  {
    id: "listings",
    title: "İlan Yönetimi",
    desc: "Tüm ilanlarınızı yönetin, CSV ile toplu yükleme yapın ve mevcut ilanları takip edin.",
    icon: "▦",
    href: "/listings",
    accent: "#fb923c",
    bg: "rgba(251,146,60,0.04)",
    border: "rgba(251,146,60,0.15)",
    tag: null,
  },
  {
    id: "zone",
    title: "Bölge Skoru",
    desc: "Mahalleleri A/B/C/D skorlamasıyla değerlendirin, yatırım fırsatlarını tespit edin.",
    icon: "◐",
    href: "/zone-scores",
    accent: "#f472b6",
    bg: "rgba(244,114,182,0.04)",
    border: "rgba(244,114,182,0.15)",
    tag: null,
  },
  {
    id: "bina",
    title: "Kat Analizi",
    desc: "Bina içi fiyat farklarını kat bazında analiz edin, en avantajlı katı belirleyin.",
    icon: "▤",
    href: "/bina-karsilastirma",
    accent: "#34d399",
    bg: "rgba(52,211,153,0.04)",
    border: "rgba(52,211,153,0.15)",
    tag: null,
  },
  {
    id: "emsal",
    title: "Emsal İstihbarat",
    desc: "Piyasa emsal verilerini analiz ederek rekabetçi fiyatlandırma stratejisi oluşturun.",
    icon: "◭",
    href: "/emsal",
    accent: "#e879f9",
    bg: "rgba(232,121,249,0.04)",
    border: "rgba(232,121,249,0.15)",
    tag: null,
  },
  {
    id: "report",
    title: "PDF Rapor",
    desc: "Profesyonel müşteri raporları oluşturun ve PDF olarak anında paylaşın.",
    icon: "▣",
    href: "/report",
    accent: "#60a5fa",
    bg: "rgba(96,165,250,0.04)",
    border: "rgba(96,165,250,0.15)",
    tag: null,
  },
];

export default function Dashboard() {
  const { agencyId } = useAgencyId();
  const [stats, setStats] = useState({ total: 0, avg: 0, avgM2: 0, cities: 0 });
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    if (!agencyId) return;
    fetch(`${API_URL}/api/v1/listings?limit=500`, { headers: { "agency-id": agencyId } })
      .then(r => r.json())
      .then(d => {
        const l = d.listings || [];
        const avg = l.length ? Math.round(l.reduce((a: number, b: any) => a + Number(b.fiyat), 0) / l.length) : 0;
        const avgM2 = l.length ? Math.round(l.reduce((a: number, b: any) => a + Number(b.net_m2 || 0), 0) / l.length) : 0;
        const cities = new Set(l.map((x: any) => x.il).filter(Boolean)).size;
        setStats({ total: l.length, avg, avgM2, cities });
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [agencyId]);

  const STAT_CARDS = [
    { label: "TOPLAM İLAN",  value: loading ? "..." : stats.total.toLocaleString("tr-TR"), color: "#FFD700" },
    { label: "ORT. FİYAT",   value: loading ? "..." : `₺${(stats.avg / 1000000).toFixed(1)}M`, color: "#22c55e" },
    { label: "ORT. M²",      value: loading ? "..." : `${stats.avgM2}m²`, color: "#e0e0e0" },
    { label: "AKTİF İL",     value: loading ? "..." : stats.cities.toString(), color: "#aaaaaa" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: "#080808", color: "#e0e0e0", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", overflow: "hidden" }}>

      {/* Sol Panel */}
      <div style={{ width: 220, borderRight: "1px solid #161616", display: "flex", flexDirection: "column", background: "#0a0a0a", flexShrink: 0 }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid #161616" }}>
          <div style={{ fontSize: 22, color: "#FFD700", letterSpacing: 4, fontWeight: 300 }}>VEGA</div>
          <div style={{ fontSize: 9, color: "#2a2a2a", marginTop: 3, letterSpacing: 4 }}>INTELLIGENCE</div>
        </div>
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", color: active ? "#FFD700" : "#444", textDecoration: "none", fontSize: 12, borderLeft: active ? "2px solid #FFD700" : "2px solid transparent", background: active ? "rgba(255,215,0,0.05)" : "transparent", transition: "all 0.15s" }}>
                <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{item.icon}</span>
                <span style={{ fontWeight: active ? 500 : 400 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "12px 18px", borderTop: "1px solid #161616" }}>
          <div style={{ fontSize: 10, color: "#2a2a2a" }}>Model: v0.2-gbm · Aktif</div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Üst İstatistik Barı */}
        <div style={{ padding: "14px 28px", borderBottom: "1px solid #161616", display: "flex", gap: 14, alignItems: "center", flexShrink: 0 }}>
          {STAT_CARDS.map((card, i) => (
            <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid #161616", borderRadius: 10, padding: "10px 14px", borderTop: `2px solid ${card.color}22` }}>
              <div style={{ fontSize: 10, color: "#333", marginBottom: 4, letterSpacing: 1 }}>{card.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>

        {/* Modül Kartları — Merkez */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#333", letterSpacing: 3, marginBottom: 4 }}>MODÜLLER</div>
            <div style={{ fontSize: 18, color: "#888", fontWeight: 300 }}>Hangi merkezi kullanmak istersiniz?</div>
          </div>

          {/* 3'lü grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {MODULES.map(mod => (
              <Link
                key={mod.id}
                href={mod.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: mod.bg,
                    border: `1px solid ${mod.border}`,
                    borderRadius: 14,
                    padding: "22px 22px 18px",
                    cursor: "pointer",
                    transition: "all 0.18s",
                    position: "relative",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = mod.accent + "55";
                    (e.currentTarget as HTMLDivElement).style.background = mod.bg.replace("0.04", "0.08");
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = mod.border;
                    (e.currentTarget as HTMLDivElement).style.background = mod.bg;
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Badge */}
                  {mod.tag && (
                    <span style={{
                      position: "absolute", top: 14, right: 14,
                      fontSize: 9, fontWeight: 600, letterSpacing: 1,
                      padding: "3px 8px", borderRadius: 20,
                      background: mod.tag === "Yakında" ? "#1a1a1a" : mod.accent + "22",
                      color: mod.tag === "Yakında" ? "#333" : mod.accent,
                      border: `1px solid ${mod.tag === "Yakında" ? "#222" : mod.accent + "33"}`,
                    }}>
                      {mod.tag}
                    </span>
                  )}

                  {/* İkon */}
                  <div style={{
                    fontSize: 28, color: mod.accent, marginBottom: 12,
                    width: 44, height: 44, borderRadius: 10,
                    background: mod.accent + "11",
                    border: `1px solid ${mod.accent}22`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {mod.icon}
                  </div>

                  {/* Başlık */}
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e0e0e0", marginBottom: 6 }}>
                    {mod.title}
                  </div>

                  {/* Açıklama */}
                  <div style={{ fontSize: 11, color: "#444", lineHeight: 1.65 }}>
                    {mod.desc}
                  </div>

                  {/* Ok */}
                  <div style={{ marginTop: 14, fontSize: 11, color: mod.accent + "88", display: "flex", alignItems: "center", gap: 4 }}>
                    <span>Aç</span>
                    <span style={{ fontSize: 10 }}>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
