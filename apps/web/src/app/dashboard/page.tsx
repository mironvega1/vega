'use client'

import Link from 'next/link'
import { marketPulse, opportunities } from '@/lib/mock/market'

const modules = [
  { href: '/analysis', title: 'Analiz Merkezi', desc: 'Adres, deal, bölge ve risk' },
  { href: '/sozlesme', title: 'Sözleşme Merkezi', desc: 'Kira ve satış belgeleri' },
  { href: '/report', title: 'PDF/Rapor Merkezi', desc: 'Sunuma hazır çıktılar' },
  { href: '/ai', title: 'AI Asistan', desc: 'Piyasa sorularına hızlı cevap' },
]

export default function Dashboard() {
  const top3 = opportunities.slice(0, 3)
  const criticalCount = opportunities.filter((item) => item.dealScore >= 85).length

  return (
    <main className="vega-page">
      <div className="vega-shell">
        <header className="vega-topbar">
          <Link href="/" className="vega-brand">VEGA</Link>
          <div className="vega-meta">Son güncelleme: {marketPulse.lastUpdate}</div>
        </header>

        <section className="vega-hero">
          <div className="vega-hero-copy">
            <div className="vega-eyebrow">Dashboard</div>
            <h1 className="vega-title">
              Bugün piyasada {opportunities.length} yeni fırsat var.
            </h1>
            <p className="vega-subtitle">
              Fırsat radarı, piyasa nabzı ve ana çalışma merkezleri tek ekranda. Kritik ilanları
              önce gör, sonra rapor veya müşteri aksiyonuna hızlı geç.
            </p>
          </div>

          <aside className="vega-card vega-card-strong">
            <h2 className="vega-section-title">Günlük Piyasa Nabzı</h2>
            <p className="vega-section-copy">{marketPulse.aiDailyComment}</p>
            <Link href="/market-pulse" className="vega-link">Piyasayı İncele</Link>
          </aside>
        </section>

        <section className="vega-stats-grid" aria-label="Piyasa özeti">
          <div className="vega-stat">
            <div className="vega-stat-label">Fırsat Sayısı</div>
            <div className="vega-stat-value">{opportunities.length}</div>
          </div>
          <div className="vega-stat">
            <div className="vega-stat-label">Kritik Fırsat</div>
            <div className="vega-stat-value accent">{criticalCount}</div>
          </div>
          <div className="vega-stat">
            <div className="vega-stat-label">Piyasa Değişimi</div>
            <div className="vega-stat-value">+%{marketPulse.priceDirection}</div>
          </div>
          <div className="vega-stat">
            <div className="vega-stat-label">En Sıcak Bölge</div>
            <div className="vega-stat-value">{marketPulse.hottestRegion}</div>
          </div>
        </section>

        <section className="vega-two-col">
          <div className="vega-card">
            <div className="vega-row">
              <div>
                <h2 className="vega-section-title">Fırsat Radarı</h2>
                <p className="vega-section-copy">Bugün piyasada öne çıkan ilanları keşfet.</p>
              </div>
              <Link href="/opportunities" className="vega-link">Fırsatları İncele</Link>
            </div>

            <div className="vega-grid">
              {top3.map((item) => (
                <div key={item.id} className="vega-opportunity">
                  <div className="vega-row">
                    <div>
                      <div className="vega-opportunity-title">{item.title}</div>
                      <div className="vega-muted">
                        {item.district} / {item.neighborhood} · {item.roomCount} · {item.squareMeters}m²
                      </div>
                    </div>
                    <div className="vega-score">{item.dealScore}/100</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="vega-card">
            <h2 className="vega-section-title">Merkezler</h2>
            <p className="vega-section-copy">Sık kullanılan çalışma alanlarına tek dokunuşla geç.</p>
            <div className="vega-module-grid">
              {modules.map((module) => (
                <Link key={module.href} href={module.href} className="vega-module">
                  <span>{module.title}</span>
                  <span>{module.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
