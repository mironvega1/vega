"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Ana Merkez",        icon: "◈" },
  { href: "/analysis",           label: "Analiz Merkezi",    icon: "◎" },
  { href: "/valuation",          label: "AI Değerleme",      icon: "⚡" },
  { href: "/map",                label: "Canlı Harita",      icon: "◉" },
  { href: "/listings",           label: "İlan Yönetimi",     icon: "▦" },
  { href: "/zone-scores",        label: "Bölge Skoru",       icon: "◐" },
  { href: "/bina-karsilastirma", label: "Kat Analizi",       icon: "▤" },
  { href: "/emsal",              label: "Emsal İstihbarat",  icon: "◭" },
  { href: "/report",             label: "PDF Rapor",         icon: "▣" },
];

type Tab = "kira_soz" | "satis_soz" | "adres" | "deal" | "bolge" | "risk";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "kira_soz",  label: "Kira Sözleşmesi",    icon: "▣" },
  { id: "satis_soz", label: "Satış Sözleşmesi",   icon: "◫" },
  { id: "adres",     label: "Adres Analizi",       icon: "◉" },
  { id: "deal",      label: "Deal Skoru",          icon: "◈" },
  { id: "bolge",     label: "Bölge Hakimiyeti",    icon: "◭" },
  { id: "risk",      label: "Risk Analizi",        icon: "◎" },
];

const D = {
  bg:    "#080808",
  bg2:   "#0d0d0d",
  bg3:   "#111",
  brd:   "#1a1a1a",
  brd2:  "#222",
  gold:  "#FFD700",
  text:  "#e0e0e0",
  muted: "#555",
  dim:   "#333",
};

const inp: React.CSSProperties = {
  width:"100%", padding:"9px 12px", borderRadius:7, border:`1px solid ${D.brd2}`,
  background:D.bg3, color:D.text, fontSize:13, outline:"none", boxSizing:"border-box",
  fontFamily:"inherit",
};
const lbl: React.CSSProperties = { fontSize:11, color:D.muted, display:"block", marginBottom:5, letterSpacing:1 };
const fld: React.CSSProperties = { marginBottom:14 };

const ILLER = ["istanbul","ankara","izmir","bursa","antalya","adana","konya","gaziantep","mugla","kayseri","mersin"];

const Inp = ({ label, val, onChange, ph="", type="text" }: any) => (
  <div style={fld}>
    <label style={lbl}>{label}</label>
    <input style={inp} type={type} value={val} onChange={onChange} placeholder={ph} />
  </div>
);

const Sel = ({ label, val, onChange, opts }: any) => (
  <div style={fld}>
    <label style={lbl}>{label}</label>
    <select style={inp} value={val} onChange={onChange}>
      {opts.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const Section = ({ title, step }: { title: string; step?: number }) => (
  <div style={{display:"flex",alignItems:"center",gap:10,marginTop:22,marginBottom:12,paddingBottom:8,borderBottom:`1px solid #1a1a1a`}}>
    {step && <span style={{background:"rgba(255,215,0,0.12)",border:"1px solid rgba(255,215,0,0.25)",color:"#FFD700",fontSize:10,fontWeight:700,width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{step}</span>}
    <span style={{fontSize:11,color:"#FFD700",letterSpacing:2,fontWeight:500}}>{title}</span>
  </div>
);

function downloadPDF(content: string, title: string) {
  const date = new Date().toLocaleDateString('tr-TR');
  const safeContent = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Times New Roman',Times,serif;font-size:11.5pt;line-height:1.85;color:#1a1a1a;background:#fff}
    .page{max-width:21cm;margin:0 auto;padding:2.5cm 3cm}
    .hdr{text-align:center;border-bottom:2px solid #1a1a1a;padding-bottom:14px;margin-bottom:28px}
    .hdr h1{font-size:15pt;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}
    .hdr p{font-size:10pt;color:#666;margin-top:6px}
    .body{white-space:pre-wrap;font-family:'Times New Roman',Times,serif}
    .ftr{margin-top:48px;padding-top:12px;border-top:1px solid #ccc;font-size:8.5pt;color:#aaa;text-align:center}
    @media print{.page{padding:0}@page{margin:2cm 2.5cm;size:A4}}
  </style>
</head>
<body>
  <div class="page">
    <div class="hdr"><h1>${title}</h1><p>${date} &nbsp;·&nbsp; Vega Intelligence Platform</p></div>
    <div class="body">${safeContent}</div>
    <div class="ftr">Bu belge Vega Intelligence Platform tarafından oluşturulmuştur. Hukuki bağlayıcılık için noter onayı gerekebilir.</div>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.print()},400)}</script>
</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export default function AnalysisPage() {
  const pathname = usePathname();
  const [tab, setTab] = useState<Tab>("kira_soz");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  // Kira form
  const [kira, setKira] = useState({
    mulk_il:"istanbul", mulk_ilce:"", mulk_mahalle:"", mulk_sokak:"", mulk_kapi_no:"", mulk_daire_no:"",
    mulk_tip:"Daire", mulk_m2:"", mulk_oda:"3+1", mulk_kat:"", mulk_esyali:"Hayır",
    kira_bedeli:"", odeme_gunu:"Her ayın 1'i", sozlesme_suresi:"1 yıl",
    baslangic_tarihi:"", depozito_ay:"2", artis_orani:"TÜFE",
    kiraci_ad:"", kiraci_soyad:"", kiraci_tc:"", kiraci_telefon:"", kiraci_adres:"",
    ev_sahibi_ad:"", ev_sahibi_soyad:"", ev_sahibi_tc:"", ev_sahibi_telefon:"",
    kefil_ad:"", kefil_soyad:"", kefil_tc:"",
    ozel_sartlar:"",
  });

  // Satış form
  const [satis, setSatis] = useState({
    mulk_il:"istanbul", mulk_ilce:"", mulk_mahalle:"", mulk_sokak:"", mulk_kapi_no:"", mulk_daire_no:"",
    ada_parsel:"", mulk_tip:"Daire", mulk_m2:"", mulk_oda:"3+1",
    satis_bedeli:"", pesınat:"", kalan_odeme:"", odeme_tarihi:"", teslim_tarihi:"",
    cezai_sart:"Satış bedelinin %10'u", ipotek_durumu:"İpotek yok",
    alici_ad:"", alici_soyad:"", alici_tc:"", alici_telefon:"", alici_adres:"",
    satici_ad:"", satici_soyad:"", satici_tc:"", satici_telefon:"", satici_adres:"",
    ozel_sartlar:"",
  });

  // Adres analiz form
  const [adres, setAdres] = useState({
    il:"istanbul", ilce:"", mahalle:"", sokak:"", numara:"", analiz_turu:"piyasa", mulk_tipi:"daire"
  });

  // Deal form
  const [deal, setDeal] = useState({
    fiyat:"", net_m2:"", il:"istanbul", ilce:"", mahalle:"", sokak:"", numara:"",
    oda_sayisi:"3+1", bina_yasi:"", kat_no:"", toplam_kat:"", esyali:"Hayır"
  });

  // Bölge form
  const [bolge, setBolge] = useState({ il:"istanbul", ilce:"", mahalle:"" });

  // Risk form
  const [risk, setRisk] = useState({
    yatirim_tutari:"", il:"istanbul", ilce:"", mahalle:"", mulk_tipi:"daire", hedef:"kira_geliri"
  });

  const post = async (path: string, body: object) => {
    setLoading(true); setResult("");
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
      });
      const d = await res.json();
      setResult(d.sozlesme || d.analiz || d.skor_analizi || d.strateji || d.risk_analizi || JSON.stringify(d,null,2));
    } catch { setResult("Bağlantı hatası."); }
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const renderKira = () => (
    <div>
      {/* Info banner */}
      <div style={{background:"rgba(255,215,0,0.05)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:8,padding:"10px 14px",marginBottom:4}}>
        <div style={{fontSize:12,color:D.gold,fontWeight:500,marginBottom:2}}>▣ TBK Uyumlu Kira Sözleşmesi</div>
        <div style={{fontSize:11,color:D.muted,lineHeight:1.5}}>Tüm alanları doldurun — kefil, TC, depozito ve artış oranı sözleşmeye işlenir.</div>
      </div>

      <Section title="MÜLK BİLGİLERİ" step={1} />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>İL *</label>
          <select style={inp} value={kira.mulk_il} onChange={e=>setKira({...kira,mulk_il:e.target.value})}>
            {ILLER.map(i=><option key={i}>{i}</option>)}
          </select></div>
        <Inp label="İLÇE *" val={kira.mulk_ilce} onChange={(e:any)=>setKira({...kira,mulk_ilce:e.target.value})} ph="Kadıköy" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="MAHALLE *" val={kira.mulk_mahalle} onChange={(e:any)=>setKira({...kira,mulk_mahalle:e.target.value})} ph="Moda" />
        <Inp label="SOKAK / CADDE *" val={kira.mulk_sokak} onChange={(e:any)=>setKira({...kira,mulk_sokak:e.target.value})} ph="Bahariye Cad." />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="KAPI NO" val={kira.mulk_kapi_no} onChange={(e:any)=>setKira({...kira,mulk_kapi_no:e.target.value})} ph="12" />
        <Inp label="DAİRE NO" val={kira.mulk_daire_no} onChange={(e:any)=>setKira({...kira,mulk_daire_no:e.target.value})} ph="5" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>MÜLK TİPİ</label>
          <select style={inp} value={kira.mulk_tip} onChange={e=>setKira({...kira,mulk_tip:e.target.value})}>
            {["Daire","Dükkan","Ofis","Villa","Depo"].map(o=><option key={o}>{o}</option>)}
          </select></div>
        <Inp label="NET M²" val={kira.mulk_m2} onChange={(e:any)=>setKira({...kira,mulk_m2:e.target.value})} ph="120" />
        <div style={fld}><label style={lbl}>ODA</label>
          <select style={inp} value={kira.mulk_oda} onChange={e=>setKira({...kira,mulk_oda:e.target.value})}>
            {["Stüdyo","1+1","2+1","3+1","4+1","5+1"].map(o=><option key={o}>{o}</option>)}
          </select></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="KAT" val={kira.mulk_kat} onChange={(e:any)=>setKira({...kira,mulk_kat:e.target.value})} ph="3" />
        <div style={fld}><label style={lbl}>EŞYALI MI</label>
          <select style={inp} value={kira.mulk_esyali} onChange={e=>setKira({...kira,mulk_esyali:e.target.value})}>
            {["Hayır","Evet","Yarı Eşyalı"].map(o=><option key={o}>{o}</option>)}
          </select></div>
      </div>

      <Section title="KİRA KOŞULLARI" step={2} />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="AYLIK KİRA (TL) *" val={kira.kira_bedeli} onChange={(e:any)=>setKira({...kira,kira_bedeli:e.target.value})} ph="25.000" />
        <Inp label="ÖDEME GÜNÜ" val={kira.odeme_gunu} onChange={(e:any)=>setKira({...kira,odeme_gunu:e.target.value})} ph="Her ayın 1'i" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>SÖZLEŞME SÜRESİ</label>
          <select style={inp} value={kira.sozlesme_suresi} onChange={e=>setKira({...kira,sozlesme_suresi:e.target.value})}>
            {["6 ay","1 yıl","2 yıl","3 yıl"].map(o=><option key={o}>{o}</option>)}
          </select></div>
        <Inp label="BAŞLANGIÇ TARİHİ *" val={kira.baslangic_tarihi} onChange={(e:any)=>setKira({...kira,baslangic_tarihi:e.target.value})} ph="01/06/2026" type="text" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>DEPOZİTO</label>
          <select style={inp} value={kira.depozito_ay} onChange={e=>setKira({...kira,depozito_ay:e.target.value})}>
            {["1","2","3"].map(o=><option key={o}>{o + " aylık kira"}</option>)}
          </select></div>
        <div style={fld}><label style={lbl}>KİRA ARTIŞ ORANI</label>
          <select style={inp} value={kira.artis_orani} onChange={e=>setKira({...kira,artis_orani:e.target.value})}>
            {["TÜFE","ÜFE","TÜFE+ÜFE Ort.","Sabit %25"].map(o=><option key={o}>{o}</option>)}
          </select></div>
      </div>

      <Section title="KİRACI BİLGİLERİ" step={3} />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="AD *" val={kira.kiraci_ad} onChange={(e:any)=>setKira({...kira,kiraci_ad:e.target.value})} ph="Ahmet" />
        <Inp label="SOYAD *" val={kira.kiraci_soyad} onChange={(e:any)=>setKira({...kira,kiraci_soyad:e.target.value})} ph="Yılmaz" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="TC KİMLİK NO *" val={kira.kiraci_tc} onChange={(e:any)=>setKira({...kira,kiraci_tc:e.target.value})} ph="12345678901" />
        <Inp label="TELEFON" val={kira.kiraci_telefon} onChange={(e:any)=>setKira({...kira,kiraci_telefon:e.target.value})} ph="0532 xxx xx xx" />
      </div>
      <Inp label="MEVCUT ADRES" val={kira.kiraci_adres} onChange={(e:any)=>setKira({...kira,kiraci_adres:e.target.value})} ph="İstanbul, Şişli, Halaskargazi Cad. No:45" />

      <Section title="KİRAYA VEREN BİLGİLERİ" step={4} />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="AD *" val={kira.ev_sahibi_ad} onChange={(e:any)=>setKira({...kira,ev_sahibi_ad:e.target.value})} ph="Fatma" />
        <Inp label="SOYAD *" val={kira.ev_sahibi_soyad} onChange={(e:any)=>setKira({...kira,ev_sahibi_soyad:e.target.value})} ph="Demir" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="TC KİMLİK NO" val={kira.ev_sahibi_tc} onChange={(e:any)=>setKira({...kira,ev_sahibi_tc:e.target.value})} ph="98765432109" />
        <Inp label="TELEFON" val={kira.ev_sahibi_telefon} onChange={(e:any)=>setKira({...kira,ev_sahibi_telefon:e.target.value})} ph="0542 xxx xx xx" />
      </div>

      <Section title="KEFİL (Opsiyonel)" step={5} />
      <div style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${D.brd}`,borderRadius:8,padding:"12px",marginBottom:4}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          <Inp label="AD" val={kira.kefil_ad} onChange={(e:any)=>setKira({...kira,kefil_ad:e.target.value})} ph="Mehmet" />
          <Inp label="SOYAD" val={kira.kefil_soyad} onChange={(e:any)=>setKira({...kira,kefil_soyad:e.target.value})} ph="Kaya" />
          <Inp label="TC KİMLİK NO" val={kira.kefil_tc} onChange={(e:any)=>setKira({...kira,kefil_tc:e.target.value})} ph="11122233344" />
        </div>
      </div>

      <Section title="ÖZEL ŞARTLAR" step={6} />
      <div style={fld}>
        <textarea style={{...inp,height:90,resize:"vertical",lineHeight:1.6}}
          value={kira.ozel_sartlar}
          onChange={e=>setKira({...kira,ozel_sartlar:e.target.value})}
          placeholder="Örn: Evcil hayvan yasak. Aidat kiracıya ait. İzinsiz tadilat yapılamaz..." />
        <div style={{fontSize:10,color:D.dim,marginTop:4}}>Boş bırakabilirsiniz — standart şartlar otomatik eklenir.</div>
      </div>

      <button
        style={{background:loading||!kira.mulk_ilce||!kira.kiraci_ad||!kira.kira_bedeli?D.brd:D.gold,
          color:loading||!kira.mulk_ilce||!kira.kiraci_ad||!kira.kira_bedeli?D.muted:"#000",
          border:"none",borderRadius:8,padding:"13px 24px",fontSize:13,fontWeight:700,
          cursor:loading||!kira.mulk_ilce||!kira.kiraci_ad||!kira.kira_bedeli?"not-allowed":"pointer",
          width:"100%",marginTop:8,letterSpacing:0.3}}
        onClick={()=>post("/api/v1/analysis/sozlesme/kira", kira)}
        disabled={loading||!kira.mulk_ilce||!kira.kiraci_ad||!kira.kira_bedeli}>
        {loading ? "Sözleşme Hazırlanıyor..." : "Kira Sözleşmesi Oluştur →"}
      </button>
      <div style={{textAlign:"center",fontSize:10,color:D.dim,marginTop:8}}>
        İlçe · Kiracı adı · Kira bedeli zorunludur
      </div>
    </div>
  );

  const renderSatis = () => (
    <div>
      <div style={{background:"rgba(255,215,0,0.05)",border:"1px solid rgba(255,215,0,0.15)",borderRadius:8,padding:"10px 14px",marginBottom:4}}>
        <div style={{fontSize:12,color:D.gold,fontWeight:500,marginBottom:2}}>◫ Satış Ön Sözleşmesi (Promesse)</div>
        <div style={{fontSize:11,color:D.muted,lineHeight:1.5}}>Ada/parsel, ödeme planı ve cezai şart dahil tam tapu devir belgesi.</div>
      </div>
      <Section title="TAŞINMAZ BİLGİLERİ" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>İL *</label>
          <select style={inp} value={satis.mulk_il} onChange={e=>setSatis({...satis,mulk_il:e.target.value})}>
            {ILLER.map(i=><option key={i}>{i}</option>)}
          </select></div>
        <Inp label="İLÇE *" val={satis.mulk_ilce} onChange={(e:any)=>setSatis({...satis,mulk_ilce:e.target.value})} ph="Beşiktaş" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="MAHALLE *" val={satis.mulk_mahalle} onChange={(e:any)=>setSatis({...satis,mulk_mahalle:e.target.value})} ph="Levent" />
        <Inp label="SOKAK *" val={satis.mulk_sokak} onChange={(e:any)=>setSatis({...satis,mulk_sokak:e.target.value})} ph="Büyükdere Cad." />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <Inp label="KAPI NO *" val={satis.mulk_kapi_no} onChange={(e:any)=>setSatis({...satis,mulk_kapi_no:e.target.value})} ph="45" />
        <Inp label="DAİRE NO" val={satis.mulk_daire_no} onChange={(e:any)=>setSatis({...satis,mulk_daire_no:e.target.value})} ph="12" />
        <Inp label="ADA/PARSEL" val={satis.ada_parsel} onChange={(e:any)=>setSatis({...satis,ada_parsel:e.target.value})} ph="123/4" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>MÜLK TİPİ</label>
          <select style={inp} value={satis.mulk_tip} onChange={e=>setSatis({...satis,mulk_tip:e.target.value})}>
            {["Daire","Villa","Dükkan","Ofis","Arsa"].map(o=><option key={o}>{o}</option>)}
          </select></div>
        <Inp label="NET M² *" val={satis.mulk_m2} onChange={(e:any)=>setSatis({...satis,mulk_m2:e.target.value})} ph="150" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>İPOTEK DURUMU</label>
          <select style={inp} value={satis.ipotek_durumu} onChange={e=>setSatis({...satis,ipotek_durumu:e.target.value})}>
            {["İpotek yok","İpotek var - devir öncesi kalkacak","Alıcı devralacak"].map(o=><option key={o}>{o}</option>)}
          </select></div>
        <div style={fld}><label style={lbl}>ODA SAYISI</label>
          <select style={inp} value={satis.mulk_oda} onChange={e=>setSatis({...satis,mulk_oda:e.target.value})}>
            {["1+1","2+1","3+1","4+1","5+1"].map(o=><option key={o}>{o}</option>)}
          </select></div>
      </div>

      <Section title="SATIŞ KOŞULLARI" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="SATIŞ BEDELİ (TL) *" val={satis.satis_bedeli} onChange={(e:any)=>setSatis({...satis,satis_bedeli:e.target.value})} ph="5000000" />
        <Inp label="PEŞİNAT (TL) *" val={satis.pesınat} onChange={(e:any)=>setSatis({...satis,pesınat:e.target.value})} ph="1000000" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="KALAN TUTAR (TL)" val={satis.kalan_odeme} onChange={(e:any)=>setSatis({...satis,kalan_odeme:e.target.value})} ph="4000000" />
        <Inp label="KALAN ÖDEME TARİHİ" val={satis.odeme_tarihi} onChange={(e:any)=>setSatis({...satis,odeme_tarihi:e.target.value})} ph="01/09/2026" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="TESLİM TARİHİ" val={satis.teslim_tarihi} onChange={(e:any)=>setSatis({...satis,teslim_tarihi:e.target.value})} ph="01/09/2026" />
        <Inp label="CEZAİ ŞART" val={satis.cezai_sart} onChange={(e:any)=>setSatis({...satis,cezai_sart:e.target.value})} ph="Satış bedelinin %10'u" />
      </div>

      <Section title="ALICI BİLGİLERİ" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="AD *" val={satis.alici_ad} onChange={(e:any)=>setSatis({...satis,alici_ad:e.target.value})} ph="Ali" />
        <Inp label="SOYAD *" val={satis.alici_soyad} onChange={(e:any)=>setSatis({...satis,alici_soyad:e.target.value})} ph="Çelik" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="TC" val={satis.alici_tc} onChange={(e:any)=>setSatis({...satis,alici_tc:e.target.value})} ph="12345678901" />
        <Inp label="TELEFON" val={satis.alici_telefon} onChange={(e:any)=>setSatis({...satis,alici_telefon:e.target.value})} ph="0532 xxx xx xx" />
      </div>
      <Inp label="ADRES" val={satis.alici_adres} onChange={(e:any)=>setSatis({...satis,alici_adres:e.target.value})} ph="Ankara, Çankaya..." />

      <Section title="SATICI BİLGİLERİ" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="AD *" val={satis.satici_ad} onChange={(e:any)=>setSatis({...satis,satici_ad:e.target.value})} ph="Zeynep" />
        <Inp label="SOYAD *" val={satis.satici_soyad} onChange={(e:any)=>setSatis({...satis,satici_soyad:e.target.value})} ph="Arslan" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="TC" val={satis.satici_tc} onChange={(e:any)=>setSatis({...satis,satici_tc:e.target.value})} ph="98765432109" />
        <Inp label="TELEFON" val={satis.satici_telefon} onChange={(e:any)=>setSatis({...satis,satici_telefon:e.target.value})} ph="0542 xxx xx xx" />
      </div>
      <Inp label="ADRES" val={satis.satici_adres} onChange={(e:any)=>setSatis({...satis,satici_adres:e.target.value})} ph="İstanbul, Beşiktaş..." />

      <Section title="ÖZEL ŞARTLAR" />
      <div style={fld}><textarea style={{...inp,height:80,resize:"vertical"}} value={satis.ozel_sartlar}
        onChange={e=>setSatis({...satis,ozel_sartlar:e.target.value})}
        placeholder="Mutfak eşyaları dahil. Balkon tadilat alıcıya ait..." /></div>

      <button style={{background:loading||!satis.mulk_ilce||!satis.alici_ad?D.brd:D.gold,color:loading||!satis.mulk_ilce||!satis.alici_ad?D.muted:"#000",
        border:"none",borderRadius:8,padding:"12px 24px",fontSize:13,fontWeight:700,cursor:loading||!satis.mulk_ilce||!satis.alici_ad?"not-allowed":"pointer",width:"100%",marginTop:8}}
        onClick={()=>post("/api/v1/analysis/sozlesme/satis", satis)} disabled={loading||!satis.mulk_ilce||!satis.alici_ad}>
        {loading?"Sözleşme Hazırlanıyor...":"Satış Ön Sözleşmesi Oluştur"}
      </button>
    </div>
  );

  const renderAdres = () => (
    <div>
      <div style={{background:"rgba(255,215,0,0.06)",border:`1px solid rgba(255,215,0,0.15)`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:D.gold}}>
        Mahalle + sokak + numara girerek sokak bazında analiz alın
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>İL *</label>
          <select style={inp} value={adres.il} onChange={e=>setAdres({...adres,il:e.target.value})}>
            {ILLER.map(i=><option key={i}>{i}</option>)}
          </select></div>
        <Inp label="İLÇE *" val={adres.ilce} onChange={(e:any)=>setAdres({...adres,ilce:e.target.value})} ph="Kadıköy" />
      </div>
      <Inp label="MAHALLE *" val={adres.mahalle} onChange={(e:any)=>setAdres({...adres,mahalle:e.target.value})} ph="Moda Mahallesi" />
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
        <Inp label="SOKAK / CADDE" val={adres.sokak} onChange={(e:any)=>setAdres({...adres,sokak:e.target.value})} ph="Bahariye Cad." />
        <Inp label="KAPI NO" val={adres.numara} onChange={(e:any)=>setAdres({...adres,numara:e.target.value})} ph="45" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>ANALİZ TÜRÜ</label>
          <select style={inp} value={adres.analiz_turu} onChange={e=>setAdres({...adres,analiz_turu:e.target.value})}>
            <option value="piyasa">Piyasa Analizi</option>
            <option value="yatirim">Yatırım Analizi</option>
            <option value="kira_getiri">Kira Getiri Analizi</option>
            <option value="rekabet">Rekabet Analizi</option>
          </select></div>
        <div style={fld}><label style={lbl}>MÜLK TİPİ</label>
          <select style={inp} value={adres.mulk_tipi} onChange={e=>setAdres({...adres,mulk_tipi:e.target.value})}>
            {["daire","villa","ofis","dükkan","arsa"].map(o=><option key={o}>{o}</option>)}
          </select></div>
      </div>
      <button style={{background:loading||!adres.ilce||!adres.mahalle?D.brd:D.gold,color:loading||!adres.ilce||!adres.mahalle?D.muted:"#000",
        border:"none",borderRadius:8,padding:"12px",fontSize:13,fontWeight:700,cursor:loading||!adres.ilce||!adres.mahalle?"not-allowed":"pointer",width:"100%",marginTop:8}}
        onClick={()=>post("/api/v1/analysis/adres-analiz",adres)} disabled={loading||!adres.ilce||!adres.mahalle}>
        {loading?"Analiz Ediliyor...":"Adres Analizi Yap"}
      </button>
    </div>
  );

  const renderDeal = () => (
    <div>
      <div style={{background:"rgba(255,215,0,0.06)",border:`1px solid rgba(255,215,0,0.15)`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:D.gold}}>
        Tam adres + fiyat girerek o mülkün fırsatı mı pahalı mı olduğunu öğrenin
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="SATIŞ FİYATI (TL) *" val={deal.fiyat} onChange={(e:any)=>setDeal({...deal,fiyat:e.target.value})} ph="4500000" />
        <Inp label="NET M² *" val={deal.net_m2} onChange={(e:any)=>setDeal({...deal,net_m2:e.target.value})} ph="120" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>İL *</label>
          <select style={inp} value={deal.il} onChange={e=>setDeal({...deal,il:e.target.value})}>
            {ILLER.map(i=><option key={i}>{i}</option>)}
          </select></div>
        <Inp label="İLÇE *" val={deal.ilce} onChange={(e:any)=>setDeal({...deal,ilce:e.target.value})} ph="Kadıköy" />
      </div>
      <Inp label="MAHALLE *" val={deal.mahalle} onChange={(e:any)=>setDeal({...deal,mahalle:e.target.value})} ph="Moda" />
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:10}}>
        <Inp label="SOKAK" val={deal.sokak} onChange={(e:any)=>setDeal({...deal,sokak:e.target.value})} ph="Bahariye Cad." />
        <Inp label="NO" val={deal.numara} onChange={(e:any)=>setDeal({...deal,numara:e.target.value})} ph="45" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        <Inp label="BİNA YAŞI" val={deal.bina_yasi} onChange={(e:any)=>setDeal({...deal,bina_yasi:e.target.value})} ph="10" />
        <Inp label="KAT NO" val={deal.kat_no} onChange={(e:any)=>setDeal({...deal,kat_no:e.target.value})} ph="3" />
        <Inp label="TOPLAM KAT" val={deal.toplam_kat} onChange={(e:any)=>setDeal({...deal,toplam_kat:e.target.value})} ph="8" />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>ODA</label>
          <select style={inp} value={deal.oda_sayisi} onChange={e=>setDeal({...deal,oda_sayisi:e.target.value})}>
            {["1+0","1+1","2+1","3+1","4+1","5+1"].map(o=><option key={o}>{o}</option>)}
          </select></div>
        <div style={fld}><label style={lbl}>EŞYALI</label>
          <select style={inp} value={deal.esyali} onChange={e=>setDeal({...deal,esyali:e.target.value})}>
            {["Hayır","Evet"].map(o=><option key={o}>{o}</option>)}
          </select></div>
      </div>
      <button style={{background:loading||!deal.fiyat||!deal.ilce||!deal.mahalle?D.brd:D.gold,color:loading||!deal.fiyat||!deal.ilce||!deal.mahalle?D.muted:"#000",
        border:"none",borderRadius:8,padding:"12px",fontSize:13,fontWeight:700,cursor:loading||!deal.fiyat||!deal.ilce||!deal.mahalle?"not-allowed":"pointer",width:"100%",marginTop:8}}
        onClick={()=>post("/api/v1/analysis/deal-score",{...deal,fiyat:parseFloat(deal.fiyat),net_m2:parseFloat(deal.net_m2),bina_yasi:parseInt(deal.bina_yasi),kat_no:parseInt(deal.kat_no),toplam_kat:parseInt(deal.toplam_kat)})}
        disabled={loading||!deal.fiyat||!deal.ilce||!deal.mahalle}>
        {loading?"Skorlanıyor...":"Deal Skoru Hesapla"}
      </button>
    </div>
  );

  const renderBolge = () => (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>İL *</label>
          <select style={inp} value={bolge.il} onChange={e=>setBolge({...bolge,il:e.target.value})}>
            {ILLER.map(i=><option key={i}>{i}</option>)}
          </select></div>
        <Inp label="İLÇE *" val={bolge.ilce} onChange={(e:any)=>setBolge({...bolge,ilce:e.target.value})} ph="Esenyurt" />
      </div>
      <Inp label="MAHALLE (opsiyonel)" val={bolge.mahalle} onChange={(e:any)=>setBolge({...bolge,mahalle:e.target.value})} ph="Birlik Mah." />
      <button style={{background:loading||!bolge.ilce?D.brd:D.gold,color:loading||!bolge.ilce?D.muted:"#000",
        border:"none",borderRadius:8,padding:"12px",fontSize:13,fontWeight:700,cursor:loading||!bolge.ilce?"not-allowed":"pointer",width:"100%",marginTop:8}}
        onClick={()=>post("/api/v1/analysis/bolge-hakimiyet",bolge)} disabled={loading||!bolge.ilce}>
        {loading?"Strateji Oluşturuluyor...":"Hakimiyet Stratejisi Oluştur"}
      </button>
    </div>
  );

  const renderRisk = () => (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Inp label="YATIRIM TUTARI (TL) *" val={risk.yatirim_tutari} onChange={(e:any)=>setRisk({...risk,yatirim_tutari:e.target.value})} ph="5000000" />
        <div style={fld}><label style={lbl}>İL *</label>
          <select style={inp} value={risk.il} onChange={e=>setRisk({...risk,il:e.target.value})}>
            {ILLER.map(i=><option key={i}>{i}</option>)}
          </select></div>
      </div>
      <Inp label="İLÇE *" val={risk.ilce} onChange={(e:any)=>setRisk({...risk,ilce:e.target.value})} ph="Sarıyer" />
      <Inp label="MAHALLE *" val={risk.mahalle} onChange={(e:any)=>setRisk({...risk,mahalle:e.target.value})} ph="Zekeriyaköy" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={fld}><label style={lbl}>MÜLK TİPİ</label>
          <select style={inp} value={risk.mulk_tipi} onChange={e=>setRisk({...risk,mulk_tipi:e.target.value})}>
            {["daire","villa","ofis","dükkan","arsa"].map(o=><option key={o}>{o}</option>)}
          </select></div>
        <div style={fld}><label style={lbl}>HEDEF</label>
          <select style={inp} value={risk.hedef} onChange={e=>setRisk({...risk,hedef:e.target.value})}>
            <option value="kira_geliri">Kira Geliri</option>
            <option value="deger_artisi">Değer Artışı</option>
            <option value="kisa_vadeli_satis">Kısa Vadeli Satış</option>
          </select></div>
      </div>
      <button style={{background:loading||!risk.ilce||!risk.mahalle?D.brd:D.gold,color:loading||!risk.ilce||!risk.mahalle?D.muted:"#000",
        border:"none",borderRadius:8,padding:"12px",fontSize:13,fontWeight:700,cursor:loading||!risk.ilce||!risk.mahalle?"not-allowed":"pointer",width:"100%",marginTop:8}}
        onClick={()=>post("/api/v1/analysis/risk",{...risk,yatirim_tutari:parseFloat(risk.yatirim_tutari)})} disabled={loading||!risk.ilce||!risk.mahalle}>
        {loading?"Analiz Ediliyor...":"Risk Analizi Yap"}
      </button>
    </div>
  );

  const renderMap: Record<Tab, ()=>React.ReactNode> = {
    kira_soz: renderKira, satis_soz: renderSatis,
    adres: renderAdres, deal: renderDeal, bolge: renderBolge, risk: renderRisk
  };

  return (
    <div style={{display:"flex",height:"100vh",background:D.bg,color:D.text,fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",overflow:"hidden"}}>
      {/* Sol Nav */}
      <div style={{width:220,borderRight:`1px solid ${D.brd}`,display:"flex",flexDirection:"column",background:"#0a0a0a",flexShrink:0}}>
        <div style={{padding:"22px 18px 18px",borderBottom:`1px solid ${D.brd}`}}>
          <div style={{fontSize:20,color:D.gold,letterSpacing:4,fontWeight:300}}>VEGA</div>
          <div style={{fontSize:9,color:D.dim,marginTop:3,letterSpacing:4}}>INTELLIGENCE PLATFORM</div>
        </div>
        <nav style={{flex:1,padding:"10px 0",overflowY:"auto"}}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 18px",color:active?D.gold:D.muted,textDecoration:"none",fontSize:12,borderLeft:active?`2px solid ${D.gold}`:`2px solid transparent`,background:active?"rgba(255,215,0,0.05)":"transparent"}}>
                <span style={{fontSize:15,width:18,textAlign:"center"}}>{item.icon}</span>
                <span style={{fontWeight:active?500:400}}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Ana İçerik */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Başlık */}
        <div style={{padding:"18px 24px",borderBottom:`1px solid ${D.brd}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:16,fontWeight:500}}>Analiz Merkezi</div>
            <div style={{fontSize:11,color:D.muted,marginTop:2}}>Sözleşme üretici · Adres analizi · Deal skoru · Risk raporu</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",borderBottom:`1px solid ${D.brd}`,padding:"0 24px",overflowX:"auto"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setResult("");}}
              style={{display:"flex",alignItems:"center",gap:6,padding:"12px 16px",border:"none",
                borderBottom:`2px solid ${tab===t.id?D.gold:"transparent"}`,background:"transparent",
                color:tab===t.id?D.gold:D.muted,fontSize:12,cursor:"pointer",whiteSpace:"nowrap",fontWeight:tab===t.id?500:400}}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* İçerik */}
        <div style={{flex:1,display:"flex",overflow:"hidden"}}>
          {/* Form */}
          <div style={{width:460,borderRight:`1px solid ${D.brd}`,overflowY:"auto",padding:"20px 24px",flexShrink:0}}>
            {renderMap[tab]?.()}
          </div>

          {/* Sonuç */}
          <div style={{flex:1,overflowY:"auto",padding:"20px 24px",background:D.bg}}>
            {loading && (
              <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12}}>
                <div style={{width:36,height:36,border:`2px solid ${D.gold}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
                <div style={{fontSize:12,color:D.muted}}>AI analiz ediyor...</div>
              </div>
            )}
            {!loading && !result && (
              <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
                <div style={{fontSize:36,color:D.brd}}>◎</div>
                <div style={{fontSize:12,color:D.dim}}>Formu doldurun ve analizi başlatın</div>
              </div>
            )}
            {!loading && result && (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div style={{fontSize:12,color:D.gold,fontWeight:500,letterSpacing:1}}>SONUÇ</div>
                  <div style={{display:"flex",gap:8}}>
                    {(tab === "kira_soz" || tab === "satis_soz") && (
                      <button onClick={() => downloadPDF(result, tab === "kira_soz" ? "Kira Sözleşmesi" : "Satış Ön Sözleşmesi")}
                        style={{background:"rgba(255,215,0,0.1)",border:`1px solid rgba(255,215,0,0.3)`,borderRadius:6,padding:"5px 14px",color:D.gold,fontSize:11,cursor:"pointer",fontWeight:500}}>
                        PDF İndir
                      </button>
                    )}
                    <button onClick={copy} style={{background:"transparent",border:`1px solid ${D.brd2}`,borderRadius:6,padding:"5px 14px",color:copied?D.gold:D.muted,fontSize:11,cursor:"pointer"}}>
                      {copied?"Kopyalandı ✓":"Kopyala"}
                    </button>
                  </div>
                </div>
                <div style={{background:D.bg2,border:`1px solid ${D.brd}`,borderRadius:10,padding:"20px",fontSize:13,lineHeight:1.9,color:"rgba(255,255,255,0.8)",whiteSpace:"pre-wrap",fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif"}}>
                  {result}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *::-webkit-scrollbar{width:4px} *::-webkit-scrollbar-track{background:transparent} *::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px}`}</style>
    </div>
  );
}
