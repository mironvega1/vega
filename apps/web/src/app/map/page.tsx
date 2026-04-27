"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAgencyId } from "@/hooks/useAgencyId";
import { createClient } from "@/lib/supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

export default function MapPage() {
  const { agencyId } = useAgencyId();
  const [accountType, setAccountType] = useState<string>("");
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setAccountType(user?.user_metadata?.account_type || "individual");
    });
  }, []);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!agencyId) return;
    fetch(`${API_URL}/api/v1/listings?limit=100`, {
      headers: { "agency-id": agencyId },
    })
      .then((r) => r.json())
      .then((d) => {
        setListings(d.listings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [agencyId]);

  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;

    const L = require("leaflet");

    // CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const map = L.map("map").setView([39.0, 35.0], 6);
    (window as any)._vegaMap = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Test koordinatlar (gerçek veri gelince lat/lng kullanacağız)
    listings.forEach((listing) => {
      if (!listing.lat || !listing.lng) return;
      const coord: [number, number] = [listing.lat, listing.lng];
      const marker = L.circleMarker(coord, {
        radius: 10,
        fillColor: "#9333ea",
        color: "#7c3aed",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 160px;">
          <div style="font-weight: bold; font-size: 14px; color: #9333ea;">
            ₺${Number(listing.fiyat).toLocaleString("tr-TR")}
          </div>
          <div style="color: #666; font-size: 12px; margin-top: 4px;">
            ${listing.net_m2} m² · ${listing.oda_sayisi} · ${listing.kat_no}. kat
          </div>
        </div>
      `);
    });

    return () => {
      map.remove();
    };
  }, [loading, listings]);

  // Kurumsal değilse upgrade ekranı
  if (accountType && accountType !== "agency") {
    return (
      <div style={{minHeight:"100vh",background:"#080808",color:"#e0e0e0",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif"}}>
        <div style={{textAlign:"center",maxWidth:420}}>
          <div style={{fontSize:40,marginBottom:16}}>◉</div>
          <div style={{fontSize:22,fontWeight:500,marginBottom:8}}>Kurumsal Özellik</div>
          <div style={{fontSize:14,color:"#555",lineHeight:1.7,marginBottom:28}}>Canlı harita ve ilan yönetimi sadece Kurumsal planlarda kullanılabilir. Ekibinizle birlikte portföyünüzü harita üzerinde yönetin.</div>
          <Link href="/auth/signup" style={{background:"#FFD700",color:"#000",textDecoration:"none",padding:"12px 28px",borderRadius:8,fontWeight:700,fontSize:14}}>
            Kurumsal Plana Geç
          </Link>
          <div style={{marginTop:16}}><Link href="/dashboard" style={{color:"#444",fontSize:13,textDecoration:"none"}}>← Geri dön</Link></div>
        </div>
      </div>
    );
  }

  return (
    <div style={{height:"100vh",background:"#080808",display:"flex",fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif"}}>
      {/* Sol panel */}
      <div style={{width:260,borderRight:"1px solid #161616",background:"#0a0a0a",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"20px 16px",borderBottom:"1px solid #161616"}}>
          <Link href="/dashboard" style={{fontSize:18,color:"#FFD700",letterSpacing:4,fontWeight:300,textDecoration:"none"}}>VEGA</Link>
          <div style={{fontSize:12,color:"#333",marginTop:8}}>Acente Portföyü — {listings.length} ilan</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
          {loading ? (
            <div style={{padding:20,textAlign:"center",color:"#333",fontSize:12}}>Yükleniyor...</div>
          ) : listings.map((l) => (
            <div key={l.id} style={{border:"1px solid #161616",borderRadius:8,padding:"10px 12px",marginBottom:4,background:"rgba(255,255,255,0.01)"}}>
              <div style={{fontSize:13,fontWeight:500,color:"#FFD700"}}>₺{Number(l.fiyat).toLocaleString("tr-TR")}</div>
              <div style={{fontSize:11,color:"#555",marginTop:2}}>{l.net_m2}m² · {l.oda_sayisi} · {l.kat_no}. kat</div>
              <div style={{fontSize:10,color:"#333",marginTop:1}}>{l.ilce || ""}{l.il?`, ${l.il}`:""}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Harita */}
      <div style={{flex:1,position:"relative"}}>
        <div id="map" style={{width:"100%",height:"100%"}} />
      </div>
    </div>
  );
}