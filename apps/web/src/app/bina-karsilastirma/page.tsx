"use client";
import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

export default function BinaKarsilastirma() {
  const [form, setForm] = useState({ il: "istanbul", ilce: "besiktas", net_m2: "100", oda_sayisi: "3+1", bina_yasi: "10", cephe: "guney", toplam_kat: "10" });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/api/v1/valuation/bina-karsilastirma`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, net_m2: parseFloat(form.net_m2), bina_yasi: parseInt(form.bina_yasi), toplam_kat: parseInt(form.toplam_kat) })
    });
    setData(await res.json());
    setLoading(false);
  };

  const maxFiyat = data ? Math.max(...data.karsilastirma.map((k: any) => k.fiyat)) : 1;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">VEGA</Link>
        <nav className="flex gap-6 text-sm text-gray-400">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/valuation" className="hover:text-white">Degerleme</Link>
          <Link href="/bina-karsilastirma" className="text-white">Bina Analizi</Link>
        </nav>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Bina Icinde Kat Analizi</h1>
        <p className="text-gray-400 text-sm mb-8">Ayni binadaki farkli katlarin fiyat farklarini goruntule.</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[{l:"Il",n:"il"},{l:"Ilce",n:"ilce"},{l:"Net m2",n:"net_m2"},{l:"Toplam Kat",n:"toplam_kat"},{l:"Bina Yasi",n:"bina_yasi"}].map(f => (
            <div key={f.n}>
              <label className="block text-xs text-gray-400 mb-1">{f.l}</label>
              <input type="text" value={(form as any)[f.n]} onChange={e => setForm({...form, [f.n]: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Oda Sayisi</label>
            <select value={form.oda_sayisi} onChange={e => setForm({...form, oda_sayisi: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
              {["1+1","2+1","3+1","4+1","5+1"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-medium mb-8 disabled:opacity-50">
          {loading ? "Hesaplaniyor..." : "Kat Analizi Yap"}
        </button>
        {data && (
          <div className="space-y-2">
            <h2 className="font-semibold mb-4">{data.ilce} - {data.net_m2}m2 - Kat Bazli Fiyatlar</h2>
            {data.karsilastirma.map((k: any) => (
              <div key={k.kat} className="flex items-center gap-3">
                <div className="text-sm text-gray-400 w-12">{k.kat}. kat</div>
                <div className="flex-1 bg-gray-800 rounded-full h-6 relative">
                  <div className="bg-purple-600 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{width: `${(k.fiyat/maxFiyat)*100}%`}}>
                    <span className="text-xs text-white font-medium">₺{(k.fiyat/1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
