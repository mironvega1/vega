"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Ana Merkez",           icon: "◈" },
  { href: "/ai",                 label: "Emlak Yapay Zekası",   icon: "◈" },
  { href: "/sozlesme",           label: "Sözleşme Merkezi",     icon: "▣" },
  { href: "/analysis",           label: "Analiz Merkezi",       icon: "◎" },
  { href: "/valuation",          label: "AI Değerleme",         icon: "⚡" },
  { href: "/map",                label: "Canlı Harita",         icon: "◉" },
  { href: "/listings",           label: "İlan Yönetimi",        icon: "▦" },
  { href: "/zone-scores",        label: "Bölge Skoru",          icon: "◐" },
  { href: "/bina-karsilastirma", label: "Kat Analizi",          icon: "▤" },
  { href: "/emsal",              label: "Emsal İstihbarat",     icon: "◭" },
  { href: "/report",             label: "PDF Rapor",            icon: "▣" },
];

type SozlesmeType = "kira" | "satis";

const SOZLESME_CARDS = [
  {
    id: "kira" as SozlesmeType,
    title: "Kira Sözleşmesi",
    desc: "TBK uyumlu, kefil ve depozito dahil tam kira sözleşmesi oluşturun.",
    detail: "Mülk bilgileri, kiracı/kiraya veren TC kimlik, kefil, depozito, artış oranı ve özel şartlar dahil kapsamlı kira sözleşmesi. PDF olarak indirilebilir.",
    accent: "#FFD700",
    icon: "▣",
    tag: "TBK Uyumlu",
  },
  {
    id: "satis" as SozlesmeType,
    title: "Satış Ön Sözleşmesi",
    desc: "Ada/parsel, ödeme planı ve cezai şart dahil tapu devir belgesi oluşturun.",
    detail: "Taşınmaz bilgileri, alıcı/satıcı bilgileri, ödeme planı, peşinat, kalan tutar, teslim tarihi ve cezai şart ile tam promesse belgesi. PDF olarak indirilebilir.",
    accent: "#22c55e",
    icon: "◫",
    tag: "Promesse",
  },
];

const D = {
  bg: "#080808", bg2: "#0d0d0d", bg3: "#111",
  brd: "#1a1a1a", brd2: "#222",
  gold: "#FFD700", text: "#e0e0e0", muted: "#555", dim: "#333",
};

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 7, border: `1px solid ${D.brd2}`,
  background: D.bg3, color: D.text, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
const lbl: React.CSSProperties = { fontSize: 11, color: D.muted, display: "block", marginBottom: 5, letterSpacing: 1 };
const fld: React.CSSProperties = { marginBottom: 14 };
const ILLER = ["istanbul","ankara","izmir","bursa","antalya","adana","konya","gaziantep","mugla","kayseri","mersin"];

const Inp = ({ label, val, onChange, ph = "", type = "text" }: any) => (
  <div style={fld}>
    <label style={lbl}>{label}</label>
    <input style={inp} type={type} value={val} onChange={onChange} placeholder={ph} />
  </div>
);

const Section = ({ title, step }: { title: string; step?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #1a1a1a" }}>
    {step && <span style={{ background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.25)", color: D.gold, fontSize: 10, fontWeight: 700, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{step}</span>}
    <span style={{ fontSize: 11, color: D.gold, letterSpacing: 2, fontWeight: 500 }}>{title}</span>
  </div>
);

function downloadPDF(content: string, title: string) {
  const date = new Date().toLocaleDateString("tr-TR");
  const safeContent = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>${title}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Times New Roman',Times,serif;font-size:11.5pt;line-height:1.85;color:#1a1a1a;background:#fff}.page{max-width:21cm;margin:0 auto;padding:2.5cm 3cm}.hdr{text-align:center;border-bottom:2px solid #1a1a1a;padding-bottom:14px;margin-bottom:28px}.hdr h1{font-size:15pt;font-weight:700;letter-spacing:1.5px;text-transform:uppercase}.hdr p{font-size:10pt;color:#666;margin-top:6px}.body{white-space:pre-wrap;font-family:'Times New Roman',Times,serif}.ftr{margin-top:48px;padding-top:12px;border-top:1px solid #ccc;font-size:8.5pt;color:#aaa;text-align:center}@media print{.page{padding:0}@page{margin:2cm 2.5cm;size:A4}}</style></head><body><div class="page"><div class="hdr"><h1>${title}</h1><p>${date} &nbsp;·&nbsp; Vega Intelligence Platform</p></div><div class="body">${safeContent}</div><div class="ftr">Bu belge Vega Intelligence Platform tarafından oluşturulmuştur. Hukuki bağlayıcılık için noter onayı gerekebilir.</div></div><script>window.onload=function(){setTimeout(function(){window.print()},400)}</script></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export default function SozlesmePage() {
  const pathname = usePathname();
  const [selected, setSelected] = useState<SozlesmeType | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const [kira, setKira] = useState({
    mulk_il: "istanbul", mulk_ilce: "", mulk_mahalle: "", mulk_sokak: "", mulk_kapi_no: "", mulk_daire_no: "",
    mulk_tip: "Daire", mulk_m2: "", mulk_oda: "3+1", mulk_kat: "", mulk_esyali: "Hayır",
    kira_bedeli: "", odeme_gunu: "Her ayın 1'i", sozlesme_suresi: "1 yıl",
    baslangic_tarihi: "", depozito_ay: "2", artis_orani: "TUFE",
    kiraci_ad: "", kiraci_soyad: "", kiraci_tc: "", kiraci_telefon: "", kiraci_adres: "",
    ev_sahibi_ad: "", ev_sahibi_soyad: "", ev_sahibi_tc: "", ev_sahibi_telefon: "",
    kefil_ad: "", kefil_soyad: "", kefil_tc: "", ozel_sartlar: "",
  });

  const [satis, setSatis] = useState({
    mulk_il: "istanbul", mulk_ilce: "", mulk_mahalle: "", mulk_sokak: "", mulk_kapi_no: "", mulk_daire_no: "",
    ada_parsel: "", mulk_tip: "Daire", mulk_m2: "", mulk_oda: "3+1",
    satis_bedeli: "", pesınat: "", kalan_odeme: "", odeme_tarihi: "", teslim_tarihi: "",
    cezai_sart: "Satış bedelinin %10'u", ipotek_durumu: "Ipotek yok",
    alici_ad: "", alici_soyad: "", alici_tc: "", alici_telefon: "", alici_adres: "",
    satici_ad: "", satici_soyad: "", satici_tc: "", satici_telefon: "", satici_adres: "",
    ozel_sartlar: "",
  });

  const post = async (path: string, body: object) => {
    setLoading(true); setResult("");
    try {
      const res = await fetch(`${API_URL}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json();
      setResult(d.sozlesme || JSON.stringify(d, null, 2));
    } catch { setResult("Bağlantı hatası."); }
    setLoading(false);
  };

  const copy = () => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const activeCard = SOZLESME_CARDS.find(c => c.id === selected);

  const renderKira = () => (
    <div>
      <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 4 }}>
        <div style={{ fontSize: 12, color: D.gold, fontWeight: 500, marginBottom: 2 }}>TBK Uyumlu Kira Sozlesmesi</div>
        <div style={{ fontSize: 11, color: D.muted, lineHeight: 1.5 }}>Tüm alanları doldurun — kefil, TC, depozito ve artış oranı sözleşmeye işlenir.</div>
      </div>
      <Section title="MULK BILGILERI" step={1} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>IL *</label>
          <select style={inp} value={kira.mulk_il} onChange={e => setKira({ ...kira, mulk_il: e.target.value })}>
            {ILLER.map(i => <option key={i}>{i}</option>)}
          </select></div>
        <Inp label="ILCE *" val={kira.mulk_ilce} onChange={(e: any) => setKira({ ...kira, mulk_ilce: e.target.value })} ph="Kadıköy" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="MAHALLE *" val={kira.mulk_mahalle} onChange={(e: any) => setKira({ ...kira, mulk_mahalle: e.target.value })} ph="Moda" />
        <Inp label="SOKAK / CADDE *" val={kira.mulk_sokak} onChange={(e: any) => setKira({ ...kira, mulk_sokak: e.target.value })} ph="Bahariye Cad." />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="KAPI NO" val={kira.mulk_kapi_no} onChange={(e: any) => setKira({ ...kira, mulk_kapi_no: e.target.value })} ph="12" />
        <Inp label="DAIRE NO" val={kira.mulk_daire_no} onChange={(e: any) => setKira({ ...kira, mulk_daire_no: e.target.value })} ph="5" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>MULK TIPI</label>
          <select style={inp} value={kira.mulk_tip} onChange={e => setKira({ ...kira, mulk_tip: e.target.value })}>
            {["Daire", "Dükkan", "Ofis", "Villa", "Depo"].map(o => <option key={o}>{o}</option>)}
          </select></div>
        <Inp label="NET M²" val={kira.mulk_m2} onChange={(e: any) => setKira({ ...kira, mulk_m2: e.target.value })} ph="120" />
        <div style={fld}><label style={lbl}>ODA</label>
          <select style={inp} value={kira.mulk_oda} onChange={e => setKira({ ...kira, mulk_oda: e.target.value })}>
            {["Stüdyo", "1+1", "2+1", "3+1", "4+1", "5+1"].map(o => <option key={o}>{o}</option>)}
          </select></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="KAT" val={kira.mulk_kat} onChange={(e: any) => setKira({ ...kira, mulk_kat: e.target.value })} ph="3" />
        <div style={fld}><label style={lbl}>ESYALI MI</label>
          <select style={inp} value={kira.mulk_esyali} onChange={e => setKira({ ...kira, mulk_esyali: e.target.value })}>
            {["Hayır", "Evet", "Yarı Eşyalı"].map(o => <option key={o}>{o}</option>)}
          </select></div>
      </div>
      <Section title="KIRA KOSULLARI" step={2} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="AYLIK KIRA (TL) *" val={kira.kira_bedeli} onChange={(e: any) => setKira({ ...kira, kira_bedeli: e.target.value })} ph="25.000" />
        <Inp label="ODEME GUNU" val={kira.odeme_gunu} onChange={(e: any) => setKira({ ...kira, odeme_gunu: e.target.value })} ph="Her ayın 1'i" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>SOZLESME SURESI</label>
          <select style={inp} value={kira.sozlesme_suresi} onChange={e => setKira({ ...kira, sozlesme_suresi: e.target.value })}>
            {["6 ay", "1 yıl", "2 yıl", "3 yıl"].map(o => <option key={o}>{o}</option>)}
          </select></div>
        <Inp label="BASLANGIC TARIHI *" val={kira.baslangic_tarihi} onChange={(e: any) => setKira({ ...kira, baslangic_tarihi: e.target.value })} ph="01/06/2026" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>DEPOZITO</label>
          <select style={inp} value={kira.depozito_ay} onChange={e => setKira({ ...kira, depozito_ay: e.target.value })}>
            {["1", "2", "3"].map(o => <option key={o}>{o + " aylık kira"}</option>)}
          </select></div>
        <div style={fld}><label style={lbl}>ARTIS ORANI</label>
          <select style={inp} value={kira.artis_orani} onChange={e => setKira({ ...kira, artis_orani: e.target.value })}>
            {["TUFE", "UFE", "TUFE+UFE Ort.", "Sabit %25"].map(o => <option key={o}>{o}</option>)}
          </select></div>
      </div>
      <Section title="KIRACI BILGILERI" step={3} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="AD *" val={kira.kiraci_ad} onChange={(e: any) => setKira({ ...kira, kiraci_ad: e.target.value })} ph="Ahmet" />
        <Inp label="SOYAD *" val={kira.kiraci_soyad} onChange={(e: any) => setKira({ ...kira, kiraci_soyad: e.target.value })} ph="Yılmaz" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="TC KIMLIK NO *" val={kira.kiraci_tc} onChange={(e: any) => setKira({ ...kira, kiraci_tc: e.target.value })} ph="12345678901" />
        <Inp label="TELEFON" val={kira.kiraci_telefon} onChange={(e: any) => setKira({ ...kira, kiraci_telefon: e.target.value })} ph="0532 xxx xx xx" />
      </div>
      <Inp label="MEVCUT ADRES" val={kira.kiraci_adres} onChange={(e: any) => setKira({ ...kira, kiraci_adres: e.target.value })} ph="İstanbul, Şişli, Halaskargazi Cad. No:45" />
      <Section title="KIRAYA VEREN BILGILERI" step={4} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="AD *" val={kira.ev_sahibi_ad} onChange={(e: any) => setKira({ ...kira, ev_sahibi_ad: e.target.value })} ph="Fatma" />
        <Inp label="SOYAD *" val={kira.ev_sahibi_soyad} onChange={(e: any) => setKira({ ...kira, ev_sahibi_soyad: e.target.value })} ph="Demir" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="TC KIMLIK NO" val={kira.ev_sahibi_tc} onChange={(e: any) => setKira({ ...kira, ev_sahibi_tc: e.target.value })} ph="98765432109" />
        <Inp label="TELEFON" val={kira.ev_sahibi_telefon} onChange={(e: any) => setKira({ ...kira, ev_sahibi_telefon: e.target.value })} ph="0542 xxx xx xx" />
      </div>
      <Section title="KEFIL (Opsiyonel)" step={5} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Inp label="AD" val={kira.kefil_ad} onChange={(e: any) => setKira({ ...kira, kefil_ad: e.target.value })} ph="Mehmet" />
        <Inp label="SOYAD" val={kira.kefil_soyad} onChange={(e: any) => setKira({ ...kira, kefil_soyad: e.target.value })} ph="Kaya" />
        <Inp label="TC KIMLIK NO" val={kira.kefil_tc} onChange={(e: any) => setKira({ ...kira, kefil_tc: e.target.value })} ph="11122233344" />
      </div>
      <Section title="OZEL SARTLAR" step={6} />
      <div style={fld}>
        <textarea style={{ ...inp, height: 80, resize: "vertical", lineHeight: 1.6 }}
          value={kira.ozel_sartlar} onChange={e => setKira({ ...kira, ozel_sartlar: e.target.value })}
          placeholder="Evcil hayvan yasak. Aidat kiracıya ait. İzinsiz tadilat yapılamaz..." />
        <div style={{ fontSize: 10, color: D.dim, marginTop: 4 }}>Boş bırakabilirsiniz — standart şartlar otomatik eklenir.</div>
      </div>
      <button
        style={{ background: loading || !kira.mulk_ilce || !kira.kiraci_ad || !kira.kira_bedeli ? D.brd : D.gold, color: loading || !kira.mulk_ilce || !kira.kiraci_ad || !kira.kira_bedeli ? D.muted : "#000", border: "none", borderRadius: 8, padding: "13px 24px", fontSize: 13, fontWeight: 700, cursor: loading || !kira.mulk_ilce || !kira.kiraci_ad || !kira.kira_bedeli ? "not-allowed" : "pointer", width: "100%", marginTop: 8 }}
        onClick={() => post("/api/v1/analysis/sozlesme/kira", kira)}
        disabled={loading || !kira.mulk_ilce || !kira.kiraci_ad || !kira.kira_bedeli}>
        {loading ? "Sozlesme Hazirlaniyor..." : "Kira Sozlesmesi Olustur"}
      </button>
    </div>
  );

  const renderSatis = () => (
    <div>
      <div style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 8, padding: "10px 14px", marginBottom: 4 }}>
        <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 500, marginBottom: 2 }}>Satis On Sozlesmesi (Promesse)</div>
        <div style={{ fontSize: 11, color: D.muted, lineHeight: 1.5 }}>Ada/parsel, ödeme planı ve cezai şart dahil tam tapu devir belgesi.</div>
      </div>
      <Section title="TASINMAZ BILGILERI" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>IL *</label>
          <select style={inp} value={satis.mulk_il} onChange={e => setSatis({ ...satis, mulk_il: e.target.value })}>
            {ILLER.map(i => <option key={i}>{i}</option>)}
          </select></div>
        <Inp label="ILCE *" val={satis.mulk_ilce} onChange={(e: any) => setSatis({ ...satis, mulk_ilce: e.target.value })} ph="Beşiktaş" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="MAHALLE *" val={satis.mulk_mahalle} onChange={(e: any) => setSatis({ ...satis, mulk_mahalle: e.target.value })} ph="Levent" />
        <Inp label="SOKAK *" val={satis.mulk_sokak} onChange={(e: any) => setSatis({ ...satis, mulk_sokak: e.target.value })} ph="Büyükdere Cad." />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <Inp label="KAPI NO *" val={satis.mulk_kapi_no} onChange={(e: any) => setSatis({ ...satis, mulk_kapi_no: e.target.value })} ph="45" />
        <Inp label="DAIRE NO" val={satis.mulk_daire_no} onChange={(e: any) => setSatis({ ...satis, mulk_daire_no: e.target.value })} ph="12" />
        <Inp label="ADA/PARSEL" val={satis.ada_parsel} onChange={(e: any) => setSatis({ ...satis, ada_parsel: e.target.value })} ph="123/4" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div style={fld}><label style={lbl}>MULK TIPI</label>
          <select style={inp} value={satis.mulk_tip} onChange={e => setSatis({ ...satis, mulk_tip: e.target.value })}>
            {["Daire", "Villa", "Dükkan", "Ofis", "Arsa"].map(o => <option key={o}>{o}</option>)}
          </select></div>
        <Inp label="NET M² *" val={satis.mulk_m2} onChange={(e: any) => setSatis({ ...satis, mulk_m2: e.target.value })} ph="150" />
        <div style={fld}><label style={lbl}>ODA</label>
          <select style={inp} value={satis.mulk_oda} onChange={e => setSatis({ ...satis, mulk_oda: e.target.value })}>
            {["1+1", "2+1", "3+1", "4+1", "5+1"].map(o => <option key={o}>{o}</option>)}
          </select></div>
      </div>
      <div style={fld}><label style={lbl}>IPOTEK DURUMU</label>
        <select style={inp} value={satis.ipotek_durumu} onChange={e => setSatis({ ...satis, ipotek_durumu: e.target.value })}>
          {["Ipotek yok", "Ipotek var - devir oncesi kalkacak", "Alici devralacak"].map(o => <option key={o}>{o}</option>)}
        </select></div>
      <Section title="SATIS KOSULLARI" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="SATIS BEDELI (TL) *" val={satis.satis_bedeli} onChange={(e: any) => setSatis({ ...satis, satis_bedeli: e.target.value })} ph="5000000" />
        <Inp label="PESINAT (TL) *" val={satis.pesınat} onChange={(e: any) => setSatis({ ...satis, pesınat: e.target.value })} ph="1000000" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="KALAN TUTAR (TL)" val={satis.kalan_odeme} onChange={(e: any) => setSatis({ ...satis, kalan_odeme: e.target.value })} ph="4000000" />
        <Inp label="ODEME TARIHI" val={satis.odeme_tarihi} onChange={(e: any) => setSatis({ ...satis, odeme_tarihi: e.target.value })} ph="01/09/2026" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="TESLIM TARIHI" val={satis.teslim_tarihi} onChange={(e: any) => setSatis({ ...satis, teslim_tarihi: e.target.value })} ph="01/09/2026" />
        <Inp label="CEZAI SART" val={satis.cezai_sart} onChange={(e: any) => setSatis({ ...satis, cezai_sart: e.target.value })} ph="Satış bedelinin %10'u" />
      </div>
      <Section title="ALICI BILGILERI" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="AD *" val={satis.alici_ad} onChange={(e: any) => setSatis({ ...satis, alici_ad: e.target.value })} ph="Ali" />
        <Inp label="SOYAD *" val={satis.alici_soyad} onChange={(e: any) => setSatis({ ...satis, alici_soyad: e.target.value })} ph="Çelik" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="TC" val={satis.alici_tc} onChange={(e: any) => setSatis({ ...satis, alici_tc: e.target.value })} ph="12345678901" />
        <Inp label="TELEFON" val={satis.alici_telefon} onChange={(e: any) => setSatis({ ...satis, alici_telefon: e.target.value })} ph="0532 xxx xx xx" />
      </div>
      <Inp label="ADRES" val={satis.alici_adres} onChange={(e: any) => setSatis({ ...satis, alici_adres: e.target.value })} ph="Ankara, Çankaya..." />
      <Section title="SATICI BILGILERI" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="AD *" val={satis.satici_ad} onChange={(e: any) => setSatis({ ...satis, satici_ad: e.target.value })} ph="Zeynep" />
        <Inp label="SOYAD *" val={satis.satici_soyad} onChange={(e: any) => setSatis({ ...satis, satici_soyad: e.target.value })} ph="Arslan" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="TC" val={satis.satici_tc} onChange={(e: any) => setSatis({ ...satis, satici_tc: e.target.value })} ph="98765432109" />
        <Inp label="TELEFON" val={satis.satici_telefon} onChange={(e: any) => setSatis({ ...satis, satici_telefon: e.target.value })} ph="0542 xxx xx xx" />
      </div>
      <Inp label="ADRES" val={satis.satici_adres} onChange={(e: any) => setSatis({ ...satis, satici_adres: e.target.value })} ph="İstanbul, Beşiktaş..." />
      <Section title="OZEL SARTLAR" />
      <div style={fld}><textarea style={{ ...inp, height: 80, resize: "vertical" }} value={satis.ozel_sartlar}
        onChange={e => setSatis({ ...satis, ozel_sartlar: e.target.value })}
        placeholder="Mutfak eşyaları dahil. Balkon tadilat alıcıya ait..." /></div>
      <button style={{ background: loading || !satis.mulk_ilce || !satis.alici_ad ? D.brd : "#22c55e", color: loading || !satis.mulk_ilce || !satis.alici_ad ? D.muted : "#000", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: loading || !satis.mulk_ilce || !satis.alici_ad ? "not-allowed" : "pointer", width: "100%", marginTop: 8 }}
        onClick={() => post("/api/v1/analysis/sozlesme/satis", satis)} disabled={loading || !satis.mulk_ilce || !satis.alici_ad}>
        {loading ? "Sozlesme Hazirlaniyor..." : "Satis On Sozlesmesi Olustur"}
      </button>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", background: D.bg, color: D.text, fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", overflow: "hidden" }}>

      {/* Sol Nav */}
      <div style={{ width: 220, borderRight: `1px solid ${D.brd}`, display: "flex", flexDirection: "column", background: "#0a0a0a", flexShrink: 0 }}>
        <div style={{ padding: "22px 18px 18px", borderBottom: `1px solid ${D.brd}` }}>
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <div style={{ fontSize: 20, color: D.gold, letterSpacing: 4, fontWeight: 300 }}>VEGA</div>
            <div style={{ fontSize: 9, color: D.dim, marginTop: 3, letterSpacing: 4 }}>INTELLIGENCE</div>
          </Link>
        </div>
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", color: active ? D.gold : D.muted, textDecoration: "none", fontSize: 12, borderLeft: active ? `2px solid ${D.gold}` : "2px solid transparent", background: active ? "rgba(255,215,0,0.05)" : "transparent" }}>
                <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{item.icon}</span>
                <span style={{ fontWeight: active ? 500 : 400 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Ana Alan */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Başlık */}
        <div style={{ padding: "16px 28px", borderBottom: `1px solid ${D.brd}`, display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          {selected && (
            <button onClick={() => { setSelected(null); setResult(""); }}
              style={{ background: "transparent", border: `1px solid ${D.brd2}`, borderRadius: 6, padding: "5px 12px", color: D.muted, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              Geri
            </button>
          )}
          <div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{selected ? activeCard?.title : "Sozlesme Merkezi"}</div>
            <div style={{ fontSize: 11, color: D.muted, marginTop: 1 }}>{selected ? activeCard?.detail : "Hangi sozlesmeyi olusturmak istersiniz?"}</div>
          </div>
        </div>

        {/* Hub: Kart Seçimi */}
        {!selected && (
          <div style={{ flex: 1, overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
            <div style={{ width: "100%", maxWidth: 700 }}>
              <div style={{ fontSize: 10, color: "#2a2a2a", letterSpacing: 3, marginBottom: 20, textAlign: "center" }}>SOZLESME TURU SECIN</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {SOZLESME_CARDS.map(card => (
                  <div key={card.id} onClick={() => { setSelected(card.id); setResult(""); }}
                    style={{ background: `${card.accent}07`, border: `1px solid ${card.accent}20`, borderRadius: 18, padding: "32px 28px", cursor: "pointer", transition: "all 0.18s", position: "relative" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${card.accent}50`; (e.currentTarget as HTMLDivElement).style.background = `${card.accent}12`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${card.accent}20`; (e.currentTarget as HTMLDivElement).style.background = `${card.accent}07`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
                  >
                    <span style={{ position: "absolute", top: 16, right: 16, fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "3px 8px", borderRadius: 20, background: `${card.accent}20`, color: card.accent, border: `1px solid ${card.accent}35` }}>{card.tag}</span>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${card.accent}14`, border: `1px solid ${card.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: card.accent, marginBottom: 18 }}>
                      {card.icon}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#d8d8d8", marginBottom: 10 }}>{card.title}</div>
                    <div style={{ fontSize: 12, color: "#3a3a3a", lineHeight: 1.7, marginBottom: 16 }}>{card.detail}</div>
                    <div style={{ fontSize: 12, color: card.accent, opacity: 0.7 }}>Olusturmaya Basla →</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form + Sonuç */}
        {selected && (
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <div style={{ width: 480, borderRight: `1px solid ${D.brd}`, overflowY: "auto", padding: "20px 24px", flexShrink: 0 }}>
              {selected === "kira" ? renderKira() : renderSatis()}
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: D.bg }}>
              {loading && (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, border: `2px solid ${D.gold}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <div style={{ fontSize: 12, color: D.muted }}>Sozlesme hazirlaniyor...</div>
                </div>
              )}
              {!loading && !result && (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <div style={{ fontSize: 36, color: D.brd }}>▣</div>
                  <div style={{ fontSize: 12, color: D.dim }}>Formu doldurun ve sozlesmeyi olusturun</div>
                </div>
              )}
              {!loading && result && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: D.gold, fontWeight: 500, letterSpacing: 1 }}>SOZLESME</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => downloadPDF(result, selected === "kira" ? "Kira Sozlesmesi" : "Satis On Sozlesmesi")}
                        style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 6, padding: "5px 14px", color: D.gold, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                        PDF Indir
                      </button>
                      <button onClick={copy} style={{ background: "transparent", border: `1px solid ${D.brd2}`, borderRadius: 6, padding: "5px 14px", color: copied ? D.gold : D.muted, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                        {copied ? "Kopyalandi" : "Kopyala"}
                      </button>
                    </div>
                  </div>
                  <div style={{ background: D.bg2, border: `1px solid ${D.brd}`, borderRadius: 10, padding: "20px", fontSize: 13, lineHeight: 1.9, color: "rgba(255,255,255,0.8)", whiteSpace: "pre-wrap" }}>
                    {result}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *::-webkit-scrollbar{width:4px} *::-webkit-scrollbar-track{background:transparent} *::-webkit-scrollbar-thumb{background:#1e1e1e;border-radius:2px}`}</style>
    </div>
  );
}
