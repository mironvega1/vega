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

const inp: React.CSSProperties = { width:"100%", padding:"9px 12px", borderRadius:7, border:"1px solid #1e1e1e", background:"#111", color:"#e0e0e0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }
const lbl: React.CSSProperties = { fontSize:11, color:"#555", display:"block", marginBottom:5, letterSpacing:1 }
const fld: React.CSSProperties = { marginBottom:14 }

export default function BinaKarsilastirma() {
  const pathname = usePathname()
  const [form, setForm] = useState({ il:"istanbul", ilce:"beşiktaş", net_m2:"100", oda_sayisi:"3+1", bina_yasi:"10", cephe:"güney", toplam_kat:"10" })
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setLoading(true); setError(""); setData(null)
    try {
      const res = await fetch(`${API_URL}/api/v1/valuation/bina-karsilastirma`, {
        method: "POST", headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ ...form, net_m2:parseFloat(form.net_m2), bina_yasi:parseInt(form.bina_yasi), toplam_kat:parseInt(form.toplam_kat) })
      })
      const d = await res.json()
      if (d.error) setError(d.error)
      else setData(d)
    } catch { setError("Bağlantı hatası.") }
    setLoading(false)
  }

  const maxFiyat = data ? Math.max(...data.karsilastirma.map((k: any) => k.fiyat), 1) : 1

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
            <div style={{ fontSize:16, fontWeight:500 }}>Kat Analizi</div>
            <div style={{ fontSize:11, color:D.muted, marginTop:2 }}>Aynı binada kat bazlı fiyat karşılaştırması · Yatırım için en iyi kat</div>
          </div>
          <div style={{ background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:16, padding:"4px 12px", fontSize:11, color:D.gold, letterSpacing:1 }}>▤ KAT ANALİZİ</div>
        </div>

        {/* Content */}
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* Form */}
          <div style={{ width:300, borderRight:`1px solid ${D.brd}`, overflowY:"auto", padding:"24px", flexShrink:0 }}>
            <div style={{ background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.12)", borderRadius:8, padding:"10px 14px", marginBottom:20, fontSize:11, color:D.muted, lineHeight:1.5 }}>
              Bina bilgilerini girin — her katın tahmini fiyatını karşılaştırın.
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={fld}><label style={lbl}>İL</label>
                <input style={inp} value={form.il} onChange={e => setForm({...form, il:e.target.value})} placeholder="istanbul" /></div>
              <div style={fld}><label style={lbl}>İLÇE *</label>
                <input style={inp} value={form.ilce} onChange={e => setForm({...form, ilce:e.target.value})} placeholder="beşiktaş" /></div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={fld}><label style={lbl}>NET M²</label>
                <input style={inp} type="number" value={form.net_m2} onChange={e => setForm({...form, net_m2:e.target.value})} /></div>
              <div style={fld}><label style={lbl}>TOPLAM KAT</label>
                <input style={inp} type="number" value={form.toplam_kat} onChange={e => setForm({...form, toplam_kat:e.target.value})} /></div>
            </div>

            <div style={fld}><label style={lbl}>BİNA YAŞI</label>
              <input style={inp} type="number" value={form.bina_yasi} onChange={e => setForm({...form, bina_yasi:e.target.value})} /></div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div style={fld}><label style={lbl}>ODA SAYISI</label>
                <select style={inp} value={form.oda_sayisi} onChange={e => setForm({...form, oda_sayisi:e.target.value})}>
                  {["1+1","2+1","3+1","4+1","5+1"].map(o => <option key={o}>{o}</option>)}
                </select></div>
              <div style={fld}><label style={lbl}>CEPHE</label>
                <select style={inp} value={form.cephe} onChange={e => setForm({...form, cephe:e.target.value})}>
                  {["kuzey","güney","doğu","batı"].map(c => <option key={c}>{c}</option>)}
                </select></div>
            </div>

            {error && <div style={{ color:"#f87171", fontSize:12, padding:"10px 14px", background:"rgba(248,113,113,0.06)", borderRadius:8, marginBottom:14 }}>{error}</div>}

            <button onClick={handleSubmit} disabled={loading || !form.ilce}
              style={{ width:"100%", padding:"13px", borderRadius:8, border:"none", fontSize:13, fontWeight:700,
                background: loading||!form.ilce ? D.brd : D.gold,
                color: loading||!form.ilce ? D.muted : "#000",
                cursor: loading||!form.ilce ? "not-allowed" : "pointer", letterSpacing:0.3 }}>
              {loading ? "Hesaplanıyor..." : "Kat Analizi Yap →"}
            </button>
          </div>

          {/* Result */}
          <div style={{ flex:1, overflowY:"auto", padding:"28px" }}>
            {loading && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, paddingTop:60 }}>
                <div style={{ width:36, height:36, border:`2px solid ${D.gold}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
                <div style={{ fontSize:12, color:D.muted }}>Hesaplanıyor...</div>
              </div>
            )}
            {!loading && data && (
              <div>
                <div style={{ fontSize:13, color:D.gold, fontWeight:500, marginBottom:20, letterSpacing:0.3 }}>
                  {data.ilce} — {data.net_m2}m² — Kat Bazlı Fiyat Dağılımı
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {data.karsilastirma.map((k: any) => {
                    const pct = (k.fiyat / maxFiyat) * 100
                    return (
                      <div key={k.kat} style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ fontSize:12, color:D.muted, width:48, flexShrink:0, textAlign:"right" }}>{k.kat}. kat</div>
                        <div style={{ flex:1, background:"#1a1a1a", borderRadius:8, height:34, position:"relative", overflow:"hidden" }}>
                          <div style={{ background:`rgba(255,215,0,${0.5 + pct/200})`, height:34, borderRadius:8, width:`${pct}%`, display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:12, transition:"width 0.5s ease" }}>
                            {pct > 30 && <span style={{ fontSize:11, fontWeight:700, color:"#000" }}>₺{(k.fiyat / 1000000).toFixed(2)}M</span>}
                          </div>
                          {pct <= 30 && (
                            <div style={{ position:"absolute", right:0, top:0, height:34, display:"flex", alignItems:"center", paddingRight:10 }}>
                              <span style={{ fontSize:11, color:"#888" }}>₺{(k.fiyat / 1000000).toFixed(2)}M</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{ textAlign:"center", fontSize:11, color:D.dim, marginTop:24 }}>
                  Değerler AI modeli tahminlerine dayanmaktadır.
                </div>
              </div>
            )}
            {!loading && !data && !error && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, paddingTop:60 }}>
                <div style={{ fontSize:40, color:D.brd }}>▤</div>
                <div style={{ fontSize:12, color:D.dim }}>Bina bilgilerini doldurun ve analizi başlatın</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*::-webkit-scrollbar{width:4px}*::-webkit-scrollbar-track{background:transparent}*::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px}`}</style>
    </div>
  )
}
