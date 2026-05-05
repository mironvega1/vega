'use client'

import Link from 'next/link'
import { CommandCenterProvider, useCommandCenter } from '@/components/command-center/CommandCenterContext'
import { ConstraintEngine } from '@/components/command-center/ConstraintEngine'
import { DataConsole } from '@/components/command-center/DataConsole'
import { FailureAnalysis } from '@/components/command-center/FailureAnalysis'
import { MemoryGraph } from '@/components/command-center/MemoryGraph'
import { StrategyExperiments } from '@/components/command-center/StrategyExperiments'

export default function CommandCenterPage() {
  return (
    <CommandCenterProvider>
      <CommandCenterView />
    </CommandCenterProvider>
  )
}

function CommandCenterView() {
  const { analysis, data } = useCommandCenter()

  return (
    <main className="cc-page">
      <style>{styles}</style>

      <header className="cc-header">
        <Link href="/dashboard" className="cc-back">← Dashboard</Link>
        <div>
          <span className="cc-brand">VEGA</span>
          <span className="cc-brand-sub">COMMAND CENTER</span>
        </div>
      </header>

      <section className="cc-hero">
        <div>
          <div className="cc-kicker">KARAR MAKİNESİ</div>
          <h1>Hatalardan öğrenen, strateji test eden, geçmişi hatırlayan operasyon merkezi.</h1>
          <p>
            Sistem yalnızca kullanıcı verisiyle çalışır. Veri yoksa sonuç uydurmaz; eksik kayıtları,
            riskleri ve karar boşluklarını görünür yapar.
          </p>
        </div>
        <div className="cc-health">
          <Metric label="Müşteri" value={data.customers.length} />
          <Metric label="Portföy" value={data.portfolios.length} />
          <Metric label="İşlem" value={data.deals.length} />
          <Metric label="Karar" value={data.decisions.length} />
        </div>
      </section>

      <section className="cc-alerts">
        <div className="cc-panel-head">
          <div>
            <div className="cc-kicker">KRİTİK UYARILAR</div>
            <h2>Risk Motoru</h2>
          </div>
          <span className="cc-count">{analysis.criticalAlerts.length} uyarı</span>
        </div>
        {analysis.criticalAlerts.map((alert) => (
          <article key={`${alert.label}-${alert.detail}`} className={`cc-alert ${alert.risk}`}>
            <strong>{alert.label}</strong>
            <span>{alert.detail}</span>
          </article>
        ))}
      </section>

      <div className="cc-grid">
        <FailureAnalysis />
        <StrategyExperiments />
        <MemoryGraph />
        <ConstraintEngine />
      </div>

      <DataConsole />
    </main>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

const styles = `
.cc-page{min-height:100vh;background:radial-gradient(circle at 20% -10%,rgba(255,215,0,.09),transparent 34rem),#060606;color:#ededed;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;padding:24px}
.cc-header{max-width:1420px;margin:0 auto 28px;min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:18px;border-bottom:1px solid #151515}
.cc-back{color:#8a8a8a;text-decoration:none;font-size:13px}.cc-back:hover{color:#FFD700}.cc-brand{color:#FFD700;letter-spacing:5px;font-size:18px}.cc-brand-sub{color:#555;letter-spacing:3px;font-size:9px;margin-left:10px}
.cc-hero{max-width:1420px;margin:0 auto 18px;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(320px,.7fr);gap:14px;align-items:stretch}
.cc-hero>div:first-child,.cc-health,.cc-panel,.cc-alerts{background:rgba(255,255,255,.018);border:1px solid #171717;border-radius:10px;padding:22px}
.cc-hero h1{margin:0;color:#f6f6f6;font-size:clamp(34px,5vw,64px);line-height:1.02;font-weight:420;letter-spacing:0}.cc-hero p{max-width:760px;color:#9a9a9a;line-height:1.7;font-size:15px}
.cc-kicker{color:#FFD700;font-size:10px;letter-spacing:2.2px;margin-bottom:10px}.cc-health{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cc-health div{background:#0b0b0b;border:1px solid #191919;border-radius:8px;padding:16px}.cc-health strong{display:block;color:#FFD700;font-size:30px}.cc-health span{color:#868686;font-size:11px;letter-spacing:1px;text-transform:uppercase}
.cc-alerts{max-width:1420px;margin:0 auto 14px}.cc-alert{display:flex;justify-content:space-between;gap:12px;border-radius:8px;padding:12px 14px;margin-top:8px;background:#0c0c0c;border:1px solid #202020}.cc-alert.high{border-color:rgba(248,113,113,.35)}.cc-alert.medium{border-color:rgba(255,215,0,.28)}.cc-alert span{color:#aaa}
.cc-grid{max-width:1420px;margin:0 auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.cc-panel h2,.cc-alerts h2{margin:0;color:#f1f1f1;font-size:20px}.cc-panel h3{margin:0 0 10px;color:#ddd;font-size:14px}.cc-panel-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:16px}.cc-panel-head.compact{margin-bottom:10px}.cc-count{border:1px solid rgba(255,215,0,.24);color:#FFD700;background:rgba(255,215,0,.06);border-radius:999px;padding:5px 10px;font-size:11px;font-weight:700;white-space:nowrap}
.cc-empty,.cc-warning,.cc-plan-summary{border:1px solid #242424;background:#0b0b0b;border-radius:8px;padding:13px;color:#999}.cc-warning{border-color:rgba(255,215,0,.35);color:#FFD700}.cc-stack{display:grid;gap:10px}.cc-record,.cc-experiment{border:1px solid #202020;background:#0b0b0b;border-radius:8px;padding:14px}.cc-record summary{cursor:pointer;display:flex;justify-content:space-between;gap:10px}.cc-record summary strong{color:#FFD700}.cc-record-body{margin-top:12px}.cc-primary{color:#f3f3f3;margin:0 0 8px}.cc-metrics{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}.cc-metrics span,.cc-sample{font-size:11px;color:#aaa;border:1px solid #222;border-radius:999px;padding:4px 8px}.cc-record li{color:#9b9b9b;margin:4px 0}
.cc-subgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}.cc-line,.cc-pattern{display:flex;justify-content:space-between;gap:10px;border-bottom:1px solid #171717;padding:8px 0;color:#aaa}.cc-pattern.medium b,.cc-pattern.high b{color:#FFD700}.cc-muted{color:#8d8d8d;line-height:1.6;font-size:13px}
.cc-variants{display:grid;grid-template-columns:1fr 1fr;gap:10px}.cc-variant{border:1px solid #1e1e1e;border-radius:8px;padding:12px}.cc-winner{background:#FFD700;color:#050505;border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800}.cc-metric-row{display:grid;grid-template-columns:80px 70px 1fr;gap:8px;align-items:center;margin-top:10px;font-size:12px;color:#aaa}.cc-metric-row i{height:6px;background:#181818;border-radius:99px;overflow:hidden}.cc-metric-row em{display:block;height:100%;background:#FFD700}
.cc-graph{height:280px;position:relative;background:linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),#090909;background-size:42px 42px;border:1px solid #1d1d1d;border-radius:8px;overflow:hidden}.cc-node{position:absolute;max-width:140px;border:1px solid;border-radius:999px;background:#080808;padding:7px 10px}.cc-node span{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cc-node small{display:block;color:#777;font-size:9px}.cc-insight{border-left:2px solid #FFD700;padding-left:10px;color:#bbb;line-height:1.55}.cc-clusters{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.cc-clusters div{border:1px solid #202020;border-radius:8px;padding:10px;background:#0b0b0b}.cc-clusters strong,.cc-clusters span,.cc-clusters small{display:block}.cc-clusters span,.cc-clusters small{color:#888;font-size:11px;margin-top:3px}
.cc-goals{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:12px}.cc-goals label{display:grid;gap:6px;color:#888;font-size:11px;letter-spacing:.8px}.cc-goals input,.cc-goals select,.cc-data-console textarea{width:100%;background:#0b0b0b;border:1px solid #242424;border-radius:8px;color:#ededed;padding:11px;outline:none}.cc-action{display:flex;justify-content:space-between;gap:14px;border:1px solid #202020;border-radius:8px;background:#0b0b0b;padding:13px}.cc-action p{margin:5px 0 0;color:#898989}.cc-action span{color:#FFD700;font-weight:800}.cc-action.high{border-color:rgba(248,113,113,.28)}.cc-action.medium{border-color:rgba(255,215,0,.22)}
.cc-blocked{margin-top:14px}.cc-data-console{max-width:1420px;margin:14px auto 0}.cc-data-stats{display:flex;gap:8px;flex-wrap:wrap}.cc-data-stats span{font-size:11px;color:#aaa;border:1px solid #222;border-radius:999px;padding:5px 9px}.cc-data-console textarea{min-height:260px;margin-top:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.5}.cc-actions-row{display:flex;gap:10px;margin-top:12px}.cc-actions-row button{border:0;border-radius:8px;background:#FFD700;color:#050505;font-weight:800;padding:11px 14px;cursor:pointer}.cc-actions-row button.secondary{background:#151515;color:#ddd;border:1px solid #282828}
@media(max-width:980px){.cc-page{padding:16px}.cc-hero,.cc-grid,.cc-subgrid,.cc-variants{grid-template-columns:1fr}.cc-goals{grid-template-columns:1fr}.cc-header{align-items:flex-start;flex-direction:column;padding-bottom:12px}.cc-alert{flex-direction:column}.cc-metric-row{grid-template-columns:72px 60px 1fr}}
`
