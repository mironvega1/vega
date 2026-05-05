'use client'

import { useState } from 'react'
import Link from 'next/link'
import { analyzeCommandCenter } from '@/lib/analysisEngine'
import { readCommandCenterData } from '@/lib/commandCenterStore'
import { marketPulse, opportunities } from '@/lib/mock/market'

const MERKEZLER = [
  {
    id: 'analysis',
    title: 'Analiz Merkezi',
    icon: '◎',
    href: '/analysis',
    accent: '#FFD700',
    desc: 'Adres, fırsat ve bölge analizleri',
    features: ['Adres Analizi', 'Deal Skoru', 'Bölge Hakimiyeti', 'Risk Analizi'],
  },
  {
    id: 'sozlesme',
    title: 'Sözleşme Merkezi',
    icon: '▣',
    href: '/sozlesme',
    accent: '#22c55e',
    desc: 'TBK uyumlu sözleşme üretimi',
    features: ['Kira Sözleşmesi', 'Satış Ön Sözleşmesi'],
  },
  {
    id: 'report',
    title: 'PDF Rapor Merkezi',
    icon: '▣',
    href: '/report',
    accent: '#60a5fa',
    desc: 'Müşteriye hazır profesyonel rapor',
    features: ['AI Değerleme Raporu', 'SHAP Faktör Analizi', 'PDF İndirme'],
  },
]

const ARACLAR = [
  {
    id: 'command-center',
    title: 'Command Center',
    icon: '▧',
    href: '/command-center',
    accent: '#FFD700',
    tag: 'OS',
    desc: 'Hata, deney, hafıza ve kısıt motoru',
  },
  {
    id: 'ai',
    title: 'Emlak Yapay Zekası',
    icon: '◈',
    href: '/ai',
    accent: '#FFD700',
    tag: 'AI',
    desc: 'Piyasa analizi ve yatırım tavsiyeleri',
  },
  {
    id: 'valuation',
    title: 'AI Değerleme',
    icon: '⚡',
    href: '/valuation',
    accent: '#a78bfa',
    tag: 'ML',
    desc: 'Sokak bazlı ML fiyat tahmini',
  },
  {
    id: 'map',
    title: 'Canlı Harita',
    icon: '◉',
    href: '/map',
    accent: '#38bdf8',
    desc: 'Fiyat ısı haritası ve yoğunluk',
  },
  {
    id: 'listings',
    title: 'İlan Yönetimi',
    icon: '▦',
    href: '/listings',
    accent: '#fb923c',
    desc: 'Portföy yönetimi ve CSV yükleme',
  },
  {
    id: 'zone',
    title: 'Bölge Skoru',
    icon: '◐',
    href: '/zone-scores',
    accent: '#f472b6',
    desc: 'İlçe bazlı yatırım skoru',
  },
  {
    id: 'bina',
    title: 'Kat Analizi',
    icon: '▤',
    href: '/bina-karsilastirma',
    accent: '#34d399',
    desc: 'Bina içi kat fiyat farkları',
  },
  {
    id: 'emsal',
    title: 'Emsal İstihbarat',
    icon: '◭',
    href: '/emsal',
    accent: '#e879f9',
    desc: 'Komşu satış ve emsal veritabanı',
  },
]

const MARKET_ITEMS = [
  { label: 'Fırsat', value: String(opportunities.length), change: 'Bugün', up: true },
  { label: 'Kritik Deal', value: String(opportunities.filter((item) => item.dealScore >= 85).length), change: '85+', up: true },
  { label: 'Piyasa Yönü', value: `+%${marketPulse.priceDirection}`, change: 'Günlük', up: true },
  { label: 'Yeni İlan', value: String(marketPulse.newListings), change: 'Aktif', up: true },
  { label: 'Sıcak Bölge', value: marketPulse.hottestRegion, change: marketPulse.demandIncrease, up: true },
]

export default function Dashboard() {
  const top3 = opportunities.slice(0, 3)
  const [commandSummary] = useState(() => {
    const data = readCommandCenterData()
    const analysis = analyzeCommandCenter(data)
    return {
      actions: analysis.actions.length,
      highRisks: analysis.risks.filter((risk) => risk.level === 'high').length,
      closeRate: Math.round(analysis.forecast.estimatedCloseRate * 100),
      insight: analysis.contextualInsights[0] || analysis.forecast.interpretation,
      actionItems: analysis.actions.slice(0, 4).map((action) => `${action.command}: ${action.title}`),
      riskItems: analysis.risks.slice(0, 5).map((risk) => `${risk.label} · ${risk.value}`),
      sourceCounts: [
        ['Müşteri', data.customers.length],
        ['Portföy', data.portfolios.length],
        ['İşlem', data.deals.length],
        ['Analiz', data.analysisResults.length],
      ] as Array<[string, number]>,
    }
  })

  return (
    <div className="dash-page">
      <style>{`
        .dash-page {
          min-height: 100vh;
          overflow-y: auto;
          background:
            radial-gradient(circle at 50% -10%, rgba(255, 215, 0, 0.08), transparent 34rem),
            #080808;
          color: #e0e0e0;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }
        .dash-header {
          position: sticky;
          top: 0;
          z-index: 100;
          min-height: 56px;
          background: rgba(8, 8, 8, 0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #141414;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 0 40px;
        }
        .dash-logo {
          color: #FFD700;
          font-size: 18px;
          letter-spacing: 5px;
          font-weight: 300;
          text-decoration: none;
        }
        .dash-logo-sub {
          font-size: 9px;
          color: #3a3a3a;
          letter-spacing: 3px;
          margin-left: 10px;
        }
        .dash-header-stats {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .dash-header-pill {
          min-width: 66px;
          padding: 6px 12px;
          background: #0c0c0c;
          border: 1px solid #1c1c1c;
          border-radius: 7px;
          text-align: center;
        }
        .dash-shell {
          width: 100%;
          box-sizing: border-box;
          padding: 18px 22px 80px;
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr) 300px;
          gap: 14px;
          align-items: start;
        }
        .dash-main {
          min-width: 0;
        }
        .dash-side {
          display: grid;
          gap: 12px;
          position: sticky;
          top: 74px;
        }
        .dash-side-card {
          background:
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.024) 1px, transparent 1px),
            #0b0b0b;
          background-size: 24px 24px;
          border: 1px solid #171717;
          border-radius: 12px;
          padding: 16px;
        }
        .dash-side-title {
          color: #eeeeee;
          font-size: 13px;
          font-weight: 750;
          margin-bottom: 10px;
        }
        .dash-mini-line {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          border-bottom: 1px solid #171717;
          padding: 8px 0;
          color: #8b8b8b;
          font-size: 11px;
          line-height: 1.35;
        }
        .dash-mini-line b {
          color: #FFD700;
        }
        .dash-architecture {
          min-height: 220px;
          position: relative;
          overflow: hidden;
        }
        .dash-architecture span {
          position: absolute;
          border: 1px solid rgba(255,215,0,0.22);
          background: rgba(255,215,0,0.045);
          border-radius: 8px;
        }
        .dash-architecture span:nth-child(1) { inset: 22px 92px 118px 12px; }
        .dash-architecture span:nth-child(2) { inset: 78px 36px 58px 84px; border-color: rgba(96,165,250,0.22); background: rgba(96,165,250,0.035); }
        .dash-architecture span:nth-child(3) { inset: 138px 126px 16px 34px; border-color: rgba(34,197,94,0.22); background: rgba(34,197,94,0.035); }
        .dash-architecture span:nth-child(4) { inset: 18px 18px 154px 178px; border-color: rgba(248,113,113,0.2); background: rgba(248,113,113,0.035); }
        .dash-architecture p {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 14px;
          margin: 0;
          color: #777;
          font-size: 11px;
          line-height: 1.55;
        }
        .dash-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.8fr);
          gap: 14px;
          margin-bottom: 26px;
        }
        .dash-panel {
          background: rgba(255, 255, 255, 0.018);
          border: 1px solid #171717;
          border-radius: 14px;
          padding: 22px;
        }
        .dash-eyebrow {
          color: #FFD700;
          font-size: 10px;
          letter-spacing: 2.4px;
          margin-bottom: 14px;
        }
        .dash-title {
          margin: 0;
          color: #f2f2f2;
          font-size: clamp(30px, 4vw, 50px);
          line-height: 1.05;
          font-weight: 300;
          letter-spacing: 0;
        }
        .dash-copy {
          margin: 16px 0 0;
          color: #9a9a9a;
          font-size: 14px;
          line-height: 1.7;
        }
        .dash-market {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 34px;
        }
        .dash-market-card {
          background: #0b0b0b;
          border: 1px solid #171717;
          border-radius: 10px;
          padding: 14px 16px;
          min-height: 96px;
        }
        .dash-kicker {
          color: #777;
          font-size: 9px;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .dash-market-value {
          color: #d8d8d8;
          font-size: 20px;
          font-weight: 700;
          line-height: 1.1;
        }
        .dash-change {
          color: #22c55e;
          font-size: 11px;
          margin-top: 7px;
        }
        .dash-section {
          margin-bottom: 36px;
        }
        .dash-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 14px;
        }
        .dash-section-label {
          color: #767676;
          font-size: 10px;
          letter-spacing: 3px;
        }
        .dash-link {
          color: #FFD700;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          opacity: 0.88;
        }
        .dash-link:hover {
          opacity: 1;
        }
        .dash-centers {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .dash-center-card,
        .dash-tool-card,
        .dash-opportunity {
          display: block;
          height: 100%;
          background: rgba(255, 255, 255, 0.018);
          border: 1px solid #171717;
          border-radius: 14px;
          padding: 20px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
        }
        .dash-center-card:hover,
        .dash-tool-card:hover,
        .dash-opportunity:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.028);
          border-color: rgba(255, 215, 0, 0.22);
        }
        .dash-card-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .dash-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          font-size: 16px;
        }
        .dash-card-title {
          color: #eeeeee;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 3px;
        }
        .dash-card-desc {
          color: #8a8a8a;
          font-size: 11px;
          line-height: 1.45;
        }
        .dash-feature-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 14px 0 16px;
        }
        .dash-feature {
          border-radius: 5px;
          padding: 4px 8px;
          font-size: 10px;
          font-weight: 650;
        }
        .dash-card-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #777;
          font-size: 11px;
        }
        .dash-tools {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }
        .dash-tool-card {
          position: relative;
          min-height: 168px;
          padding: 16px;
        }
        .dash-tag {
          position: absolute;
          top: 10px;
          right: 10px;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 8px;
          font-weight: 800;
        }
        .dash-tool-icon {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          margin-bottom: 12px;
        }
        .dash-opportunities {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .dash-opportunity {
          padding: 16px;
        }
        .dash-score {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #050505;
          background: #FFD700;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 800;
        }
        @media (max-width: 980px) {
          .dash-header {
            align-items: flex-start;
            flex-direction: column;
            padding: 16px 22px;
          }
          .dash-header-stats {
            justify-content: flex-start;
          }
          .dash-shell {
            padding: 14px 14px 64px;
            grid-template-columns: 1fr;
          }
          .dash-side {
            position: static;
          }
          .dash-hero,
          .dash-market,
          .dash-centers,
          .dash-opportunities {
            grid-template-columns: 1fr;
          }
          .dash-tools {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 560px) {
          .dash-tools {
            grid-template-columns: 1fr;
          }
          .dash-panel,
          .dash-center-card,
          .dash-tool-card,
          .dash-opportunity {
            padding: 16px;
          }
        }
      `}</style>

      <header className="dash-header">
        <div>
          <Link href="/" className="dash-logo">VEGA</Link>
          <span className="dash-logo-sub">INTELLIGENCE</span>
        </div>
        <div className="dash-header-stats">
          {[
            { label: 'Fırsat', value: opportunities.length, color: '#FFD700' },
            { label: 'Kritik', value: opportunities.filter((item) => item.dealScore >= 85).length, color: '#22c55e' },
            { label: 'İlan', value: marketPulse.newListings, color: '#c0c0c0' },
            { label: 'Bölge', value: marketPulse.hottestRegion, color: '#8a8a8a' },
          ].map((stat) => (
            <div key={stat.label} className="dash-header-pill">
              <div style={{ color: stat.color, fontSize: 13, fontWeight: 700, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ color: '#686868', fontSize: 9, marginTop: 4, letterSpacing: 1 }}>
                {stat.label.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </header>

      <div className="dash-shell">
        <aside className="dash-side">
          <div className="dash-side-card">
            <div className="dash-kicker">VERİ KAYNAKLARI</div>
            <div className="dash-side-title">Sistemi Besleyen Kayıtlar</div>
            {commandSummary.sourceCounts.map(([label, value]) => (
              <div key={label} className="dash-mini-line">
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
            <Link href="/command-center" className="dash-link" style={{ display: 'inline-block', marginTop: 12 }}>
              Kayıt Ekle →
            </Link>
          </div>

          <div className="dash-side-card dash-architecture">
            <span />
            <span />
            <span />
            <span />
            <p>Müşteri, portföy, işlem ve aksiyon katmanları tek karar mimarisine bağlanır.</p>
          </div>
        </aside>

        <main className="dash-main">
        <section className="dash-hero">
          <div className="dash-panel">
            <div className="dash-eyebrow">DASHBOARD</div>
            <h1 className="dash-title">
              Günaydın, bugün piyasada {opportunities.length} yeni fırsat var.
            </h1>
            <p className="dash-copy">
              Analiz Merkezi ve Command Center aynı kullanıcı verisini okur. Dashboard artık sadece
              modül listesi değil; karar motorundan gelen risk ve aksiyon sinyalini öne çıkarır.
            </p>
          </div>

          <aside className="dash-panel">
            <div className="dash-kicker">COMMAND CENTER SİNYALİ</div>
            <div style={{ color: '#e8e8e8', fontSize: 17, lineHeight: 1.55, marginBottom: 18 }}>
              {commandSummary.insight}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8, marginBottom: 18 }}>
              <div className="dash-header-pill"><div style={{ color: '#FFD700', fontWeight: 800 }}>{commandSummary.actions}</div><div style={{ color: '#686868', fontSize: 9 }}>AKSİYON</div></div>
              <div className="dash-header-pill"><div style={{ color: commandSummary.highRisks ? '#f87171' : '#22c55e', fontWeight: 800 }}>{commandSummary.highRisks}</div><div style={{ color: '#686868', fontSize: 9 }}>RİSK</div></div>
              <div className="dash-header-pill"><div style={{ color: '#c0c0c0', fontWeight: 800 }}>%{commandSummary.closeRate}</div><div style={{ color: '#686868', fontSize: 9 }}>KAPANMA</div></div>
            </div>
            <Link href="/command-center" className="dash-link">Karar Merkezine Git →</Link>
          </aside>
        </section>

        <section className="dash-market" aria-label="Piyasa özeti">
          {MARKET_ITEMS.map((item) => (
            <div key={item.label} className="dash-market-card">
              <div className="dash-kicker">{item.label}</div>
              <div className="dash-market-value">{item.value}</div>
              <div className="dash-change">{item.change}</div>
            </div>
          ))}
        </section>

        <section className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-label">MERKEZLER</div>
          </div>
          <div className="dash-centers">
            {MERKEZLER.map((center) => (
              <Link key={center.id} href={center.href} className="dash-center-card">
                <div className="dash-card-head">
                  <div
                    className="dash-icon"
                    style={{
                      color: center.accent,
                      background: `${center.accent}12`,
                      border: `1px solid ${center.accent}28`,
                    }}
                  >
                    {center.icon}
                  </div>
                  <div>
                    <div className="dash-card-title">{center.title}</div>
                    <div className="dash-card-desc">{center.desc}</div>
                  </div>
                </div>

                <div className="dash-feature-list">
                  {center.features.map((feature) => (
                    <span
                      key={feature}
                      className="dash-feature"
                      style={{
                        color: center.accent,
                        background: `${center.accent}10`,
                        border: `1px solid ${center.accent}22`,
                      }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="dash-card-foot">
                  <span>{center.features.length} özellik</span>
                  <span style={{ color: center.accent }}>Merkeze Gir →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-label">FIRSAT RADARI</div>
            <Link href="/opportunities" className="dash-link">Fırsatları İncele →</Link>
          </div>
          <div className="dash-opportunities">
            {top3.map((item) => (
              <Link key={item.id} href="/opportunities" className="dash-opportunity">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div className="dash-card-title">{item.title}</div>
                  <div className="dash-score">{item.dealScore}</div>
                </div>
                <div className="dash-card-desc">
                  {item.district} / {item.neighborhood} · {item.roomCount} · {item.squareMeters}m²
                </div>
                <div style={{ color: '#9a9a9a', fontSize: 12, lineHeight: 1.55, marginTop: 12 }}>
                  {item.aiSummary}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="dash-section">
          <div className="dash-section-head">
            <div className="dash-section-label">ARAÇLAR</div>
          </div>
          <div className="dash-tools">
            {ARACLAR.map((tool) => (
              <Link key={tool.id} href={tool.href} className="dash-tool-card">
                {'tag' in tool && tool.tag && (
                  <span
                    className="dash-tag"
                    style={{
                      color: tool.accent,
                      background: `${tool.accent}16`,
                      border: `1px solid ${tool.accent}28`,
                    }}
                  >
                    {tool.tag}
                  </span>
                )}
                <div
                  className="dash-tool-icon"
                  style={{
                    color: tool.accent,
                    background: `${tool.accent}12`,
                    border: `1px solid ${tool.accent}24`,
                  }}
                >
                  {tool.icon}
                </div>
                <div className="dash-card-title">{tool.title}</div>
                <div className="dash-card-desc">{tool.desc}</div>
                <div style={{ color: tool.accent, fontSize: 11, fontWeight: 700, marginTop: 14 }}>Aç →</div>
              </Link>
            ))}
          </div>
        </section>
        </main>

        <aside className="dash-side">
          <div className="dash-side-card">
            <div className="dash-kicker">AKSİYON SİNYALİ</div>
            <div className="dash-side-title">Öncelikli İşler</div>
            {commandSummary.actionItems.length ? (
              commandSummary.actionItems.map((item) => (
                <div key={item} className="dash-mini-line">
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <div className="dash-mini-line">
                <span>Command Center veri bekliyor.</span>
              </div>
            )}
          </div>

          <div className="dash-side-card">
            <div className="dash-kicker">RİSK MİMARİSİ</div>
            <div className="dash-side-title">Canlı Uyarılar</div>
            {commandSummary.riskItems.map((item) => (
              <div key={item} className="dash-mini-line">
                <span>{item}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
