"use client"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAgencyId } from "@/hooks/useAgencyId"
import { createClient } from "@/lib/supabase/client"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com"
const D = { bg:"#080808", bg2:"#0a0a0a", brd:"#161616", gold:"#FFD700", text:"#e0e0e0", muted:"#555", dim:"#333" }

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

export default function MapPage() {
  const { agencyId } = useAgencyId()
  const pathname = usePathname()
  const [accountType, setAccountType] = useState<string>("")
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setAccountType(user?.user_metadata?.account_type || "individual")
    })
  }, [])

  useEffect(() => {
    if (!agencyId) return
    fetch(`${API_URL}/api/v1/listings?limit=100`, { headers: { "agency-id": agencyId } })
      .then(r => r.json())
      .then(d => { setListings(d.listings || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [agencyId])

  useEffect(() => {
    if (loading) return
    if (typeof window === "undefined") return

    const L = require("leaflet")
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    document.head.appendChild(link)

    const map = L.map("map").setView([39.0, 35.0], 6)
    ;(window as any)._vegaMap = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    listings.forEach((listing) => {
      if (!listing.lat || !listing.lng) return
      const coord: [number, number] = [listing.lat, listing.lng]
      const marker = L.circleMarker(coord, {
        radius: 9,
        fillColor: "#FFD700",
        color: "#c8a800",
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map)

      marker.bindPopup(`
        <div style="font-family:'Helvetica Neue',sans-serif;min-width:160px;padding:4px">
          <div style="font-weight:700;font-size:14px;color:#c8a800">
            ₺${Number(listing.fiyat).toLocaleString("tr-TR")}
          </div>
          <div style="color:#555;font-size:12px;margin-top:4px">
            ${listing.net_m2}m² · ${listing.oda_sayisi} · ${listing.kat_no}. kat
          </div>
          <div style="color:#888;font-size:11px;margin-top:2px">
            ${listing.ilce || ""}${listing.il ? `, ${listing.il}` : ""}
          </div>
        </div>
      `)
    })

    return () => { map.remove() }
  }, [loading, listings])

  if (accountType && accountType !== "agency") {
    return (
      <div style={{ minHeight:"100vh", background:D.bg, color:D.text, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif" }}>
        <div style={{ textAlign:"center", maxWidth:420 }}>
          <div style={{ fontSize:40, color:D.muted, marginBottom:16 }}>◉</div>
          <div style={{ fontSize:22, fontWeight:500, marginBottom:8 }}>Kurumsal Özellik</div>
          <div style={{ fontSize:14, color:D.muted, lineHeight:1.7, marginBottom:28 }}>
            Canlı harita ve ilan yönetimi sadece Kurumsal planlarda kullanılabilir. Ekibinizle birlikte portföyünüzü harita üzerinde yönetin.
          </div>
          <Link href="/auth/signup" style={{ background:D.gold, color:"#000", textDecoration:"none", padding:"12px 28px", borderRadius:8, fontWeight:700, fontSize:14 }}>
            Kurumsal Plana Geç
          </Link>
          <div style={{ marginTop:16 }}>
            <Link href="/dashboard" style={{ color:"#444", fontSize:13, textDecoration:"none" }}>← Geri dön</Link>
          </div>
        </div>
      </div>
    )
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

        {/* Listings panel */}
        <div style={{ height:300, borderTop:`1px solid ${D.brd}`, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"10px 14px", borderBottom:`1px solid ${D.brd}` }}>
            <div style={{ fontSize:10, color:D.dim, letterSpacing:2 }}>PORTFÖY — {listings.length} İLAN</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"6px" }}>
            {loading ? (
              <div style={{ padding:16, textAlign:"center", color:D.dim, fontSize:12 }}>Yükleniyor...</div>
            ) : listings.length === 0 ? (
              <div style={{ padding:16, textAlign:"center", color:D.dim, fontSize:12 }}>İlan bulunamadı</div>
            ) : listings.map((l, i) => (
              <div key={l.id || i}
                onClick={() => setSelected(l)}
                style={{ border:`1px solid ${selected?.id===l.id?"rgba(255,215,0,0.3)":D.brd}`, borderRadius:7, padding:"8px 10px", marginBottom:4, background:selected?.id===l.id?"rgba(255,215,0,0.04)":"transparent", cursor:"pointer" }}>
                <div style={{ fontSize:12, fontWeight:500, color:D.gold }}>₺{(Number(l.fiyat)/1000000).toFixed(1)}M</div>
                <div style={{ fontSize:11, color:D.muted, marginTop:1 }}>{l.net_m2}m² · {l.oda_sayisi}</div>
                <div style={{ fontSize:10, color:D.dim, marginTop:1 }}>{l.ilce}{l.il?`, ${l.il}`:""}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex:1, position:"relative" }}>
        <div id="map" style={{ width:"100%", height:"100%" }}/>

        {/* Selected listing detail */}
        {selected && (
          <div style={{ position:"absolute", top:16, right:16, background:"rgba(8,8,8,0.95)", border:"1px solid rgba(255,215,0,0.2)", borderRadius:10, padding:"16px 20px", minWidth:240, zIndex:1000 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div style={{ fontSize:14, fontWeight:600, color:D.gold }}>₺{Number(selected.fiyat).toLocaleString("tr-TR")}</div>
              <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none", color:D.muted, cursor:"pointer", fontSize:16, lineHeight:1 }}>×</button>
            </div>
            <div style={{ fontSize:12, color:D.muted, marginBottom:4 }}>{selected.net_m2}m² · {selected.oda_sayisi} · {selected.kat_no}. kat</div>
            <div style={{ fontSize:11, color:D.dim }}>{selected.ilce}{selected.il?`, ${selected.il}`:""}</div>
            {selected.bina_yasi && <div style={{ fontSize:11, color:D.dim, marginTop:2 }}>Bina yaşı: {selected.bina_yasi}</div>}
            {selected.cephe && <div style={{ fontSize:11, color:D.dim, marginTop:2 }}>Cephe: {selected.cephe}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
