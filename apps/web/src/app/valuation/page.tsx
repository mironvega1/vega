"use client";
import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

const ILLER = ["istanbul","ankara","izmir","bursa","antalya","adana","konya","gaziantep","mersin","kocaeli","mugla","tekirdag","sakarya","denizli","trabzon","eskisehir","samsun","kayseri","balikesir","manisa"];

export default function Valuation() {
  const [form, setForm] = useState({
    net_m2: "", kat_no: "3", toplam_kat: "8", bina_yasi: "10",
    cephe: "güney", oda_sayisi: "3+1", il: "istanbul", ilce: "besiktas", mahalle: "merkez"
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [liquidity, setLiquidity] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult(null);
    setLiquidity(null);

    const body = {
      net_m2: parseFloat(form.net_m2), kat_no: parseInt(form.kat_no),
      toplam_kat: parseInt(form.toplam_kat), bina_yasi: parseInt(form.bina_yasi),
      cephe: form.cephe, oda_sayisi: form.oda_sayisi,
      il: form.il, ilce: form.ilce, mahalle: form.mahalle
    };

    const [valRes, liqRes] = await Promise.all([
      fetch(`${API_URL}/api/v1/valuation/predict`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }),
      fetch(`${API_URL}/api/v1/valuation/liquidity`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ il: form.il, ilce: form.ilce, fiyat: 0, net_m2: parseFloat(form.net_m2), oda_sayisi: form.oda_sayisi })
      })
    ]);

    const valData = await valRes.json();
    const liqData = await liqRes.json();

    if (valData.tahmin_fiyat) {
      const updatedLiq = await fetch(`${API_URL}/api/v1/valuation/liquidity`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ il: form.il, ilce: form.ilce, fiyat: valData.tahmin_fiyat, net_m2: parseFloat(form.net_m2), oda_sayisi: form.oda_sayisi })
      });
      setLiquidity(await updatedLiq.json());
    } else {
      setLiquidity(liqData);
    }

    setResult(valData);
    setLoading(false);
  };

  const liqColor = liquidity?.renk === "green" ? "#22c55e" : liquidity?.renk === "yellow" ? "#eab308" : "#ef4444";

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">VEGA</Link>
        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/listings" className="hover:text-white">İlanlar</Link>
          <Link href="/map" className="hover:text-white">Harita</Link>
          <Link href="/valuation" className="text-white">Değerleme</Link>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">AI Değerleme</h1>
        <p className="text-gray-400 text-sm mb-8">Mülk bilgilerini gir, yapay zeka fiyat ve satış süresi tahmin etsin.</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: "Net m²", name: "net_m2", type: "number", placeholder: "100" },
            { label: "Kat No", name: "kat_no", type: "number", placeholder: "3" },
            { label: "Toplam Kat", name: "toplam_kat", type: "number", placeholder: "8" },
            { label: "Bina Yaşı", name: "bina_yasi", type: "number", placeholder: "10" },
            { label: "İl", name: "il", type: "text", placeholder: "istanbul" },
            { label: "İlçe", name: "ilce", type: "text", placeholder: "besiktas" },
            { label: "Mahalle", name: "mahalle", type: "text", placeholder: "merkez" },
          ].map((f) => (
            <div key={f.name}>
              <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
              <input
                type={f.type} name={f.name}
                value={(form as any)[f.name]}
                onChange={handleChange}
                placeholder={f.placeholder}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs text-gray-400 mb-1">Oda Sayısı</label>
            <select name="oda_sayisi" value={form.oda_sayisi} onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
              {["1+1","2+1","3+1","4+1","5+1","3+2","4+2"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Cephe</label>
            <select name="cephe" value={form.cephe} onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
              {["kuzey","güney","doğu","batı","güneydoğu","güneybatı"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={loading || !form.net_m2}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors mb-8">
          {loading ? "Hesaplanıyor..." : "Değerleme Yap"}
        </button>

        {result && !result.error && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">Alt Aralık</div>
                <div className="text-lg font-bold text-gray-300">₺{Number(result.alt_aralik).toLocaleString("tr-TR")}</div>
              </div>
              <div className="bg-purple-900 border border-purple-700 rounded-xl p-4 text-center">
                <div className="text-xs text-purple-300 mb-1">Tahmin Fiyat</div>
                <div className="text-2xl font-bold text-white">₺{Number(result.tahmin_fiyat).toLocaleString("tr-TR")}</div>
                <div className="text-xs text-purple-400 mt-1">Güven: %{Math.round(result.guven_skoru * 100)}</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-400 mb-1">Üst Aralık</div>
                <div className="text-lg font-bold text-gray-300">₺{Number(result.ust_aralik).toLocaleString("tr-TR")}</div>
              </div>
            </div>

            {liquidity && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Liquidity Analizi</h3>
                  <span style={{color: liqColor}} className="font-bold text-lg">{liquidity.tahmini_satis_suresi_gun} gün</span>
                </div>
                <div className="text-sm text-gray-400">{liquidity.aciklama}</div>
                <div className="mt-2 flex gap-4 text-xs text-gray-500">
                  <span>Talep Skoru: {liquidity.talep_skoru}</span>
                  <span>Kategori: <span style={{color: liqColor}}>{liquidity.kategori}</span></span>
                </div>
              </div>
            )}

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">SHAP — Fiyatı Ne Etkiliyor?</h3>
              <div className="space-y-2">
                {Object.entries(result.shap_values || {}).sort((a: any, b: any) => b[1] - a[1]).map(([k, v]: any) => (
                  <div key={k} className="flex items-center gap-2">
                    <div className="text-xs text-gray-400 w-24">{k}</div>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full"
                        style={{width: `${Math.min(100, Math.abs(v) / Math.max(...Object.values(result.shap_values).map(Number)) * 100)}%`}}/>
                    </div>
                    <div className="text-xs text-gray-300 w-20 text-right">₺{Number(v).toLocaleString("tr-TR")}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-gray-500 text-center">
              Model: {result.model_version} · {result.lokasyon?.il} / {result.lokasyon?.ilce}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
