'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { analyzeCommandCenter } from '@/lib/analysisEngine'
import { readCommandCenterData } from '@/lib/commandCenterStore'

const MODULES = [
  {
    id: 'feature-training',
    title: 'Özellik Rehberi',
    icon: '▥',
    href: '/feature-training',
    accent: '#fbbf24',
    tag: 'REHBER',
    desc: 'Hangi özelliğin hangi bilgiyle daha iyi çalıştığını sade şekilde gösterir.',
    features: ['Nasıl Kullanılır', 'Eksik Bilgi', 'Sonraki Adım'],
  },
  {
    id: 'command-center',
    title: 'İş Takibi',
    icon: '▧',
    href: '/command-center',
    accent: '#FFD700',
    tag: 'TAKİP',
    desc: 'Müşteri, portföy ve yapılacak işleri tek yerden takip edin.',
    features: ['Müşteri', 'Portföy', 'Yapılacaklar', 'Hatırlatma'],
  },
  {
    id: 'analysis',
    title: 'Analiz Merkezi',
    icon: '◎',
    href: '/analysis',
    accent: '#FFD700',
    tag: 'ANALİZ',
    desc: 'Fiyat, emsal, bölge ve risk kararları için hızlı analiz yapın.',
    features: ['Adres Analizi', 'Deal Skoru', 'Bölge Hakimiyeti', 'Risk Analizi'],
  },
  {
    id: 'listings',
    title: 'İlan Yönetimi',
    icon: '▦',
    href: '/listings',
    accent: '#fb923c',
    tag: 'PORTFÖY',
    desc: 'Portföylerinizi girin, düzenleyin ve durumlarını takip edin.',
    features: ['Portföy Ekle', 'CSV Aktar', 'Durum', 'Güncelleme'],
  },
  {
    id: 'ai',
    title: 'Emlak Asistanı',
    icon: '◈',
    href: '/ai',
    accent: '#a3e635',
    tag: 'AI',
    desc: 'Portföy ve müşterilerinize göre pratik cevaplar alın.',
    features: ['Soru Sor', 'Risk Yorumu', 'Mesaj Taslağı'],
  },
  {
    id: 'valuation',
    title: 'AI Değerleme',
    icon: '⚡',
    href: '/valuation',
    accent: '#a78bfa',
    tag: 'FİYAT',
    desc: 'Mülkün tahmini fiyat aralığını ve pazarlık payını görün.',
    features: ['Fiyat Tahmini', 'Fiyat Aralığı', 'Pazarlık'],
  },
  {
    id: 'sozlesme',
    title: 'Sözleşme Merkezi',
    icon: '▣',
    href: '/sozlesme',
    accent: '#22c55e',
    tag: 'EVRAK',
    desc: 'Kira ve satış belgelerini düzenli şekilde hazırlayın.',
    features: ['Kira', 'Satış', 'Kontrol'],
  },
  {
    id: 'report',
    title: 'PDF Rapor Merkezi',
    icon: '▣',
    href: '/report',
    accent: '#60a5fa',
    tag: 'RAPOR',
    desc: 'Müşteri görüşmesine hazır değerleme ve emsal raporu oluşturun.',
    features: ['PDF', 'Değerleme', 'Emsal'],
  },
  {
    id: 'emsal',
    title: 'Emsal İstihbarat',
    icon: '◭',
    href: '/emsal',
    accent: '#e879f9',
    tag: 'EMSAL',
    desc: 'Benzer ilanları, fiyat sapmasını ve fırsatları karşılaştırın.',
    features: ['Emsal', 'Sapma', 'Fırsat', 'Likidite'],
  },
]

const CENTER_GROUPS = [
  {
    id: 'operations',
    title: 'İş Takibi Merkezi',
    href: '/command-center',
    accent: '#FFD700',
    desc: 'Günlük takip, müşteri görüşmeleri ve portföy işleri için ana çalışma alanı.',
    features: ['Müşteri Ekle', 'Portföy Ekle', 'Yapılacaklar', 'Kaybedilen İşler'],
    modules: ['command-center', 'listings'],
  },
  {
    id: 'analysis-center',
    title: 'Analiz Merkezi',
    href: '/analysis',
    accent: '#e879f9',
    desc: 'Fiyatı, bölgeyi ve emsalleri daha güvenli yorumlamak için analiz araçları.',
    features: ['Adres Analizi', 'Deal Skoru', 'AI Değerleme', 'Emsal', 'Bölge Skoru', 'Kat Analizi'],
    modules: ['analysis', 'valuation', 'emsal'],
  },
  {
    id: 'documents',
    title: 'Belge Merkezi',
    href: '/sozlesme',
    accent: '#22c55e',
    desc: 'Kira, satış ve müşteri sunumu için hazır belge üretim alanı.',
    features: ['Kira Sözleşmesi', 'Satış Ön Sözleşmesi', 'PDF Rapor', 'Müşteri Sunumu'],
    modules: ['sozlesme', 'report'],
  },
  {
    id: 'ai-center',
    title: 'Asistan Merkezi',
    href: '/ai',
    accent: '#a3e635',
    desc: 'Müşteri mesajı, fiyat yorumu ve takip notu hazırlamak için pratik yardımcı.',
    features: ['Soru Sor', 'Mesaj Taslağı', 'Risk Yorumu', 'Takip Önerisi'],
    modules: ['ai'],
  },
]

const WORKFLOW = [
  ['01', 'Portföy', 'Yeni portföyü veya müşteriyi kaydet.'],
  ['02', 'Analiz', 'Fiyat, emsal veya bölge kontrolü yap.'],
  ['03', 'Takip', 'Aranacak müşteri ve yapılacak işi işaretle.'],
  ['04', 'Belge', 'Gerekirse sözleşme veya rapor hazırla.'],
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
    { label: 'Aktif İş', value: summary.activeDeals, note: 'Takipte' },
    { label: 'Bugünkü İş', value: summary.actions, note: 'Öncelikli' },
    { label: 'Kapanma', value: `%${summary.closeRate}`, note: 'Tahmin' },
    { label: 'Beklenen Ciro', value: money(summary.expectedRevenue), note: 'Yaklaşık' },
    { label: 'Analiz', value: summary.analysisCount, note: 'Hazır' },
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
          <Panel kicker="ÖZET" title="Bugünkü Durum">
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
            <Link href="/command-center" className="dash-link side-link">Müşteri veya portföy ekle →</Link>
          </Panel>

          <Panel kicker="HIZLI BAŞLANGIÇ" title="Sırayla Ne Yapılır?">
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

          <Panel kicker="KISA YOLLAR" title="En Çok Kullanılanlar">
            <Link href="/analysis" className="dash-quick-link">Analiz Yap →</Link>
            <Link href="/listings" className="dash-quick-link">Portföy Ekle →</Link>
            <Link href="/sozlesme" className="dash-quick-link">Sözleşme Hazırla →</Link>
          </Panel>
        </aside>

        <main className="dash-main">
          <section className="dash-hero">
            <div className="dash-panel hero-panel">
              <div className="dash-eyebrow">VEGA ANA EKRAN</div>
              <h1 className="dash-title">
                Bugün hangi işi öne alacağını daha net gör.
              </h1>
              <p className="dash-copy">
                Müşteri, portföy, analiz ve belge merkezleri tek ekranda. Büyük kartlardan merkeze gir,
                işini seç ve kaldığın yerden devam et.
              </p>
            </div>

            <aside className="dash-panel command-panel">
              <div className="dash-kicker">BUGÜNKÜ ÖNERİ</div>
              <div className="dash-command-copy">{summary.insight}</div>
              <div className="dash-command-grid">
                <MiniStat label="Aksiyon" value={summary.actions} color="#FFD700" />
                <MiniStat label="Risk" value={summary.highRisks} color={summary.highRisks ? '#f87171' : '#22c55e'} />
                <MiniStat label="Kapanma" value={`%${summary.closeRate}`} color="#c0c0c0" />
              </div>
              <Link href="/command-center" className="dash-link">İş Takibine Git →</Link>
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
              <div className="dash-section-label">MERKEZLER</div>
            </div>
            <div className="dash-centers">
              {CENTER_GROUPS.map((group) => (
                <CenterGroupCard key={group.id} group={group} />
              ))}
            </div>
          </section>

          <section className="dash-section">
            <div className="dash-section-head">
              <div className="dash-section-label">GÜNLÜK KULLANIM</div>
            </div>
            <div className="dash-routing-grid">
              {[
                ['Portföy girişi', 'Yeni ilanı ekleyin, durumunu takipte tutun.'],
                ['Fiyat kontrolü', 'Değerleme ve emsal ile fiyatı savunun.'],
                ['Müşteri takibi', 'Aranacak ve mesaj atılacak kişileri görün.'],
                ['Belge hazırlığı', 'Rapor veya sözleşmeyi görüşmeye hazır hale getirin.'],
              ].map(([title, text]) => (
                <div key={title} className="dash-route-card">
                  <b>{title}</b>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="dash-side">
          <Panel kicker="BUGÜN" title="Öncelikli İşler">
            {summary.topActions.length ? (
              summary.topActions.map((item) => (
                <div key={item.id} className={`dash-action-line ${item.risk}`}>
                  <span>{item.label}</span>
                </div>
              ))
            ) : (
              <div className="dash-empty">
                Henüz takip edilecek iş yok. Müşteri veya portföy ekleyince öncelikler burada görünür.
              </div>
            )}
          </Panel>

          <Panel kicker="DİKKAT" title="Kontrol Edilecekler">
            {summary.riskItems.map((item) => (
              <div key={item.id} className={`dash-risk-line ${item.level}`}>
                <span>{item.label}</span>
                <b>{item.value}</b>
              </div>
            ))}
          </Panel>

          <Panel kicker="SONUÇ" title="İş Durumu">
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

function CenterGroupCard({ group }: { group: (typeof CENTER_GROUPS)[number] }) {
  const modules = group.modules
    .map((id) => MODULES.find((module) => module.id === id))
    .filter((module): module is (typeof MODULES)[number] => Boolean(module))

  return (
    <Link href={group.href} className="dash-center-card" style={{ borderTopColor: `${group.accent}70` }}>
      <div className="dash-center-top">
        <span className="dash-center-mark" style={{ color: group.accent, background: `${group.accent}12`, borderColor: `${group.accent}28` }}>
          {group.title.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <div className="dash-card-title">{group.title}</div>
          <div className="dash-card-desc">{group.desc}</div>
        </div>
      </div>
      <div className="dash-center-feature-grid">
        {group.features.map((feature) => (
          <span key={feature}>{feature}</span>
        ))}
      </div>
      <div className="dash-center-links">
        {modules.map((module) => (
          <span key={module.id} style={{ color: module.accent, background: `${module.accent}10`, border: `1px solid ${module.accent}22` }}>
            {module.title}
          </span>
        ))}
      </div>
      <div className="dash-card-foot">
        <span>{group.features.length} özellik</span>
        <span style={{ color: group.accent }}>Merkeze Gir →</span>
      </div>
    </Link>
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
.dash-section{margin-bottom:34px}.dash-section-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:14px}.dash-section-label{color:#767676;font-size:10px;letter-spacing:3px}.dash-centers{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.dash-routing-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.dash-route-card{border:1px solid #191919;border-radius:10px;background:#0b0b0b;padding:14px;min-height:96px}.dash-route-card b{display:block;color:#eeeeee;font-size:13px;margin-bottom:7px}.dash-route-card span{display:block;color:#888;font-size:11px;line-height:1.5}.dash-module-card,.dash-tool-card,.dash-center-card{position:relative;display:block;height:100%;background:rgba(255,255,255,.018);border:1px solid #171717;border-radius:14px;padding:20px;text-decoration:none;color:inherit;transition:transform .15s ease,border-color .15s ease,background .15s ease}.dash-center-card{border-top:2px solid rgba(255,215,0,.45);min-height:286px;padding:24px}.dash-tool-card{min-height:176px;padding:16px}.dash-module-card:hover,.dash-tool-card:hover,.dash-center-card:hover{transform:translateY(-2px);background:rgba(255,255,255,.028);border-color:rgba(255,215,0,.22)}
.dash-center-top{display:flex;align-items:flex-start;gap:14px;margin-bottom:16px}.dash-center-mark{width:48px;height:48px;border:1px solid;border-radius:10px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;font-size:12px;font-weight:900;letter-spacing:.6px}.dash-center-feature-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:16px 0}.dash-center-feature-grid span{border:1px solid #222;background:#090909;border-radius:8px;color:#d7d7d7;font-size:12px;font-weight:700;line-height:1.2;padding:10px 11px}.dash-center-links{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 16px}.dash-center-links span{border-radius:5px;padding:4px 8px;font-size:10px;font-weight:650}
.dash-tag{position:absolute;top:10px;right:10px;border-radius:4px;padding:2px 6px;font-size:8px;font-weight:800}.dash-card-head{display:flex;align-items:center;gap:12px;margin-bottom:12px}.dash-icon{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;font-size:16px}.dash-card-title{color:#eeeeee;font-size:14px;font-weight:700;margin-bottom:3px}.dash-card-desc{color:#8a8a8a;font-size:11px;line-height:1.45;max-width:92%}.dash-feature-list{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0 16px}.dash-feature{border-radius:5px;padding:4px 8px;font-size:10px;font-weight:650}.dash-card-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;color:#777;font-size:11px}
@media(max-width:1180px){.dash-shell{grid-template-columns:1fr}.dash-side{position:static}.dash-hero,.dash-operating-grid,.dash-centers{grid-template-columns:1fr 1fr}.dash-routing-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.dash-header{align-items:flex-start;flex-direction:column;padding:16px 22px}.dash-header-stats{justify-content:flex-start}.dash-shell{padding:12px 12px 64px}.dash-hero,.dash-operating-grid,.dash-centers,.dash-routing-grid,.dash-command-grid,.dash-split{grid-template-columns:1fr}.dash-title{font-size:32px}.dash-panel,.dash-module-card,.dash-tool-card,.dash-center-card{padding:16px}}
`
