import Link from "next/link";

export default function Home() {
  return (
    <main style={{minHeight:"100vh",background:"#080808",color:"#e0e0e0",fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif"}}>

      {/* Header */}
      <header style={{borderBottom:"1px solid #161616",padding:"20px 40px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:22,color:"#FFD700",letterSpacing:4,fontWeight:300}}>VEGA</div>
          <div style={{fontSize:9,color:"#333",letterSpacing:4,marginTop:2}}>INTELLIGENCE PLATFORM</div>
        </div>
        <nav style={{display:"flex",alignItems:"center",gap:32}}>
          <Link href="/dashboard" style={{color:"#555",textDecoration:"none",fontSize:13,transition:"color 0.15s"}} onMouseEnter={e=>(e.currentTarget.style.color="#e0e0e0")} onMouseLeave={e=>(e.currentTarget.style.color="#555")}>Platform</Link>
          <Link href="/valuation" style={{color:"#555",textDecoration:"none",fontSize:13}} onMouseEnter={e=>(e.currentTarget.style.color="#e0e0e0")} onMouseLeave={e=>(e.currentTarget.style.color="#555")}>Değerleme</Link>
          <Link href="/auth/login" style={{color:"#888",textDecoration:"none",fontSize:13,padding:"7px 16px",border:"1px solid #222",borderRadius:7}}>Giriş Yap</Link>
          <Link href="/auth/signup" style={{background:"#FFD700",color:"#000",textDecoration:"none",fontSize:13,fontWeight:600,padding:"8px 20px",borderRadius:7,letterSpacing:0.5}}>Ücretsiz Başla</Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={{maxWidth:960,margin:"0 auto",padding:"100px 40px 80px",textAlign:"center"}}>
        <div style={{display:"inline-block",background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:20,padding:"6px 16px",fontSize:11,color:"#FFD700",letterSpacing:2,marginBottom:32}}>
          ENTERPRISE PROPTECH PLATFORM
        </div>
        <h1 style={{fontSize:52,fontWeight:300,lineHeight:1.15,marginBottom:24,letterSpacing:-1}}>
          Türkiye'nin İlk<br />
          <span style={{color:"#FFD700",fontWeight:600}}>Emlak Zeka Altyapısı</span>
        </h1>
        <p style={{color:"#555",fontSize:16,lineHeight:1.8,maxWidth:560,margin:"0 auto 48px"}}>
          Sokak bazlı fiyat tahmini. Kaç günde satılır analizi. Sözleşme üretici. Bölge hakimiyet skoru. Ekibinizle birlikte, tek çatı altında.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",alignItems:"center"}}>
          <Link href="/auth/signup" style={{background:"#FFD700",color:"#000",textDecoration:"none",padding:"14px 36px",borderRadius:10,fontWeight:700,fontSize:14,letterSpacing:0.5}}>
            Hemen Başla — Ücretsiz
          </Link>
          <Link href="/dashboard" style={{color:"#555",textDecoration:"none",padding:"14px 28px",borderRadius:10,border:"1px solid #1e1e1e",fontSize:14}}>
            Demo İncele →
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{borderTop:"1px solid #111",borderBottom:"1px solid #111",padding:"28px 40px",display:"flex",justifyContent:"center",gap:80}}>
        {[
          {val:"500+", label:"Aktif İlan"},
          {val:"7",    label:"Şehir"},
          {val:"v0.2", label:"Model Versiyonu"},
          {val:"99%",  label:"Uptime"},
        ].map(s => (
          <div key={s.label} style={{textAlign:"center"}}>
            <div style={{fontSize:26,fontWeight:600,color:"#FFD700"}}>{s.val}</div>
            <div style={{fontSize:11,color:"#333",marginTop:4,letterSpacing:1}}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{maxWidth:960,margin:"0 auto",padding:"80px 40px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
        {[
          {icon:"◎", title:"Ultra Micro Valuation", desc:"Kapı numarası, kat, cephe bazlı fiyat tahmini. Gradient boosting ensemble ile SHAP açıklaması."},
          {icon:"⚡", title:"Liquidity Engine",      desc:"Bu ev kaç günde satılır? Günlük arz-talep dengesi ve bölge alıcı yoğunluğu analizi."},
          {icon:"◈", title:"AI Analiz Merkezi",     desc:"Piyasa analizi, bölge skoru, deal scoring ve sözleşme üreticisi — tek platformda."},
          {icon:"▦", title:"Team Workspace",        desc:"Aynı acente altında 10, 100, 1000 danışman. Ortak portföy, ayrı performans görünümü."},
          {icon:"◉", title:"Canlı Harita",          desc:"Tüm portföy harita üzerinde. Koordinat bazlı bölge yoğunluğu ve fiyat ısı haritası."},
          {icon:"▣", title:"PDF Rapor",             desc:"Müşteriye sunmak için hazır profesyonel değerleme raporu. Tek tıkla oluştur."},
        ].map(f => (
          <div key={f.title} style={{background:"rgba(255,255,255,0.01)",border:"1px solid #161616",borderRadius:12,padding:"24px",transition:"border-color 0.15s",cursor:"default"}}
            onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(255,215,0,0.2)")}
            onMouseLeave={e=>(e.currentTarget.style.borderColor="#161616")}>
            <div style={{fontSize:22,color:"#FFD700",marginBottom:12}}>{f.icon}</div>
            <div style={{fontSize:14,fontWeight:500,marginBottom:8}}>{f.title}</div>
            <div style={{fontSize:12,color:"#444",lineHeight:1.7}}>{f.desc}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{borderTop:"1px solid #111",padding:"80px 40px",textAlign:"center"}}>
        <div style={{fontSize:32,fontWeight:300,marginBottom:16}}>Ekibinizle birlikte başlayın</div>
        <div style={{fontSize:14,color:"#444",marginBottom:32}}>Acente kodu ile ekip arkadaşlarınızı davet edin. Ortak portföy, tek platform.</div>
        <Link href="/auth/signup" style={{background:"#FFD700",color:"#000",textDecoration:"none",padding:"14px 40px",borderRadius:10,fontWeight:700,fontSize:14}}>
          Acente Hesabı Oluştur
        </Link>
      </section>

      <footer style={{borderTop:"1px solid #0e0e0e",padding:"24px 40px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:12,color:"#FFD700",letterSpacing:3}}>VEGA</div>
        <div style={{fontSize:11,color:"#2a2a2a"}}>© 2026 Vega Intelligence Platform</div>
      </footer>
    </main>
  );
}
