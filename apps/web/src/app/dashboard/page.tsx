"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const AGENCY_ID = "41897482-1325-4f6d-83bf-d26583054f15";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Ana Merkez", icon: "◈", desc: "AI & Genel Bakış" },
  { href: "/valuation", label: "AI Değerleme", icon: "◎", desc: "Fiyat tahmini" },
  { href: "/map", label: "Canlı Harita", icon: "◉", desc: "Koordinat bazlı" },
  { href: "/listings", label: "İlan Yönetimi", icon: "▦", desc: "CSV yükleme" },
  { href: "/zone-scores", label: "Bölge Skoru", icon: "◐", desc: "A/B/C/D analizi" },
  { href: "/bina-karsilastirma", label: "Kat Analizi", icon: "▤", desc: "Bina içi fiyat" },
  { href: "/report", label: "PDF Rapor", icon: "▣", desc: "Müşteri raporu" },
];

const SUGGESTIONS = [
  "Beşiktaş'ta 100m² daire değeri nedir?",
  "Esenyurt vs Kadıköy fiyat farkı",
  "İstanbul'da en değerli 5 ilçe",
  "Bodrum'da yatırım yapmalı mıyım?",
  "Ev alırken nelere dikkat etmeliyim?",
];

export default function Dashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [messages, setMessages] = useState<{role:string,content:string}[]>([
    {role:"assistant", content:"Merhaba! Ben Vega AI — Türkiye gayrimenkul piyasasının en kapsamlı AI asistanıyım.\n\nFiyat analizi, bölge karşılaştırması, yatırım tavsiyeleri ve piyasa trendleri konusunda yardımcı olabilirim.\n\nNe öğrenmek istersiniz?"}
  ]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [stats, setStats] = useState({total:0, avg:0, avgM2:0, cities:0});
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch(`${API_URL}/api/v1/listings?limit=500`, { headers: { "agency-id": AGENCY_ID } })
      .then(r => r.json())
      .then(d => {
        const l = d.listings || [];
        setListings(l);
        const avg = l.length ? Math.round(l.reduce((a:number,b:any) => a + Number(b.fiyat), 0) / l.length) : 0;
        const avgM2 = l.length ? Math.round(l.reduce((a:number,b:any) => a + Number(b.net_m2||0), 0) / l.length) : 0;
        const cities = new Set(l.map((x:any) => x.il).filter(Boolean)).size;
        setStats({total:l.length, avg, avgM2, cities});
        setLoading(false);
      }).catch(()=>setLoading(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior:"smooth"});
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;
    setInput("");
    setMessages(prev => [...prev, {role:"user", content:userMsg}]);
    setAiLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, {role:"user",content:userMsg}],
          context: `Sen Vega AI'sin. Türkiye gayrimenkul uzmanısın. Platform: ${stats.total} ilan, ort. ₺${stats.avg.toLocaleString("tr-TR")}, ${stats.cities} şehir. Kısa ve net Türkçe yanıt ver.`
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {role:"assistant", content:data.reply || "Yanıt alınamadı."}]);
    } catch {
      setMessages(prev => [...prev, {role:"assistant", content:"Şu an bağlantı sorunu var. Lütfen tekrar deneyin."}]);
    }
    setAiLoading(false);
  };

  const STAT_CARDS = [
    { label: "Toplam İlan", value: loading ? "..." : stats.total.toLocaleString("tr-TR"), sub: "aktif portföy", color: "#FFD700" },
    { label: "Ort. Fiyat", value: loading ? "..." : `₺${(stats.avg/1000000).toFixed(1)}M`, sub: "piyasa ortalaması", color: "#22c55e" },
    { label: "Ort. m²", value: loading ? "..." : `${stats.avgM2}m²`, sub: "metrekare", color: "#3b82f6" },
    { label: "Şehir", value: loading ? "..." : stats.cities.toString(), sub: "aktif il", color: "#a855f7" },
  ];

  return (
    <div style={{display:"flex",height:"100vh",background:"#080808",color:"#e0e0e0",fontFamily:"'Helvetica Neue', Helvetica, Arial, sans-serif",overflow:"hidden"}}>

      {/* Sol Panel */}
      <div style={{width:260,borderRight:"1px solid #161616",display:"flex",flexDirection:"column",background:"#0a0a0a",flexShrink:0}}>
        <div style={{padding:"24px 20px 20px",borderBottom:"1px solid #161616"}}>
          <div style={{fontSize:24,color:"#FFD700",letterSpacing:4,fontWeight:300}}>VEGA</div>
          <div style={{fontSize:10,color:"#333",marginTop:3,letterSpacing:4}}>INTELLIGENCE PLATFORM</div>
        </div>

        <nav style={{flex:1,padding:"12px 0",overflowY:"auto"}}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 20px",color:active?"#FFD700":"#555",textDecoration:"none",fontSize:13,borderLeft:active?"2px solid #FFD700":"2px solid transparent",background:active?"rgba(255,215,0,0.06)":"transparent",transition:"all 0.15s",cursor:"pointer"}}>
                <span style={{fontSize:18,width:20,textAlign:"center"}}>{item.icon}</span>
                <div>
                  <div style={{fontWeight:active?500:400}}>{item.label}</div>
                  <div style={{fontSize:10,color:active?"rgba(255,215,0,0.5)":"#333",marginTop:1}}>{item.desc}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div style={{padding:"16px 20px",borderTop:"1px solid #161616"}}>
          <div style={{fontSize:10,color:"#2a2a2a",marginBottom:10,letterSpacing:3}}>CANLI VERİ</div>
          <div style={{display:"flex",gap:6,marginBottom:6}}>
            <div style={{flex:1,background:"rgba(255,215,0,0.06)",border:"1px solid rgba(255,215,0,0.1)",borderRadius:6,padding:"8px 10px"}}>
              <div style={{fontSize:16,color:"#FFD700",fontWeight:500}}>{stats.total > 0 ? stats.total.toLocaleString("tr-TR") : "..."}</div>
              <div style={{fontSize:10,color:"#333",marginTop:2}}>İlan</div>
            </div>
            <div style={{flex:1,background:"rgba(255,255,255,0.03)",border:"1px solid #161616",borderRadius:6,padding:"8px 10px"}}>
              <div style={{fontSize:16,color:"#888",fontWeight:500}}>{stats.cities > 0 ? stats.cities : "..."}</div>
              <div style={{fontSize:10,color:"#333",marginTop:2}}>Şehir</div>
            </div>
          </div>
          <div style={{fontSize:11,color:"#2a2a2a"}}>Model: v0.2-gbm · Aktif</div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Üst İstatistik Barı */}
        <div style={{padding:"16px 24px",borderBottom:"1px solid #161616",display:"flex",gap:16,alignItems:"center"}}>
          {STAT_CARDS.map((card, i) => (
            <div key={i} style={{flex:1,background:"rgba(255,255,255,0.02)",border:"1px solid #161616",borderRadius:10,padding:"12px 16px",borderTop:`2px solid ${card.color}22`}}>
              <div style={{fontSize:11,color:"#444",marginBottom:4,letterSpacing:1}}>{card.label.toUpperCase()}</div>
              <div style={{fontSize:20,fontWeight:600,color:card.color}}>{card.value}</div>
              <div style={{fontSize:11,color:"#333",marginTop:2}}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Chat + Son İlanlar */}
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>

          {/* Chat Alanı */}
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}>
              {messages.map((msg, i) => (
                <div key={i} style={{marginBottom:16,display:"flex",gap:10,flexDirection:msg.role==="user"?"row-reverse":"row",alignItems:"flex-start"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,background:msg.role==="user"?"rgba(255,255,255,0.08)":"rgba(255,215,0,0.12)",border:msg.role==="user"?"1px solid #222":"1px solid rgba(255,215,0,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:msg.role==="user"?"#555":"#FFD700",fontWeight:600}}>
                    {msg.role==="user"?"S":"V"}
                  </div>
                  <div style={{maxWidth:"72%",background:msg.role==="user"?"rgba(255,255,255,0.04)":"rgba(255,215,0,0.02)",border:msg.role==="user"?"1px solid #1a1a1a":"1px solid rgba(255,215,0,0.08)",borderRadius:10,padding:"10px 14px",fontSize:13,lineHeight:1.75,color:msg.role==="user"?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.82)",whiteSpace:"pre-wrap"}}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"flex-start"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,215,0,0.12)",border:"1px solid rgba(255,215,0,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#FFD700"}}>V</div>
                  <div style={{background:"rgba(255,215,0,0.02)",border:"1px solid rgba(255,215,0,0.08)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#444"}}>Analiz ediliyor<span style={{animation:"blink 1s infinite"}}>...</span></div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            <div style={{padding:"0 24px 8px",display:"flex",gap:6,flexWrap:"wrap"}}>
              {SUGGESTIONS.map((s,i) => (
                <button key={i} onClick={()=>sendMessage(s)}
                  style={{background:"rgba(255,255,255,0.02)",border:"1px solid #1a1a1a",borderRadius:16,padding:"5px 12px",fontSize:11,color:"#444",cursor:"pointer",transition:"all 0.15s"}}
                  onMouseEnter={e=>{(e.target as any).style.color="#FFD700";(e.target as any).style.borderColor="rgba(255,215,0,0.25)"}}
                  onMouseLeave={e=>{(e.target as any).style.color="#444";(e.target as any).style.borderColor="#1a1a1a"}}>
                  {s}
                </button>
              ))}
            </div>

            <div style={{padding:"8px 24px 20px"}}>
              <div style={{display:"flex",gap:10,background:"rgba(255,255,255,0.02)",border:"1px solid #1e1e1e",borderRadius:10,padding:"10px 14px"}}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()}
                  placeholder="Emlak sorunuzu sorun..."
                  style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:13,color:"rgba(255,255,255,0.65)",fontFamily:"inherit"}}/>
                <button onClick={()=>sendMessage()} disabled={aiLoading||!input.trim()}
                  style={{background:input.trim()?"#FFD700":"#161616",color:input.trim()?"#000":"#333",border:"none",borderRadius:7,padding:"7px 18px",fontSize:12,fontWeight:500,cursor:input.trim()?"pointer":"default",transition:"all 0.15s"}}>
                  Sor
                </button>
              </div>
            </div>
          </div>

          {/* Son İlanlar Paneli */}
          <div style={{width:280,borderLeft:"1px solid #161616",display:"flex",flexDirection:"column",background:"#090909"}}>
            <div style={{padding:"16px 16px 12px",borderBottom:"1px solid #161616"}}>
              <div style={{fontSize:11,color:"#333",letterSpacing:2}}>SON İLANLAR</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
              {listings.slice(0,20).map((l:any,i:number) => (
                <div key={i} style={{padding:"10px 12px",borderRadius:8,marginBottom:4,border:"1px solid #161616",background:"rgba(255,255,255,0.01)",cursor:"pointer",transition:"all 0.15s"}}
                  onMouseEnter={e=>{(e.target as any).style.borderColor="#222"}}
                  onMouseLeave={e=>{(e.target as any).style.borderColor="#161616"}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#FFD700"}}>₺{(Number(l.fiyat)/1000000).toFixed(1)}M</div>
                  <div style={{fontSize:11,color:"#555",marginTop:2}}>{l.net_m2}m² · {l.oda_sayisi}</div>
                  <div style={{fontSize:10,color:"#333",marginTop:1}}>{l.ilce || ""}{l.il ? `, ${l.il}` : ""}</div>
                </div>
              ))}
              {listings.length === 0 && (
                <div style={{padding:"20px",textAlign:"center",color:"#333",fontSize:12}}>Yükleniyor...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
