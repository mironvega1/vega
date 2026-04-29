"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ─── küçük hook: sayaç animasyonu ─── */
function useCounter(target: number, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return val;
}

/* ─── simülasyon mesajları ─── */
const SIM_CHAT = [
  { role: "user", text: "Kadıköy'de 120m² dairenin değeri ne kadar?" },
  { role: "ai",   text: "Kadıköy ortalama ₺85,000/m² üzerinden hesapladım. 120m² için tahmini değer:\n\n₺9,800,000 – ₺10,500,000\n\nKat, cephe ve bina yaşına göre ±%8 sapma olabilir." },
  { role: "user", text: "Kira getirisi nasıl?" },
  { role: "ai",   text: "Bölgede kira/satış çarpanı şu an 280–310 ay arası.\n\n▸ Aylık kira tahmini: ₺33,000 – ₺38,000\n▸ Brüt getiri: %4.2\n▸ Net getiri: %3.1 (giderler dahil)" },
];

const MODULES = [
  { icon: "◈", label: "Emlak Yapay Zekası",  desc: "Piyasa analizi, bölge karşılaştırma, yatırım tavsiyeleri",  accent: "#FFD700" },
  { icon: "⚡", label: "AI Değerleme",         desc: "ML modeli ile sokak bazlı anlık fiyat tahmini + SHAP",      accent: "#38bdf8" },
  { icon: "▣", label: "Sözleşme Merkezi",     desc: "TBK uyumlu kira & satış sözleşmesi otomasyonu",            accent: "#22c55e" },
  { icon: "◎", label: "Analiz Merkezi",       desc: "Adres, deal, bölge hakimiyeti ve risk analizleri",         accent: "#e879f9" },
  { icon: "◉", label: "Canlı Harita",         desc: "İnteraktif fiyat ısı haritası ve yoğunluk görünümü",       accent: "#fb923c" },
  { icon: "▣", label: "PDF Rapor",            desc: "Müşteriye sunmak için hazır profesyonel değerleme raporu", accent: "#a78bfa" },
  { icon: "◐", label: "Bölge Skoru",          desc: "İlçe ve mahalle bazlı yatırım skoru ve trend analizi",     accent: "#34d399" },
  { icon: "▤", label: "Kat Analizi",          desc: "Bina bazlı kat karşılaştırması ve değer farkı",            accent: "#f472b6" },
  { icon: "◭", label: "Emsal İstihbarat",     desc: "Komşu mülk satışları ve bölge emsal veritabanı",           accent: "#fbbf24" },
];

const TICKER_ITEMS = [
  "50.000+ Aktif İlan", "81 İl Kapsamı", "%99.2 Model Doğruluğu",
  "9 AI Modülü", "Anlık Piyasa Verisi", "TBK Uyumlu Sözleşmeler",
  "KVKK Uyumlu", "SSL Güvenli", "Profesyonel PDF Raporlar",
];

export default function Home() {
  const [chatIdx, setChatIdx] = useState(0);
  const [chatVisible, setChatVisible] = useState<number[]>([0]);
  const [statsStarted, setStatsStarted] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const c1 = useCounter(50000, 2000, statsStarted);
  const c2 = useCounter(81,    1200, statsStarted);
  const c3 = useCounter(992,   2200, statsStarted);
  const c4 = useCounter(9,      800, statsStarted);

  /* chat simülasyonu */
  useEffect(() => {
    if (chatIdx >= SIM_CHAT.length - 1) return;
    const t = setTimeout(() => {
      setChatIdx(i => i + 1);
      setChatVisible(v => [...v, chatIdx + 1]);
    }, chatIdx === 0 ? 1800 : 2600);
    return () => clearTimeout(t);
  }, [chatIdx]);

  /* stats counter tetikle */
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsStarted(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: "#050505", color: "#e0e0e0", fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", overflowX: "hidden" }}>

      {/* ══ CSS animasyonları ══ */}
      <style>{`
        @keyframes fadeUp   { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn   { from { opacity:0 } to { opacity:1 } }
        @keyframes ticker   { from { transform:translateX(0) } to { transform:translateX(-50%) } }
        @keyframes pulse    { 0%,100%{opacity:.35} 50%{opacity:.7} }
        @keyframes glow     { 0%,100%{opacity:.18} 50%{opacity:.38} }
        @keyframes scanline { from{transform:translateY(-100%)} to{transform:translateY(100vh)} }
        @keyframes blink    { 0%,100%{opacity:1} 49%{opacity:1} 50%{opacity:0} }
        @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .chat-msg { animation: fadeUp 0.5s ease forwards; }
        .mod-card:hover { border-color: rgba(255,215,0,0.18) !important; transform:translateY(-2px); }
        .mod-card { transition: border-color 0.2s, transform 0.2s; }
        .hero-btn-primary:hover { background:#FFC000 !important; }
        .hero-btn-secondary:hover { border-color:rgba(255,215,0,0.4) !important; color:#FFD700 !important; }
        .hero-btn-primary, .hero-btn-secondary { transition: all 0.15s; }
      `}</style>

      {/* ══ HEADER ══ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(5,5,5,0.85)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        padding: "0 48px", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <span style={{ fontSize: 20, color: "#FFD700", letterSpacing: 5, fontWeight: 200 }}>VEGA</span>
          <span style={{ fontSize: 8, color: "#222", letterSpacing: 3, marginLeft: 8 }}>INTELLIGENCE</span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/auth/login" className="hero-btn-secondary" style={{
            color: "#555", textDecoration: "none", fontSize: 13,
            padding: "8px 22px", border: "1px solid #1e1e1e", borderRadius: 8,
          }}>Giriş Yap</Link>
          <Link href="/auth/signup" className="hero-btn-primary" style={{
            background: "#FFD700", color: "#000", textDecoration: "none",
            fontSize: 13, fontWeight: 700, padding: "9px 24px", borderRadius: 8, letterSpacing: 0.3,
          }}>Kayıt Ol →</Link>
        </nav>
      </header>

      {/* ══ HERO ══ */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "100px 40px 60px", textAlign: "center",
        position: "relative", overflow: "hidden",
      }}>
        {/* arka plan dekorları */}
        <div style={{ position:"absolute", top:"10%", left:"50%", transform:"translateX(-50%)", width:700, height:700, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 65%)", pointerEvents:"none", animation:"glow 4s ease-in-out infinite" }} />
        <div style={{ position:"absolute", bottom:"-10%", left:"5%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%)", pointerEvents:"none", animation:"glow 5s ease-in-out infinite 1s" }} />
        <div style={{ position:"absolute", top:"20%", right:"5%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(232,121,249,0.03) 0%, transparent 70%)", pointerEvents:"none", animation:"glow 6s ease-in-out infinite 2s" }} />

        {/* grid deseni */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }} />

        {/* içerik */}
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ animation:"fadeUp 0.6s ease forwards" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.15)",
              borderRadius:20, padding:"6px 18px", marginBottom:36,
            }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", animation:"pulse 2s infinite" }} />
              <span style={{ fontSize:11, color:"#FFD700", letterSpacing:2 }}>TÜRKİYE #1 EMLAK ZEKAsi</span>
            </div>
          </div>

          <div style={{ animation:"fadeUp 0.7s ease 0.1s both" }}>
            <h1 style={{ fontSize:62, fontWeight:200, lineHeight:1.1, letterSpacing:-2, margin:0 }}>
              Gayrimenkulde<br />
              <span style={{ fontWeight:700, color:"#FFD700" }}>Yapay Zeka</span><br />
              <span style={{ color:"#444" }}>Dönemi Başladı</span>
            </h1>
          </div>

          <div style={{ animation:"fadeUp 0.7s ease 0.2s both" }}>
            <p style={{ fontSize:16, color:"#3a3a3a", lineHeight:1.8, maxWidth:520, margin:"28px auto 0" }}>
              Fiyat tahmini, risk analizi, sözleşme üretimi ve canlı piyasa verisiyle Türkiye'nin her ilçesine hakim olun.
            </p>
          </div>

          <div style={{ animation:"fadeUp 0.7s ease 0.3s both", marginTop:44, display:"flex", gap:12, justifyContent:"center", alignItems:"center" }}>
            <Link href="/auth/signup" className="hero-btn-primary" style={{
              background:"#FFD700", color:"#000", textDecoration:"none",
              padding:"15px 44px", borderRadius:10, fontWeight:800, fontSize:15, letterSpacing:0.3,
            }}>Ücretsiz Başla →</Link>
            <Link href="/auth/login" className="hero-btn-secondary" style={{
              color:"#555", textDecoration:"none", padding:"15px 36px",
              borderRadius:10, border:"1px solid #1e1e1e", fontSize:15,
            }}>Giriş Yap</Link>
          </div>

          {/* mini özellik etiketleri */}
          <div style={{ animation:"fadeUp 0.7s ease 0.45s both", marginTop:36, display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
            {["AI Değerleme","Sözleşme Üretici","Risk Analizi","Canlı Harita","PDF Rapor","Bölge Skoru"].map(t => (
              <div key={t} style={{
                background:"rgba(255,255,255,0.02)", border:"1px solid #1a1a1a",
                borderRadius:20, padding:"5px 14px", fontSize:11, color:"#383838",
              }}>{t}</div>
            ))}
          </div>
        </div>

        {/* scroll ok */}
        <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", animation:"float 2.5s ease-in-out infinite" }}>
          <div style={{ fontSize:10, color:"#222", letterSpacing:2, marginBottom:8, textAlign:"center" }}>KEŞFET</div>
          <div style={{ width:1, height:40, background:"linear-gradient(to bottom, #333, transparent)", margin:"0 auto" }} />
        </div>
      </section>

      {/* ══ TICKER ══ */}
      <div style={{ borderTop:"1px solid #0e0e0e", borderBottom:"1px solid #0e0e0e", overflow:"hidden", padding:"14px 0", background:"#080808" }}>
        <div style={{ display:"flex", animation:"ticker 22s linear infinite", whiteSpace:"nowrap" }}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <div key={i} style={{ display:"inline-flex", alignItems:"center", gap:32, paddingRight:48, fontSize:12, color:"#2a2a2a", letterSpacing:1 }}>
              <span style={{ color:"#FFD700", fontSize:10 }}>◆</span>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* ══ STATS ══ */}
      <section ref={statsRef} style={{ padding:"80px 48px", display:"flex", justifyContent:"center", gap:4 }}>
        {[
          { val: c1 >= 1000 ? `${(c1/1000).toFixed(0)}K+` : `${c1}`, label:"Aktif İlan", accent:"#FFD700" },
          { val: `${c2}`,   label:"İl Kapsamı",    accent:"#38bdf8" },
          { val: `%${(c3/10).toFixed(1)}`, label:"Model Doğruluğu", accent:"#22c55e" },
          { val: `${c4}`,   label:"AI Modülü",     accent:"#e879f9" },
        ].map((s, i) => (
          <div key={i} style={{
            flex:1, maxWidth:220,
            background:"rgba(255,255,255,0.015)",
            border:"1px solid #111",
            borderRadius:14, padding:"28px 24px", textAlign:"center",
            borderTop:`2px solid ${s.accent}`,
          }}>
            <div style={{ fontSize:42, fontWeight:700, color:s.accent, letterSpacing:-1, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:11, color:"#333", marginTop:10, letterSpacing:1.5 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* ══ AI CHAT SİMÜLASYONU ══ */}
      <section style={{ padding:"20px 48px 80px", display:"flex", gap:60, alignItems:"center", maxWidth:1100, margin:"0 auto" }}>
        {/* sol: açıklama */}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:"#FFD700", letterSpacing:3, marginBottom:16 }}>CANLI SİMÜLASYON</div>
          <h2 style={{ fontSize:36, fontWeight:300, lineHeight:1.25, margin:0, color:"#c0c0c0" }}>
            Sorun —<br />
            <span style={{ color:"#FFD700" }}>Anında</span> yanıt al
          </h2>
          <p style={{ fontSize:14, color:"#333", marginTop:20, lineHeight:1.8 }}>
            Kadıköy'den Bodrum'a, 81 ilde anlık piyasa verisiyle desteklenen AI asistanımız tüm emlak sorularınıza saniyeler içinde cevap verir.
          </p>
          <div style={{ marginTop:32, display:"flex", flexDirection:"column", gap:14 }}>
            {[
              { icon:"⚡", text:"Sokak bazlı fiyat tahmini" },
              { icon:"◎", text:"Kira-satış çarpanı analizi" },
              { icon:"◈", text:"Yatırım tavsiyeleri" },
            ].map(f => (
              <div key={f.text} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"rgba(255,215,0,0.06)", border:"1px solid rgba(255,215,0,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#FFD700", fontSize:14 }}>{f.icon}</div>
                <span style={{ fontSize:13, color:"#555" }}>{f.text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:36 }}>
            <Link href="/auth/signup" style={{ background:"#FFD700", color:"#000", textDecoration:"none", padding:"12px 32px", borderRadius:8, fontWeight:700, fontSize:13 }}>
              Şimdi Dene →
            </Link>
          </div>
        </div>

        {/* sağ: chat penceresi */}
        <div style={{ width:440, flexShrink:0 }}>
          <div style={{
            background:"#080808", border:"1px solid #161616", borderRadius:16, overflow:"hidden",
            boxShadow:"0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,215,0,0.04)",
          }}>
            {/* chat başlık */}
            <div style={{ padding:"14px 20px", borderBottom:"1px solid #111", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:10, background:"rgba(255,215,0,0.1)", border:"1px solid rgba(255,215,0,0.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#FFD700", fontSize:15 }}>◈</div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:"#e0e0e0" }}>Vega AI</div>
                <div style={{ fontSize:10, color:"#333", display:"flex", alignItems:"center", gap:4 }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:"#22c55e", animation:"pulse 2s infinite" }} />
                  Aktif
                </div>
              </div>
            </div>

            {/* mesajlar */}
            <div style={{ padding:"20px 16px", display:"flex", flexDirection:"column", gap:12, minHeight:260 }}>
              {SIM_CHAT.slice(0, chatIdx + 1).map((msg, i) => (
                <div key={i} className="chat-msg" style={{
                  display:"flex", gap:8,
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems:"flex-start",
                }}>
                  <div style={{
                    width:26, height:26, borderRadius:"50%", flexShrink:0,
                    background: msg.role === "user" ? "rgba(255,255,255,0.05)" : "rgba(255,215,0,0.1)",
                    border: msg.role === "user" ? "1px solid #1e1e1e" : "1px solid rgba(255,215,0,0.2)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:9, color: msg.role === "user" ? "#555" : "#FFD700", fontWeight:600,
                  }}>{msg.role === "user" ? "S" : "V"}</div>
                  <div style={{
                    maxWidth:"82%",
                    background: msg.role === "user" ? "rgba(255,255,255,0.03)" : "rgba(255,215,0,0.02)",
                    border: msg.role === "user" ? "1px solid #1a1a1a" : "1px solid rgba(255,215,0,0.08)",
                    borderRadius:10, padding:"9px 13px",
                    fontSize:12, lineHeight:1.7, whiteSpace:"pre-wrap",
                    color: msg.role === "user" ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.8)",
                  }}>{msg.text}</div>
                </div>
              ))}
              {chatIdx < SIM_CHAT.length - 1 && (
                <div style={{ display:"flex", gap:8, alignItems:"center", paddingLeft:34 }}>
                  <div style={{ display:"flex", gap:4 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:"#333", animation:`pulse 1.2s ease-in-out infinite`, animationDelay:`${i*0.2}s` }} />)}
                  </div>
                </div>
              )}
            </div>

            {/* input görünümü */}
            <div style={{ padding:"12px 16px", borderTop:"1px solid #0e0e0e", display:"flex", gap:8 }}>
              <div style={{ flex:1, background:"rgba(255,255,255,0.02)", border:"1px solid #161616", borderRadius:8, padding:"9px 13px", fontSize:11, color:"#222" }}>Soru sorun…</div>
              <div style={{ background:"rgba(255,215,0,0.08)", border:"1px solid rgba(255,215,0,0.15)", borderRadius:8, padding:"9px 16px", fontSize:11, color:"#FFD700" }}>Sor</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MODÜLLER ══ */}
      <section style={{ padding:"60px 48px 80px", background:"#080808", borderTop:"1px solid #0e0e0e", borderBottom:"1px solid #0e0e0e" }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ fontSize:11, color:"#FFD700", letterSpacing:3, marginBottom:14 }}>PLATFORM MODÜLLERİ</div>
          <h2 style={{ fontSize:36, fontWeight:300, margin:0, color:"#c0c0c0" }}>
            Her ihtiyaç için <span style={{ color:"#FFD700" }}>özel modül</span>
          </h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, maxWidth:1000, margin:"0 auto" }}>
          {MODULES.map((m, i) => (
            <div key={i} className="mod-card" style={{
              background:"rgba(255,255,255,0.01)", border:"1px solid #141414",
              borderRadius:12, padding:"20px 20px",
              display:"flex", alignItems:"flex-start", gap:14,
            }}>
              <div style={{
                width:38, height:38, borderRadius:10, flexShrink:0,
                background:`${m.accent}10`, border:`1px solid ${m.accent}22`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:16, color:m.accent,
              }}>{m.icon}</div>
              <div>
                <div style={{ fontSize:13, color:"#888", fontWeight:500, marginBottom:5 }}>{m.label}</div>
                <div style={{ fontSize:11, color:"#2a2a2a", lineHeight:1.55 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ DEĞERLEMESİMÜLASYONU ══ */}
      <section style={{ padding:"80px 48px", display:"flex", gap:60, alignItems:"center", maxWidth:1100, margin:"0 auto" }}>
        {/* sol: değerleme kartı */}
        <div style={{ width:420, flexShrink:0 }}>
          <div style={{
            background:"#080808", border:"1px solid #161616", borderRadius:16, overflow:"hidden",
            boxShadow:"0 24px 80px rgba(0,0,0,0.5)",
          }}>
            <div style={{ padding:"16px 20px", borderBottom:"1px solid #111", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ fontSize:12, fontWeight:600, color:"#e0e0e0" }}>⚡ AI Değerleme</div>
              <div style={{ marginLeft:"auto", fontSize:10, color:"#22c55e", display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#22c55e", animation:"pulse 2s infinite" }} />
                Hazır
              </div>
            </div>
            <div style={{ padding:"20px" }}>
              {/* form alanları */}
              {[
                { label:"İl / İlçe", val:"İstanbul / Kadıköy" },
                { label:"Mahalle", val:"Moda" },
                { label:"Metrekare", val:"120 m²" },
                { label:"Oda sayısı", val:"3+1" },
              ].map(f => (
                <div key={f.label} style={{ marginBottom:12 }}>
                  <div style={{ fontSize:10, color:"#2e2e2e", letterSpacing:1, marginBottom:5 }}>{f.label.toUpperCase()}</div>
                  <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid #161616", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#666" }}>{f.val}</div>
                </div>
              ))}
              {/* sonuç */}
              <div style={{ marginTop:20, background:"rgba(255,215,0,0.04)", border:"1px solid rgba(255,215,0,0.12)", borderRadius:10, padding:"18px" }}>
                <div style={{ fontSize:10, color:"#555", letterSpacing:1, marginBottom:8 }}>TAHMİNİ DEĞER</div>
                <div style={{ fontSize:32, fontWeight:700, color:"#FFD700", letterSpacing:-0.5 }}>₺10.240.000</div>
                <div style={{ fontSize:11, color:"#333", marginTop:6 }}>± %4.8 güven aralığı  ·  ₺85,333/m²</div>
                <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    { label:"Tahmini kira", val:"₺35.000/ay" },
                    { label:"Brüt getiri", val:"%4.1" },
                    { label:"Satış süresi", val:"~42 gün" },
                    { label:"Risk skoru", val:"Düşük ✓" },
                  ].map(d => (
                    <div key={d.label} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid #111", borderRadius:8, padding:"10px 12px" }}>
                      <div style={{ fontSize:9, color:"#2a2a2a", letterSpacing:0.5 }}>{d.label.toUpperCase()}</div>
                      <div style={{ fontSize:13, color:"#888", fontWeight:500, marginTop:4 }}>{d.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* sağ: açıklama */}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:"#38bdf8", letterSpacing:3, marginBottom:16 }}>AI DEĞERLEMEMODELİ</div>
          <h2 style={{ fontSize:36, fontWeight:300, lineHeight:1.25, margin:0, color:"#c0c0c0" }}>
            Sokak bazında<br />
            <span style={{ color:"#38bdf8" }}>hassas</span> fiyat tahmini
          </h2>
          <p style={{ fontSize:14, color:"#333", marginTop:20, lineHeight:1.8 }}>
            Gradient boosting ensemble modeli, 50.000+ ilanın verisiyle eğitildi. Sadece metrekare ve oda değil — kat, cephe, bina yaşı, ulaşım mesafesi ve komşu satışlar dahil 40+ parametre analizi.
          </p>
          <div style={{ marginTop:32, display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { pct:92, label:"Oda / Kat / Cephe ağırlığı" },
              { pct:78, label:"Bölgesel talep endeksi" },
              { pct:65, label:"Son 90 gün emsal etkisi" },
            ].map(b => (
              <div key={b.label}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#333", marginBottom:6 }}>
                  <span>{b.label}</span><span style={{ color:"#38bdf8" }}>{b.pct}%</span>
                </div>
                <div style={{ height:4, background:"#111", borderRadius:4 }}>
                  <div style={{ height:"100%", width:`${b.pct}%`, background:"linear-gradient(90deg, #38bdf8, #0ea5e9)", borderRadius:4 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:36 }}>
            <Link href="/auth/signup" style={{ background:"rgba(56,189,248,0.1)", color:"#38bdf8", textDecoration:"none", padding:"12px 32px", borderRadius:8, fontWeight:600, fontSize:13, border:"1px solid rgba(56,189,248,0.2)" }}>
              Değerleme Yap →
            </Link>
          </div>
        </div>
      </section>

      {/* ══ SÖZLEŞME SİMÜLASYONU ══ */}
      <section style={{ background:"#080808", borderTop:"1px solid #0e0e0e", borderBottom:"1px solid #0e0e0e", padding:"80px 48px", display:"flex", gap:60, alignItems:"center", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:"#22c55e", letterSpacing:3, marginBottom:16 }}>SÖZLEŞME MERKEZİ</div>
          <h2 style={{ fontSize:36, fontWeight:300, lineHeight:1.25, margin:0, color:"#c0c0c0" }}>
            <span style={{ color:"#22c55e" }}>Saniyeler</span> içinde<br />hukuki sözleşme
          </h2>
          <p style={{ fontSize:14, color:"#333", marginTop:20, lineHeight:1.8 }}>
            TBK uyumlu kira ve satış sözleşmelerini otomatik oluşturun. Bilgileri doldurun, PDF indirin — avukat maliyeti olmadan.
          </p>
          <div style={{ marginTop:28, display:"flex", flexDirection:"column", gap:10 }}>
            {[
              "TBK 299-378. Madde uyumlu",
              "Kira artış maddeleri otomatik",
              "Depozito ve ödeme planı dahil",
              "A4 PDF olarak indirilebilir",
            ].map(f => (
              <div key={f} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:16, height:16, borderRadius:4, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#22c55e" }}>✓</div>
                <span style={{ fontSize:13, color:"#444" }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:36 }}>
            <Link href="/auth/signup" style={{ background:"rgba(34,197,94,0.08)", color:"#22c55e", textDecoration:"none", padding:"12px 32px", borderRadius:8, fontWeight:600, fontSize:13, border:"1px solid rgba(34,197,94,0.2)" }}>
              Sözleşme Oluştur →
            </Link>
          </div>
        </div>

        {/* sağ: sözleşme önizleme */}
        <div style={{ width:400, flexShrink:0 }}>
          <div style={{ background:"#0a0a0a", border:"1px solid #161616", borderRadius:12, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
            <div style={{ padding:"14px 18px", borderBottom:"1px solid #111", display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:7, background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#22c55e" }}>▣</div>
              <div style={{ fontSize:12, fontWeight:500, color:"#888" }}>Kira Sözleşmesi</div>
              <div style={{ marginLeft:"auto", fontSize:10, background:"rgba(34,197,94,0.1)", color:"#22c55e", padding:"3px 10px", borderRadius:10, border:"1px solid rgba(34,197,94,0.2)" }}>TBK Uyumlu</div>
            </div>
            <div style={{ padding:"18px" }}>
              {[
                { step:1, label:"Taraflar", fields:["Kiraya veren: Ahmet Yılmaz", "Kiracı: Ayşe Kara"] },
                { step:2, label:"Mülk Bilgileri", fields:["Kadıköy, Moda Mah.", "3+1 · 120m² · 4. Kat"] },
                { step:3, label:"Kira Koşulları", fields:["₺35.000/ay · 12 Ay", "Depozito: ₺70.000"] },
              ].map(s => (
                <div key={s.step} style={{ marginBottom:14 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:18, height:18, borderRadius:"50%", background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:"#22c55e", flexShrink:0 }}>{s.step}</div>
                    <div style={{ fontSize:11, color:"#444", fontWeight:500 }}>{s.label}</div>
                    <div style={{ flex:1, height:1, background:"#111" }} />
                  </div>
                  {s.fields.map(f => (
                    <div key={f} style={{ background:"rgba(255,255,255,0.015)", border:"1px solid #111", borderRadius:6, padding:"7px 12px", fontSize:11, color:"#555", marginBottom:5 }}>{f}</div>
                  ))}
                </div>
              ))}
              <div style={{ marginTop:16, background:"rgba(34,197,94,0.06)", border:"1px solid rgba(34,197,94,0.15)", borderRadius:8, padding:"11px 14px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ fontSize:18, color:"#22c55e" }}>▣</div>
                <div>
                  <div style={{ fontSize:12, color:"#22c55e", fontWeight:500 }}>PDF Hazır</div>
                  <div style={{ fontSize:10, color:"#333", marginTop:2 }}>3 sayfalık tam sözleşme</div>
                </div>
                <div style={{ marginLeft:"auto", fontSize:11, color:"#22c55e", background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.15)", padding:"6px 14px", borderRadius:7, cursor:"pointer" }}>İndir</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding:"100px 48px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)", pointerEvents:"none", animation:"glow 5s ease-in-out infinite" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ fontSize:11, color:"#FFD700", letterSpacing:3, marginBottom:20 }}>HEMEN BAŞLAYIN</div>
          <h2 style={{ fontSize:46, fontWeight:300, margin:0, lineHeight:1.2, color:"#c0c0c0" }}>
            Türkiye emlak piyasasına<br />
            <span style={{ color:"#FFD700", fontWeight:700 }}>tam hakimiyet</span>
          </h2>
          <p style={{ fontSize:14, color:"#333", marginTop:20, lineHeight:1.8 }}>Ücretsiz hesap açın. Kredi kartı gerekmez.</p>
          <div style={{ marginTop:40, display:"flex", gap:12, justifyContent:"center" }}>
            <Link href="/auth/signup" style={{ background:"#FFD700", color:"#000", textDecoration:"none", padding:"16px 52px", borderRadius:10, fontWeight:800, fontSize:15, letterSpacing:0.3 }}>
              Ücretsiz Başla →
            </Link>
            <Link href="/auth/login" style={{ color:"#444", textDecoration:"none", padding:"16px 36px", borderRadius:10, border:"1px solid #1a1a1a", fontSize:15 }}>
              Giriş Yap
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop:"1px solid #0e0e0e", padding:"28px 48px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:16, color:"#FFD700", letterSpacing:4, fontWeight:200 }}>VEGA</div>
          <div style={{ fontSize:9, color:"#1a1a1a", letterSpacing:3, marginTop:3 }}>INTELLIGENCE PLATFORM</div>
        </div>
        <div style={{ display:"flex", gap:32 }}>
          {["Platform", "Değerleme", "Analiz", "Sözleşme"].map(l => (
            <span key={l} style={{ fontSize:12, color:"#1e1e1e", cursor:"pointer" }}>{l}</span>
          ))}
        </div>
        <div style={{ fontSize:11, color:"#1a1a1a" }}>© 2026 Vega Intelligence</div>
      </footer>
    </div>
  );
}
