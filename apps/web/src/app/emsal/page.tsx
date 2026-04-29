"use client"
import React, { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com"
const D = { bg:"#080808", bg2:"#0d0d0d", bg3:"#111", brd:"#161616", brd2:"#1e1e1e", gold:"#FFD700", text:"#e0e0e0", muted:"#555", dim:"#333" }

const NAV_ITEMS = [
  { href:"/dashboard",          label:"Ana Merkez",           icon:"◈" },
  { href:"/ai",                 label:"Emlak Yapay Zekası",   icon:"◈" },
  { href:"/analysis",           label:"Analiz Merkezi",    icon:"◎" },
  { href:"/valuation",          label:"AI Değerleme",      icon:"⚡" },
  { href:"/map",                label:"Canlı Harita",      icon:"◉" },
  { href:"/listings",           label:"İlan Yönetimi",     icon:"▦" },
  { href:"/zone-scores",        label:"Bölge Skoru",       icon:"◐" },
  { href:"/bina-karsilastirma", label:"Kat Analizi",       icon:"▤" },
  { href:"/emsal",              label:"Emsal İstihbarat",  icon:"◭" },
  { href:"/report",             label:"PDF Rapor",         icon:"▣" },
]

type Tab = "arama" | "fiyat" | "firsat" | "sapma" | "eslestirme" | "arz_talep" | "likidite" | "rapor"
const TABS: { id: Tab; label: string }[] = [
  { id:"arama",      label:"Emsal Arama" },
  { id:"fiyat",      label:"Fiyat Analizi" },
  { id:"firsat",     label:"Fırsat Motoru" },
  { id:"sapma",      label:"Sapma Analizi" },
  { id:"eslestirme", label:"Portföy Eşleşme" },
  { id:"arz_talep",  label:"Arz-Talep" },
  { id:"likidite",   label:"Likidite Skoru" },
  { id:"rapor",      label:"Rapor Merkezi" },
]

const inp: React.CSSProperties = { width:"100%", padding:"8px 10px", borderRadius:6, border:"1px solid #1e1e1e", background:"#111", color:"#e0e0e0", fontSize:12, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }
const lbl: React.CSSProperties = { fontSize:10, color:"#555", display:"block", marginBottom:4, letterSpacing:1 }
const fld: React.CSSProperties = { marginBottom:12 }

// ── Module-level components ─────────────────────────────────────────────────

function scoreColor(n: number) {
  return n >= 75 ? "#22c55e" : n >= 50 ? "#FFD700" : n >= 30 ? "#f97316" : "#ef4444"
}

const KpiCard = ({ label, value, sub, color = "#FFD700" }: { label:string; value:any; sub?:string; color?:string }) => (
  <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:8, padding:"14px 16px", borderTop:`2px solid ${color}44` }}>
    <div style={{ fontSize:10, color:D.muted, letterSpacing:1, marginBottom:6 }}>{label}</div>
    <div style={{ fontSize:22, fontWeight:700, color }}>{value}</div>
    {sub && <div style={{ fontSize:10, color:D.dim, marginTop:4 }}>{sub}</div>}
  </div>
)

const LoadingSpinner = ({ text }: { text: string }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, paddingTop:60 }}>
    <div style={{ width:36, height:36, border:`2px solid ${D.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
    <div style={{ fontSize:12, color:D.muted }}>{text}</div>
  </div>
)

const EmptyState = ({ icon, title, sub }: { icon:string; title:string; sub:string }) => (
  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, paddingTop:64 }}>
    <div style={{ fontSize:44, color:D.brd }}>{icon}</div>
    <div style={{ fontSize:14, color:D.dim, fontWeight:500 }}>{title}</div>
    <div style={{ fontSize:12, color:"#2a2a2a", maxWidth:320, textAlign:"center", lineHeight:1.6 }}>{sub}</div>
  </div>
)

const ListingRow = ({ l, idx }: { l: any; idx: number }) => {
  const sapmaColor = (l.sapma_pct||0) < -10 ? "#22c55e" : (l.sapma_pct||0) > 10 ? "#ef4444" : D.text
  return (
    <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 1fr 90px 80px 72px 72px 72px", gap:8, padding:"10px 12px", borderBottom:`1px solid ${D.brd}`, fontSize:12, alignItems:"center" }}>
      <div style={{ fontSize:10, color:D.dim, textAlign:"right" }}>{idx+1}</div>
      <div>
        <div style={{ fontWeight:500, color:D.gold }}>₺{(Number(l.fiyat||0)/1000000).toFixed(2)}M</div>
        <div style={{ fontSize:10, color:D.muted, marginTop:1 }}>{l.ilce||""}</div>
      </div>
      <div>
        <div style={{ color:D.text }}>{l.net_m2}m² · {l.oda_sayisi}</div>
        <div style={{ fontSize:10, color:D.dim, marginTop:1 }}>{l.kat_no}. kat · {l.bina_yasi} yaş</div>
      </div>
      <div style={{ color:D.text, textAlign:"right", fontSize:11 }}>₺{(l.m2_fiyati||0).toLocaleString("tr-TR")}</div>
      <div style={{ color:sapmaColor, textAlign:"right", fontWeight:500 }}>{(l.sapma_pct||0)>0?"+":""}{l.sapma_pct||0}%</div>
      <div style={{ textAlign:"right" }}>
        <span style={{ background:scoreColor(l.firsat_skoru||0)+"22", color:scoreColor(l.firsat_skoru||0), borderRadius:4, padding:"2px 7px", fontSize:11, fontWeight:600 }}>{l.firsat_skoru||0}</span>
      </div>
      <div style={{ textAlign:"right" }}>
        <span style={{ background:scoreColor(l.likidite_skoru||0)+"22", color:scoreColor(l.likidite_skoru||0), borderRadius:4, padding:"2px 6px", fontSize:11 }}>{l.likidite_skoru||0}</span>
      </div>
      <div style={{ textAlign:"right" }}>
        {l.risk_flag && <span style={{ background:"rgba(239,68,68,0.12)", color:"#f87171", borderRadius:4, padding:"2px 6px", fontSize:10 }}>RİSK</span>}
      </div>
    </div>
  )
}

function buildReportHtml(searchData: any, intelData: any, sf: any, inf: any) {
  const today = new Date().toLocaleDateString("tr-TR")
  const stats = searchData?.stats || {}
  const listings = (searchData?.listings || []).slice(0,10)
  const bolge = sf.ilce || sf.il || "Piyasa"

  const rows = listings.map((l: any) => `
    <tr>
      <td>₺${Number(l.fiyat||0).toLocaleString("tr-TR")}</td>
      <td>${l.net_m2||""}m² · ${l.oda_sayisi||""}</td>
      <td>${l.ilce||""}</td>
      <td>₺${(l.m2_fiyati||0).toLocaleString("tr-TR")}</td>
      <td style="color:${(l.sapma_pct||0)<0?"#22a35a":"#c0392b"}">${(l.sapma_pct||0)>0?"+":""}${l.sapma_pct||0}%</td>
      <td>${l.firsat_skoru||0}</td>
      <td>${l.likidite_skoru||0}</td>
    </tr>`).join("")

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"/>
<title>VEGA Emsal Raporu</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:12px;color:#1a1a1a;line-height:1.5}
  .hdr{background:#080808;color:#FFD700;padding:28px 36px;display:flex;justify-content:space-between;align-items:center}
  .hdr-t{font-size:24px;font-weight:300;letter-spacing:5px}
  .hdr-s{font-size:9px;letter-spacing:3px;color:#555;margin-top:3px}
  .hdr-m{text-align:right;font-size:11px;color:#888}
  .body{padding:32px 36px}
  .sec{margin-bottom:24px}
  .sec-t{font-size:9px;font-weight:700;letter-spacing:2px;color:#888;text-transform:uppercase;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #eee}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
  .kpi{background:#f8f8f8;border-radius:6px;padding:12px;text-align:center;border-top:2px solid #c8a800}
  .kv{font-size:22px;font-weight:700;color:#1a1a1a}
  .kl{font-size:9px;color:#888;letter-spacing:1px;margin-top:3px}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th{background:#f4f4f4;padding:8px 10px;text-align:left;font-weight:600;color:#555;font-size:9px;letter-spacing:1px}
  td{padding:7px 10px;border-bottom:1px solid #f0f0f0}
  .ai{background:#fffef5;border-left:3px solid #c8a800;padding:12px 16px;border-radius:0 6px 6px 0;font-size:12px;line-height:1.7;color:#333}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .ifield{background:#f8f8f8;border-radius:6px;padding:10px 14px}
  .il{font-size:9px;color:#888;letter-spacing:1px;margin-bottom:3px}
  .iv{font-size:13px;font-weight:600}
  .price-box{background:#080808;border-radius:10px;padding:22px;text-align:center;margin-bottom:14px}
  .pm{font-size:30px;font-weight:700;color:#FFD700}
  .pr{font-size:12px;color:#666;margin-top:5px}
  .disc{background:#fffbe6;border:1px solid #ffe066;border-radius:6px;padding:10px 14px;font-size:10px;color:#7a6500;margin-top:18px}
  .ftr{background:#f5f5f5;padding:14px 36px;text-align:center;font-size:10px;color:#999}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head>
<body>
<div class="hdr">
  <div>
    <div class="hdr-t">VEGA</div>
    <div class="hdr-s">EMSAL İSTİHBARAT RAPORU</div>
  </div>
  <div class="hdr-m">
    <div style="font-size:13px;color:#e0e0e0">${bolge} — Emsal Analizi</div>
    <div style="margin-top:4px">Tarih: ${today}</div>
  </div>
</div>
<div class="body">
${searchData ? `
<div class="sec">
  <div class="sec-t">Piyasa Özeti</div>
  <div class="kpis">
    <div class="kpi"><div class="kv">${stats.toplam||0}</div><div class="kl">ANALİZ EDİLEN</div></div>
    <div class="kpi"><div class="kv">${stats.firsat_count||0}</div><div class="kl">FIRSAT İLAN</div></div>
    <div class="kpi"><div class="kv">${stats.riskli_count||0}</div><div class="kl">RİSKLİ İLAN</div></div>
    <div class="kpi"><div class="kv">₺${(stats.ort_m2_fiyati||0).toLocaleString("tr-TR")}</div><div class="kl">ORT. M²/TL</div></div>
  </div>
</div>
${searchData.ai_yorum ? `<div class="sec"><div class="sec-t">AI Piyasa Yorumu</div><div class="ai">${searchData.ai_yorum}</div></div>` : ""}
<div class="sec">
  <div class="sec-t">En İyi Fırsat İlanları (Top 10)</div>
  <table>
    <thead><tr><th>FİYAT</th><th>ALAN/TİP</th><th>BÖLGE</th><th>M²/TL</th><th>SAPMA</th><th>FIRSAT</th><th>LİKİDİTE</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>` : ""}
${intelData ? `
<div class="sec">
  <div class="sec-t">Mülk İstihbaratı — ${inf.ilce||inf.il||""}</div>
  <div class="price-box">
    <div class="pm">₺${Number(intelData.tahmin_fiyat||0).toLocaleString("tr-TR")}</div>
    <div class="pr">₺${Number(intelData.alt_aralik||0).toLocaleString("tr-TR")} — ₺${Number(intelData.ust_aralik||0).toLocaleString("tr-TR")}</div>
  </div>
  <div class="g2" style="margin-bottom:12px">
    <div class="ifield"><div class="il">FIRSAT SKORU</div><div class="iv">${intelData.firsat_skoru||0} / 100</div></div>
    <div class="ifield"><div class="il">LİKİDİTE SKORU</div><div class="iv">${intelData.likidite_skoru||0} / 100</div></div>
    <div class="ifield"><div class="il">SAPMA</div><div class="iv">${(intelData.sapma_pct||0)>0?"+":""}${intelData.sapma_pct||0}%</div></div>
    <div class="ifield"><div class="il">SATIŞ SÜRESİ TAHMİNİ</div><div class="iv">${intelData.tahmini_satis_gun||60} gün</div></div>
    <div class="ifield"><div class="il">ÖNERİLEN İLAN FİYATI</div><div class="iv">₺${Number(intelData.onerilen_ilan_fiyati||0).toLocaleString("tr-TR")}</div></div>
    <div class="ifield"><div class="il">PAZARLIK TOLERANSI</div><div class="iv">%${intelData.pazarlik_tolerans_pct||7}</div></div>
  </div>
  ${intelData.piyasa_konumu ? `<div class="ai" style="margin-bottom:8px">${intelData.piyasa_konumu}</div>` : ""}
  ${intelData.danisman_onerisi ? `<div class="ai">${intelData.danisman_onerisi}</div>` : ""}
</div>` : ""}
  <div class="disc">Bu rapor VEGA AI tarafından otomatik olarak oluşturulmuştur. Yatırım tavsiyesi niteliği taşımaz. Nihai değer tespiti için uzman görüşü alınız.</div>
</div>
<div class="ftr">VEGA Intelligence Platform · vega-web-peach.vercel.app · ${today}</div>
</body></html>`
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function EmsalPage() {
  const pathname = usePathname()
  const [tab, setTab] = useState<Tab>("arama")

  const [sf, setSf] = useState({ il:"istanbul", ilce:"", net_m2_min:"", net_m2_max:"", fiyat_min:"", fiyat_max:"", oda_sayisi:"", bina_yasi_max:"", kat_min:"", kat_max:"", hedef_m2:"", hedef_fiyat:"", limit:"80" })
  const [searchData, setSearchData] = useState<any>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState("")

  const [inf, setInf] = useState({ il:"istanbul", ilce:"", mahalle:"", net_m2:"100", oda_sayisi:"3+1", bina_yasi:"10", kat_no:"3", toplam_kat:"8", cephe:"güney", fiyat:"" })
  const [intelData, setIntelData] = useState<any>(null)
  const [intelLoading, setIntelLoading] = useState(false)
  const [intelError, setIntelError] = useState("")

  const runSearch = async () => {
    setSearchLoading(true); setSearchError("")
    try {
      const body: any = { il: sf.il, limit: parseInt(sf.limit)||80 }
      if (sf.ilce) body.ilce = sf.ilce
      if (sf.net_m2_min) body.net_m2_min = parseFloat(sf.net_m2_min)
      if (sf.net_m2_max) body.net_m2_max = parseFloat(sf.net_m2_max)
      if (sf.fiyat_min) body.fiyat_min = parseFloat(sf.fiyat_min)
      if (sf.fiyat_max) body.fiyat_max = parseFloat(sf.fiyat_max)
      if (sf.oda_sayisi) body.oda_sayisi = sf.oda_sayisi
      if (sf.bina_yasi_max) body.bina_yasi_max = parseInt(sf.bina_yasi_max)
      if (sf.kat_min) body.kat_min = parseInt(sf.kat_min)
      if (sf.kat_max) body.kat_max = parseInt(sf.kat_max)
      if (sf.hedef_m2) body.hedef_m2 = parseFloat(sf.hedef_m2)
      if (sf.hedef_fiyat) body.hedef_fiyat = parseFloat(sf.hedef_fiyat)
      const res = await fetch(`${API_URL}/api/v1/emsal/search`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
      const data = await res.json()
      if (data.error) setSearchError(data.error)
      else setSearchData(data)
    } catch { setSearchError("Bağlantı hatası.") }
    setSearchLoading(false)
  }

  const runIntel = async () => {
    if (!inf.ilce.trim()) { setIntelError("İlçe zorunludur."); return }
    setIntelLoading(true); setIntelError("")
    try {
      const body: any = { il:inf.il, ilce:inf.ilce, net_m2:parseFloat(inf.net_m2), oda_sayisi:inf.oda_sayisi, bina_yasi:parseInt(inf.bina_yasi), kat_no:parseInt(inf.kat_no), toplam_kat:parseInt(inf.toplam_kat), cephe:inf.cephe }
      if (inf.mahalle) body.mahalle = inf.mahalle
      if (inf.fiyat) body.fiyat = parseFloat(inf.fiyat)
      const res = await fetch(`${API_URL}/api/v1/emsal/intelligence`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
      const data = await res.json()
      if (data.error) setIntelError(data.error)
      else setIntelData(data)
    } catch { setIntelError("Bağlantı hatası.") }
    setIntelLoading(false)
  }

  const downloadReport = () => {
    const html = buildReportHtml(searchData, intelData, sf, inf)
    const blob = new Blob([html], { type:"text/html;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const w = window.open(url, "_blank")
    if (w) { w.addEventListener("load", () => { w.print() }) }
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }

  const stats = searchData?.stats || {}
  const listings: any[] = searchData?.listings || []
  const showSearchForm = tab !== "fiyat" && tab !== "rapor"
  const showIntelForm = tab === "fiyat"

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
        <div style={{ padding:"16px 24px", borderBottom:`1px solid ${D.brd}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:16, fontWeight:500 }}>Emsal İstihbarat Merkezi</div>
            <div style={{ fontSize:11, color:D.muted, marginTop:2 }}>Piyasa araştırması · Fırsat tespiti · Sapma analizi · Portföy eşleşme · Likidite · Rapor</div>
          </div>
          <div style={{ background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:16, padding:"4px 12px", fontSize:11, color:D.gold, letterSpacing:1 }}>◭ EMSAL</div>
        </div>

        {/* Tab Bar */}
        <div style={{ borderBottom:`1px solid ${D.brd}`, padding:"0 20px", display:"flex", gap:0, overflowX:"auto", flexShrink:0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding:"11px 16px", fontSize:11, border:"none", background:"transparent", cursor:"pointer", whiteSpace:"nowrap", color:tab===t.id?D.gold:D.muted, borderBottom:tab===t.id?`2px solid ${D.gold}`:"2px solid transparent", fontWeight:tab===t.id?500:400, fontFamily:"inherit", marginBottom:-1, letterSpacing:0.3 }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* Left Form Panel */}
          {(showSearchForm || showIntelForm) && (
            <div style={{ width:272, borderRight:`1px solid ${D.brd}`, overflowY:"auto", padding:"18px 16px", flexShrink:0 }}>
              {showSearchForm && (
                <>
                  <div style={{ fontSize:10, color:D.dim, letterSpacing:2, marginBottom:12 }}>ARAMA FİLTRELERİ</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div style={fld}><label style={lbl}>İL</label><input style={inp} value={sf.il} onChange={e=>setSf(p=>({...p,il:e.target.value}))} placeholder="istanbul"/></div>
                    <div style={fld}><label style={lbl}>İLÇE</label><input style={inp} value={sf.ilce} onChange={e=>setSf(p=>({...p,ilce:e.target.value}))} placeholder="beşiktaş"/></div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div style={fld}><label style={lbl}>M² MİN</label><input style={inp} type="number" value={sf.net_m2_min} onChange={e=>setSf(p=>({...p,net_m2_min:e.target.value}))} placeholder="80"/></div>
                    <div style={fld}><label style={lbl}>M² MAX</label><input style={inp} type="number" value={sf.net_m2_max} onChange={e=>setSf(p=>({...p,net_m2_max:e.target.value}))} placeholder="200"/></div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div style={fld}><label style={lbl}>FİYAT MİN</label><input style={inp} type="number" value={sf.fiyat_min} onChange={e=>setSf(p=>({...p,fiyat_min:e.target.value}))} placeholder="5M"/></div>
                    <div style={fld}><label style={lbl}>FİYAT MAX</label><input style={inp} type="number" value={sf.fiyat_max} onChange={e=>setSf(p=>({...p,fiyat_max:e.target.value}))} placeholder="20M"/></div>
                  </div>
                  <div style={fld}><label style={lbl}>ODA SAYISI</label>
                    <select style={inp} value={sf.oda_sayisi} onChange={e=>setSf(p=>({...p,oda_sayisi:e.target.value}))}>
                      <option value="">Tümü</option>
                      {["1+1","2+1","3+1","4+1","5+1"].map(o=><option key={o}>{o}</option>)}
                    </select></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div style={fld}><label style={lbl}>BINA YAŞI MAX</label><input style={inp} type="number" value={sf.bina_yasi_max} onChange={e=>setSf(p=>({...p,bina_yasi_max:e.target.value}))} placeholder="20"/></div>
                    <div style={fld}><label style={lbl}>LİMİT</label><input style={inp} type="number" value={sf.limit} onChange={e=>setSf(p=>({...p,limit:e.target.value}))} placeholder="80"/></div>
                  </div>
                  <div style={{ height:1, background:D.brd, margin:"4px 0 12px" }}/>
                  <div style={{ fontSize:10, color:D.dim, letterSpacing:2, marginBottom:10 }}>HEDEF MÜLK (opsiyonel)</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div style={fld}><label style={lbl}>HEDEF M²</label><input style={inp} type="number" value={sf.hedef_m2} onChange={e=>setSf(p=>({...p,hedef_m2:e.target.value}))} placeholder="100"/></div>
                    <div style={fld}><label style={lbl}>HEDEF FİYAT</label><input style={inp} type="number" value={sf.hedef_fiyat} onChange={e=>setSf(p=>({...p,hedef_fiyat:e.target.value}))} placeholder="10M"/></div>
                  </div>
                  {searchError && <div style={{ color:"#f87171", fontSize:11, padding:"8px 10px", background:"rgba(248,113,113,0.06)", borderRadius:6, marginBottom:10 }}>{searchError}</div>}
                  <button onClick={runSearch} disabled={searchLoading}
                    style={{ width:"100%", padding:"11px", borderRadius:7, border:"none", fontSize:12, fontWeight:700, background:searchLoading?D.brd:D.gold, color:searchLoading?D.muted:"#000", cursor:searchLoading?"not-allowed":"pointer", letterSpacing:0.3, fontFamily:"inherit" }}>
                    {searchLoading ? "Analiz Ediliyor..." : "Emsal Analizi Başlat →"}
                  </button>
                </>
              )}

              {showIntelForm && (
                <>
                  <div style={{ fontSize:10, color:D.dim, letterSpacing:2, marginBottom:12 }}>MÜLK BİLGİLERİ</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div style={fld}><label style={lbl}>İL</label><input style={inp} value={inf.il} onChange={e=>setInf(p=>({...p,il:e.target.value}))} placeholder="istanbul"/></div>
                    <div style={fld}><label style={lbl}>İLÇE *</label><input style={inp} value={inf.ilce} onChange={e=>setInf(p=>({...p,ilce:e.target.value}))} placeholder="beşiktaş"/></div>
                  </div>
                  <div style={fld}><label style={lbl}>MAHALLE (opsiyonel)</label><input style={inp} value={inf.mahalle} onChange={e=>setInf(p=>({...p,mahalle:e.target.value}))} placeholder="Levent"/></div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div style={fld}><label style={lbl}>NET M²</label><input style={inp} type="number" value={inf.net_m2} onChange={e=>setInf(p=>({...p,net_m2:e.target.value}))}/></div>
                    <div style={fld}><label style={lbl}>BİNA YAŞI</label><input style={inp} type="number" value={inf.bina_yasi} onChange={e=>setInf(p=>({...p,bina_yasi:e.target.value}))}/></div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div style={fld}><label style={lbl}>KAT NO</label><input style={inp} type="number" value={inf.kat_no} onChange={e=>setInf(p=>({...p,kat_no:e.target.value}))}/></div>
                    <div style={fld}><label style={lbl}>TOPLAM KAT</label><input style={inp} type="number" value={inf.toplam_kat} onChange={e=>setInf(p=>({...p,toplam_kat:e.target.value}))}/></div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    <div style={fld}><label style={lbl}>ODA SAYISI</label>
                      <select style={inp} value={inf.oda_sayisi} onChange={e=>setInf(p=>({...p,oda_sayisi:e.target.value}))}>
                        {["1+1","2+1","3+1","4+1","5+1"].map(o=><option key={o}>{o}</option>)}
                      </select></div>
                    <div style={fld}><label style={lbl}>CEPHE</label>
                      <select style={inp} value={inf.cephe} onChange={e=>setInf(p=>({...p,cephe:e.target.value}))}>
                        {["kuzey","güney","doğu","batı"].map(c=><option key={c}>{c}</option>)}
                      </select></div>
                  </div>
                  <div style={fld}><label style={lbl}>İSTENEN FİYAT (opsiyonel)</label><input style={inp} type="number" value={inf.fiyat} onChange={e=>setInf(p=>({...p,fiyat:e.target.value}))} placeholder="Sapma analizi için"/></div>
                  {intelError && <div style={{ color:"#f87171", fontSize:11, padding:"8px 10px", background:"rgba(248,113,113,0.06)", borderRadius:6, marginBottom:10 }}>{intelError}</div>}
                  <button onClick={runIntel} disabled={intelLoading||!inf.ilce.trim()}
                    style={{ width:"100%", padding:"11px", borderRadius:7, border:"none", fontSize:12, fontWeight:700, background:intelLoading||!inf.ilce.trim()?D.brd:D.gold, color:intelLoading||!inf.ilce.trim()?D.muted:"#000", cursor:intelLoading||!inf.ilce.trim()?"not-allowed":"pointer", letterSpacing:0.3, fontFamily:"inherit" }}>
                    {intelLoading ? "Analiz Ediliyor..." : "İstihbarat Analizi →"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Right Panel */}
          <div style={{ flex:1, overflowY:"auto", padding:"22px 24px" }}>

            {/* ── EMSAL ARAMA ── */}
            {tab === "arama" && (
              <>
                {searchLoading && <LoadingSpinner text="Emsal analizi yapılıyor..."/>}
                {!searchLoading && !searchData && <EmptyState icon="◎" title="Emsal Araması Başlatın" sub="Sol panelden filtrelerinizi ayarlayın ve analizi başlatın."/>}
                {!searchLoading && searchData && (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
                      <KpiCard label="ANALİZ EDİLEN" value={stats.toplam||0} sub="toplam ilan" color={D.gold}/>
                      <KpiCard label="FIRSAT İLAN" value={stats.firsat_count||0} sub="skor > 65" color="#22c55e"/>
                      <KpiCard label="RİSKLİ" value={stats.riskli_count||0} sub="sapma > %20" color="#ef4444"/>
                      <KpiCard label="LİKİDİTE YÜKSEK" value={stats.likidite_yuksek||0} sub="skor > 70" color={D.text}/>
                    </div>
                    <div style={{ display:"flex", gap:10, marginBottom:18 }}>
                      {[
                        { label:"ORT. FİYAT", v:`₺${(stats.ort_fiyat||0).toLocaleString("tr-TR")}` },
                        { label:"ORT. M²/TL", v:`₺${(stats.ort_m2_fiyati||0).toLocaleString("tr-TR")}` },
                        { label:"MIN FİYAT", v:`₺${(stats.min_fiyat||0).toLocaleString("tr-TR")}`, c:"#22c55e" },
                        { label:"MAX FİYAT", v:`₺${(stats.max_fiyat||0).toLocaleString("tr-TR")}` },
                      ].map((s,i)=>(
                        <div key={i} style={{ flex:1, background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:7, padding:"10px 14px" }}>
                          <div style={{ fontSize:10, color:D.dim, letterSpacing:1 }}>{s.label}</div>
                          <div style={{ fontSize:16, fontWeight:600, color:(s as any).c||D.text, marginTop:4 }}>{s.v}</div>
                        </div>
                      ))}
                    </div>
                    {searchData.ai_yorum && (
                      <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.15)", borderLeft:`3px solid rgba(255,215,0,0.4)`, borderRadius:8, padding:"12px 16px", marginBottom:18, fontSize:12, color:D.text, lineHeight:1.75 }}>
                        {searchData.ai_yorum}
                      </div>
                    )}
                    <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:8, overflow:"hidden" }}>
                      <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 1fr 90px 80px 72px 72px 72px", gap:8, padding:"9px 12px", borderBottom:`1px solid ${D.brd}`, fontSize:10, color:D.dim, letterSpacing:1 }}>
                        <div/><div>FİYAT/BÖLGE</div><div>ALAN/TİP</div><div style={{textAlign:"right"}}>M²/TL</div><div style={{textAlign:"right"}}>SAPMA</div><div style={{textAlign:"right"}}>FIRSAT</div><div style={{textAlign:"right"}}>LİK.</div><div style={{textAlign:"right"}}>DURUM</div>
                      </div>
                      {listings.map((l,i)=><ListingRow key={l.id||i} l={l} idx={i}/>)}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── FİYAT ANALİZİ ── */}
            {tab === "fiyat" && (
              <>
                {intelLoading && <LoadingSpinner text="Mülk istihbaratı hesaplanıyor..."/>}
                {!intelLoading && !intelData && <EmptyState icon="⚡" title="Mülk İstihbaratı" sub="Sol panelden mülk bilgilerini girin. AI derin analiz yapacak."/>}
                {!intelLoading && intelData && (
                  <div style={{ maxWidth:620 }}>
                    <div style={{ background:"rgba(255,215,0,0.05)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:12, padding:"26px", textAlign:"center", marginBottom:20 }}>
                      <div style={{ fontSize:11, color:D.muted, letterSpacing:2, marginBottom:8 }}>TAHMİN DEĞERİ</div>
                      <div style={{ fontSize:38, fontWeight:700, color:D.gold, letterSpacing:-1 }}>₺{Number(intelData.tahmin_fiyat||0).toLocaleString("tr-TR")}</div>
                      <div style={{ fontSize:13, color:D.muted, marginTop:8 }}>₺{Number(intelData.alt_aralik||0).toLocaleString("tr-TR")} — ₺{Number(intelData.ust_aralik||0).toLocaleString("tr-TR")}</div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:18 }}>
                      {[
                        { label:"FIRSAT SKORU", v:intelData.firsat_skoru||0 },
                        { label:"LİKİDİTE SKORU", v:intelData.likidite_skoru||0 },
                      ].map((s,i)=>(
                        <div key={i} style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:8, padding:"16px", textAlign:"center" }}>
                          <div style={{ fontSize:10, color:D.muted, letterSpacing:1, marginBottom:6 }}>{s.label}</div>
                          <div style={{ fontSize:32, fontWeight:700, color:scoreColor(s.v) }}>{s.v}</div>
                          <div style={{ fontSize:10, color:D.dim, marginTop:3 }}>/ 100</div>
                        </div>
                      ))}
                      <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:8, padding:"16px", textAlign:"center" }}>
                        <div style={{ fontSize:10, color:D.muted, letterSpacing:1, marginBottom:6 }}>SAPMA</div>
                        <div style={{ fontSize:32, fontWeight:700, color:(intelData.sapma_pct||0)<0?"#22c55e":(intelData.sapma_pct||0)>0?"#ef4444":D.text }}>
                          {(intelData.sapma_pct||0)>0?"+":""}{intelData.sapma_pct||0}%
                        </div>
                        <div style={{ fontSize:10, color:D.dim, marginTop:3 }}>piyasaya göre</div>
                      </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
                      {[
                        { label:"ADİL FİYAT ARALIĞI", v:`₺${Number(intelData.adil_fiyat_min||0).toLocaleString("tr-TR")} — ₺${Number(intelData.adil_fiyat_max||0).toLocaleString("tr-TR")}` },
                        { label:"ÖNERİLEN İLAN FİYATI", v:`₺${Number(intelData.onerilen_ilan_fiyati||0).toLocaleString("tr-TR")}` },
                        { label:"PAZARLIK TOLERANSI", v:`%${intelData.pazarlik_tolerans_pct||7}` },
                        { label:"TAHMİNİ SATIŞ SÜRESİ", v:`${intelData.tahmini_satis_gun||60} gün` },
                      ].map((item,i)=>(
                        <div key={i} style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:8, padding:"12px 14px" }}>
                          <div style={{ fontSize:10, color:D.dim, letterSpacing:1, marginBottom:4 }}>{item.label}</div>
                          <div style={{ fontSize:13, fontWeight:500, color:D.text }}>{item.v}</div>
                        </div>
                      ))}
                    </div>
                    {[
                      { label:"PİYASA KONUMU", text:intelData.piyasa_konumu },
                      { label:"FIRSAT ANALİZİ", text:intelData.firsat_analizi },
                      { label:"DANIŞMAN ÖNERİSİ", text:intelData.danisman_onerisi },
                      { label:"ARZ-TALEP ÖZETİ", text:intelData.arz_talep_ozeti },
                    ].filter(n=>n.text).map((n,i)=>(
                      <div key={i} style={{ background:"rgba(255,215,0,0.03)", border:"1px solid rgba(255,215,0,0.1)", borderLeft:`2px solid rgba(255,215,0,0.3)`, borderRadius:8, padding:"12px 16px", marginBottom:10 }}>
                        <div style={{ fontSize:9, color:D.dim, letterSpacing:2, marginBottom:6 }}>{n.label}</div>
                        <div style={{ fontSize:12, color:D.text, lineHeight:1.75 }}>{n.text}</div>
                      </div>
                    ))}
                    {intelData.risk_flag && (
                      <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8, padding:"12px 16px", fontSize:12, color:"#f87171" }}>
                        Uyarı: Bu mülk piyasa ortalamasından önemli ölçüde sapma göstermektedir.
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ── FIRSAT MOTORU ── */}
            {tab === "firsat" && (
              <>
                {searchLoading && <LoadingSpinner text="Fırsat analizi yapılıyor..."/>}
                {!searchLoading && !searchData && <EmptyState icon="◈" title="Fırsat Motoru" sub="Önce Emsal Arama sekmesinden piyasa araştırması yapın."/>}
                {!searchLoading && searchData && (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
                      <KpiCard label="FIRSAT İLAN" value={stats.firsat_count||0} sub="skor > 65" color="#22c55e"/>
                      <KpiCard label="ORT. FIRSAT" value={Math.round(listings.reduce((a,l)=>a+(l.firsat_skoru||0),0)/Math.max(listings.length,1))} color={D.gold}/>
                      <KpiCard label="PIYASA ALTI" value={listings.filter(l=>l.sapma_pct<-15).length} sub="< −15% sapma" color="#22c55e"/>
                      <KpiCard label="BÖLGE ÇEŞITLILIĞI" value={new Set(listings.map(l=>l.ilce).filter(Boolean)).size} sub="farklı ilçe" color={D.text}/>
                    </div>
                    <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:8, overflow:"hidden" }}>
                      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${D.brd}`, fontSize:11, color:D.gold }}>Fırsat Sıralaması — En Yüksek Skordan</div>
                      <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 1fr 90px 80px 72px 72px 72px", gap:8, padding:"9px 12px", borderBottom:`1px solid ${D.brd}`, fontSize:10, color:D.dim, letterSpacing:1 }}>
                        <div/><div>FİYAT/BÖLGE</div><div>ALAN/TİP</div><div style={{textAlign:"right"}}>M²/TL</div><div style={{textAlign:"right"}}>SAPMA</div><div style={{textAlign:"right"}}>FIRSAT</div><div style={{textAlign:"right"}}>LİK.</div><div style={{textAlign:"right"}}>DURUM</div>
                      </div>
                      {[...listings].sort((a,b)=>b.firsat_skoru-a.firsat_skoru).map((l,i)=><ListingRow key={l.id||i} l={l} idx={i}/>)}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── SAPMA ANALİZİ ── */}
            {tab === "sapma" && (
              <>
                {searchLoading && <LoadingSpinner text="Sapma analizi yapılıyor..."/>}
                {!searchLoading && !searchData && <EmptyState icon="◐" title="Sapma Analizi" sub="Önce Emsal Arama sekmesinden arama yapın."/>}
                {!searchLoading && searchData && (
                  <>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:18 }}>
                      {[
                        { label:"Çok Ucuz (<−20%)", count:listings.filter(l=>l.sapma_pct<-20).length, color:"#22c55e" },
                        { label:"Uygun (−20%→0%)", count:listings.filter(l=>l.sapma_pct>=-20&&l.sapma_pct<0).length, color:"#86efac" },
                        { label:"Ortalama (0%→+10%)", count:listings.filter(l=>l.sapma_pct>=0&&l.sapma_pct<10).length, color:D.gold },
                        { label:"Pahalı (>+10%)", count:listings.filter(l=>l.sapma_pct>=10).length, color:"#ef4444" },
                      ].map((s,i)=>(
                        <div key={i} style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:8, padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                          <div><div style={{ fontSize:13, fontWeight:600, color:D.text }}>{s.count}</div><div style={{ fontSize:10, color:D.dim }}>{s.label}</div></div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:8, padding:"16px" }}>
                      <div style={{ fontSize:10, color:D.dim, letterSpacing:2, marginBottom:14 }}>SAPMA DAĞILIMI (negatif = fırsat)</div>
                      {[...listings].sort((a,b)=>a.sapma_pct-b.sapma_pct).map((l,i)=>{
                        const p = l.sapma_pct||0
                        const color = p<-15?"#22c55e":p<0?"#86efac":p<15?D.gold:"#ef4444"
                        const w = Math.min(48, Math.abs(p)*1.5)
                        return (
                          <div key={l.id||i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:5 }}>
                            <div style={{ fontSize:11, color:D.muted, width:130, flexShrink:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.ilce||"—"} {l.net_m2}m² {l.oda_sayisi}</div>
                            <div style={{ flex:1, height:18, position:"relative", background:"#161616", borderRadius:3, overflow:"visible" }}>
                              <div style={{ position:"absolute", left:"50%", top:0, width:1, height:"100%", background:"#2a2a2a" }}/>
                              <div style={{ position:"absolute", [p<0?"right":"left"]:"50%", width:`${w}%`, height:"100%", background:color+"99", borderRadius:3, maxWidth:"50%" }}/>
                            </div>
                            <div style={{ fontSize:11, fontWeight:600, color, width:52, textAlign:"right", flexShrink:0 }}>{p>0?"+":""}{p}%</div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── PORTFÖY EŞLEŞME ── */}
            {tab === "eslestirme" && (
              <>
                {searchLoading && <LoadingSpinner text="Eşleşme analizi yapılıyor..."/>}
                {!searchLoading && !searchData && <EmptyState icon="▦" title="Portföy Eşleşme" sub="Emsal Arama sekmesinde hedef m² belirleyerek arama yapın. İlanlar benzerlik skoruna göre sıralanır."/>}
                {!searchLoading && searchData && (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:18 }}>
                      <KpiCard label="YÜKSEK EŞLEŞİM" value={listings.filter(l=>(l.benzerlik_pct||0)>=80).length} sub=">= 80 puan" color="#22c55e"/>
                      <KpiCard label="ORTA EŞLEŞİM" value={listings.filter(l=>(l.benzerlik_pct||0)>=50&&(l.benzerlik_pct||0)<80).length} sub="50–79 puan" color={D.gold}/>
                      <KpiCard label="DÜŞÜK EŞLEŞİM" value={listings.filter(l=>(l.benzerlik_pct||0)<50).length} sub="< 50 puan" color={D.muted}/>
                    </div>
                    <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:8, overflow:"hidden" }}>
                      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${D.brd}`, fontSize:11, color:D.gold }}>Benzerlik Sıralaması</div>
                      {[...listings].sort((a,b)=>(b.benzerlik_pct||0)-(a.benzerlik_pct||0)).map((l,i)=>(
                        <div key={l.id||i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderBottom:`1px solid ${D.brd}` }}>
                          <div style={{ width:46, height:46, borderRadius:7, background:`${scoreColor(l.benzerlik_pct||0)}18`, border:`1px solid ${scoreColor(l.benzerlik_pct||0)}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                            <span style={{ fontSize:14, fontWeight:700, color:scoreColor(l.benzerlik_pct||0) }}>{l.benzerlik_pct||0}</span>
                          </div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13, fontWeight:500, color:D.gold }}>₺{Number(l.fiyat||0).toLocaleString("tr-TR")}</div>
                            <div style={{ fontSize:11, color:D.muted, marginTop:2 }}>{l.net_m2}m² · {l.oda_sayisi} · {l.kat_no}. kat · {l.ilce||""}</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:12, color:D.text }}>₺{(l.m2_fiyati||0).toLocaleString("tr-TR")}/m²</div>
                            <div style={{ fontSize:10, color:(l.sapma_pct||0)<0?"#22c55e":"#f87171", marginTop:2 }}>{(l.sapma_pct||0)>0?"+":""}{l.sapma_pct||0}% sapma</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── ARZ-TALEP ── */}
            {tab === "arz_talep" && (
              <>
                {searchLoading && <LoadingSpinner text="Arz-talep analizi yapılıyor..."/>}
                {!searchLoading && !searchData && <EmptyState icon="◉" title="Arz-Talep Analizi" sub="Önce Emsal Arama sekmesinden arama yapın."/>}
                {!searchLoading && searchData && (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
                      <KpiCard label="TOPLAM ARZ" value={stats.toplam||0} color={D.gold}/>
                      <KpiCard label="ORT. M²/TL" value={`₺${(stats.ort_m2_fiyati||0).toLocaleString("tr-TR")}`} color={D.text}/>
                      <KpiCard label="FİYAT FARKI" value={`₺${(((stats.max_fiyat||0)-(stats.min_fiyat||0))/1000000).toFixed(1)}M`} sub="min-max" color={D.muted}/>
                      <KpiCard label="FIRSAT ORANI" value={`%${Math.round(((stats.firsat_count||0)/Math.max(stats.toplam||1,1))*100)}`} color="#22c55e"/>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                      <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:10, padding:"18px" }}>
                        <div style={{ fontSize:10, color:D.dim, letterSpacing:2, marginBottom:14 }}>ODA TİPİ DAĞILIMI</div>
                        {(()=>{
                          const map: Record<string,number> = {}
                          listings.forEach(l=>{if(l.oda_sayisi)map[l.oda_sayisi]=(map[l.oda_sayisi]||0)+1})
                          const mx = Math.max(...Object.values(map),1)
                          return Object.entries(map).sort(([,a],[,b])=>b-a).map(([oda,cnt])=>(
                            <div key={oda} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                              <div style={{ fontSize:12, color:D.text, width:36, flexShrink:0 }}>{oda}</div>
                              <div style={{ flex:1, background:"#161616", borderRadius:4, height:22, overflow:"hidden" }}>
                                <div style={{ width:`${(cnt/mx)*100}%`, height:"100%", background:`rgba(255,215,0,${0.35+cnt/mx*0.5})`, borderRadius:4, display:"flex", alignItems:"center", paddingLeft:8, transition:"width 0.5s" }}>
                                  {(cnt/mx)>0.25&&<span style={{ fontSize:10, color:"#000", fontWeight:700 }}>{cnt}</span>}
                                </div>
                              </div>
                              {(cnt/mx)<=0.25&&<span style={{ fontSize:10, color:D.muted, flexShrink:0 }}>{cnt}</span>}
                            </div>
                          ))
                        })()}
                      </div>
                      <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:10, padding:"18px" }}>
                        <div style={{ fontSize:10, color:D.dim, letterSpacing:2, marginBottom:14 }}>M² FİYAT BANDI</div>
                        {(()=>{
                          const prices = listings.filter(l=>l.m2_fiyati>0).map(l=>l.m2_fiyati)
                          if(!prices.length) return <div style={{ fontSize:12, color:D.dim }}>Veri yok.</div>
                          const mn = Math.min(...prices), mx2 = Math.max(...prices)
                          const step = (mx2-mn)/5
                          return Array.from({length:5},(_,i)=>{
                            const lo=mn+i*step, hi=mn+(i+1)*step
                            const cnt=prices.filter(p=>p>=lo&&(i===4?p<=hi:p<hi)).length
                            const pct=cnt/prices.length*100
                            return (
                              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                                <div style={{ fontSize:10, color:D.muted, width:110, flexShrink:0 }}>₺{Math.round(lo/1000)}K–{Math.round(hi/1000)}K</div>
                                <div style={{ flex:1, background:"#161616", borderRadius:4, height:18 }}>
                                  <div style={{ width:`${pct}%`, height:"100%", background:"rgba(255,215,0,0.5)", borderRadius:4, transition:"width 0.5s" }}/>
                                </div>
                                <div style={{ fontSize:10, color:D.muted, width:20, textAlign:"right", flexShrink:0 }}>{cnt}</div>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </div>
                    {searchData.ai_yorum && (
                      <div style={{ background:"rgba(255,215,0,0.03)", border:"1px solid rgba(255,215,0,0.12)", borderLeft:`2px solid rgba(255,215,0,0.35)`, borderRadius:8, padding:"12px 16px", fontSize:12, color:D.text, lineHeight:1.75 }}>
                        {searchData.ai_yorum}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ── LİKİDİTE SKORU ── */}
            {tab === "likidite" && (
              <>
                {searchLoading && <LoadingSpinner text="Likidite analizi yapılıyor..."/>}
                {!searchLoading && !searchData && <EmptyState icon="▤" title="Likidite Skoru" sub="Önce Emsal Arama sekmesinden arama yapın."/>}
                {!searchLoading && searchData && (
                  <>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
                      <KpiCard label="LİKİDİTE YÜKSEK" value={stats.likidite_yuksek||0} sub="> 70 puan" color="#22c55e"/>
                      <KpiCard label="ORT. LİKİDİTE" value={Math.round(listings.reduce((a,l)=>a+(l.likidite_skoru||0),0)/Math.max(listings.length,1))} color={D.gold}/>
                      <KpiCard label="HIZLI SATILIR" value={listings.filter(l=>(l.likidite_skoru||0)>=80).length} sub=">= 80" color="#22c55e"/>
                      <KpiCard label="ZOR SATILIR" value={listings.filter(l=>(l.likidite_skoru||0)<40).length} sub="< 40" color="#ef4444"/>
                    </div>
                    <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:8, overflow:"hidden" }}>
                      <div style={{ padding:"10px 14px", borderBottom:`1px solid ${D.brd}`, fontSize:11, color:D.gold }}>Likidite Sıralaması</div>
                      {[...listings].sort((a,b)=>(b.likidite_skoru||0)-(a.likidite_skoru||0)).map((l,i)=>{
                        const liq=l.likidite_skoru||0
                        return (
                          <div key={l.id||i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", borderBottom:`1px solid ${D.brd}` }}>
                            <div style={{ fontSize:10, color:D.dim, width:24, textAlign:"right", flexShrink:0 }}>#{i+1}</div>
                            <div style={{ flex:1 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                                <div>
                                  <span style={{ fontSize:13, fontWeight:500, color:D.gold }}>₺{Number(l.fiyat||0).toLocaleString("tr-TR")}</span>
                                  <span style={{ fontSize:11, color:D.muted, marginLeft:8 }}>{l.net_m2}m² · {l.oda_sayisi} · {l.ilce||""}</span>
                                </div>
                                <span style={{ fontSize:15, fontWeight:700, color:scoreColor(liq) }}>{liq}</span>
                              </div>
                              <div style={{ background:"#1a1a1a", borderRadius:3, height:5 }}>
                                <div style={{ width:`${liq}%`, height:"100%", background:scoreColor(liq), borderRadius:3, transition:"width 0.5s" }}/>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── RAPOR MERKEZİ ── */}
            {tab === "rapor" && (
              <div style={{ maxWidth:500 }}>
                <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:10, padding:"18px", marginBottom:20, fontSize:12, color:D.muted, lineHeight:1.75 }}>
                  Emsal araması ve mülk istihbaratı yaptıktan sonra PDF raporu oluşturun. Tarayıcı PDF motoru kullanılır — tüm Türkçe karakterler doğru görünür.
                </div>
                <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:10, padding:"20px", marginBottom:20 }}>
                  <div style={{ fontSize:10, color:D.dim, letterSpacing:2, marginBottom:14 }}>RAPOR İÇERİĞİ</div>
                  {[
                    { label:"Piyasa istatistikleri (KPI)", ok:!!searchData },
                    { label:"AI piyasa yorumu", ok:!!(searchData?.ai_yorum) },
                    { label:`Top ${Math.min(10,listings.length)} fırsat ilanı tablosu`, ok:listings.length>0 },
                    { label:"Mülk istihbarat detayları", ok:!!intelData },
                    { label:"Danışman önerisi (AI)", ok:!!(intelData?.danisman_onerisi) },
                  ].map((item,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <span style={{ fontSize:13, color:item.ok?"#22c55e":D.brd }}>◎</span>
                      <span style={{ fontSize:12, color:item.ok?D.text:D.muted }}>{item.label}</span>
                      {!item.ok && <span style={{ fontSize:10, color:D.dim, marginLeft:"auto" }}>Veri yok</span>}
                    </div>
                  ))}
                </div>
                <button onClick={downloadReport} disabled={!searchData&&!intelData}
                  style={{ width:"100%", padding:"14px", borderRadius:8, border:"none", fontSize:13, fontWeight:700, background:(searchData||intelData)?D.gold:D.brd, color:(searchData||intelData)?"#000":D.muted, cursor:(searchData||intelData)?"pointer":"not-allowed", letterSpacing:0.3, fontFamily:"inherit" }}>
                  {(searchData||intelData) ? "PDF Raporu Oluştur →" : "Önce Analiz Yapın"}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px}`}</style>
    </div>
  )
}
