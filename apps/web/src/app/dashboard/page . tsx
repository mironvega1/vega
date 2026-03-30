"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const AGENCY_ID = "176186b2-0a2a-4107-9b5b-a95bc039910f";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

export default function Dashboard() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/listings`, {
      headers: { "agency-id": AGENCY_ID },
    })
      .then((r) => r.json())
      .then((d) => {
        setListings(d.listings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">VEGA</Link>
        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/dashboard" className="text-white">Dashboard</Link>
          <Link href="/listings" className="hover:text-white">İlanlar</Link>
          <Link href="/valuation" className="hover:text-white">Değerleme</Link>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link href="/listings" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            + İlan Yükle
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: "Toplam İlan", value: listings.length },
            { label: "Aktif İlan", value: listings.filter(l => l.durum === "active").length },
            { label: "Ort. Fiyat", value: listings.length ? `₺${Math.round(listings.reduce((a, b) => a + Number(b.fiyat), 0) / listings.length).toLocaleString("tr-TR")}` : "-" },
            { label: "Ort. m²", value: listings.length ? `${Math.round(listings.reduce((a, b) => a + Number(b.net_m2 || 0), 0) / listings.length)} m²` : "-" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <div className="text-gray-400 text-sm mb-1">{s.label}</div>
              <div className="text-2xl font-bold">{loading ? "..." : s.value}</div>
            </div>
          ))}
        </div>

        {/* Listings table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold">Son İlanlar</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left px-6 py-3">Fiyat</th>
                <th className="text-left px-6 py-3">m²</th>
                <th className="text-left px-6 py-3">Oda</th>
                <th className="text-left px-6 py-3">Kat</th>
                <th className="text-left px-6 py-3">Durum</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
              ) : listings.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Henüz ilan yok</td></tr>
              ) : (
                listings.map((l) => (
                  <tr key={l.id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 font-medium">₺{Number(l.fiyat).toLocaleString("tr-TR")}</td>
                    <td className="px-6 py-4 text-gray-400">{l.net_m2} m²</td>
                    <td className="px-6 py-4 text-gray-400">{l.oda_sayisi}</td>
                    <td className="px-6 py-4 text-gray-400">{l.kat_no}. kat</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-900 text-green-400 px-2 py-0.5 rounded-full text-xs">{l.durum}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}