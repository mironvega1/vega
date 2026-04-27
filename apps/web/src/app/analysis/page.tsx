"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Ana Merkez",     icon: "◈" },
  { href: "/analysis",           label: "Analiz Merkezi", icon: "◎" },
  { href: "/valuation",          label: "AI Değerleme",   icon: "⚡" },
  { href: "/map",                label: "Canlı Harita",   icon: "◉" },
  { href: "/listings",           label: "İlan Yönetimi",  icon: "▦" },
  { href: "/zone-scores",        label: "Bölge Skoru",    icon: "◐" },
  { href: "/bina-karsilastirma", label: "Kat Analizi",    icon: "▤" },
  { href: "/report",             label: "PDF Rapor",      icon: "▣" },
];

type Tab = "sozlesme" | "piyasa" | "deal" | "bolge" | "risk";

const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
  { id: "sozlesme", label: "Sözleşme Üretici",   icon: "📋", desc: "Kira & satış taslağı" },
  { id: "piyasa",   label: "Piyasa Analizi",     icon: "📊", desc: "İlçe bazlı trend" },
  { id: "deal",     label: "Deal Skoru",         icon: "🎯", desc: "Fırsat değerlendirme" },
  { id: "bolge",    label: "Bölge Hakimiyeti",   icon: "🏆", desc: "Strateji & aksiyon" },
  { id: "risk",     label: "Risk Analizi",       icon: "⚠️", desc: "Yatırım risk raporu" },
];

export default function AnalysisPage() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<Tab>("sozlesme");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  // Sözleşme form
  const [soz, setSoz] = useState({ turu:"kira", mulk_adres:"", mulk_tip:"Daire", mulk_m2:"", mulk_fiyat:"", sozlesme_suresi:"1 yıl", kiraci_veya_alici_ad:"", ev_sahibi_veya_satici_ad:"", depozito:"", notlar:"" });

  // Piyasa form
  const [piyasa, setPiyasa] = useState({ ilce:"", il:"istanbul", mulk_tipi:"daire" });

  // Deal form
  const [deal, setDeal] = useState({ fiyat:"", net_m2:"", ilce:"", oda_sayisi:"3+1", bina_yasi:"", kat_no:"", toplam_kat:"" });

  // Bölge form
  const [bolge, setBolge] = useState({ ilce:"", il:"istanbul" });

  // Risk form
  const [risk, setRisk] = useState({ yatirim_tutari:"", ilce:"", mulk_tipi:"daire", hedef:"kira_geliri" });

  const post = async (path: string, body: object) => {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch(`${API_URL}${path}`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      const data = await res.json();
      const text = data.sozlesme || data.analiz || data.skor_analizi || data.strateji || data.risk_analizi || JSON.stringify(data, null, 2);
      setResult(text);
    } catch (e) {
      setResult("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width:"100%", padding:"9px 12px", borderRadius:7, border:"1px solid #1e1e1e",
    background:"#0d0d0d", color:"#e0e0e0", fontSize:13, outline:"none", boxSizing:"border-box"
  };
  const selectStyle: React.CSSProperties = { ...inputStyle };
  const labelStyle: React.CSSProperties = { fontSize:11, color:"#555", display:"block", marginBottom:5, letterSpacing:1 };
  const fieldStyle: React.CSSProperties = { marginBottom:14 };

  const renderForm = () => {
    if (activeTab === "sozlesme") return (
      <div>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {["kira","satis"].map(t => (
            <button key={t} onClick={()=>setSoz({...soz,turu:t})}
              style={{flex:1,padding:"9px",border:"1px solid",borderColor:soz.turu===t?"#FFD700":"#1e1e1e",borderRadius:7,background:soz.turu===t?"rgba(255,215,0,0.08)":"transparent",color:soz.turu===t?"#FFD700":"#444",fontSize:13,cursor:"pointer"}}>
              {t==="kira" ? "Kira Sözleşmesi" : "Satış Ön Sözleşmesi"}
            </button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={fieldStyle}>
            <label style={labelStyle}>MÜLK ADRESİ</label>
            <input style={inputStyle} value={soz.mulk_adres} onChange={e=>setSoz({...soz,mulk_adres:e.target.value})} placeholder="Kadıköy, Moda Cad. No:5" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>MÜLK TİPİ</label>
            <select style={selectStyle} value={soz.mulk_tip} onChange={e=>setSoz({...soz,mulk_tip:e.target.value})}>
              {["Daire","Dükkan","Ofis","Villa","Arsa","Depo"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>NET M²</label>
            <input style={inputStyle} value={soz.mulk_m2} onChange={e=>setSoz({...soz,mulk_m2:e.target.value})} placeholder="120" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>{soz.turu==="kira"?"AYLIK KİRA (TL)":"SATIŞ BEDELİ (TL)"}</label>
            <input style={inputStyle} value={soz.mulk_fiyat} onChange={e=>setSoz({...soz,mulk_fiyat:e.target.value})} placeholder={soz.turu==="kira"?"25000":"3500000"} />
          </div>
          {soz.turu==="kira" && <>
            <div style={fieldStyle}>
              <label style={labelStyle}>SÖZLEŞME SÜRESİ</label>
              <select style={selectStyle} value={soz.sozlesme_suresi} onChange={e=>setSoz({...soz,sozlesme_suresi:e.target.value})}>
                {["6 ay","1 yıl","2 yıl","3 yıl"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>DEPOZİTO (TL)</label>
              <input style={inputStyle} value={soz.depozito} onChange={e=>setSoz({...soz,depozito:e.target.value})} placeholder="75000" />
            </div>
          </>}
          <div style={fieldStyle}>
            <label style={labelStyle}>{soz.turu==="kira"?"KİRACININ ADI SOYADI":"ALICININ ADI SOYADI"}</label>
            <input style={inputStyle} value={soz.kiraci_veya_alici_ad} onChange={e=>setSoz({...soz,kiraci_veya_alici_ad:e.target.value})} placeholder="Ahmet Yılmaz" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>{soz.turu==="kira"?"KİRAYA VERENİN ADI":"SATICININ ADI"}</label>
            <input style={inputStyle} value={soz.ev_sahibi_veya_satici_ad} onChange={e=>setSoz({...soz,ev_sahibi_veya_satici_ad:e.target.value})} placeholder="Fatma Demir" />
          </div>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>EK NOTLAR (opsiyonel)</label>
          <input style={inputStyle} value={soz.notlar} onChange={e=>setSoz({...soz,notlar:e.target.value})} placeholder="Evcil hayvan yasak, aidat kiracıya ait..." />
        </div>
        <button onClick={()=>post("/api/v1/analysis/sozlesme", soz)} disabled={loading||!soz.mulk_adres||!soz.kiraci_veya_alici_ad} style={btnStyle(loading||!soz.mulk_adres||!soz.kiraci_veya_alici_ad)}>
          {loading?"Oluşturuluyor...":"Sözleşme Oluştur"}
        </button>
      </div>
    );

    if (activeTab === "piyasa") return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
          <div style={fieldStyle}>
            <label style={labelStyle}>İL</label>
            <select style={selectStyle} value={piyasa.il} onChange={e=>setPiyasa({...piyasa,il:e.target.value})}>
              {["istanbul","ankara","izmir","bursa","antalya","adana","konya","mugla"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>İLÇE</label>
            <input style={inputStyle} value={piyasa.ilce} onChange={e=>setPiyasa({...piyasa,ilce:e.target.value})} placeholder="Kadıköy, Beşiktaş..." />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>MÜLK TİPİ</label>
            <select style={selectStyle} value={piyasa.mulk_tipi} onChange={e=>setPiyasa({...piyasa,mulk_tipi:e.target.value})}>
              {["daire","villa","ofis","dükkan","arsa"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <button onClick={()=>post("/api/v1/analysis/piyasa", piyasa)} disabled={loading||!piyasa.ilce} style={btnStyle(loading||!piyasa.ilce)}>
          {loading?"Analiz Ediliyor...":"Piyasa Analizi Yap"}
        </button>
      </div>
    );

    if (activeTab === "deal") return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[
            {label:"SATIŞ FİYATI (TL)", key:"fiyat", ph:"3500000"},
            {label:"NET M²",            key:"net_m2", ph:"120"},
            {label:"İLÇE",             key:"ilce",   ph:"Kadıköy"},
            {label:"BİNA YAŞI",        key:"bina_yasi",ph:"10"},
            {label:"KAT NO",           key:"kat_no", ph:"3"},
            {label:"TOPLAM KAT",       key:"toplam_kat",ph:"8"},
          ].map(f=>(
            <div key={f.key} style={fieldStyle}>
              <label style={labelStyle}>{f.label}</label>
              <input style={inputStyle} value={(deal as any)[f.key]} onChange={e=>setDeal({...deal,[f.key]:e.target.value})} placeholder={f.ph} />
            </div>
          ))}
          <div style={fieldStyle}>
            <label style={labelStyle}>ODA SAYISI</label>
            <select style={selectStyle} value={deal.oda_sayisi} onChange={e=>setDeal({...deal,oda_sayisi:e.target.value})}>
              {["1+0","1+1","2+1","3+1","4+1","5+1"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <button onClick={()=>post("/api/v1/analysis/deal-score", {
          ...deal, fiyat:parseFloat(deal.fiyat), net_m2:parseFloat(deal.net_m2),
          bina_yasi:parseInt(deal.bina_yasi), kat_no:parseInt(deal.kat_no), toplam_kat:parseInt(deal.toplam_kat)
        })} disabled={loading||!deal.fiyat||!deal.ilce} style={btnStyle(loading||!deal.fiyat||!deal.ilce)}>
          {loading?"Skorlanıyor...":"Deal Skoru Hesapla"}
        </button>
      </div>
    );

    if (activeTab === "bolge") return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
          <div style={fieldStyle}>
            <label style={labelStyle}>İL</label>
            <select style={selectStyle} value={bolge.il} onChange={e=>setBolge({...bolge,il:e.target.value})}>
              {["istanbul","ankara","izmir","bursa","antalya","mugla"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>HEDEF İLÇE</label>
            <input style={inputStyle} value={bolge.ilce} onChange={e=>setBolge({...bolge,ilce:e.target.value})} placeholder="Hakimiyet kurmak istediğiniz ilçe" />
          </div>
        </div>
        <button onClick={()=>post("/api/v1/analysis/bolge-hakimiyet", bolge)} disabled={loading||!bolge.ilce} style={btnStyle(loading||!bolge.ilce)}>
          {loading?"Strateji Oluşturuluyor...":"Hakimiyet Stratejisi Oluştur"}
        </button>
      </div>
    );

    if (activeTab === "risk") return (
      <div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div style={fieldStyle}>
            <label style={labelStyle}>YATIRIM TUTARI (TL)</label>
            <input style={inputStyle} value={risk.yatirim_tutari} onChange={e=>setRisk({...risk,yatirim_tutari:e.target.value})} placeholder="5000000" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>İLÇE</label>
            <input style={inputStyle} value={risk.ilce} onChange={e=>setRisk({...risk,ilce:e.target.value})} placeholder="Esenyurt, Sarıyer..." />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>MÜLK TİPİ</label>
            <select style={selectStyle} value={risk.mulk_tipi} onChange={e=>setRisk({...risk,mulk_tipi:e.target.value})}>
              {["daire","villa","ofis","dükkan","arsa"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>YATIRIM HEDEFİ</label>
            <select style={selectStyle} value={risk.hedef} onChange={e=>setRisk({...risk,hedef:e.target.value})}>
              <option value="kira_geliri">Kira Geliri</option>
              <option value="deger_artisi">Değer Artışı</option>
              <option value="kisa_vadeli_satis">Kısa Vadeli Satış</option>
            </select>
          </div>
        </div>
        <button onClick={()=>post("/api/v1/analysis/risk", {...risk,yatirim_tutari:parseFloat(risk.yatirim_tutari)})} disabled={loading||!risk.yatirim_tutari||!risk.ilce} style={btnStyle(loading||!risk.yatirim_tutari||!risk.ilce)}>
          {loading?"Analiz Ediliyor...":"Risk Analizi Yap"}
        </button>
      </div>
    );
  };

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    background: disabled ? "#161616" : "#FFD700",
    color: disabled ? "#333" : "#000",
    border: "none", borderRadius: 8, padding: "11px 24px",
    fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
    marginTop: 8, letterSpacing: 0.5,
  });

  return (
    <div style={{display:"flex",height:"100vh",background:"#080808",color:"#e0e0e0",fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",overflow:"hidden"}}>

      {/* Sol Panel */}
      <div style={{width:240,borderRight:"1px solid #161616",display:"flex",flexDirection:"column",background:"#0a0a0a",flexShrink:0}}>
        <div style={{padding:"24px 20px 20px",borderBottom:"1px solid #161616"}}>
          <div style={{fontSize:22,color:"#FFD700",letterSpacing:4,fontWeight:300}}>VEGA</div>
          <div style={{fontSize:9,color:"#333",marginTop:3,letterSpacing:4}}>INTELLIGENCE PLATFORM</div>
        </div>
        <nav style={{flex:1,padding:"12px 0",overflowY:"auto"}}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 20px",color:active?"#FFD700":"#555",textDecoration:"none",fontSize:13,borderLeft:active?"2px solid #FFD700":"2px solid transparent",background:active?"rgba(255,215,0,0.06)":"transparent"}}>
                <span style={{fontSize:16,width:20,textAlign:"center"}}>{item.icon}</span>
                <span style={{fontWeight:active?500:400}}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Ana İçerik */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Başlık */}
        <div style={{padding:"20px 28px",borderBottom:"1px solid #161616"}}>
          <div style={{fontSize:18,fontWeight:500}}>Analiz Merkezi</div>
          <div style={{fontSize:12,color:"#444",marginTop:3}}>Piyasa analizi, sözleşme üretici, deal skoru ve risk analizi</div>
        </div>

        {/* Tab Navigation */}
        <div style={{display:"flex",gap:0,borderBottom:"1px solid #161616",padding:"0 28px"}}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={()=>{setActiveTab(tab.id);setResult("");}}
              style={{display:"flex",alignItems:"center",gap:8,padding:"14px 20px",border:"none",borderBottom:`2px solid ${activeTab===tab.id?"#FFD700":"transparent"}`,background:"transparent",color:activeTab===tab.id?"#FFD700":"#444",fontSize:13,cursor:"pointer",fontWeight:activeTab===tab.id?500:400,transition:"all 0.15s"}}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* İçerik */}
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>

          {/* Form */}
          <div style={{width:480,borderRight:"1px solid #161616",padding:"24px 28px",overflowY:"auto",flexShrink:0}}>
            <div style={{fontSize:12,color:"#444",marginBottom:20}}>
              {TABS.find(t=>t.id===activeTab)?.desc}
            </div>
            {renderForm()}
          </div>

          {/* Sonuç */}
          <div style={{flex:1,padding:"24px 28px",overflowY:"auto"}}>
            {loading && (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:12}}>
                <div style={{width:40,height:40,border:"2px solid #FFD700",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}} />
                <div style={{fontSize:13,color:"#444"}}>AI analiz ediyor...</div>
              </div>
            )}
            {!loading && !result && (
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:8}}>
                <div style={{fontSize:32,color:"#1e1e1e"}}>◎</div>
                <div style={{fontSize:13,color:"#333"}}>Formu doldurun ve analizi başlatın</div>
              </div>
            )}
            {!loading && result && (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div style={{fontSize:13,color:"#FFD700",fontWeight:500}}>Analiz Sonucu</div>
                  <button onClick={()=>{navigator.clipboard.writeText(result)}}
                    style={{background:"transparent",border:"1px solid #1e1e1e",borderRadius:6,padding:"5px 12px",color:"#555",fontSize:11,cursor:"pointer"}}>
                    Kopyala
                  </button>
                </div>
                <div style={{background:"#0d0d0d",border:"1px solid #161616",borderRadius:10,padding:"20px 24px",fontSize:13,lineHeight:1.9,color:"rgba(255,255,255,0.75)",whiteSpace:"pre-wrap",fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif"}}>
                  {result}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
