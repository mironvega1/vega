"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const AGENCY_ID = "41897482-1325-4f6d-83bf-d26583054f15";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://vega-api-9ps9.onrender.com";

export default function MapPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/listings?limit=100`, {
      headers: { "agency-id": AGENCY_ID },
    })
      .then((r) => r.json())
      .then((d) => {
        setListings(d.listings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (typeof window === "undefined") return;

    const L = require("leaflet");

    // CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const map = L.map("map").setView([41.0082, 28.9784], 11);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    // Test koordinatlar (gerçek veri gelince lat/lng kullanacağız)
    const testCoords: [number, number][] = [
      [40.9833, 29.0333],
      [41.0766, 29.0100],
      [41.1200, 29.0500],
      [41.0200, 29.0150],
      [41.0800, 29.0450],
    ];

    listings.forEach((listing, i) => {
      const coord = testCoords[i % testCoords.length];
      const marker = L.circleMarker(coord, {
        radius: 10,
        fillColor: "#9333ea",
        color: "#7c3aed",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; min-width: 160px;">
          <div style="font-weight: bold; font-size: 14px; color: #9333ea;">
            ₺${Number(listing.fiyat).toLocaleString("tr-TR")}
          </div>
          <div style="color: #666; font-size: 12px; margin-top: 4px;">
            ${listing.net_m2} m² · ${listing.oda_sayisi} · ${listing.kat_no}. kat
          </div>
        </div>
      `);
    });

    return () => {
      map.remove();
    };
  }, [loading, listings]);

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">VEGA</Link>
        <nav className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/listings" className="hover:text-white">İlanlar</Link>
          <Link href="/map" className="text-white">Harita</Link>
          <Link href="/valuation" className="hover:text-white">Değerleme</Link>
        </nav>
      </header>

      <div className="flex h-[calc(100vh-57px)]">
        {/* Sol panel */}
        <div className="w-72 border-r border-gray-800 bg-gray-900 p-4 overflow-y-auto">
          <h2 className="font-semibold mb-4">İlanlar ({listings.length})</h2>
          {loading ? (
            <div className="text-gray-500 text-sm">Yükleniyor...</div>
          ) : (
            listings.map((l) => (
              <div key={l.id} className="border border-gray-800 rounded-lg p-3 mb-2 hover:border-purple-700 cursor-pointer transition-colors">
                <div className="font-medium text-purple-400">₺{Number(l.fiyat).toLocaleString("tr-TR")}</div>
                <div className="text-gray-400 text-xs mt-1">{l.net_m2} m² · {l.oda_sayisi} · {l.kat_no}. kat</div>
              </div>
            ))
          )}
        </div>

        {/* Harita */}
        <div className="flex-1 relative">
          <div id="map" className="w-full h-full" />
        </div>
      </div>
    </main>
  );
}