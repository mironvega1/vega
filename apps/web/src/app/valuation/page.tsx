"use client";
import { useState } from "react";
import Link from "next/link";

export default function Valuation() {
  const [form, setForm] = useState({
    fiyat: "",
    net_m2: "",
    oda_sayisi: "3+1",
    kat_no: "",
    toplam_kat: "",
    bina_yasi: "",
    cephe: "güney",
    ilce: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">VEGA</Link>
        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/listings" className="hover:text-white">İlanlar</Link>
          <Link href="/valuation" className="text-white">Değerleme</Link>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Değerleme</h1>
        <p className="text-gray-400 text-sm mb-8">Mülk bilgilerini girin, AI tahmini alın.</p>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-6">Mülk Bilgileri</h2>
            <div className="space-y-4">
              {[
                { label: "İlçe", name: "ilce", placeholder: "Kadıköy" },
                { label: "Net m²", name: "net_m2", placeholder: "120" },
                { label: "Kat No", name: "kat_no", placeholder: "3" },
                { label: "Toplam Kat", name: "toplam_kat", placeholder: "8" },
                { label: "Bina Yaşı", name: "bina_yasi", placeholder: "10" },
              ].map((f) => (
                <div key={f.name}>
                  <label className="text-gray-400 text-sm block mb-1">{f.label}</label>
                  <input
                    name={f.name}
                    value={form[f.name as keyof typeof form]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}

              <div>
                <label className="text-gray-400 text-sm block mb-1">Oda Sayısı</label>
                <select name="oda_sayisi" value={form.oda_sayisi} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                  {["1+0","1+1","2+1","3+1","4+1","5+1"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Cephe</label>
                <select name="cephe" value={form.cephe} onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                  {["kuzey","güney","doğu","batı","güney-doğu","güney-batı"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium transition-colors mt-2">
                Değerleme Al (Yakında)
              </button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4 text-gray-700">◎</div>
            <h3 className="font-semibold text-gray-400 mb-2">AI Değerleme Motoru</h3>
            <p className="text-gray-500 text-sm">
              Gradient boosting ensemble modeli yakında aktif olacak. Şu an veri toplama aşamasındayız.
            </p>
            <div className="mt-6 w-full bg-gray-800 rounded-xl p-4 text-left">
              <div className="text-xs text-gray-500 mb-3">Gelecek özellikler:</div>
              {["Kapı no bazlı fiyat tahmini","Kaç günde satılır analizi","SHAP açıklanabilirlik","Bölge karşılaştırması"].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span className="text-purple-400">◦</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}