"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAgencyId } from "@/hooks/useAgencyId";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const MODULES = [
  { id: "sozlesme", title: "Sözleşme Merkezi", desc: "Kira ve satış sözleşmelerini dakikalar içinde oluşturun, PDF olarak indirin.", icon: "▣", href: "/sozlesme", accent: "#22c55e" },
  { id: "analysis", title: "Analiz Merkezi",   desc: "Adres analizi, deal skoru, bölge hakimiyeti ve risk raporu.", icon: "◎", href: "/analysis",  accent: "#FFD700" },
  { id: "valuation",title: "AI Değerleme",     desc: "Yapay zeka ile mülk fiyatını saniyeler içinde tahmin edin.", icon: "⚡", href: "/valuation", accent: "#a78bfa", tag: "AI" },
  { id: "map",      title: "Canlı Harita",     desc: "İlanları ve fırsatları interaktif harita üzerinde keşfedin.", icon: "◉", href: "/map",       accent: "#38bdf8" },
  { id: "listings", title: "İlan Yönetimi",    desc: "Tüm ilanlarınızı yönetin ve CSV ile toplu yükleme yapın.", icon: "▦", href: "/listings",   accent: "#fb923c" },
  { id: "zone",     title: "Bölge Skoru",      desc: "Mahalleleri A/B/C/D skorlamasıyla değerlendirin.", icon: "◐", href: "/zone-scores",accent: "#f472b6" },
  { id: "bina",     title: "Kat Analizi",      desc: "Bina içi fiyat farklarını kat bazında inceleyin.", icon: "▤", href: "/bina-karsilastirma", accent: "#34d399" },
  { id: "emsal",    title: "Emsal İstihbarat", desc: "Piyasa emsal verilerini analiz ederek rekabetçi fiyat belirleyin.", icon: "◭", href: "/emsal", accent: "#e879f9" },
  { id: "report",   title: "PDF Rapor",        desc: "Profesyonel müşteri raporlarını anında oluşturun.", icon: "▣", href: "/report",    accent: "#60a5fa" },
];

const MARKET_ITEMS = [
  { label: "İstanbul Ort. m²", value: "₺89.400", change: "+4.2%", up: true },
  { label: "Ankara Ort. m²",   value: "₺42.800", change: "+3.1%", up: true },
  { label: "İzmir Ort. m²",    value: "₺61.200", change: "+2.7%", up: true },
  { label: "Kira/Satış Çarpanı", value: "×210",  change: "-0.8%", up: false },
  { label: "Ortalama Satış Süresi", value: "47 gün", change: "-3 gün", up: true },
];

export default function Dashboard() {
  const { agencyId } = useAgencyId();
  const [stats, setStats] = useState({ total: 0, avg: 0, avgM2: 0, cities: 0, active: 0 });
  const [loading, setLoading] = useState(true);

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

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 40px", borderBottom: "1px solid #141414", position: "sticky", top: 0, background: "#080808", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span style={{ fontSize: 22, color: "#FFD700", letterSpacing: 4, fontWeight: 300 }}>VEGA</span>
          <span style={{ fontSize: 10, color: "#252525", letterSpacing: 3 }}>INTELLIGENCE PLATFORM</span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {[
            { label: "Toplam İlan", value: loading ? "…" : fmt(stats.total), color: "#FFD700" },
            { label: "Aktif İlan",  value: loading ? "…" : fmt(stats.active), color: "#22c55e" },
            { label: "Ort. Fiyat", value: loading ? "…" : `₺${(stats.avg / 1_000_000).toFixed(1)}M`, color: "#aaa" },
            { label: "Şehir",      value: loading ? "…" : stats.cities.toString(), color: "#555" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "right" }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#2a2a2a", marginTop: 2, letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "36px 32px 60px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 40, paddingBottom: 32, borderBottom: "1px solid #111" }}>
          <div style={{ fontSize: 13, color: "#2a2a2a", letterSpacing: 3, marginBottom: 10 }}>ANA MERKEZ</div>
          <div style={{ fontSize: 30, fontWeight: 300, color: "#666", lineHeight: 1.3, marginBottom: 16 }}>
            Türkiye&rsquo;nin en kapsamlı<br />
            <span style={{ color: "#FFD700" }}>gayrimenkul zeka platformu</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              `${loading ? "…" : fmt(stats.total)} aktif ilan`,
              `${loading ? "…" : stats.cities} şehir`,
              `${loading ? "…" : stats.avgM2}m² ortalama`,
              "AI destekli değerleme",
              "Anlık piyasa verisi",
            ].map(tag => (
              <span key={tag} style={{ fontSize: 11, color: "#333", border: "1px solid #1a1a1a", borderRadius: 20, padding: "4px 12px" }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Piyasa Göstergeleri Bandı */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: "#2a2a2a", letterSpacing: 3, marginBottom: 14 }}>CANLI PİYASA GÖSTERGELERİ</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {MARKET_ITEMS.map(item => (
              <div key={item.label} style={{ background: "#0d0d0d", border: "1px solid #141414", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ fontSize: 10, color: "#333", marginBottom: 6, letterSpacing: 0.5 }}>{item.label}</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#e0e0e0", marginBottom: 4 }}>{item.value}</div>
                <div style={{ fontSize: 11, color: item.up ? "#22c55e" : "#ef4444" }}>{item.change}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Portföy Detay Kartları */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: "#2a2a2a", letterSpacing: 3, marginBottom: 14 }}>PORTFÖYÜNÜz</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "Toplam İlan",    value: loading ? "…" : fmt(stats.total),  sub: "portföydeki mülk", color: "#FFD700", top: "#FFD70022" },
              { label: "Aktif",          value: loading ? "…" : fmt(stats.active), sub: "satışta / kirada",  color: "#22c55e", top: "#22c55e22" },
              { label: "Ort. Fiyat",     value: loading ? "…" : `₺${(stats.avg / 1_000_000).toFixed(2)}M`, sub: "piyasa ortalaması", color: "#a78bfa", top: "#a78bfa22" },
              { label: "Ort. m²",        value: loading ? "…" : `${stats.avgM2} m²`, sub: "metrekare büyüklük", color: "#38bdf8", top: "#38bdf822" },
            ].map(s => (
              <div key={s.label} style={{ background: "#0d0d0d", border: "1px solid #141414", borderTop: `2px solid ${s.top}`, borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ fontSize: 10, color: "#2a2a2a", letterSpacing: 1, marginBottom: 8 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#2e2e2e" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Emlak Yapay Zekası — Öne Çıkan */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 10, color: "#2a2a2a", letterSpacing: 3, marginBottom: 14 }}>YAPAY ZEKA</div>
          <Link href="/ai" style={{ textDecoration: "none", display: "block" }}>
            <div
              style={{ background: "linear-gradient(135deg, rgba(255,215,0,0.07) 0%, rgba(255,215,0,0.02) 100%)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 16, padding: "26px 32px", display: "flex", alignItems: "center", gap: 28, cursor: "pointer", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,215,0,0.35)"; (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg, rgba(255,215,0,0.11) 0%, rgba(255,215,0,0.04) 100%)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,215,0,0.15)"; (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(135deg, rgba(255,215,0,0.07) 0%, rgba(255,215,0,0.02) 100%)"; }}
            >
              <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", fontSize: 100, color: "rgba(255,215,0,0.03)", fontWeight: 900, letterSpacing: -4, userSelect: "none" }}>VEGA AI</div>
              <div style={{ width: 58, height: 58, borderRadius: 14, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#FFD700", flexShrink: 0 }}>◈</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 17, fontWeight: 600, color: "#e0e0e0" }}>Emlak Yapay Zekası</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "2px 8px", borderRadius: 20, background: "rgba(255,215,0,0.15)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.3)" }}>AI</span>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                  <span style={{ fontSize: 10, color: "#333" }}>Aktif</span>
                </div>
                <div style={{ fontSize: 12, color: "#444", lineHeight: 1.65 }}>
                  Fiyat analizi, bölge karşılaştırması, yatırım tavsiyeleri ve piyasa trendleri —
                  Türkiye&rsquo;nin en kapsamlı gayrimenkul AI asistanına doğrudan sorun.
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {["Fiyat Analizi", "Bölge Karşılaştırma", "Yatırım Tavsiyesi", "Piyasa Trendleri"].map(tag => (
                    <span key={tag} style={{ fontSize: 10, color: "#333", border: "1px solid #1a1a1a", borderRadius: 12, padding: "2px 8px" }}>{tag}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 18, color: "rgba(255,215,0,0.3)", flexShrink: 0 }}>→</div>
            </div>
          </Link>
        </div>

        {/* Modüller Grid */}
        <div>
          <div style={{ fontSize: 10, color: "#2a2a2a", letterSpacing: 3, marginBottom: 14 }}>TÜM MODÜLLER</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {MODULES.map(mod => (
              <Link key={mod.id} href={mod.href} style={{ textDecoration: "none" }}>
                <div
                  style={{ background: `${mod.accent}07`, border: `1px solid ${mod.accent}1a`, borderRadius: 14, padding: "20px 20px 16px", cursor: "pointer", transition: "all 0.18s", display: "flex", gap: 16, alignItems: "flex-start", position: "relative" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${mod.accent}45`; (e.currentTarget as HTMLDivElement).style.background = `${mod.accent}12`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${mod.accent}1a`; (e.currentTarget as HTMLDivElement).style.background = `${mod.accent}07`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                >
                  {"tag" in mod && mod.tag && (
                    <span style={{ position: "absolute", top: 14, right: 14, fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "2px 7px", borderRadius: 20, background: `${mod.accent}20`, color: mod.accent, border: `1px solid ${mod.accent}35` }}>{mod.tag}</span>
                  )}
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${mod.accent}14`, border: `1px solid ${mod.accent}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: mod.accent, flexShrink: 0 }}>{mod.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#d0d0d0", marginBottom: 4 }}>{mod.title}</div>
                    <div style={{ fontSize: 11, color: "#333", lineHeight: 1.6 }}>{mod.desc}</div>
                    <div style={{ marginTop: 10, fontSize: 11, color: `${mod.accent}70` }}>Aç →</div>
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
