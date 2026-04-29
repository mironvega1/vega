"use client"
import React, { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAgencyId } from "@/hooks/useAgencyId"

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

const COLUMNS = ["fiyat","net_m2","oda_sayisi","kat_no","toplam_kat","ilce","bina_yasi","cephe"]

export default function Listings() {
  const pathname = usePathname()
  const { agencyId } = useAgencyId()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [drag, setDrag] = useState(false)

  const handleUpload = async () => {
    if (!file || !agencyId) return
    setLoading(true)
    const form = new FormData()
    form.append("file", file)
    try {
      const res = await fetch(`${API_URL}/api/v1/listings/import-csv?listing_type=satilik`, {
        method: "POST", headers: { "agency-id": agencyId }, body: form
      })
      setResult(await res.json())
    } catch { setResult({ error: "Bağlantı hatası." }) }
    setLoading(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.name.endsWith(".csv")) setFile(f)
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
            <div style={{ fontSize:16, fontWeight:500 }}>İlan Yönetimi</div>
            <div style={{ fontSize:11, color:D.muted, marginTop:2 }}>CSV ile toplu ilan yükleme · Satılık & kiralık portföy</div>
          </div>
          <div style={{ background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:16, padding:"4px 12px", fontSize:11, color:D.gold, letterSpacing:1 }}>▦ PORTFÖY</div>
        </div>

        {/* Content */}
        <div style={{ flex:1, overflowY:"auto", padding:"32px 28px" }}>
          <div style={{ maxWidth:600, margin:"0 auto" }}>

            {/* Columns info */}
            <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.12)", borderRadius:10, padding:"14px 18px", marginBottom:24 }}>
              <div style={{ fontSize:12, color:D.gold, fontWeight:500, marginBottom:10 }}>Gerekli CSV Kolonları</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {COLUMNS.map(c => (
                  <span key={c} style={{ background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:5, padding:"3px 10px", fontSize:11, color:"rgba(255,215,0,0.7)", fontFamily:"monospace" }}>{c}</span>
                ))}
              </div>
              <div style={{ fontSize:11, color:D.dim, marginTop:10 }}>il (opsiyonel) · satilik_kiralik (opsiyonel)</div>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => document.getElementById("csv-upload")?.click()}
              style={{
                border: `2px dashed ${drag ? "rgba(255,215,0,0.5)" : file ? "rgba(255,215,0,0.25)" : "#222"}`,
                borderRadius: 12, padding: "44px", textAlign: "center", marginBottom: 16,
                background: drag ? "rgba(255,215,0,0.04)" : file ? "rgba(255,215,0,0.02)" : "transparent",
                transition: "all 0.15s", cursor: "pointer"
              }}
            >
              <input type="file" accept=".csv" id="csv-upload" style={{ display:"none" }}
                onChange={e => setFile(e.target.files?.[0] || null)} />
              <div style={{ fontSize:28, marginBottom:12, color: file ? D.gold : D.dim }}>▦</div>
              {file ? (
                <div>
                  <div style={{ fontSize:14, color:D.gold, fontWeight:500 }}>{file.name}</div>
                  <div style={{ fontSize:11, color:D.muted, marginTop:4 }}>{(file.size / 1024).toFixed(1)} KB · Yüklemek için butona tıklayın</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize:13, color:D.muted }}>CSV dosyasını buraya sürükleyin</div>
                  <div style={{ fontSize:11, color:D.dim, marginTop:4 }}>veya seçmek için tıklayın</div>
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading || !agencyId}
              style={{
                width: "100%", padding: "13px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700,
                background: !file || loading || !agencyId ? D.brd : D.gold,
                color: !file || loading || !agencyId ? D.muted : "#000",
                cursor: !file || loading || !agencyId ? "not-allowed" : "pointer",
                letterSpacing: 0.3
              }}>
              {loading ? "İlanlar Yükleniyor..." : "İlanları Yükle →"}
            </button>

            {result && (
              <div style={{ marginTop:20, background:D.bg2, border:`1px solid ${result.success > 0 ? "rgba(34,197,94,0.2)" : "rgba(248,113,113,0.2)"}`, borderRadius:10, padding:"16px 20px" }}>
                {result.success > 0 && (
                  <div style={{ fontSize:14, color:"#22c55e", fontWeight:500, marginBottom:6 }}>✓ {result.success} ilan başarıyla yüklendi</div>
                )}
                {result.error > 0 && (
                  <div style={{ fontSize:12, color:"#f87171", marginBottom:6 }}>{result.error} ilan yüklenemedi</div>
                )}
                {result.errors?.map((e: string, i: number) => (
                  <div key={i} style={{ fontSize:11, color:D.dim, marginTop:3 }}>· {e}</div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
      <style>{`*::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px}`}</style>
    </div>
  )
}
