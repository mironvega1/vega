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

export default function Valuation() {
  const pathname = usePathname()
  const [form, setForm] = useState({
    net_m2:"", kat_no:"3", toplam_kat:"8", bina_yasi:"10",
    cephe:"güney", oda_sayisi:"3+1", il:"istanbul", ilce:"kadıköy", mahalle:"moda"
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [liquidity, setLiquidity] = useState<any>(null)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!form.net_m2) return
    setLoading(true); setResult(null); setLiquidity(null); setError("")
    try {
      const body = {
        net_m2: parseFloat(form.net_m2), kat_no: parseInt(form.kat_no),
        toplam_kat: parseInt(form.toplam_kat), bina_yasi: parseInt(form.bina_yasi),
        cephe: form.cephe, oda_sayisi: form.oda_sayisi,
        il: form.il, ilce: form.ilce, mahalle: form.mahalle
      }
      const [valRes, liqRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/valuation/predict`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) }),
        fetch(`${API_URL}/api/v1/valuation/liquidity`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ il:form.il, ilce:form.ilce, fiyat:0, net_m2:parseFloat(form.net_m2), oda_sayisi:form.oda_sayisi }) })
      ])
      const valData = await valRes.json()
      if (valData.tahmin_fiyat) {
        const updatedLiq = await fetch(`${API_URL}/api/v1/valuation/liquidity`, {
          method: "POST", headers: {"Content-Type":"application/json"},
          body: JSON.stringify({ il:form.il, ilce:form.ilce, fiyat:valData.tahmin_fiyat, net_m2:parseFloat(form.net_m2), oda_sayisi:form.oda_sayisi })
        })
        setLiquidity(await updatedLiq.json())
      } else { setLiquidity(await liqRes.json()) }
      if (valData.error) setError(valData.error)
      setResult(valData)
    } catch { setError("Bağlantı hatası. Lütfen tekrar deneyin.") }
    setLoading(false)
  }

  const liqColor = liquidity?.renk === "green" ? "#22c55e" : liquidity?.renk === "yellow" ? "#eab308" : "#ef4444"
  const shapVals = result?.shap_values ? Object.values(result.shap_values).map(Number) : [1]
  const maxShap = Math.max(...shapVals, 1)

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
            <div style={{ fontSize:16, fontWeight:500 }}>AI Değerleme</div>
            <div style={{ fontSize:11, color:D.muted, marginTop:2 }}>GBM modeli · Sokak bazlı fiyat tahmini · SHAP açıklaması</div>
          </div>
          <div style={{ background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:16, padding:"4px 12px", fontSize:11, color:D.gold, letterSpacing:1 }}>⚡ AI MODEL v0.2</div>
        </div>

        {/* Content */}
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* Form */}
          <div style={{ width:340, borderRight:`1px solid ${D.brd}`, overflowY:"auto", padding:"24px", flexShrink:0 }}>
            <div style={{ background:"rgba(255,215,0,0.05)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:8, padding:"10px 14px", marginBottom:20, fontSize:11, color:D.gold, lineHeight:1.5 }}>
              Mülk bilgilerini girin — AI tahmin fiyatı, güven aralığı ve tahmini satış süresini hesaplar.
            </div>

            <div style={fld}><label style={lbl}>NET M² *</label>
              <input style={inp} type="number" value={form.net_m2} onChange={e => setForm({...form, net_m2:e.target.value})} placeholder="120" /></div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={fld}><label style={lbl}>KAT NO</label>
                <input style={inp} type="number" value={form.kat_no} onChange={e => setForm({...form, kat_no:e.target.value})} /></div>
              <div style={fld}><label style={lbl}>TOPLAM KAT</label>
                <input style={inp} type="number" value={form.toplam_kat} onChange={e => setForm({...form, toplam_kat:e.target.value})} /></div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={fld}><label style={lbl}>BİNA YAŞI</label>
                <input style={inp} type="number" value={form.bina_yasi} onChange={e => setForm({...form, bina_yasi:e.target.value})} /></div>
              <div style={fld}><label style={lbl}>ODA SAYISI</label>
                <select style={inp} value={form.oda_sayisi} onChange={e => setForm({...form, oda_sayisi:e.target.value})}>
                  {["1+1","2+1","3+1","4+1","5+1","3+2","4+2"].map(o => <option key={o}>{o}</option>)}
                </select></div>
            </div>

            <div style={fld}><label style={lbl}>CEPHE</label>
              <select style={inp} value={form.cephe} onChange={e => setForm({...form, cephe:e.target.value})}>
                {["kuzey","güney","doğu","batı","güneydoğu","güneybatı"].map(c => <option key={c}>{c}</option>)}
              </select></div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={fld}><label style={lbl}>İL</label>
                <input style={inp} value={form.il} onChange={e => setForm({...form, il:e.target.value})} placeholder="istanbul" /></div>
              <div style={fld}><label style={lbl}>İLÇE *</label>
                <input style={inp} value={form.ilce} onChange={e => setForm({...form, ilce:e.target.value})} placeholder="kadıköy" /></div>
            </div>

            <div style={fld}><label style={lbl}>MAHALLE</label>
              <input style={inp} value={form.mahalle} onChange={e => setForm({...form, mahalle:e.target.value})} placeholder="moda" /></div>

            {error && <div style={{ color:"#f87171", fontSize:12, padding:"10px 14px", background:"rgba(248,113,113,0.06)", borderRadius:8, marginBottom:14 }}>{error}</div>}

            <button onClick={handleSubmit} disabled={loading || !form.net_m2}
              style={{ width:"100%", padding:"13px", borderRadius:8, border:"none", fontSize:13, fontWeight:700,
                background: loading||!form.net_m2 ? D.brd : D.gold,
                color: loading||!form.net_m2 ? D.muted : "#000",
                cursor: loading||!form.net_m2 ? "not-allowed" : "pointer", letterSpacing:0.3 }}>
              {loading ? "Hesaplanıyor..." : "Değerleme Yap →"}
            </button>
          </div>

          {/* Result */}
          <div style={{ flex:1, overflowY:"auto", padding:"24px" }}>
            {loading && (
              <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12 }}>
                <div style={{ width:36, height:36, border:`2px solid ${D.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                <div style={{ fontSize:12, color:D.muted }}>Model çalışıyor...</div>
              </div>
            )}
            {!loading && !result && (
              <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
                <div style={{ fontSize:40, color:D.brd }}>⚡</div>
                <div style={{ fontSize:12, color:D.dim }}>Mülk bilgilerini doldurun ve değerleme yapın</div>
              </div>
            )}
            {!loading && result && !result.error && (
              <div>
                {/* Price cards */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
                  <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:10, padding:"16px", textAlign:"center" }}>
                    <div style={{ fontSize:11, color:D.muted, marginBottom:6, letterSpacing:1 }}>ALT ARALIK</div>
                    <div style={{ fontSize:16, fontWeight:600, color:"#888" }}>₺{Number(result.alt_aralik).toLocaleString("tr-TR")}</div>
                  </div>
                  <div style={{ background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.3)", borderRadius:10, padding:"16px", textAlign:"center" }}>
                    <div style={{ fontSize:11, color:"rgba(255,215,0,0.6)", marginBottom:6, letterSpacing:1 }}>TAHMİN FİYAT</div>
                    <div style={{ fontSize:22, fontWeight:700, color:D.gold }}>₺{Number(result.tahmin_fiyat).toLocaleString("tr-TR")}</div>
                    <div style={{ fontSize:10, color:"rgba(255,215,0,0.5)", marginTop:4 }}>Güven: %{Math.round(result.guven_skoru * 100)}</div>
                  </div>
                  <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:10, padding:"16px", textAlign:"center" }}>
                    <div style={{ fontSize:11, color:D.muted, marginBottom:6, letterSpacing:1 }}>ÜST ARALIK</div>
                    <div style={{ fontSize:16, fontWeight:600, color:"#888" }}>₺{Number(result.ust_aralik).toLocaleString("tr-TR")}</div>
                  </div>
                </div>

                {/* Liquidity */}
                {liquidity && (
                  <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:10, padding:"16px", marginBottom:16 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                      <div style={{ fontSize:12, color:D.gold, letterSpacing:1, fontWeight:500 }}>SATIŞ SÜRESİ TAHMİNİ</div>
                      <div style={{ fontSize:20, fontWeight:700, color:liqColor }}>{liquidity.tahmini_satis_suresi_gun} gün</div>
                    </div>
                    <div style={{ fontSize:12, color:"#888", lineHeight:1.6, marginBottom:8 }}>{liquidity.aciklama}</div>
                    <div style={{ display:"flex", gap:16, fontSize:11 }}>
                      <span style={{ color:D.dim }}>Talep Skoru: <span style={{ color:"#888" }}>{liquidity.talep_skoru}</span></span>
                      <span style={{ color:D.dim }}>Kategori: <span style={{ color:liqColor }}>{liquidity.kategori}</span></span>
                    </div>
                  </div>
                )}

                {/* SHAP */}
                {result.shap_values && (
                  <div style={{ background:D.bg2, border:`1px solid ${D.brd}`, borderRadius:10, padding:"16px", marginBottom:16 }}>
                    <div style={{ fontSize:12, color:D.gold, letterSpacing:1, fontWeight:500, marginBottom:14 }}>SHAP — FİYATI ETKİLEYEN FAKTÖRLER</div>
                    {Object.entries(result.shap_values).sort((a: any, b: any) => b[1] - a[1]).map(([k, v]: any) => (
                      <div key={k} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                        <div style={{ fontSize:11, color:D.muted, width:80, flexShrink:0 }}>{k}</div>
                        <div style={{ flex:1, background:"#1a1a1a", borderRadius:4, height:6, overflow:"hidden" }}>
                          <div style={{ height:6, borderRadius:4, background:D.gold, width:`${Math.min(100, Math.abs(v) / maxShap * 100)}%` }}/>
                        </div>
                        <div style={{ fontSize:11, color:"#888", width:90, textAlign:"right", flexShrink:0 }}>₺{Number(v).toLocaleString("tr-TR")}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ textAlign:"center", fontSize:11, color:D.dim }}>
                  Model: {result.model_version} · {result.lokasyon?.il} / {result.lokasyon?.ilce}
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
