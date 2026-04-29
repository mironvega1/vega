"use client"
import React, { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com"
const D = { bg:"#080808", bg2:"#0d0d0d", brd:"#161616", brd2:"#1e1e1e", gold:"#FFD700", text:"#e0e0e0", muted:"#555", dim:"#333" }

const NAV_ITEMS = [
  { href:"/dashboard",          label:"Ana Merkez",           icon:"◈" },
  { href:"/ai",                 label:"Emlak Yapay Zekası",   icon:"◈" },
  { href:"/sozlesme",           label:"Sözleşme Merkezi",     icon:"▣" },
  { href:"/analysis",           label:"Analiz Merkezi",    icon:"◎" },
  { href:"/valuation",          label:"AI Değerleme",      icon:"⚡" },
  { href:"/map",                label:"Canlı Harita",      icon:"◉" },
  { href:"/listings",           label:"İlan Yönetimi",     icon:"▦" },
  { href:"/zone-scores",        label:"Bölge Skoru",       icon:"◐" },
  { href:"/bina-karsilastirma", label:"Kat Analizi",       icon:"▤" },
  { href:"/emsal",              label:"Emsal İstihbarat",  icon:"◭" },
  { href:"/report",             label:"PDF Rapor",         icon:"▣" },
]

const CATEGORIES: Record<string, string> = {
  metro: "Metro / Toplu Taşıma",
  school: "Okul",
  hospital: "Hastane / Klinik",
  mall: "AVM / Market",
}

const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#eab308" : s >= 40 ? "#f97316" : "#ef4444"

export default function ZoneScores() {
  const pathname = usePathname()
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const searchAddress = async () => {
    if (!address.trim()) return
    setLoading(true); setError(""); setResult(null)
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ", Türkiye")}&format=json&limit=1`)
      const d = await r.json()
      if (!d[0]) { setError("Adres bulunamadı. Daha spesifik bir adres deneyin."); setLoading(false); return }
      const res = await fetch(`${API_URL}/api/v1/location/score?lat=${d[0].lat}&lng=${d[0].lon}`)
      setResult(await res.json())
    } catch { setError("Bağlantı hatası. Lütfen tekrar deneyin.") }
    setLoading(false)
  }

  return (
    <div style={{ display:"flex", height:"100vh", background:D.bg, color:D.text, fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif", overflow:"hidden" }}>

      {/* Sidebar */}
      <div style={{ width:220, borderRight:`1px solid ${D.brd}`, display:"flex", flexDirection:"column", background:D.bg2, flexShrink:0 }}>
        <div style={{ padding:"22px 18px 18px", borderBottom:`1px solid ${D.brd}` }}>
          <div style={{ fontSize:20, color:D.gold, letterSpacing:4, fontWeight:300 }}>VEGA</div>
          <div style={{ fontSize:9, color:D.dim, marginTop:3, letterSpacing:4 }}>INTELLIGENCE PLATFORM</div>
        </div>
        <nav style={{ flex:1, padding:"10px 0", overflowY:"auto" }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 18px", color:active?D.gold:D.muted, textDecoration:"none", fontSize:12, borderLeft:active?`2px solid ${D.gold}`:`2px solid transparent`, background:active?"rgba(255,215,0,0.05)":"transparent" }}>
                <span style={{ fontSize:15, width:18, textAlign:"center" }}>{item.icon}</span>
                <span style={{ fontWeight:active?500:400 }}>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ padding:"18px 28px", borderBottom:`1px solid ${D.brd}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:16, fontWeight:500 }}>Bölge Skoru</div>
            <div style={{ fontSize:11, color:D.muted, marginTop:2 }}>Adres bazlı lokasyon analizi · Metro, okul, hastane, AVM mesafeleri</div>
          </div>
          <div style={{ background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:16, padding:"4px 12px", fontSize:11, color:D.gold, letterSpacing:1 }}>◐ LOKASYON</div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"32px 28px" }}>
          <div style={{ maxWidth:640, margin:"0 auto" }}>

            {/* Info */}
            <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.12)", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:11, color:D.muted, lineHeight:1.6 }}>
              OpenStreetMap üzerinden koordinat alınır · Yakın çevredeki ulaşım, eğitim, sağlık, alışveriş tesisleri analiz edilir.
            </div>

            {/* Search */}
            <div style={{ display:"flex", gap:10, marginBottom:24 }}>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                onKeyDown={e => e.key === "Enter" && searchAddress()}
                placeholder="Örn: Beşiktaş, İstanbul veya tam sokak adresi"
                style={{ flex:1, padding:"10px 14px", borderRadius:8, border:"1px solid #1e1e1e", background:"#111", color:D.text, fontSize:13, outline:"none", fontFamily:"inherit" }}
              />
              <button onClick={searchAddress} disabled={loading || !address.trim()}
                style={{ background: loading||!address.trim() ? "#1a1a1a" : D.gold, color: loading||!address.trim() ? "#333" : "#000", border:"none", borderRadius:8, padding:"10px 22px", fontSize:12, fontWeight:700, cursor: loading||!address.trim() ? "not-allowed" : "pointer", whiteSpace:"nowrap" }}>
                {loading ? "Analiz ediliyor..." : "Analiz Et →"}
              </button>
            </div>

            {error && <div style={{ color:"#f87171", fontSize:12, padding:"10px 14px", background:"rgba(248,113,113,0.06)", borderRadius:8, marginBottom:16 }}>{error}</div>}

            {loading && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, paddingTop:48 }}>
                <div style={{ width:36, height:36, border:`2px solid ${D.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                <div style={{ fontSize:12, color:D.muted }}>Lokasyon analiz ediliyor...</div>
              </div>
            )}

            {!loading && result && (
              <div>
                {/* Grade */}
                <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:12, padding:"28px", textAlign:"center", marginBottom:16 }}>
                  <div style={{ fontSize:56, fontWeight:800, color:scoreColor(result.total_score), lineHeight:1 }}>
                    {result.grade}
                  </div>
                  <div style={{ fontSize:30, fontWeight:700, marginTop:10, color:D.text }}>{result.total_score} <span style={{ fontSize:16, color:D.muted }}>/ 100</span></div>
                  <div style={{ fontSize:12, color:D.muted, marginTop:6 }}>Genel Lokasyon Skoru</div>
                </div>

                {/* Breakdown */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {Object.entries(result.breakdown || {}).map(([key, val]: any) => (
                    <div key={key} style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:10, padding:"16px" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                        <span style={{ fontSize:12, fontWeight:500 }}>{CATEGORIES[key] || key}</span>
                        <span style={{ fontSize:18, fontWeight:700, color:scoreColor(val.score) }}>{val.score}</span>
                      </div>
                      <div style={{ background:"#1a1a1a", borderRadius:4, height:6, marginBottom:10 }}>
                        <div style={{ height:6, borderRadius:4, background:scoreColor(val.score), width:`${val.score}%`, transition:"width 0.4s ease" }}/>
                      </div>
                      {val.closest_name && <div style={{ fontSize:11, color:D.muted }}>En yakın: {val.closest_name}</div>}
                      {val.closest_distance_m && (
                        <div style={{ fontSize:10, color:D.dim, marginTop:2 }}>
                          {val.closest_distance_m < 1000 ? `${val.closest_distance_m}m` : `${(val.closest_distance_m / 1000).toFixed(1)}km`} · {val.count_nearby} tesis
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ textAlign:"center", fontSize:11, color:D.dim, marginTop:16 }}>
                  Koordinat: {result.lat?.toFixed(4)}, {result.lng?.toFixed(4)} · OpenStreetMap Overpass API
                </div>
              </div>
            )}

            {!loading && !result && !error && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, paddingTop:48 }}>
                <div style={{ fontSize:36, color:D.brd }}>◐</div>
                <div style={{ fontSize:12, color:D.dim }}>Adres girin ve analizi başlatın</div>
              </div>
            )}

          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px}`}</style>
    </div>
  )
}
