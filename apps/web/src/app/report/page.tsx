"use client";
import { useState } from "react";
import Link from "next/link";

const AGENCY_ID = "41897482-1325-4f6d-83bf-d26583054f15";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

export default function ReportPage() {
  const [form, setForm] = useState({
    net_m2: "120",
    kat_no: "3",
    toplam_kat: "8",
    bina_yasi: "10",
    cephe: "güney",
    oda_sayisi: "3+1",
    musteri_adi: "",
    adres: "",
    ilce: "Kadıköy",
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleValuation = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/api/v1/valuation/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        net_m2: parseFloat(form.net_m2),
        kat_no: parseInt(form.kat_no),
        toplam_kat: parseInt(form.toplam_kat),
        bina_yasi: parseInt(form.bina_yasi),
        cephe: form.cephe,
        oda_sayisi: form.oda_sayisi,
      }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const handlePDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Header
    doc.setFillColor(88, 28, 135);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("VEGA", 15, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Emlak Zeka Altyapisi - Deger leme Raporu", 15, 27);

    const today = new Date().toLocaleDateString("tr-TR");
    doc.text(`Tarih: ${today}`, 150, 27);

    // Müşteri bilgisi
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Musteri Bilgileri", 15, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Ad Soyad: ${form.musteri_adi || "-"}`, 15, 60);
    doc.text(`Adres: ${form.adres || "-"}`, 15, 68);
    doc.text(`Ilce: ${form.ilce}`, 15, 76);

    // Mülk bilgileri
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Mulk Bilgileri", 15, 92);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const mulkBilgileri = [
      ["Net Alan", `${form.net_m2} m2`],
      ["Oda Sayisi", form.oda_sayisi],
      ["Kat No", `${form.kat_no}. kat / ${form.toplam_kat} kat`],
      ["Bina Yasi", `${form.bina_yasi} yil`],
      ["Cephe", form.cephe],
    ];

    mulkBilgileri.forEach(([key, val], i) => {
      doc.setFillColor(248, 248, 248);
      doc.rect(15, 98 + i * 10, 180, 9, "F");
      doc.text(key, 20, 104 + i * 10);
      doc.text(val, 120, 104 + i * 10);
    });

    // Değerleme sonucu
    if (result) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("AI Deger leme Sonucu", 15, 160);

      doc.setFillColor(88, 28, 135);
      doc.rect(15, 165, 180, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text(
        `TL ${Number(result.tahmin_fiyat).toLocaleString("tr-TR")}`,
        105, 181,
        { align: "center" }
      );

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Alt Aralik: TL ${Number(result.alt_aralik).toLocaleString("tr-TR")}`, 20, 202);
      doc.text(`Ust Aralik: TL ${Number(result.ust_aralik).toLocaleString("tr-TR")}`, 100, 202);
      doc.text(`Guven Skoru: %${Math.round(result.guven_skoru * 100)}`, 20, 212);
      doc.text(`Model: ${result.model_version}`, 100, 212);

      // SHAP
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Fiyati Etkileyen Faktorler", 15, 228);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      Object.entries(result.shap_values)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .forEach(([key, val], i) => {
          doc.text(`${key}: TL ${Number(val).toLocaleString("tr-TR")}`, 20, 236 + i * 8);
        });
    }

    // Footer
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 278, 210, 20, "F");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text("Bu rapor VEGA AI tarafindan olusturulmustur. Yatirim tavsiyesi degildir.", 105, 287, { align: "center" });
    doc.text("vega-web-peach.vercel.app", 105, 293, { align: "center" });

    doc.save(`VEGA_Rapor_${today.replace(/\./g, "-")}.pdf`);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">VEGA</Link>
        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/map" className="hover:text-white">Harita</Link>
          <Link href="/valuation" className="hover:text-white">Değerleme</Link>
          <Link href="/report" className="text-white">Rapor</Link>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">PDF Değerleme Raporu</h1>
        <p className="text-gray-400 text-sm mb-8">Müşterinize sunmak için profesyonel rapor oluşturun.</p>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Müşteri Bilgileri</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Müşteri Adı</label>
                  <input name="musteri_adi" value={form.musteri_adi} onChange={handleChange}
                    placeholder="Ahmet Yılmaz"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Adres</label>
                  <input name="adres" value={form.adres} onChange={handleChange}
                    placeholder="Moda Cad. No:5"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">İlçe</label>
                  <input name="ilce" value={form.ilce} onChange={handleChange}
                    placeholder="Kadıköy"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Mülk Bilgileri</h2>
              <div className="space-y-3">
                {[
                  { label: "Net m²", name: "net_m2", placeholder: "120" },
                  { label: "Kat No", name: "kat_no", placeholder: "3" },
                  { label: "Toplam Kat", name: "toplam_kat", placeholder: "8" },
                  { label: "Bina Yaşı", name: "bina_yasi", placeholder: "10" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="text-gray-400 text-sm block mb-1">{f.label}</label>
                    <input name={f.name} value={form[f.name as keyof typeof form]} onChange={handleChange}
                      placeholder={f.placeholder}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                  </div>
                ))}
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Oda Sayısı</label>
                  <select name="oda_sayisi" value={form.oda_sayisi} onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                    {["1+0","1+1","2+1","3+1","4+1","5+1"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-1">Cephe</label>
                  <select name="cephe" value={form.cephe} onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                    {["kuzey","güney","doğu","batı","güney-doğu","güney-batı"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="font-semibold mb-4">Önizleme</h2>
              {result ? (
                <div>
                  <div className="bg-purple-900 rounded-xl p-4 text-center mb-4">
                    <div className="text-3xl font-bold text-purple-300">
                      ₺{Number(result.tahmin_fiyat).toLocaleString("tr-TR")}
                    </div>
                    <div className="text-purple-400 text-sm mt-1">
                      ₺{Number(result.alt_aralik).toLocaleString("tr-TR")} — ₺{Number(result.ust_aralik).toLocaleString("tr-TR")}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    {Object.entries(result.shap_values)
                      .sort(([,a],[,b]) => (b as number) - (a as number))
                      .map(([key, val]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400">{key}</span>
                          <span>₺{Number(val).toLocaleString("tr-TR")}</span>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-sm">Önce değerleme alın</p>
                </div>
              )}
            </div>

            <button onClick={handleValuation} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-medium transition-colors">
              {loading ? "Hesaplanıyor..." : "Değerleme Al"}
            </button>

            <button onClick={handlePDF} disabled={!result}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors">
              PDF İndir
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}