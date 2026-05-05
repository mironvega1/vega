'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { CommandCenterProvider, useCommandCenter } from '@/components/command-center/CommandCenterContext'
import { ConstraintEngine } from '@/components/command-center/ConstraintEngine'
import { DataConsole } from '@/components/command-center/DataConsole'
import type { ActionRecommendation, RiskLevel } from '@/lib/commandCenterTypes'

const money = (value: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)

export default function CommandCenterPage() {
  return (
    <CommandCenterProvider>
      <CommandCenterView />
    </CommandCenterProvider>
  )
}

function CommandCenterView() {
  const { analysis, data, recordFeedback } = useCommandCenter()
  const wonDeals = data.deals.filter((deal) => deal.status === 'won').length
  const lostDeals = data.deals.filter((deal) => deal.status === 'lost').length
  const activeDeals = data.deals.filter((deal) => deal.status === 'active').length

  return (
    <main className="cc-page">
      <style>{styles}</style>

      <header className="cc-header">
        <Link href="/dashboard" className="cc-back">← Ana Merkez</Link>
        <div className="cc-title">
          <span>VEGA</span>
          <strong>Command Center</strong>
        </div>
        <Link href="/analysis" className="cc-back">Analiz Merkezi →</Link>
      </header>

      <section className="cc-shell">
        <aside className="cc-col cc-left">
          <Panel kicker="OPERASYON" title="Aksiyon Motoru" meta={`${analysis.actions.length} öneri`}>
            <div className="cc-action-list">
              {analysis.actions.map((action) => (
                <ActionCard key={action.id} action={action} onDone={() => recordFeedback({ actionId: action.id, dealId: action.dealId, result: 'done', note: action.command })} />
              ))}
            </div>
          </Panel>

          <ConstraintEngine />
        </aside>

        <section className="cc-col cc-center">
          <section className="cc-hero">
            <div>
              <div className="cc-kicker">VERİ → ANALİZ → KARAR → AKSİYON → GERİ BESLEME</div>
              <h1>Statik dashboard değil, çalışan karar makinesi.</h1>
              <p>
                Sistem kullanıcı verisini okur, analiz sonuçlarını hafızaya alır, risk üretir,
                aksiyonu önceliklendirir ve geri bildirimi bir sonraki karara katar.
              </p>
            </div>
            <div className="cc-score">
              <strong>%{Math.round(analysis.forecast.estimatedCloseRate * 100)}</strong>
              <span>Tahmini kapanma oranı</span>
              <em>{analysis.forecast.interpretation}</em>
            </div>
          </section>

          <div className="cc-metrics">
            <Metric label="Aktif işlem" value={activeDeals} comment={activeDeals ? 'Sistem bunları aksiyon için izliyor.' : 'Aktif işlem yok.'} />
            <Metric label="Kazanılan" value={wonDeals} comment={wonDeals ? 'Geçmiş başarı tahmine katıldı.' : 'Başarı geçmişi yok.'} />
            <Metric label="Kaybedilen" value={lostDeals} comment={lostDeals ? 'Kayıplar hata öğrenimine işlendi.' : 'Kayıp paterni oluşmadı.'} />
            <Metric label="Analiz kaydı" value={data.analysisResults.length} comment={data.analysisResults.length ? 'Analiz sonucu merkeze akıyor.' : 'Analiz verisi bekleniyor.'} />
          </div>

          <Panel kicker="TAHMİN" title="Basit Tahmin Paneli" meta={money(analysis.forecast.expectedWonRevenue)}>
            <div className="cc-forecast-grid">
              <Info label="Aktif kayıt" value={analysis.forecast.activeCount.toString()} note="Kapanma havuzundaki canlı iş sayısı." />
              <Info label="Beklenen gelir" value={money(analysis.forecast.expectedRevenue)} note="Aktif işlemlerin toplam potansiyeli." />
              <Info label="Ağırlıklı sonuç" value={money(analysis.forecast.expectedWonRevenue)} note="Kapanma oranıyla risklenmiş gelir." />
            </div>
            <div className="cc-comment">{analysis.forecast.expectedResult}</div>
          </Panel>

          <Panel kicker="PROBLEMLİ VARLIKLAR" title="Sistemin Takıldığı Yerler" meta={`${analysis.problemAssets.length} kayıt`}>
            {analysis.problemAssets.length ? (
              <div className="cc-problems">
                {analysis.problemAssets.map((asset) => (
                  <article key={asset.id} className={`cc-problem ${asset.severity}`}>
                    <div>
                      <strong>{asset.title}</strong>
                      <span>{asset.metric}</span>
                    </div>
                    <p>{asset.interpretation}</p>
                    <ul>
                      {asset.evidence.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </article>
                ))}
              </div>
            ) : (
              <Empty text="Problemli varlık görünmüyor. Kullanıcı verisi geldikçe fiyat, takip ve performans analizi burada çalışır." />
            )}
          </Panel>

          <Panel kicker="ANALİZ AKIŞI" title="Command Center’a Gelen Sonuçlar" meta={`${data.analysisResults.length} analiz`}>
            {data.analysisResults.length ? (
              <div className="cc-feed">
                {data.analysisResults.slice(0, 6).map((item) => (
                  <article key={item.id}>
                    <strong>{item.title}</strong>
                    <span>{item.location || item.source}</span>
                    <p>{item.summary}</p>
                  </article>
                ))}
              </div>
            ) : (
              <Empty text="Analiz Merkezi’nde üretilen gerçek kullanıcı sonuçları buraya yazılacak. Sahte veri yok." />
            )}
          </Panel>

          <DataConsole />
        </section>

        <aside className="cc-col cc-right">
          <Panel kicker="RİSK" title="Risk Paneli" meta={`${analysis.risks.filter((risk) => risk.level === 'high').length} kritik`}>
            <div className="cc-risk-list">
              {analysis.risks.map((risk) => (
                <article key={risk.id} className={`cc-risk ${risk.level}`}>
                  <div>
                    <strong>{risk.label}</strong>
                    <span>{risk.value}</span>
                  </div>
                  <p>{risk.interpretation}</p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel kicker="ÖĞRENİLEN HATALAR" title="Başarısızlık Analizi" meta={`${analysis.failures.records.length} kayıp`}>
            {analysis.failures.topMistakes.length ? (
              <div className="cc-lines">
                {analysis.failures.topMistakes.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <b>{item.count}</b>
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="Kapanmayan ya da kaybedilen süreç verisi oluşunca sistem tekrar eden hatayı çıkarır." />
            )}
          </Panel>

          <Panel kicker="BAĞLAMSAL ZEKA" title="Hafıza Grafı İçgörüleri" meta={`${analysis.memory.nodes.length} node`}>
            <div className="cc-insights">
              {[...analysis.contextualInsights, ...analysis.memory.insights].slice(0, 7).map((insight) => (
                <p key={insight}>{insight}</p>
              ))}
            </div>
          </Panel>

          <Panel kicker="DENEYLER" title="Aktif Strateji Testleri" meta={`${analysis.experiments.length} test`}>
            {analysis.experiments.length ? (
              <div className="cc-experiments">
                {analysis.experiments.map((experiment) => (
                  <article key={experiment.id}>
                    <strong>{experiment.name}</strong>
                    <span>{experiment.liftText}</span>
                    {experiment.warning && <em>{experiment.warning}</em>}
                  </article>
                ))}
              </div>
            ) : (
              <Empty text="Fiyat A/B, agresif-normal veya hızlı-sabırlı strateji kayıtları girilince kazanan burada görünür." />
            )}
          </Panel>
        </aside>
      </section>
    </main>
  )
}

function Panel({ kicker, title, meta, children }: { kicker: string; title: string; meta: string; children: ReactNode }) {
  return (
    <section className="cc-panel">
      <div className="cc-panel-head">
        <div>
          <div className="cc-kicker">{kicker}</div>
          <h2>{title}</h2>
        </div>
        <span>{meta}</span>
      </div>
      {children}
    </section>
  )
}

function ActionCard({ action, onDone }: { action: ActionRecommendation; onDone: () => void }) {
  return (
    <article className={`cc-action-card ${action.risk}`}>
      <div>
        <span>{action.command}</span>
        <b>{action.impact}</b>
      </div>
      <strong>{action.title}</strong>
      <p>{action.reason}</p>
      <button onClick={onDone}>Yapıldı</button>
    </article>
  )
}

function Metric({ label, value, comment }: { label: string; value: number; comment: string }) {
  return (
    <article>
      <strong>{value}</strong>
      <span>{label}</span>
      <p>{comment}</p>
    </article>
  )
}

function Info({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="cc-empty">{text}</div>
}

const riskColors: Record<RiskLevel, string> = {
  low: '#22c55e',
  medium: '#FFD700',
  high: '#f87171',
}

const styles = `
.cc-page{min-height:100vh;background:#060606;color:#ededed;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
.cc-header{height:58px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 22px;border-bottom:1px solid #161616;background:#080808;position:sticky;top:0;z-index:20}
.cc-back{color:#777;text-decoration:none;font-size:12px}.cc-back:hover{color:#FFD700}.cc-title{display:flex;align-items:baseline;gap:12px}.cc-title span{color:#FFD700;letter-spacing:5px;font-size:18px}.cc-title strong{font-size:12px;color:#777;font-weight:500;letter-spacing:2px;text-transform:uppercase}
.cc-shell{display:grid;grid-template-columns:330px minmax(0,1fr) 340px;gap:12px;padding:12px;align-items:start}.cc-col{display:grid;gap:12px}.cc-left,.cc-right{position:sticky;top:70px;max-height:calc(100vh - 82px);overflow:auto;padding-bottom:16px}
.cc-panel,.cc-hero,.cc-metrics article{background:#0b0b0b;border:1px solid #1b1b1b;border-radius:8px;padding:14px}.cc-panel-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.cc-panel-head h2{margin:0;color:#f2f2f2;font-size:16px;font-weight:650}.cc-panel-head>span{border:1px solid rgba(255,215,0,.25);color:#FFD700;background:rgba(255,215,0,.05);border-radius:999px;padding:5px 9px;font-size:10px;font-weight:800;white-space:nowrap}.cc-kicker{color:#FFD700;font-size:9px;letter-spacing:2px;margin-bottom:6px;text-transform:uppercase}
.cc-hero{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:18px;align-items:stretch;background:linear-gradient(135deg,rgba(255,215,0,.08),rgba(255,255,255,.015) 45%,#0b0b0b)}.cc-hero h1{margin:0;font-size:36px;line-height:1.06;font-weight:520;letter-spacing:0;color:#fff}.cc-hero p{margin:12px 0 0;color:#9a9a9a;line-height:1.65;font-size:14px}.cc-score{border:1px solid rgba(255,215,0,.18);border-radius:8px;background:rgba(0,0,0,.22);padding:15px;display:flex;flex-direction:column;justify-content:center}.cc-score strong{font-size:42px;color:#FFD700;line-height:1}.cc-score span{margin-top:8px;color:#ddd;font-size:13px}.cc-score em{margin-top:12px;color:#8e8e8e;font-style:normal;font-size:12px;line-height:1.5}
.cc-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.cc-metrics strong{display:block;color:#FFD700;font-size:28px}.cc-metrics span{display:block;color:#ddd;font-size:12px;margin-top:4px}.cc-metrics p{margin:7px 0 0;color:#777;font-size:11px;line-height:1.45}
.cc-action-list,.cc-risk-list,.cc-problems,.cc-feed,.cc-lines,.cc-insights,.cc-experiments{display:grid;gap:9px}.cc-action-card,.cc-risk,.cc-problem,.cc-feed article,.cc-experiments article,.cc-forecast-grid article{border:1px solid #222;background:#090909;border-radius:8px;padding:11px}.cc-action-card>div,.cc-risk>div,.cc-problem>div,.cc-lines div{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.cc-action-card span{text-transform:uppercase;color:#FFD700;font-size:9px;letter-spacing:1.4px}.cc-action-card b{color:#FFD700}.cc-action-card strong,.cc-risk strong,.cc-problem strong,.cc-feed strong,.cc-experiments strong{display:block;color:#f0f0f0;font-size:13px}.cc-action-card p,.cc-risk p,.cc-problem p,.cc-feed p,.cc-experiments span,.cc-forecast-grid p{margin:7px 0 0;color:#888;font-size:12px;line-height:1.5}.cc-action-card button{margin-top:10px;width:100%;border:1px solid rgba(255,215,0,.3);background:rgba(255,215,0,.08);color:#FFD700;border-radius:7px;padding:8px;cursor:pointer;font-weight:800}.cc-action-card.high,.cc-risk.high,.cc-problem.high{border-color:${riskColors.high}66}.cc-action-card.medium,.cc-risk.medium,.cc-problem.medium{border-color:${riskColors.medium}55}.cc-action-card.low,.cc-risk.low,.cc-problem.low{border-color:${riskColors.low}44}
.cc-forecast-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.cc-forecast-grid span{display:block;color:#777;font-size:10px;text-transform:uppercase;letter-spacing:1px}.cc-forecast-grid strong{display:block;color:#f3f3f3;font-size:16px;margin-top:5px}.cc-comment,.cc-empty{margin-top:10px;border:1px solid #222;background:#090909;border-radius:8px;padding:11px;color:#999;font-size:12px;line-height:1.55}.cc-empty{margin-top:0}
.cc-problem span,.cc-risk span{color:#FFD700;font-size:12px;white-space:nowrap}.cc-problem ul{margin:8px 0 0;padding-left:17px;color:#777;font-size:11px;line-height:1.5}.cc-feed span{display:block;color:#FFD700;font-size:11px;margin-top:3px}.cc-lines div{border-bottom:1px solid #181818;padding:8px 0}.cc-lines span{color:#aaa;font-size:12px;line-height:1.4}.cc-lines b{color:#FFD700}.cc-insights p{border-left:2px solid #FFD700;margin:0;padding:2px 0 2px 10px;color:#aaa;font-size:12px;line-height:1.55}.cc-experiments em{display:block;color:#FFD700;font-style:normal;font-size:11px;margin-top:6px}
.cc-goals{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}.cc-goals label{display:grid;gap:5px;color:#888;font-size:10px;letter-spacing:.7px}.cc-goals input,.cc-goals select,.cc-data-console textarea{width:100%;box-sizing:border-box;background:#090909;border:1px solid #252525;border-radius:7px;color:#ededed;padding:9px;outline:none}.cc-plan-summary{border:1px solid #222;background:#090909;border-radius:8px;padding:10px;color:#aaa;font-size:12px;margin-bottom:9px}.cc-stack{display:grid;gap:8px}.cc-action{display:flex;justify-content:space-between;gap:10px;border:1px solid #222;border-radius:8px;background:#090909;padding:10px}.cc-action p{margin:5px 0 0;color:#888;font-size:12px}.cc-action span{color:#FFD700;font-weight:800}.cc-blocked{margin-top:12px}.cc-blocked h3{font-size:13px;margin:0 0 8px}.cc-line{display:flex;justify-content:space-between;gap:8px;color:#888;border-bottom:1px solid #171717;padding:7px 0;font-size:12px}
.cc-data-console{background:#0b0b0b;border:1px solid #1b1b1b;border-radius:8px;padding:14px}.cc-data-stats{display:flex;gap:6px;flex-wrap:wrap}.cc-data-stats span{font-size:10px;color:#aaa;border:1px solid #222;border-radius:999px;padding:5px 8px}.cc-data-console textarea{min-height:230px;margin-top:10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;line-height:1.5}.cc-actions-row{display:flex;gap:8px;margin-top:10px}.cc-actions-row button{border:0;border-radius:7px;background:#FFD700;color:#050505;font-weight:800;padding:10px 12px;cursor:pointer}.cc-actions-row button.secondary{background:#151515;color:#ddd;border:1px solid #282828}
.cc-muted{color:#888;font-size:12px;line-height:1.55;margin:0 0 10px}.cc-warning{border:1px solid rgba(255,215,0,.35);background:rgba(255,215,0,.06);color:#FFD700;border-radius:7px;padding:9px;margin-top:8px;font-size:12px}.cc-count{border:1px solid rgba(255,215,0,.25);color:#FFD700;background:rgba(255,215,0,.05);border-radius:999px;padding:5px 9px;font-size:10px;font-weight:800;white-space:nowrap}
@media(max-width:1180px){.cc-shell{grid-template-columns:1fr}.cc-left,.cc-right{position:static;max-height:none}.cc-hero,.cc-metrics,.cc-forecast-grid{grid-template-columns:1fr 1fr}}@media(max-width:720px){.cc-header{height:auto;align-items:flex-start;flex-direction:column;padding:14px}.cc-hero,.cc-metrics,.cc-forecast-grid,.cc-goals{grid-template-columns:1fr}.cc-shell{padding:8px}.cc-hero h1{font-size:28px}}
`
