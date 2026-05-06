'use client'

import Link from 'next/link'
import { useState } from 'react'
import { buildFeatureTraining } from '@/lib/featureTraining'
import { readCommandCenterData } from '@/lib/commandCenterStore'

const levelLabel = {
  weak: 'Eğitim zayıf',
  learning: 'Öğreniyor',
  strong: 'Güçlü',
}

export default function FeatureTrainingPage() {
  const [training] = useState(() => buildFeatureTraining(readCommandCenterData()))
  const strong = training.filter((item) => item.level === 'strong').length
  const learning = training.filter((item) => item.level === 'learning').length
  const weak = training.filter((item) => item.level === 'weak').length

  return (
    <main className="ft-page">
      <style>{styles}</style>

      <header className="ft-header">
        <Link href="/dashboard" className="ft-back">← Dashboard</Link>
        <div>
          <span>VEGA</span>
          <strong>Feature Training</strong>
        </div>
        <Link href="/command-center" className="ft-back">Command Center →</Link>
      </header>

      <section className="ft-shell">
        <aside className="ft-side">
          <section className="ft-panel">
            <div className="ft-kicker">EĞİTİM DURUMU</div>
            <h1>Her özellik ayrı veriyle güçlenir.</h1>
            <p>
              Bu merkez model uydurmaz; her modülün hangi kullanıcı verisiyle güvenilir çalışacağını,
              hangi kalite eşiğini aradığını ve hangi aksiyona bağlandığını gösterir.
            </p>
          </section>

          <section className="ft-panel ft-stats">
            <div><b>{strong}</b><span>Güçlü</span></div>
            <div><b>{learning}</b><span>Öğreniyor</span></div>
            <div><b>{weak}</b><span>Zayıf</span></div>
          </section>

          <section className="ft-panel">
            <div className="ft-kicker">GENEL TALİMAT</div>
            <div className="ft-line">1. Müşteri ve portföy ekle.</div>
            <div className="ft-line">2. İşlem ve temas kaydı oluştur.</div>
            <div className="ft-line">3. Analiz sonucu üret.</div>
            <div className="ft-line">4. Aksiyon geri bildirimi ver.</div>
          </section>
        </aside>

        <section className="ft-main">
          {training.map((feature) => (
            <article key={feature.id} className={`ft-card ${feature.level}`}>
              <div className="ft-card-head">
                <div>
                  <div className="ft-kicker">{feature.category}</div>
                  <h2>{feature.title}</h2>
                </div>
                <div className="ft-score">
                  <b>{feature.readiness}</b>
                  <span>{levelLabel[feature.level]}</span>
                </div>
              </div>

              <p className="ft-mission">{feature.mission}</p>

              <div className="ft-grid">
                <Block title="Veri Gereksinimi" items={feature.requiredData} />
                <Block title="Mevcut Sinyal" items={feature.currentSignals} />
                <Block title="Kalite Kuralları" items={feature.qualityRules} />
                <Block title="Çıktı Sözleşmesi" items={feature.outputContract} />
                <Block title="Kaçınılacak Hata" items={feature.failureModes} />
                <Block title="Sonraki Eğitim" items={feature.nextTrainingActions.length ? feature.nextTrainingActions : feature.missingData} />
              </div>

              <div className="ft-handoff">
                <span>{feature.handoff}</span>
                <Link href={feature.href}>Modüle Git →</Link>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  )
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="ft-block">
      <h3>{title}</h3>
      {items.map((item) => (
        <div key={item} className="ft-line">{item}</div>
      ))}
    </div>
  )
}

const styles = `
.ft-page{min-height:100vh;background:#070707;color:#ededed;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
.ft-header{height:58px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 22px;border-bottom:1px solid #161616;background:#080808;position:sticky;top:0;z-index:20}.ft-header div{display:flex;align-items:baseline;gap:12px}.ft-header span{color:#FFD700;letter-spacing:5px;font-size:18px}.ft-header strong{font-size:12px;color:#777;font-weight:500;letter-spacing:2px;text-transform:uppercase}.ft-back{color:#777;text-decoration:none;font-size:12px}.ft-back:hover{color:#FFD700}
.ft-shell{display:grid;grid-template-columns:320px minmax(0,1fr);gap:14px;padding:16px 18px 80px}.ft-side{display:grid;gap:12px;align-content:start;position:sticky;top:74px}.ft-panel,.ft-card{background:linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.024) 1px,transparent 1px),#0b0b0b;background-size:24px 24px;border:1px solid #171717;border-radius:12px;padding:16px}.ft-panel h1{margin:0;color:#f2f2f2;font-size:30px;line-height:1.08;font-weight:420}.ft-panel p{color:#969696;font-size:13px;line-height:1.65}.ft-kicker{color:#FFD700;font-size:9px;letter-spacing:1.8px;text-transform:uppercase;margin-bottom:8px}
.ft-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ft-stats div{border:1px solid #222;background:#090909;border-radius:8px;padding:10px;text-align:center}.ft-stats b{display:block;color:#FFD700;font-size:22px}.ft-stats span{display:block;color:#777;font-size:10px;margin-top:4px}
.ft-main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.ft-card{padding:18px}.ft-card.weak{border-color:rgba(248,113,113,.28)}.ft-card.learning{border-color:rgba(255,215,0,.25)}.ft-card.strong{border-color:rgba(34,197,94,.28)}.ft-card-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.ft-card h2{margin:0;color:#f4f4f4;font-size:19px}.ft-score{min-width:88px;text-align:center;border:1px solid rgba(255,215,0,.24);border-radius:9px;background:rgba(255,215,0,.05);padding:8px}.ft-score b{display:block;color:#FFD700;font-size:24px;line-height:1}.ft-score span{display:block;color:#888;font-size:10px;margin-top:4px}.ft-mission{color:#aaa;font-size:13px;line-height:1.55;margin:12px 0 14px}
.ft-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.ft-block{border:1px solid #202020;background:#090909;border-radius:9px;padding:11px}.ft-block h3{margin:0 0 8px;color:#ddd;font-size:12px}.ft-line{border-bottom:1px solid #171717;color:#8f8f8f;font-size:11px;line-height:1.4;padding:7px 0}.ft-line:last-child{border-bottom:0}.ft-handoff{display:flex;justify-content:space-between;gap:12px;align-items:center;border-top:1px solid #1b1b1b;margin-top:13px;padding-top:12px}.ft-handoff span{color:#888;font-size:12px;line-height:1.45}.ft-handoff a{color:#FFD700;text-decoration:none;font-size:12px;font-weight:800;white-space:nowrap}
@media(max-width:1100px){.ft-shell{grid-template-columns:1fr}.ft-side{position:static}.ft-main{grid-template-columns:1fr}}@media(max-width:620px){.ft-header{height:auto;align-items:flex-start;flex-direction:column;padding:14px}.ft-shell{padding:10px}.ft-grid,.ft-stats{grid-template-columns:1fr}.ft-card-head,.ft-handoff{flex-direction:column}.ft-score{text-align:left}}
`
