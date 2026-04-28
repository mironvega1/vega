"use client"
import React, { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com"
const D = { bg:"#080808", bg2:"#0d0d0d", bg3:"#111", brd:"#161616", brd2:"#1e1e1e", gold:"#FFD700", text:"#e0e0e0", muted:"#555", dim:"#333" }

const NAV_ITEMS = [
  { href:"/dashboard",          label:"Ana Merkez",        icon:"◈" },
  { href:"/analysis",           label:"Analiz Merkezi",    icon:"◎" },
  { href:"/valuation",          label:"AI Değerleme",      icon:"⚡" },
  { href:"/map",                label:"Canlı Harita",      icon:"◉" },
  { href:"/listings",           label:"İlan Yönetimi",     icon:"▦" },
  { href:"/zone-scores",        label:"Bölge Skoru",       icon:"◐" },
  { href:"/bina-karsilastirma", label:"Kat Analizi",       icon:"▤" },
  { href:"/emsal",              label:"Emsal İstihbarat",  icon:"◭" },
  { href:"/report",             label:"PDF Rapor",         icon:"▣" },
]

const inp: React.CSSProperties = { width:"100%", padding:"9px 12px", borderRadius:7, border:"1px solid #1e1e1e", background:"#111", color:"#e0e0e0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }
const lbl: React.CSSProperties = { fontSize:11, color:"#555", display:"block", marginBottom:5, letterSpacing:1 }
const fld: React.CSSProperties = { marginBottom:14 }

function downloadPDF(form: any, result: any) {
  const today = new Date().toLocaleDateString("tr-TR")
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8"/>
<title>VEGA Değerleme Raporu</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:12px;line-height:1.6}
  .header{background:#080808;color:#FFD700;padding:32px 40px;display:flex;justify-content:space-between;align-items:center}
  .header-title{font-size:28px;font-weight:300;letter-spacing:6px}
  .header-sub{font-size:10px;letter-spacing:3px;color:#666;margin-top:4px}
  .header-meta{text-align:right;font-size:11px;color:#888}
  .body{padding:36px 40px}
  .section{margin-bottom:28px}
  .section-title{font-size:10px;font-weight:600;letter-spacing:2px;color:#888;text-transform:uppercase;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #e8e8e8}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .field{background:#f9f9f9;border-radius:6px;padding:10px 14px}
  .field-label{font-size:10px;color:#999;letter-spacing:1px;margin-bottom:3px}
  .field-val{font-size:13px;font-weight:500;color:#1a1a1a}
  .price-box{background:#080808;border-radius:10px;padding:24px;text-align:center;margin-bottom:16px}
  .price-main{font-size:32px;font-weight:700;color:#FFD700;letter-spacing:-1px}
  .price-range{font-size:13px;color:#888;margin-top:6px}
  .shap-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0}
  .shap-key{color:#555;font-size:12px}
  .shap-val{font-size:12px;font-weight:500}
  .footer{background:#f5f5f5;padding:20px 40px;text-align:center;font-size:10px;color:#999;margin-top:auto}
  .disclaimer{background:#fffbe6;border:1px solid #ffe066;border-radius:6px;padding:12px 16px;font-size:11px;color:#7a6500;margin-top:20px}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.header{background:#080808!important}}
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="header-title">VEGA</div>
    <div class="header-sub">INTELLIGENCE PLATFORM</div>
  </div>
  <div class="header-meta">
    <div style="font-size:13px;font-weight:500;color:#e0e0e0">Değerleme Raporu</div>
    <div style="margin-top:4px">Tarih: ${today}</div>
  </div>
</div>
<div class="body">
  <div class="section">
    <div class="section-title">Müşteri Bilgileri</div>
    <div class="grid2">
      <div class="field"><div class="field-label">MÜŞTERİ ADI</div><div class="field-val">${form.musteri_adi || "—"}</div></div>
      <div class="field"><div class="field-label">İLÇE</div><div class="field-val">${form.ilce || "—"}</div></div>
      <div class="field" style="grid-column:1/-1"><div class="field-label">ADRES</div><div class="field-val">${form.adres || "—"}</div></div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Mülk Bilgileri</div>
    <div class="grid2">
      <div class="field"><div class="field-label">NET ALAN</div><div class="field-val">${form.net_m2} m²</div></div>
      <div class="field"><div class="field-label">ODA SAYISI</div><div class="field-val">${form.oda_sayisi}</div></div>
      <div class="field"><div class="field-label">KAT</div><div class="field-val">${form.kat_no}. kat / ${form.toplam_kat} kat</div></div>
      <div class="field"><div class="field-label">BİNA YAŞI</div><div class="field-val">${form.bina_yasi} yıl</div></div>
      <div class="field"><div class="field-label">CEPHE</div><div class="field-val">${form.cephe}</div></div>
    </div>
  </div>

  ${result ? `
  <div class="section">
    <div class="section-title">AI Değerleme Sonucu</div>
    <div class="price-box">
      <div class="price-main">₺${Number(result.tahmin_fiyat).toLocaleString("tr-TR")}</div>
      <div class="price-range">₺${Number(result.alt_aralik).toLocaleString("tr-TR")} — ₺${Number(result.ust_aralik).toLocaleString("tr-TR")}</div>
    </div>
    <div class="grid2" style="margin-bottom:16px">
      <div class="field"><div class="field-label">GÜVEN SKORU</div><div class="field-val">%${Math.round((result.guven_skoru||0)*100)}</div></div>
      <div class="field"><div class="field-label">MODEL</div><div class="field-val">${result.model_version||"v0.2"}</div></div>
    </div>
    <div class="section-title">Fiyatı Etkileyen Faktörler</div>
    ${Object.entries(result.shap_values||{}).sort(([,a],[,b])=>(b as number)-(a as number)).map(([key,val])=>`
    <div class="shap-row">
      <span class="shap-key">${key}</span>
      <span class="shap-val">₺${Number(val).toLocaleString("tr-TR")}</span>
    </div>`).join("")}
  </div>
  ` : ""}

  <div class="disclaimer">
    Bu rapor VEGA AI tarafından otomatik olarak oluşturulmuştur. Yatırım tavsiyesi niteliği taşımaz. Nihai değer tespiti için uzman görüşü alınız.
  </div>
</div>
<div class="footer">VEGA Intelligence Platform · vega-web-peach.vercel.app · ${today}</div>
</body></html>`

  const blob = new Blob([html], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const w = window.open(url, "_blank")
  if (w) {
    w.addEventListener("load", () => { w.print() })
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

export default function Report() {
  const pathname = usePathname()
  const [form, setForm] = useState({
    musteri_adi: "", adres: "", ilce: "Kadıköy",
    net_m2: "120", kat_no: "3", toplam_kat: "8",
    bina_yasi: "10", oda_sayisi: "3+1", cephe: "güney",
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleValuation = async () => {
    setLoading(true); setError(""); setResult(null)
    try {
      const res = await fetch(`${API_URL}/api/v1/valuation/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          net_m2: parseFloat(form.net_m2),
          kat_no: parseInt(form.kat_no),
          toplam_kat: parseInt(form.toplam_kat),
          bina_yasi: parseInt(form.bina_yasi),
          cephe: form.cephe,
          oda_sayisi: form.oda_sayisi,
        }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResult(data)
    } catch { setError("Bağlantı hatası.") }
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
            <div style={{ fontSize:16, fontWeight:500 }}>PDF Rapor</div>
            <div style={{ fontSize:11, color:D.muted, marginTop:2 }}>Müşteri için profesyonel değerleme raporu · Tam Türkçe karakter desteği</div>
          </div>
          <div style={{ background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:16, padding:"4px 12px", fontSize:11, color:D.gold, letterSpacing:1 }}>▣ RAPOR</div>
        </div>

        {/* Content */}
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* Left Form Panel */}
          <div style={{ width:320, borderRight:`1px solid ${D.brd}`, overflowY:"auto", padding:"24px", flexShrink:0 }}>
            <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.12)", borderRadius:8, padding:"10px 14px", marginBottom:20, fontSize:11, color:D.muted, lineHeight:1.5 }}>
              Müşteri ve mülk bilgilerini doldurun, AI değerleme alın, ardından PDF olarak indirin.
            </div>

            {/* Customer Info */}
            <div style={{ fontSize:10, color:D.dim, letterSpacing:2, marginBottom:12 }}>MÜŞTERİ BİLGİLERİ</div>
            <div style={fld}><label style={lbl}>MÜŞTERİ ADI SOYADI</label>
              <input style={inp} value={form.musteri_adi} onChange={e=>update("musteri_adi",e.target.value)} placeholder="Ahmet Yılmaz" /></div>
            <div style={fld}><label style={lbl}>ADRES</label>
              <input style={inp} value={form.adres} onChange={e=>update("adres",e.target.value)} placeholder="Moda Cad. No:5" /></div>
            <div style={fld}><label style={lbl}>İLÇE</label>
              <input style={inp} value={form.ilce} onChange={e=>update("ilce",e.target.value)} placeholder="Kadıköy" /></div>

            <div style={{ height:1, background:D.brd, margin:"16px 0" }}/>

            {/* Property Info */}
            <div style={{ fontSize:10, color:D.dim, letterSpacing:2, marginBottom:12 }}>MÜLK BİLGİLERİ</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={fld}><label style={lbl}>NET M²</label>
                <input style={inp} type="number" value={form.net_m2} onChange={e=>update("net_m2",e.target.value)} /></div>
              <div style={fld}><label style={lbl}>BİNA YAŞI</label>
                <input style={inp} type="number" value={form.bina_yasi} onChange={e=>update("bina_yasi",e.target.value)} /></div>
              <div style={fld}><label style={lbl}>KAT NO</label>
                <input style={inp} type="number" value={form.kat_no} onChange={e=>update("kat_no",e.target.value)} /></div>
              <div style={fld}><label style={lbl}>TOPLAM KAT</label>
                <input style={inp} type="number" value={form.toplam_kat} onChange={e=>update("toplam_kat",e.target.value)} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={fld}><label style={lbl}>ODA SAYISI</label>
                <select style={inp} value={form.oda_sayisi} onChange={e=>update("oda_sayisi",e.target.value)}>
                  {["1+0","1+1","2+1","3+1","4+1","5+1"].map(o=><option key={o}>{o}</option>)}
                </select></div>
              <div style={fld}><label style={lbl}>CEPHE</label>
                <select style={inp} value={form.cephe} onChange={e=>update("cephe",e.target.value)}>
                  {["kuzey","güney","doğu","batı","güney-doğu","güney-batı"].map(c=><option key={c}>{c}</option>)}
                </select></div>
            </div>

            {error && <div style={{ color:"#f87171", fontSize:12, padding:"10px 14px", background:"rgba(248,113,113,0.06)", borderRadius:8, marginBottom:14 }}>{error}</div>}

            <button onClick={handleValuation} disabled={loading}
              style={{ width:"100%", padding:"13px", borderRadius:8, border:"none", fontSize:13, fontWeight:700, marginBottom:10,
                background: loading ? D.brd : D.gold,
                color: loading ? D.muted : "#000",
                cursor: loading ? "not-allowed" : "pointer", letterSpacing:0.3 }}>
              {loading ? "Hesaplanıyor..." : "Değerleme Al →"}
            </button>

            <button onClick={()=>downloadPDF(form, result)} disabled={!result}
              style={{ width:"100%", padding:"13px", borderRadius:8, border:`1px solid ${result ? "rgba(255,215,0,0.3)" : D.brd}`, fontSize:13, fontWeight:700, background:"transparent",
                color: result ? D.gold : D.muted,
                cursor: result ? "pointer" : "not-allowed", letterSpacing:0.3 }}>
              {result ? "PDF İndir →" : "Önce Değerleme Alın"}
            </button>
          </div>

          {/* Right Preview Panel */}
          <div style={{ flex:1, overflowY:"auto", padding:"28px" }}>
            {loading && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, paddingTop:60 }}>
                <div style={{ width:36, height:36, border:`2px solid ${D.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                <div style={{ fontSize:12, color:D.muted }}>Değerleme hesaplanıyor...</div>
              </div>
            )}

            {!loading && result && (
              <div style={{ maxWidth:520 }}>
                {/* Price Hero */}
                <div style={{ background:"rgba(255,215,0,0.05)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:12, padding:"28px", textAlign:"center", marginBottom:20 }}>
                  <div style={{ fontSize:11, color:D.muted, letterSpacing:2, marginBottom:8 }}>TAHMİN DEĞERİ</div>
                  <div style={{ fontSize:36, fontWeight:700, color:D.gold, letterSpacing:-1 }}>
                    ₺{Number(result.tahmin_fiyat).toLocaleString("tr-TR")}
                  </div>
                  <div style={{ fontSize:13, color:D.muted, marginTop:8 }}>
                    ₺{Number(result.alt_aralik).toLocaleString("tr-TR")} — ₺{Number(result.ust_aralik).toLocaleString("tr-TR")}
                  </div>
                  <div style={{ display:"flex", justifyContent:"center", gap:20, marginTop:16 }}>
                    <div>
                      <div style={{ fontSize:11, color:D.dim }}>Güven Skoru</div>
                      <div style={{ fontSize:16, fontWeight:600, color:D.text }}>%{Math.round((result.guven_skoru||0)*100)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:11, color:D.dim }}>Model</div>
                      <div style={{ fontSize:16, fontWeight:600, color:D.text }}>{result.model_version||"v0.2"}</div>
                    </div>
                  </div>
                </div>

                {/* SHAP Values */}
                <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:10, padding:"20px" }}>
                  <div style={{ fontSize:10, color:D.dim, letterSpacing:2, marginBottom:16 }}>FİYATI ETKİLEYEN FAKTÖRLER</div>
                  {Object.entries(result.shap_values||{})
                    .sort(([,a],[,b])=>(b as number)-(a as number))
                    .map(([key, val], i) => {
                      const max = Math.max(...Object.values(result.shap_values||{}) as number[])
                      const pct = max > 0 ? ((val as number) / max) * 100 : 0
                      return (
                        <div key={i} style={{ marginBottom:10 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                            <span style={{ fontSize:12, color:D.muted }}>{key}</span>
                            <span style={{ fontSize:12, color:D.text }}>₺{Number(val).toLocaleString("tr-TR")}</span>
                          </div>
                          <div style={{ background:"#1a1a1a", borderRadius:3, height:4 }}>
                            <div style={{ background:D.gold, height:4, borderRadius:3, width:`${pct}%`, transition:"width 0.5s ease" }}/>
                          </div>
                        </div>
                      )
                    })}
                </div>

                <div style={{ textAlign:"center", fontSize:11, color:D.dim, marginTop:20, lineHeight:1.6 }}>
                  Değerler VEGA AI modeli tahminlerine dayanmaktadır.<br/>
                  Yatırım tavsiyesi niteliği taşımaz.
                </div>
              </div>
            )}

            {!loading && !result && !error && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, paddingTop:80 }}>
                <div style={{ fontSize:48, color:D.brd }}>▣</div>
                <div style={{ fontSize:14, color:D.dim, marginBottom:4 }}>Rapor Hazır Değil</div>
                <div style={{ fontSize:12, color:"#2a2a2a", textAlign:"center", maxWidth:280, lineHeight:1.6 }}>
                  Formu doldurun ve değerleme alın.<br/>Sonuç gelince PDF butonu aktif olacak.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px}`}</style>
    </div>
  )
}
