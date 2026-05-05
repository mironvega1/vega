'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { opportunities } from '@/lib/mock/market'

const tl = (n: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(n)

export default function OpportunitiesPage() {
  const [watched, setWatched] = useState<string[]>([])
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('deal')
  const [selected, setSelected] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const rows = useMemo(() => {
    return opportunities
      .filter((item) => item.title.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'discount') return b.discountRate - a.discountRate
        if (sort === 'new') return +new Date(b.publishedAt) - +new Date(a.publishedAt)
        return b.dealScore - a.dealScore
      })
  }, [q, sort])

  const selectedOpportunity = opportunities.find((item) => item.id === selected)

  return (
    <main className="vega-page">
      <div className="vega-shell">
        <header className="vega-topbar">
          <Link href="/dashboard" className="vega-back">← Dashboard</Link>
          <div className="vega-meta">Son güncelleme: Bugün 09:30</div>
        </header>

        <section className="vega-hero-copy">
          <div className="vega-eyebrow">Fırsat Radarı</div>
          <h1 className="vega-title">Piyasa altı fırsatları takip edin.</h1>
          <p className="vega-subtitle">
            Deal skoru, iskonto oranı ve AI özetiyle hızlı tarama yapın. İzlemeye alın,
            müşteriye mesaj hazırlayın veya rapora geçin.
          </p>
        </section>

        <div className="vega-toolbar">
          <input
            className="vega-input"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Başlık, mahalle veya oda tipi ara"
          />
          <select
            className="vega-select"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="deal">En yüksek deal</option>
            <option value="discount">En yüksek iskonto</option>
            <option value="new">En yeni</option>
          </select>
        </div>

        <section className="vega-grid">
          {rows.map((item) => {
            const isWatched = watched.includes(item.id)

            return (
              <article key={item.id} className="vega-opportunity">
                <div className="vega-row">
                  <div>
                    <h2 className="vega-opportunity-title">{item.title}</h2>
                    <div className="vega-muted">
                      {item.city} / {item.district} / {item.neighborhood} · {item.roomCount} ·{' '}
                      {item.squareMeters}m²
                    </div>
                  </div>
                  <div className="vega-score">{item.dealScore}/100</div>
                </div>

                <div className="vega-muted">
                  Fiyat: {tl(item.price)} · Piyasa: {tl(item.estimatedMarketPrice)} · İskonto:
                  %{item.discountRate}
                </div>
                <p className="vega-section-copy">{item.aiSummary}</p>

                <div className="vega-actions">
                  <button className="vega-button vega-button-primary" onClick={() => setSelected(item.id)}>
                    Detaylı İncele
                  </button>
                  <button
                    className="vega-button"
                    onClick={() =>
                      setWatched((current) =>
                        isWatched ? current.filter((id) => id !== item.id) : [...current, item.id],
                      )
                    }
                  >
                    {isWatched ? 'İzlemeden Çıkar' : 'İzlemeye Al'}
                  </button>
                  <button
                    className="vega-button"
                    onClick={() =>
                      setMsg(
                        `Merhaba, ${item.district} ${item.neighborhood} bölgesinde ${item.roomCount} fırsatı var. Fiyat ${tl(item.price)}, piyasa ${tl(item.estimatedMarketPrice)}.`,
                      )
                    }
                  >
                    Müşteriye Gönder
                  </button>
                  <Link href="/report" className="vega-button">Rapor Oluştur</Link>
                </div>
              </article>
            )
          })}
        </section>
      </div>

      {selectedOpportunity && (
        <div className="vega-dialog-backdrop" onClick={() => setSelected(null)}>
          <div className="vega-dialog" onClick={(event) => event.stopPropagation()}>
            <h2 className="vega-section-title">{selectedOpportunity.title}</h2>
            <p className="vega-section-copy">{selectedOpportunity.aiSummary}</p>
            <div className="vega-muted">Aksiyonlar: satıcıyı ara, tapuyu doğrula, aidat kontrol et.</div>
          </div>
        </div>
      )}

      {msg && (
        <div className="vega-toast">
          <div className="vega-muted">{msg}</div>
          <div className="vega-actions" style={{ marginTop: 12 }}>
            <button className="vega-button vega-button-primary" onClick={() => navigator.clipboard.writeText(msg)}>
              Kopyala
            </button>
            <button className="vega-button" onClick={() => setMsg('')}>Kapat</button>
          </div>
        </div>
      )}
    </main>
  )
}
