"use client";
import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

export default function Valuation() {
  const [form, setForm] = useState({
    net_m2: "",
    kat_no: "3",
    toplam_kat: "8",
    bina_yasi: "10",
    cephe: "güney",
    oda_sayisi: "3+1",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
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
        <h1 className="text-2xl font-bold mb-2">AI Değerleme</h1>
        <p className="text-gray-400 text-sm mb-8">Mülk bilgilerini girin, AI tahmini alın.</p>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="font-semibold mb-6">Mülk Bilgileri</h2>
            <div className="space-y-4">
              {[
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
              <button
                onClick={handleSubmit}
                disabled={!form.net_m2 || loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors mt-2"
              >
                {loading ? "Hesaplanıyor..." : "Değerleme Al"}
              </button>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            {result ? (
              result.error ? (
                <div className="text-red-400">{result.error}</div>
              ) : (
                <>
                  <h2 className="font-semibold mb-6">Tahmin Sonucu</h2>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-purple-400 mb-1">
                      ₺{Number(result.tahmin_fiyat).toLocaleString("tr-TR")}
                    </div>
                    <div className="text-gray-400 text-sm">
                      ₺{Number(result.alt_aralik).toLocaleString("tr-TR")} — ₺{Number(result.ust_aralik).toLocaleString("tr-TR")}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      Güven: %{Math.round(result.guven_skoru * 100)}
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-4">
                    <div className="text-xs text-gray-500 mb-3">Fiyatı etkileyen faktörler (SHAP)</div>
                    {Object.entries(result.shap_values)
                      .sort(([,a],[,b]) => (b as number) - (a as number))
                      .map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between mb-2">
                          <span className="text-gray-400 text-sm">{key}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${Math.min(100, (Number(val) / Number(result.tahmin_fiyat)) * 100)}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-xs w-20 text-right">
                              ₺{Number(val).toLocaleString("tr-TR")}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="text-xs text-gray-600 mt-4">Model: {result.model_version}</div>
                </>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <div className="text-4xl mb-4">◎</div>
                <p className="text-sm">Mülk bilgilerini doldurun ve değerleme alın.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}