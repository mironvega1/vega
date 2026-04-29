"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAgencyId } from "@/hooks/useAgencyId";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const MODULES = [
  { id: "sozlesme", title: "Sozlesme Merkezi",  desc: "Kira ve satis sozlesmelerini dakikalar icinde olusturun, PDF olarak indirin.", icon: "▣", href: "/sozlesme",          accent: "#22c55e" },
  { id: "analysis", title: "Analiz Merkezi",    desc: "Adres analizi, deal skoru, bolge hakimiyeti ve risk raporu.",                  icon: "◎", href: "/analysis",           accent: "#FFD700" },
  { id: "valuation",title: "AI Degerleme",      desc: "Yapay zeka ile mulk fiyatini saniyeler icinde tahmin edin.",                   icon: "⚡", href: "/valuation",          accent: "#a78bfa", tag: "AI" },
  { id: "map",      title: "Canli Harita",      desc: "Ilanlari ve firsatlari interaktif harita uzerinde kesfedin.",                   icon: "◉", href: "/map",                accent: "#38bdf8" },
  { id: "listings", title: "Ilan Yonetimi",     desc: "Tum ilanlarinizi yonetin ve CSV ile toplu yukleme yapin.",                     icon: "▦", href: "/listings",            accent: "#fb923c" },
  { id: "zone",     title: "Bolge Skoru",       desc: "Mahalleleri A/B/C/D skorlamasiyla degerlendirin.",                             icon: "◐", href: "/zone-scores",         accent: "#f472b6" },
  { id: "bina",     title: "Kat Analizi",       desc: "Bina ici fiyat farklarini kat bazinda inceleyin.",                             icon: "▤", href: "/bina-karsilastirma",  accent: "#34d399" },
  { id: "emsal",    title: "Emsal Istihbarat",  desc: "Piyasa emsal verilerini analiz ederek rekabetci fiyat belirleyin.",            icon: "◭", href: "/emsal",               accent: "#e879f9" },
  { id: "report",   title: "PDF Rapor",         desc: "Profesyonel musteri raporlarini aninda olusturun.",                            icon: "▣", href: "/report",              accent: "#60a5fa" },
];

const MARKET_ITEMS = [
  { label: "Istanbul Ort. m2",    value: "89.400",  unit: "", change: "+4.2%", up: true },
  { label: "Ankara Ort. m2",      value: "42.800",  unit: "", change: "+3.1%", up: true },
  { label: "Izmir Ort. m2",       value: "61.200",  unit: "", change: "+2.7%", up: true },
  { label: "Kira/Satis Carpani",  value: "x210",    unit: "", change: "-0.8%", up: false },
  { label: "Ort. Satis Suresi",   value: "47",      unit: "gun", change: "-3 gun", up: true },
];

const QUICK_NAV = [
  { label: "AI",         icon: "◈", href: "/ai" },
  { label: "Sozlesme",   icon: "▣", href: "/sozlesme" },
  { label: "Analiz",     icon: "◎", href: "/analysis" },
  { label: "Degerleme",  icon: "⚡", href: "/valuation" },
  { label: "Harita",     icon: "◉", href: "/map" },
  { label: "Ilanlar",    icon: "▦", href: "/listings" },
  { label: "Bolge",      icon: "◐", href: "/zone-scores" },
  { label: "Kat",        icon: "▤", href: "/bina-karsilastirma" },
  { label: "Emsal",      icon: "◭", href: "/emsal" },
  { label: "Rapor",      icon: "▣", href: "/report" },
];

export default function Dashboard() {
  const { agencyId } = useAgencyId();
  const [stats, setStats] = useState({ total: 0, avg: 0, avgM2: 0, cities: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);
  const [aiHovered, setAiHovered] = useState(false);

  useEffect(() => {
    if (!agencyId) return;
    fetch(`${API_URL}/api/v1/listings?limit=500`, { headers: { "agency-id": agencyId } })
      .then(r => r.json())
      .then(d => {
        const l = d.listings || [];
        const avg   = l.length ? Math.round(l.reduce((a: number, b: any) => a + Number(b.fiyat), 0) / l.length) : 0;
        const avgM2 = l.length ? Math.round(l.reduce((a: number, b: any) => a + Number(b.net_m2 || 0), 0) / l.length) : 0;
        const cities = new Set(l.map((x: any) => x.il).filter(Boolean)).size;
        const active = l.filter((x: any) => x.durum === "active").length;
        setStats({ total: l.length, avg, avgM2, cities, active });
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [agencyId]);

  const fmt = (n: number) => n.toLocaleString("tr-TR");

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#e0e0e0", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", overflowY: "auto" }}>

      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        height: 56,
        background: "rgba(8,8,8,0.95)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid #111",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontSize: 18, color: "#FFD700", letterSpacing: 5, fontWeight: 200 }}>VEGA</span>
          <span style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 3, fontWeight: 400 }}>INTELLIGENCE</span>
        </div>

        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[
            { label: "Toplam", value: loading ? "—" : fmt(stats.total), color: "#FFD700" },
            { label: "Aktif",  value: loading ? "—" : fmt(stats.active), color: "#22c55e" },
            { label: "Ort. Fiyat", value: loading ? "—" : `${(stats.avg / 1_000_000).toFixed(1)}M`, color: "#c0c0c0" },
            { label: "Sehir",  value: loading ? "—" : String(stats.cities), color: "#555" },
          ].map(s => (
            <div key={s.label} style={{
              padding: "5px 12px",
              background: "#0a0a0a",
              border: "1px solid #141414",
              borderRadius: 8,
              textAlign: "center",
              minWidth: 56,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: "#2a2a2a", marginTop: 3, letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px 80px" }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 3, marginBottom: 10 }}>HIZLI ERISIM</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {QUICK_NAV.map(item => (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div
                  onMouseEnter={() => setHoveredChip(item.href)}
                  onMouseLeave={() => setHoveredChip(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 11px",
                    background: "#0d0d0d",
                    border: `1px solid ${hoveredChip === item.href ? "rgba(255,215,0,0.25)" : "#161616"}`,
                    borderRadius: 6,
                    fontSize: 11,
                    color: hoveredChip === item.href ? "#FFD700" : "#555",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 10 }}>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 10 }}>
            {MARKET_ITEMS.map(item => (
              <div key={item.label} style={{
                flex: 1,
                background: "#0a0a0a",
                border: "1px solid #141414",
                borderRadius: 10,
                padding: "14px 18px",
              }}>
                <div style={{ fontSize: 9, color: "#2a2a2a", letterSpacing: 1, marginBottom: 8 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#c0c0c0", letterSpacing: -0.5, lineHeight: 1 }}>
                  {item.value}{item.unit ? <span style={{ fontSize: 11, fontWeight: 400, color: "#444", marginLeft: 3 }}>{item.unit}</span> : null}
                </div>
                <div style={{ fontSize: 10, color: item.up ? "#22c55e" : "#ef4444", marginTop: 6 }}>{item.change}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <Link href="/ai" style={{ textDecoration: "none", display: "block" }}>
            <div
              onMouseEnter={() => setAiHovered(true)}
              onMouseLeave={() => setAiHovered(false)}
              style={{
                display: "flex", alignItems: "center", gap: 24,
                background: aiHovered
                  ? "linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(255,215,0,0.02) 100%)"
                  : "linear-gradient(135deg, rgba(255,215,0,0.03) 0%, rgba(0,0,0,0) 100%)",
                border: `1px solid ${aiHovered ? "rgba(255,215,0,0.2)" : "rgba(255,215,0,0.08)"}`,
                borderRadius: 14,
                padding: "22px 28px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{
                width: 52, height: 52, flexShrink: 0,
                borderRadius: 12,
                background: "rgba(255,215,0,0.08)",
                border: "1px solid rgba(255,215,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, color: "#FFD700",
              }}>◈</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 500, color: "#e0e0e0" }}>Emlak Yapay Zekasi</span>
                  <span style={{
                    fontSize: 8, fontWeight: 700, letterSpacing: 1,
                    padding: "2px 6px", borderRadius: 4,
                    background: "rgba(255,215,0,0.1)", color: "#FFD700",
                    border: "1px solid rgba(255,215,0,0.2)",
                  }}>AI</span>
                </div>
                <div style={{ fontSize: 11, color: "#333", lineHeight: 1.6 }}>
                  Fiyat analizi, bolge karsilastirmasi, yatirim tavsiyeleri ve piyasa trendleri. Turkiye gayrimenkul AI asistani.
                </div>
              </div>

              <div style={{
                fontSize: 16,
                color: aiHovered ? "rgba(255,215,0,0.6)" : "rgba(255,255,255,0.1)",
                flexShrink: 0,
                transition: "color 0.2s",
              }}>→</div>
            </div>
          </Link>
        </div>

        <div>
          <div style={{ fontSize: 9, color: "#1e1e1e", letterSpacing: 3, marginBottom: 14 }}>MODULLER</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {MODULES.map(mod => (
              <Link key={mod.id} href={mod.href} style={{ textDecoration: "none" }}>
                <div
                  onMouseEnter={() => setHoveredModule(mod.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  style={{
                    background: hoveredModule === mod.id ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)",
                    border: `1px solid ${hoveredModule === mod.id ? "rgba(255,255,255,0.08)" : "#141414"}`,
                    borderRadius: 14,
                    padding: "20px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    transform: hoveredModule === mod.id ? "translateY(-2px)" : "translateY(0)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    position: "relative",
                  }}
                >
                  {"tag" in mod && mod.tag && (
                    <span style={{
                      position: "absolute", top: 14, right: 14,
                      fontSize: 8, fontWeight: 700, letterSpacing: 1,
                      padding: "2px 6px", borderRadius: 4,
                      background: `${mod.accent}18`, color: mod.accent,
                      border: `1px solid ${mod.accent}30`,
                    }}>{mod.tag}</span>
                  )}

                  <div style={{
                    width: 36, height: 36,
                    borderRadius: "50%",
                    background: `${mod.accent}14`,
                    border: `1px solid ${mod.accent}22`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, color: mod.accent,
                    flexShrink: 0,
                  }}>{mod.icon}</div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#c0c0c0", fontWeight: 500, marginBottom: 5 }}>{mod.title}</div>
                    <div style={{ fontSize: 11, color: "#2e2e2e", lineHeight: 1.6 }}>{mod.desc}</div>
                  </div>

                  <div style={{ fontSize: 11, color: mod.accent, opacity: hoveredModule === mod.id ? 0.8 : 0.35, transition: "opacity 0.15s" }}>
                    Ac →
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
