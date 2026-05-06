'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { analyzeCommandCenter } from '@/lib/analysisEngine'
import { readCommandCenterData } from '@/lib/commandCenterStore'

const MODULES = [
  {
    id: 'feature-training',
    title: 'Feature Training',
    icon: '▥',
    href: '/feature-training',
    accent: '#fbbf24',
    tag: 'EĞİTİM',
    desc: 'Her modülün veri ihtiyacını, kalite kurallarını ve eksik eğitim adımlarını gösterir.',
    features: ['Hazır Olma', 'Kalite Kuralı', 'Eksik Veri', 'Eğitim Planı'],
  },
  {
    id: 'command-center',
    title: 'Command Center',
    icon: '▧',
    href: '/command-center',
    accent: '#FFD700',
    tag: 'OS',
    desc: 'Müşteri, portföy, işlem ve aksiyon verisini tek karar motorunda birleştirir.',
    features: ['Veri Girişi', 'Aksiyon Motoru', 'Risk Paneli', 'Hafıza Grafı'],
  },
  {
    id: 'analysis',
    title: 'Analiz Merkezi',
    icon: '◎',
    href: '/analysis',
    accent: '#FFD700',
    tag: 'ANALİZ',
    desc: 'Adres, deal skoru, bölge ve risk analizlerini Command Center hafızasına aktarır.',
    features: ['Adres Analizi', 'Deal Skoru', 'Bölge Hakimiyeti', 'Risk Analizi'],
  },
  {
    id: 'listings',
    title: 'İlan Yönetimi',
    icon: '▦',
    href: '/listings',
    accent: '#fb923c',
    tag: 'PORTFÖY',
    desc: 'Portföy kayıtlarını operasyon ve takip süreçleriyle bağlamlandırır.',
    features: ['Portföy', 'CSV', 'Durum', 'Güncelleme'],
  },
  {
    id: 'ai',
    title: 'Emlak Yapay Zekası',
    icon: '◈',
    href: '/ai',
    accent: '#a3e635',
    tag: 'AI',
    desc: 'Kullanıcının kendi Command Center verisini okuyarak bağlamsal yanıt üretir.',
    features: ['Kişisel Context', 'Risk Yorumu', 'Aksiyon Önerisi'],
  },
  {
    id: 'valuation',
    title: 'AI Değerleme',
    icon: '⚡',
    href: '/valuation',
    accent: '#a78bfa',
    tag: 'ML',
    desc: 'Sokak bazlı değerleme sonuçlarını karar sürecine sinyal olarak ekler.',
    features: ['Fiyat Tahmini', 'SHAP', 'Skor'],
  },
  {
    id: 'sozlesme',
    title: 'Sözleşme Merkezi',
    icon: '▣',
    href: '/sozlesme',
    accent: '#22c55e',
    tag: 'EVRAK',
    desc: 'Kapanışa yaklaşan işlemler için sözleşme üretim akışını hızlandırır.',
    features: ['Kira', 'Satış', 'Kontrol'],
  },
  {
    id: 'report',
    title: 'PDF Rapor Merkezi',
    icon: '▣',
    href: '/report',
    accent: '#60a5fa',
    tag: 'RAPOR',
    desc: 'Müşteri görüşmelerinde kullanılacak profesyonel rapor çıktıları üretir.',
    features: ['PDF', 'Değerleme', 'Paylaşım'],
  },
  {
    id: 'emsal',
    title: 'Emsal İstihbarat',
    icon: '◭',
    href: '/emsal',
    accent: '#e879f9',
    tag: 'EMSAL',
    desc: 'Kullanıcının arama kriterlerine göre emsal ve sapma analizi yapar.',
    features: ['Emsal', 'Sapma', 'Likidite'],
  },
]

const WORKFLOW = [
  ['01', 'Veri', 'Müşteri ve portföy kaydı girilir.'],
  ['02', 'Analiz', 'Fiyat, risk ve takip sinyali hesaplanır.'],
  ['03', 'Karar', 'Aksiyon motoru öncelik çıkarır.'],
  ['04', 'Geri Besleme', 'Yapıldı/kaybedildi bilgisi hafızaya yazılır.'],
]

const money = (value: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)

export default function Dashboard() {
  const [summary] = useState(() => {
    const data = readCommandCenterData()
    const analysis = analyzeCommandCenter(data)
    const activeDeals = data.deals.filter((deal) => deal.status === 'active').length
    const wonDeals = data.deals.filter((deal) => deal.status === 'won').length
    const lostDeals = data.deals.filter((deal) => deal.status === 'lost').length
    const highRisks = analysis.risks.filter((risk) => risk.level === 'high').length
    const topActions = analysis.actions.slice(0, 5)

    return {
      customers: data.customers.length,
      portfolios: data.portfolios.length,
      deals: data.deals.length,
      activeDeals,
      wonDeals,
      lostDeals,
      analysisCount: data.analysisResults.length,
      actions: analysis.actions.length,
      highRisks,
      closeRate: Math.round(analysis.forecast.estimatedCloseRate * 100),
      expectedRevenue: analysis.forecast.expectedWonRevenue,
      insight: analysis.contextualInsights[0] || analysis.forecast.interpretation,
      topActions: topActions.map((action) => ({
        id: action.id,
        label: `${action.command}: ${action.title}`,
        risk: action.risk,
      })),
      riskItems: analysis.risks.slice(0, 5).map((risk) => ({
        id: risk.id,
        label: risk.label,
        value: risk.value,
        level: risk.level,
      })),
    }
  })

  const headerStats = [
    { label: 'Müşteri', value: summary.customers, color: '#FFD700' },
    { label: 'Portföy', value: summary.portfolios, color: '#22c55e' },
    { label: 'İşlem', value: summary.deals, color: '#c0c0c0' },
    { label: 'Risk', value: summary.highRisks, color: summary.highRisks ? '#f87171' : '#8a8a8a' },
  ]

  const operatingMetrics = [
    { label: 'Aktif İşlem', value: summary.activeDeals, note: 'Kişisel takip havuzu' },
    { label: 'Aksiyon', value: summary.actions, note: 'Command Center önerisi' },
    { label: 'Kapanma', value: `%${summary.closeRate}`, note: 'Veriden türeyen tahmin' },
    { label: 'Beklenen Sonuç', value: money(summary.expectedRevenue), note: 'Risk ağırlıklı gelir' },
    { label: 'Analiz', value: summary.analysisCount, note: 'Hafızaya yazılan sonuç' },
  ]

  return (
    <div className="dash-page">
      <style>{styles}</style>

      <header className="dash-header">
        <div>
          <Link href="/" className="dash-logo">VEGA</Link>
          <span className="dash-logo-sub">INTELLIGENCE</span>
        </div>
        <div className="dash-header-stats">
          {headerStats.map((stat) => (
            <div key={stat.label} className="dash-header-pill">
              <div style={{ color: stat.color, fontSize: 13, fontWeight: 800, lineHeight: 1 }}>
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
          <Panel kicker="KİŞİSEL VERİ" title="Kayıt Katmanı">
            {[
              ['Müşteri', summary.customers],
              ['Portföy', summary.portfolios],
              ['İşlem', summary.deals],
              ['Analiz', summary.analysisCount],
            ].map(([label, value]) => (
              <div key={label} className="dash-mini-line">
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
            <Link href="/command-center" className="dash-link side-link">Yeni Kayıt Ekle →</Link>
          </Panel>

          <Panel kicker="MİMARİ" title="Operasyon Akışı">
            <div className="dash-workflow">
              {WORKFLOW.map(([step, title, text]) => (
                <div key={step}>
                  <b>{step}</b>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </Panel>

          <div className="dash-architecture" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <p>Kişiye özel veri katmanları üst üste binerek karar mimarisini oluşturur.</p>
          </div>
        </aside>

        <main className="dash-main">
          <section className="dash-hero">
            <div className="dash-panel hero-panel">
              <div className="dash-eyebrow">KİŞİSEL OPERASYON</div>
              <h1 className="dash-title">
                Günaydın, bugün kendi operasyonunda {summary.actions} aksiyon sinyali var.
              </h1>
              <p className="dash-copy">
                Bu ekran herkes için aynı demo piyasa haberini göstermez. Müşteri, portföy, işlem,
                analiz ve geri bildirim kayıtların neyse dashboard sadece onu yorumlar.
              </p>
            </div>

            <aside className="dash-panel command-panel">
              <div className="dash-kicker">COMMAND CENTER SİNYALİ</div>
              <div className="dash-command-copy">{summary.insight}</div>
              <div className="dash-command-grid">
                <MiniStat label="Aksiyon" value={summary.actions} color="#FFD700" />
                <MiniStat label="Risk" value={summary.highRisks} color={summary.highRisks ? '#f87171' : '#22c55e'} />
                <MiniStat label="Kapanma" value={`%${summary.closeRate}`} color="#c0c0c0" />
              </div>
              <Link href="/command-center" className="dash-link">Karar Merkezine Git →</Link>
            </aside>
          </section>

          <section className="dash-operating-grid" aria-label="Kişisel operasyon özeti">
            {operatingMetrics.map((item) => (
              <article key={item.label} className="dash-metric-card">
                <div className="dash-kicker">{item.label}</div>
                <div className="dash-market-value">{item.value}</div>
                <div className="dash-change">{item.note}</div>
              </article>
            ))}
          </section>

          <section className="dash-section">
            <div className="dash-section-head">
              <div className="dash-section-label">ANA MODÜLLER</div>
            </div>
            <div className="dash-modules">
              {MODULES.slice(0, 4).map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </section>

          <section className="dash-section">
            <div className="dash-section-head">
              <div className="dash-section-label">OPERASYON ARAÇLARI</div>
            </div>
            <div className="dash-tools">
              {MODULES.slice(4).map((module) => (
                <ModuleCard key={module.id} module={module} compact />
              ))}
            </div>
          </section>
        </main>

        <aside className="dash-side">
          <Panel kicker="BUGÜNKÜ PLAN" title="Öncelikli İşler">
            {summary.topActions.length ? (
              summary.topActions.map((item) => (
                <div key={item.id} className={`dash-action-line ${item.risk}`}>
                  <span>{item.label}</span>
                </div>
              ))
            ) : (
              <div className="dash-empty">
                Command Center veri bekliyor. Müşteri, portföy ve işlem eklenince kişisel plan burada oluşur.
              </div>
            )}
          </Panel>

          <Panel kicker="RİSK ÇİZGİSİ" title="Canlı Uyarılar">
            {summary.riskItems.map((item) => (
              <div key={item.id} className={`dash-risk-line ${item.level}`}>
                <span>{item.label}</span>
                <b>{item.value}</b>
              </div>
            ))}
          </Panel>

          <Panel kicker="DURUM" title="Kapanış Hafızası">
            <div className="dash-split">
              <MiniStat label="Aktif" value={summary.activeDeals} color="#FFD700" />
              <MiniStat label="Kazanılan" value={summary.wonDeals} color="#22c55e" />
              <MiniStat label="Kaybedilen" value={summary.lostDeals} color="#f87171" />
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  )
}

function Panel({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="dash-side-card">
      <div className="dash-kicker">{kicker}</div>
      <div className="dash-side-title">{title}</div>
      {children}
    </section>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="dash-header-pill">
      <div style={{ color, fontWeight: 800 }}>{value}</div>
      <div style={{ color: '#686868', fontSize: 9, marginTop: 4 }}>{label.toUpperCase()}</div>
    </div>
  )
}

function ModuleCard({
  module,
  compact,
}: {
  module: (typeof MODULES)[number]
  compact?: boolean
}) {
  return (
    <Link href={module.href} className={compact ? 'dash-tool-card' : 'dash-module-card'}>
      <span
        className="dash-tag"
        style={{ color: module.accent, background: `${module.accent}16`, border: `1px solid ${module.accent}28` }}
      >
        {module.tag}
      </span>
      <div className="dash-card-head">
        <div
          className="dash-icon"
          style={{ color: module.accent, background: `${module.accent}12`, border: `1px solid ${module.accent}28` }}
        >
          {module.icon}
        </div>
        <div>
          <div className="dash-card-title">{module.title}</div>
          <div className="dash-card-desc">{module.desc}</div>
        </div>
      </div>
      <div className="dash-feature-list">
        {module.features.map((feature) => (
          <span
            key={feature}
            className="dash-feature"
            style={{ color: module.accent, background: `${module.accent}10`, border: `1px solid ${module.accent}22` }}
          >
            {feature}
          </span>
        ))}
      </div>
      <div className="dash-card-foot">
        <span>{module.features.length} özellik</span>
        <span style={{ color: module.accent }}>Aç →</span>
      </div>
    </Link>
  )
}

const styles = `
.dash-page{min-height:100vh;overflow-y:auto;background:radial-gradient(circle at 50% -10%,rgba(255,215,0,.08),transparent 34rem),#080808;color:#e0e0e0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
.dash-header{position:sticky;top:0;z-index:100;min-height:56px;background:rgba(8,8,8,.96);backdrop-filter:blur(12px);border-bottom:1px solid #141414;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:0 40px}
.dash-logo{color:#FFD700;font-size:18px;letter-spacing:5px;font-weight:300;text-decoration:none}.dash-logo-sub{font-size:9px;color:#3a3a3a;letter-spacing:3px;margin-left:10px}.dash-header-stats{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.dash-header-pill{min-width:66px;padding:6px 12px;background:#0c0c0c;border:1px solid #1c1c1c;border-radius:7px;text-align:center}
.dash-shell{width:100%;box-sizing:border-box;padding:18px 24px 80px;display:grid;grid-template-columns:minmax(260px,18vw) minmax(0,1fr) minmax(280px,20vw);gap:14px;align-items:start}.dash-main{min-width:0}.dash-side{display:grid;gap:12px;position:sticky;top:74px}.dash-side-card,.dash-panel,.dash-metric-card,.dash-architecture{background:linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.024) 1px,transparent 1px),#0b0b0b;background-size:24px 24px;border:1px solid #171717;border-radius:12px;padding:16px}
.dash-kicker{color:#777;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;margin-bottom:8px}.dash-side-title{color:#eeeeee;font-size:13px;font-weight:750;margin-bottom:10px}.dash-link{color:#FFD700;font-size:12px;font-weight:700;text-decoration:none;opacity:.88}.dash-link:hover{opacity:1}.side-link{display:inline-block;margin-top:12px}
.dash-mini-line,.dash-risk-line,.dash-action-line{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #171717;padding:8px 0;color:#8b8b8b;font-size:11px;line-height:1.35}.dash-mini-line b,.dash-risk-line b{color:#FFD700}.dash-risk-line.high b,.dash-action-line.high span{color:#f87171}.dash-risk-line.medium b,.dash-action-line.medium span{color:#FFD700}.dash-risk-line.low b,.dash-action-line.low span{color:#22c55e}.dash-empty{border:1px solid #202020;background:#090909;border-radius:8px;padding:11px;color:#888;font-size:12px;line-height:1.5}
.dash-workflow{display:grid;gap:8px}.dash-workflow div{border:1px solid #202020;background:#090909;border-radius:8px;padding:10px}.dash-workflow b{display:inline-block;color:#FFD700;font-size:10px;margin-right:8px}.dash-workflow strong{color:#eaeaea;font-size:12px}.dash-workflow span{display:block;color:#7d7d7d;font-size:11px;line-height:1.45;margin-top:5px}
.dash-architecture{min-height:220px;position:relative;overflow:hidden}.dash-architecture span{position:absolute;border:1px solid rgba(255,215,0,.22);background:rgba(255,215,0,.045);border-radius:8px}.dash-architecture span:nth-child(1){inset:22px 92px 118px 12px}.dash-architecture span:nth-child(2){inset:78px 36px 58px 84px;border-color:rgba(96,165,250,.22);background:rgba(96,165,250,.035)}.dash-architecture span:nth-child(3){inset:138px 126px 16px 34px;border-color:rgba(34,197,94,.22);background:rgba(34,197,94,.035)}.dash-architecture span:nth-child(4){inset:18px 18px 154px 178px;border-color:rgba(248,113,113,.2);background:rgba(248,113,113,.035)}.dash-architecture p{position:absolute;left:16px;right:16px;bottom:14px;margin:0;color:#777;font-size:11px;line-height:1.55}
.dash-hero{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(320px,.75fr);gap:14px;margin-bottom:14px}.hero-panel{background:linear-gradient(135deg,rgba(255,215,0,.07),rgba(255,255,255,.018) 50%,#0b0b0b)}.dash-eyebrow{color:#FFD700;font-size:10px;letter-spacing:2.4px;margin-bottom:14px}.dash-title{margin:0;color:#f2f2f2;font-size:clamp(34px,4.2vw,68px);line-height:1.02;font-weight:300;letter-spacing:0}.dash-copy{margin:18px 0 0;color:#9a9a9a;font-size:14px;line-height:1.7}.dash-command-copy{color:#e8e8e8;font-size:17px;line-height:1.55;margin-bottom:18px}.dash-command-grid,.dash-split{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:16px}
.dash-operating-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin-bottom:30px}.dash-metric-card{min-height:96px}.dash-market-value{color:#d8d8d8;font-size:20px;font-weight:700;line-height:1.1}.dash-change{color:#22c55e;font-size:11px;margin-top:7px;line-height:1.35}
.dash-section{margin-bottom:34px}.dash-section-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:14px}.dash-section-label{color:#767676;font-size:10px;letter-spacing:3px}.dash-modules{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.dash-tools{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.dash-module-card,.dash-tool-card{position:relative;display:block;height:100%;background:rgba(255,255,255,.018);border:1px solid #171717;border-radius:14px;padding:20px;text-decoration:none;color:inherit;transition:transform .15s ease,border-color .15s ease,background .15s ease}.dash-tool-card{min-height:176px;padding:16px}.dash-module-card:hover,.dash-tool-card:hover{transform:translateY(-2px);background:rgba(255,255,255,.028);border-color:rgba(255,215,0,.22)}
.dash-tag{position:absolute;top:10px;right:10px;border-radius:4px;padding:2px 6px;font-size:8px;font-weight:800}.dash-card-head{display:flex;align-items:center;gap:12px;margin-bottom:12px}.dash-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;font-size:16px}.dash-card-title{color:#eeeeee;font-size:14px;font-weight:700;margin-bottom:3px}.dash-card-desc{color:#8a8a8a;font-size:11px;line-height:1.45;max-width:92%}.dash-feature-list{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 16px}.dash-feature{border-radius:5px;padding:4px 8px;font-size:10px;font-weight:650}.dash-card-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;color:#777;font-size:11px}
@media(max-width:1180px){.dash-shell{grid-template-columns:1fr}.dash-side{position:static}.dash-hero,.dash-operating-grid,.dash-modules{grid-template-columns:1fr 1fr}.dash-tools{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.dash-header{align-items:flex-start;flex-direction:column;padding:16px 22px}.dash-header-stats{justify-content:flex-start}.dash-shell{padding:12px 12px 64px}.dash-hero,.dash-operating-grid,.dash-modules,.dash-tools,.dash-command-grid,.dash-split{grid-template-columns:1fr}.dash-title{font-size:32px}.dash-panel,.dash-module-card,.dash-tool-card{padding:16px}}
`
