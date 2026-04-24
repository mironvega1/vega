"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const AGENCY_ID = "41897482-1325-4f6d-83bf-d26583054f15";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Ana Merkez", icon: "◈" },
  { href: "/valuation", label: "AI Değerleme", icon: "◎" },
  { href: "/map", label: "Canlı Harita", icon: "◉" },
  { href: "/listings", label: "İlan Yönetimi", icon: "▦" },
  { href: "/zone-scores", label: "Bölge Skoru", icon: "◐" },
  { href: "/bina-karsilastirma", label: "Kat Analizi", icon: "▤" },
  { href: "/report", label: "PDF Rapor", icon: "▣" },
];

const SUGGESTIONS = [
  "Beşiktaş'ta 100m² daire değeri nedir?",
  "Esenyurt vs Kadıköy fiyat farkı",
  "İstanbul'da en değerli 5 ilçe",
  "Bodrum'da yatırım yapmalı mıyım?",
];

export default function Dashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [messages, setMessages] = useState<{role:string,content:string}[]>([
    {role:"assistant", content:"Merhaba! Ben Vega AI — Türkiye gayrimenkul piyasasının en kapsamlı AI asistanıyım. Fiyat analizi, bölge karşılaştırması ve yatırım tavsiyeleri konusunda yardımcı olabilirim. Ne öğrenmek istersiniz?"}
  ]);
  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [stats, setStats] = useState({total:0, avg:0, avgM2:0});
  const messagesEndRef = useRef<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/listings?limit=500`, { headers: { "agency-id": AGENCY_ID } })
      .then(r => r.json())
      .then(d => {
        const l = d.listings || [];
        setListings(l);
        const avg = l.length ? Math.round(l.reduce((a:number,b:any) => a + Number(b.fiyat), 0) / l.length) : 0;
        const avgM2 = l.length ? Math.round(l.reduce((a:number,b:any) => a + Number(b.net_m2||0), 0) / l.length) : 0;
        setStats({total:l.length, avg, avgM2});
      }).catch(()=>{});
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
      const context = `Sen Vega AI'sın — Türkiye gayrimenkul uzmanısın. Platform verileri: ${stats.total} ilan, ort. ₺${stats.avg.toLocaleString("tr-TR")}. Sadece emlak konularında yardımcı ol. Türkçe, kısa ve net yanıt ver.`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: context,
          messages: messages.filter(m=>m.role!=="system").concat([{role:"user",content:userMsg}])
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Yanıt alınamadı.";
      setMessages(prev => [...prev, {role:"assistant", content:reply}]);
    } catch {
      setMessages(prev => [...prev, {role:"assistant", content:"Bağlantı hatası."}]);
    }
    setAiLoading(false);
  };

  return (
    <div style={{display:"flex",height:"100vh",background:"#0a0a0a",color:"#e8e8e8",fontFamily:"'Helvetica Neue', Helvetica, Arial, sans-serif",overflow:"hidden"}}>
      <div style={{width:240,borderRight:"1px solid #1a1a1a",display:"flex",flexDirection:"column",padding:"24px 0",flexShrink:0}}>
        <div style={{padding:"0 20px 24px",borderBottom:"1px solid #1a1a1a"}}>
          <div style={{fontFamily:"serif",fontSize:22,color:"#FFD700",letterSpacing:2}}>VEGA</div>
          <div style={{fontSize:11,color:"#444",marginTop:2,letterSpacing:3}}>INTELLIGENCE</div>
        </div>
        <nav style={{flex:1,padding:"16px 0"}}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 20px",color:item.href==="/dashboard"?"#FFD700":"#555",textDecoration:"none",fontSize:13,borderLeft:item.href==="/dashboard"?"2px solid #FFD700":"2px solid transparent",background:item.href==="/dashboard"?"rgba(255,215,0,0.05)":"transparent"}}>
              <span style={{fontSize:16}}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{padding:"16px 20px",borderTop:"1px solid #1a1a1a"}}>
          <div style={{fontSize:11,color:"#333",marginBottom:8,letterSpacing:2}}>CANLI VERİ</div>
          <div style={{fontSize:13,color:"#555"}}>{stats.total.toLocaleString("tr-TR")} ilan</div>
          <div style={{fontSize:11,color:"#444",marginTop:4}}>₺{stats.avg > 0 ? (stats.avg/1000000).toFixed(1)+"M ort." : "Yükleniyor..."}</div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"16px 24px",borderBottom:"1px solid #1a1a1a",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"serif",fontSize:18,fontWeight:700,color:"rgba(255,255,255,0.70)"}}>Ana Merkez</div>
            <div style={{fontSize:12,color:"#444",marginTop:2}}>Vega AI ile emlak zekasına erişin</div>
          </div>
          <div style={{display:"flex",gap:8}}>
            <div style={{background:"rgba(255,215,0,0.1)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:8,padding:"6px 14px",fontSize:12,color:"#FFD700"}}>{stats.total.toLocaleString("tr-TR")} İlan</div>
            <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid #1a1a1a",borderRadius:8,padding:"6px 14px",fontSize:12,color:"#555"}}>v0.2-gbm</div>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"24px"}}>
          {messages.map((msg, i) => (
            <div key={i} style={{marginBottom:20,display:"flex",gap:12,flexDirection:msg.role==="user"?"row-reverse":"row"}}>
              <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,background:msg.role==="user"?"rgba(255,255,255,0.1)":"rgba(255,215,0,0.15)",border:msg.role==="user"?"1px solid #333":"1px solid rgba(255,215,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:msg.role==="user"?"#666":"#FFD700"}}>
                {msg.role==="user"?"S":"V"}
              </div>
              <div style={{maxWidth:"70%",background:msg.role==="user"?"rgba(255,255,255,0.05)":"rgba(255,215,0,0.03)",border:msg.role==="user"?"1px solid #1a1a1a":"1px solid rgba(255,215,0,0.1)",borderRadius:12,padding:"12px 16px",fontSize:14,lineHeight:1.7,color:msg.role==="user"?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.85)"}}>
                {msg.content}
              </div>
            </div>
          ))}
          {aiLoading && (
            <div style={{display:"flex",gap:12,marginBottom:20}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,215,0,0.15)",border:"1px solid rgba(255,215,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#FFD700"}}>V</div>
              <div style={{background:"rgba(255,215,0,0.03)",border:"1px solid rgba(255,215,0,0.1)",borderRadius:12,padding:"12px 16px",fontSize:14,color:"#555"}}>Analiz ediliyor...</div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>
        <div style={{padding:"0 24px 12px",display:"flex",gap:8,flexWrap:"wrap"}}>
          {SUGGESTIONS.map((s,i) => (
            <button key={i} onClick={()=>sendMessage(s)} style={{background:"rgba(255,255,255,0.03)",border:"1px solid #1a1a1a",borderRadius:20,padding:"6px 14px",fontSize:12,color:"#555",cursor:"pointer"}}>
              {s}
            </button>
          ))}
        </div>
        <div style={{padding:"12px 24px 24px"}}>
          <div style={{display:"flex",gap:12,background:"rgba(255,255,255,0.03)",border:"1px solid #222",borderRadius:12,padding:"12px 16px"}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()}
              placeholder="Emlak sorunuzu sorun..." style={{flex:1,background:"transparent",border:"none",outline:"none",fontSize:14,color:"rgba(255,255,255,0.7)",fontFamily:"inherit"}}/>
            <button onClick={()=>sendMessage()} disabled={aiLoading||!input.trim()}
              style={{background:input.trim()?"#FFD700":"#1a1a1a",color:input.trim()?"#000":"#333",border:"none",borderRadius:8,padding:"8px 20px",fontSize:13,cursor:"pointer"}}>
              Sor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
