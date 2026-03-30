"use client";
import { useState } from "react";
import Link from "next/link";

const AGENCY_ID = "176186b2-0a2a-4107-9b5b-a95bc039910f";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

export default function Listings() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_URL}/api/v1/listings/import-csv?listing_type=satilik`, {
      method: "POST",
      headers: { "agency-id": AGENCY_ID },
      body: form,
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
          <Link href="/listings" className="text-white">İlanlar</Link>
          <Link href="/valuation" className="hover:text-white">Değerleme</Link>
        </nav>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-8">İlan Yükle</h1>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="font-semibold mb-2">CSV Dosyası Yükle</h2>
          <p className="text-gray-400 text-sm mb-6">
            CSV dosyanızda şu kolonlar olmalı: fiyat, net_m2, oda_sayisi, kat_no, toplam_kat, ilce, bina_yasi, cephe
          </p>

          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center mb-6 hover:border-purple-600 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="text-gray-400 text-sm">
                {file ? (
                  <span className="text-purple-400 font-medium">{file.name}</span>
                ) : (
                  <>CSV dosyasını seçmek için tıklayın</>
                )}
              </div>
            </label>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors"
          >
            {loading ? "Yükleniyor..." : "İlanları Yükle"}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-gray-800 rounded-xl">
              <div className="text-green-400 font-medium mb-1">
                ✓ {result.success} ilan başarıyla yüklendi
              </div>
              {result.error > 0 && (
                <div className="text-red-400 text-sm">{result.error} ilan yüklenemedi</div>
              )}
              {result.errors?.map((e: string, i: number) => (
                <div key={i} className="text-gray-400 text-xs mt-1">{e}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}