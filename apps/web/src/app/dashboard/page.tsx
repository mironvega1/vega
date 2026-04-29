"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAgencyId } from "@/hooks/useAgencyId";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const MODULES = [
  {
    id: "valuation",
    title: "AI Değerleme",
    desc: "Yapay zeka ile mülk fiyatını saniyeler içinde tahmin edin.",
    icon: "⚡",
    href: "/valuation",
    accent: "#a78bfa",
    tag: "AI",
  },
  {
    id: "analysis",
    title: "Analiz Merkezi",
    desc: "Sözleşme oluşturun, piyasa trendlerini ve bölgesel verileri analiz edin.",
    icon: "◎",
    href: "/analysis",
    accent: "#FFD700",
    tag: null,
  },
  {
    id: "map",
    title: "Canlı Harita",
    desc: "İlanları ve fırsatları interaktif harita üzerinde keşfedin.",
    icon: "◉",
    href: "/map",
    accent: "#38bdf8",
    tag: null,
  },
  {
    id: "listings",
    title: "İlan Yönetimi",
    desc: "Tüm ilanlarınızı yönetin, CSV ile toplu yükleme yapın.",
    icon: "▦",
    href: "/listings",
    accent: "#fb923c",
    tag: null,
  },
  {
    id: "zone",
    title: "Bölge Skoru",
    desc: "Mahalleleri A/B/C/D skorlamasıyla değerlendirin.",
    icon: "◐",
    href: "/zone-scores",
    accent: "#f472b6",
    tag: null,
  },
  {
    id: "bina",
    title: "Kat Analizi",
    desc: "Bina içi fiyat farklarını kat bazında inceleyin.",
    icon: "▤",
    href: "/bina-karsilastirma",
    accent: "#34d399",
    tag: null,
  },
  {
    id: "emsal",
    title: "Emsal İstihbarat",
    desc: "Piyasa emsal verilerini analiz ederek rekabetçi fiyat belirleyin.",
    icon: "◭",
    href: "/emsal",
    accent: "#e879f9",
    tag: null,
  },
  {
    id: "report",
    title: "PDF Rapor",
    desc: "Profesyonel müşteri raporlarını anında PDF olarak oluşturun.",
    icon: "▣",
    href: "/report",
    accent: "#60a5fa",
    tag: null,
  },
];

export default function Dashboard() {
  const { agencyId } = useAgencyId();
  const [stats, setStats] = useState({ total: 0, avg: 0, cities: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agencyId) return;
    fetch(`${API_URL}/api/v1/listings?limit=500`, { headers: { "agency-id": agencyId } })
      .then(r => r.json())
      .then(d => {
        const l = d.listings || [];
        const avg = l.length ? Math.round(l.reduce((a: number, b: any) => a + Number(b.fiyat), 0) / l.length) : 0;
        const cities = new Set(l.map((x: any) => x.il).filter(Boolean)).size;
        setStats({ total: l.length, avg, cities });
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [agencyId]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "#e0e0e0",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      overflowY: "auto",
    }}>

      {/* Üst Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid #161616",
        background: "#080808", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div>
          <span style={{ fontSize: 22, color: "#FFD700", letterSpacing: 4, fontWeight: 300 }}>VEGA</span>
          <span style={{ fontSize: 10, color: "#2a2a2a", marginLeft: 10, letterSpacing: 3 }}>INTELLIGENCE</span>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {[
            { label: "İlan", value: loading ? "…" : stats.total.toLocaleString("tr-TR"), color: "#FFD700" },
            { label: "Ort. Fiyat", value: loading ? "…" : `₺${(stats.avg / 1000000).toFixed(1)}M`, color: "#22c55e" },
            { label: "Şehir", value: loading ? "…" : stats.cities.toString(), color: "#aaa" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#333", marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* İçerik */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 60px" }}>

        {/* Karşılama */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 26, fontWeight: 300, color: "#888", marginBottom: 6 }}>Hoş geldiniz</div>
          <div style={{ fontSize: 13, color: "#2e2e2e" }}>Bir merkez seçerek başlayın</div>
        </div>

        {/* Emlak Yapay Zekası — Öne Çıkarılmış Kart */}
        <Link href="/ai" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
          <div
            style={{
              background: "linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(255,215,0,0.02) 100%)",
              border: "1px solid rgba(255,215,0,0.2)",
              borderRadius: 18,
              padding: "28px 32px",
              display: "flex",
              alignItems: "center",
              gap: 28,
              cursor: "pointer",
              transition: "all 0.2s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,215,0,0.4)";
              (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.04) 100%)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,215,0,0.2)";
              (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(255,215,0,0.02) 100%)";
            }}
          >
            {/* Dekoratif arka plan */}
            <div style={{
              position: "absolute", right: -20, top: -20,
              fontSize: 120, color: "rgba(255,215,0,0.03)",
              fontWeight: 900, userSelect: "none", pointerEvents: "none",
            }}>AI</div>

            {/* İkon */}
            <div style={{
              width: 64, height: 64, borderRadius: 16, flexShrink: 0,
              background: "rgba(255,215,0,0.1)",
              border: "1px solid rgba(255,215,0,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, color: "#FFD700",
            }}>◈</div>

            {/* Metin */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 18, fontWeight: 600, color: "#e0e0e0" }}>Emlak Yapay Zekası</span>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: 1,
                  padding: "3px 8px", borderRadius: 20,
                  background: "rgba(255,215,0,0.15)", color: "#FFD700",
                  border: "1px solid rgba(255,215,0,0.3)",
                }}>AI</span>
              </div>
              <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                Türkiye gayrimenkul piyasasının en kapsamlı AI asistanı — fiyat analizi, bölge karşılaştırması,
                yatırım tavsiyeleri ve piyasa trendleri konusunda anında yanıt alın.
              </div>
            </div>

            {/* Ok */}
            <div style={{ fontSize: 20, color: "rgba(255,215,0,0.4)", flexShrink: 0 }}>→</div>
          </div>
        </Link>

        {/* Diğer Modüller — 4'lü grid */}
        <div style={{ fontSize: 10, color: "#2a2a2a", letterSpacing: 3, marginBottom: 14 }}>DİĞER MODÜLLER</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {MODULES.map(mod => (
            <Link key={mod.id} href={mod.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: `${mod.accent}08`,
                  border: `1px solid ${mod.accent}20`,
                  borderRadius: 14,
                  padding: "20px 18px 16px",
                  cursor: "pointer",
                  transition: "all 0.18s",
                  height: "100%",
                  boxSizing: "border-box",
                  position: "relative",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${mod.accent}50`;
                  (e.currentTarget as HTMLDivElement).style.background = `${mod.accent}12`;
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${mod.accent}20`;
                  (e.currentTarget as HTMLDivElement).style.background = `${mod.accent}08`;
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                {mod.tag && (
                  <span style={{
                    position: "absolute", top: 12, right: 12,
                    fontSize: 9, fontWeight: 700, letterSpacing: 1,
                    padding: "2px 7px", borderRadius: 20,
                    background: `${mod.accent}20`, color: mod.accent,
                    border: `1px solid ${mod.accent}35`,
                  }}>{mod.tag}</span>
                )}

                <div style={{
                  fontSize: 22, color: mod.accent, marginBottom: 10,
                  width: 40, height: 40, borderRadius: 10,
                  background: `${mod.accent}12`,
                  border: `1px solid ${mod.accent}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{mod.icon}</div>

                <div style={{ fontSize: 13, fontWeight: 600, color: "#d0d0d0", marginBottom: 5 }}>
                  {mod.title}
                </div>
                <div style={{ fontSize: 11, color: "#3a3a3a", lineHeight: 1.6 }}>
                  {mod.desc}
                </div>

                <div style={{ marginTop: 12, fontSize: 11, color: `${mod.accent}70` }}>
                  Aç →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
