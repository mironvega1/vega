import Link from 'next/link'
import { dailyActions, demandSignals, marketPulse, regions } from '@/lib/mock/market'

const tl = (n: number) => new Intl.NumberFormat('tr-TR').format(n)

export default function MarketPulsePage() {
  return (
    <main className="vega-page">
      <div className="vega-shell">
        <header className="vega-topbar">
          <Link href="/dashboard" className="vega-back">← Dashboard</Link>
          <div className="vega-meta">{marketPulse.lastUpdate}</div>
        </header>

        <section className="vega-hero-copy" style={{ marginBottom: 22 }}>
          <div className="vega-eyebrow">Günlük Piyasa Nabzı</div>
          <h1 className="vega-title">Bölge hareketlerini tek ekranda okuyun.</h1>
          <p className="vega-subtitle">
            Fiyat yönü, yeni ilan akışı, talep sinyalleri ve günlük aksiyon listesiyle
            portföy kararlarını hızlandırın.
          </p>
        </section>

        <section className="vega-stats-grid" aria-label="Piyasa göstergeleri">
          <div className="vega-stat">
            <div className="vega-stat-label">Fiyat Yönü</div>
            <div className="vega-stat-value">+%{marketPulse.priceDirection}</div>
          </div>
          <div className="vega-stat">
            <div className="vega-stat-label">Yeni İlan</div>
            <div className="vega-stat-value">{marketPulse.newListings}</div>
          </div>
          <div className="vega-stat">
            <div className="vega-stat-label">En Hızlı Bölge</div>
            <div className="vega-stat-value accent">{marketPulse.hottestRegion}</div>
          </div>
          <div className="vega-stat">
            <div className="vega-stat-label">Talep</div>
            <div className="vega-stat-value">{marketPulse.demandIncrease}</div>
          </div>
        </section>

        <section className="vega-two-col">
          <div className="vega-card">
            <h2 className="vega-section-title">Bölge Performansı</h2>
            <div className="vega-grid">
              {regions.map((region) => (
                <article key={region.name} className="vega-opportunity">
                  <div className="vega-row">
                    <div>
                      <div className="vega-opportunity-title">{region.name}</div>
                      <div className="vega-muted">
                        m² {tl(region.m2Price)} TL · Günlük %{region.dailyChange} · Haftalık %
                        {region.weeklyChange}
                      </div>
                    </div>
                    <div className="vega-score">{region.newListings} yeni</div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="vega-card">
            <h2 className="vega-section-title">Talep Sinyalleri</h2>
            <div className="vega-grid">
              {demandSignals.map((signal) => (
                <article key={signal.title} className="vega-opportunity">
                  <div className="vega-opportunity-title">{signal.title}</div>
                  <div className="vega-muted">Etki: {signal.effect} · Bölge: {signal.region}</div>
                  <p className="vega-section-copy">{signal.action}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="vega-two-col" style={{ marginTop: 14 }}>
          <div className="vega-card">
            <h2 className="vega-section-title">Bugünün AI Piyasa Yorumu</h2>
            <p className="vega-section-copy">{marketPulse.aiDailyComment}</p>
          </div>

          <div className="vega-card">
            <h2 className="vega-section-title">Bugün Ne Yapmalıyım?</h2>
            <ol className="vega-list">
              {dailyActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </main>
  )
}
