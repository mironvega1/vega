"use client";
import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

export default function ZoneScores() {
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const searchAddress = async () => {
    if (!address) return;
    setLoading(true);
    const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ", Türkiye")}&format=json&limit=1`);
    const d = await r.json();
    if (d[0]) {
      setLat(d[0].lat);
      setLng(d[0].lon);
      await fetchScore(d[0].lat, d[0].lon);
    }
    setLoading(false);
  };

  const fetchScore = async (la: string, lo: string) => {
    setLoading(true);
    const r = await fetch(`${API_URL}/api/v1/location/score?lat=${la}&lng=${lo}`);
    const d = await r.json();
    setResult(d);
    setLoading(false);
  };

  const scoreColor = (s: number) => s >= 80 ? "#22c55e" : s >= 60 ? "#eab308" : s >= 40 ? "#f97316" : "#ef4444";
  const grade = (s: number) => s >= 80 ? "A" : s >= 60 ? "B" : s >= 40 ? "C" : "D";

  const categories: Record<string, string> = {
    metro: "Metro / Toplu Taşıma",
    school: "Okul",
    hospital: "Hastane / Klinik",
    mall: "AVM / Market",
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">VEGA</Link>
        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/map" className="hover:text-white">Harita</Link>
          <Link href="/valuation" className="hover:text-white">Değerleme</Link>
          <Link href="/zone-scores" className="text-white">Bölge Skoru</Link>
        </nav>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Bölge Skoru</h1>
        <p className="text-gray-400 text-sm mb-8">Adres gir — okul, hastane, metro, AVM mesafesi analizi al.</p>

        <div className="flex gap-3 mb-8">
          <input
            type="text" value={address} onChange={e => setAddress(e.target.value)}
            placeholder="Adres gir (örn: Beşiktaş, İstanbul)"
            onKeyDown={e => e.key === "Enter" && searchAddress()}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:border-purple-500 outline-none"
          />
          <button onClick={searchAddress} disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg text-sm font-medium disabled:opacity-50">
            {loading ? "Analiz ediliyor..." : "Analiz Et"}
          </button>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold mb-2" style={{color: scoreColor(result.total_score)}}>
                {result.grade}
              </div>
              <div className="text-3xl font-bold mb-1">{result.total_score} / 100</div>
              <div className="text-gray-400 text-sm">Genel Lokasyon Skoru</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(result.breakdown || {}).map(([key, val]: any) => (
                <div key={key} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">{categories[key] || key}</span>
                    <span className="font-bold" style={{color: scoreColor(val.score)}}>{val.score}</span>
                  </div>
                  <div className="bg-gray-800 rounded-full h-2 mb-3">
                    <div className="h-2 rounded-full transition-all" style={{width: `${val.score}%`, background: scoreColor(val.score)}}/>
                  </div>
                  {val.closest_name && (
                    <div className="text-xs text-gray-400">
                      En yakın: {val.closest_name}
                    </div>
                  )}
                  {val.closest_distance_m && (
                    <div className="text-xs text-gray-500">
                      {val.closest_distance_m < 1000 ? `${val.closest_distance_m}m` : `${(val.closest_distance_m/1000).toFixed(1)}km`} uzakta · {val.count_nearby} tesis
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-gray-500 text-center">
              Koordinat: {result.lat?.toFixed(4)}, {result.lng?.toFixed(4)} · OSM Overpass API
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
