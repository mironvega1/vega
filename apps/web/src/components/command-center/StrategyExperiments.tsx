'use client'

import { useCommandCenter } from './CommandCenterContext'

export function StrategyExperiments() {
  const { analysis } = useCommandCenter()

  return (
    <section className="cc-panel">
      <div className="cc-panel-head">
        <div>
          <div className="cc-kicker">STRATEJİ TESTLERİ</div>
          <h2>Aktif Deneyler</h2>
        </div>
        <span className="cc-count">{analysis.experiments.length} deney</span>
      </div>

      {analysis.experiments.length === 0 ? (
        <div className="cc-empty">Deney kaydı yok. Fiyat A/B veya strateji varyantları girildiğinde hesaplanır.</div>
      ) : (
        <div className="cc-stack">
          {analysis.experiments.map((experiment) => (
            <article key={experiment.id} className="cc-experiment">
              <div className="cc-panel-head compact">
                <div>
                  <h3>{experiment.name}</h3>
                  <p className="cc-muted">{experiment.liftText}</p>
                </div>
                {experiment.winner !== 'none' && <span className="cc-winner">Kazanan {experiment.winner}</span>}
              </div>

              {experiment.warning && <div className="cc-warning">{experiment.warning}</div>}

              <div className="cc-variants">
                {[experiment.variantA, experiment.variantB].map((variant) => (
                  <div key={variant.label} className="cc-variant">
                    <strong>{variant.label}</strong>
                    <Metric label="Kapanma" value={`%${Math.round(variant.closeRate * 100)}`} width={variant.closeRate * 100} />
                    <Metric label="Süre" value={`${Math.round(variant.averageDuration)} gün`} width={Math.max(10, 100 - variant.averageDuration)} />
                    <Metric
                      label="Gelir"
                      value={formatMoney(variant.averageRevenue)}
                      width={Math.min(100, variant.averageRevenue / 10000)}
                    />
                    <span className="cc-sample">n={variant.sampleSize}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function Metric({ label, value, width }: { label: string; value: string; width: number }) {
  return (
    <div className="cc-metric-row">
      <span>{label}</span>
      <b>{value}</b>
      <i>
        <em style={{ width: `${Math.max(4, Math.min(100, width))}%` }} />
      </i>
    </div>
  )
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}
