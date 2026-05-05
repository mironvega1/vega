'use client'

import type { RiskLevel } from '@/lib/commandCenterTypes'
import { useCommandCenter } from './CommandCenterContext'

export function ConstraintEngine() {
  const { data, analysis, updateConstraints } = useCommandCenter()
  const constraints = data.constraints

  return (
    <section className="cc-panel">
      <div className="cc-panel-head">
        <div>
          <div className="cc-kicker">KISIT MOTORU</div>
          <h2>Optimal Aksiyon Planı</h2>
        </div>
        <span className="cc-count">{analysis.plan.actions.length} aksiyon</span>
      </div>

      <div className="cc-goals">
        <label>
          Minimum gelir hedefi
          <input
            type="number"
            value={constraints.minimumRevenue}
            onChange={(event) => updateConstraints({ minimumRevenue: Number(event.target.value) })}
          />
        </label>
        <label>
          Maksimum indirim %
          <input
            type="number"
            value={constraints.maxDiscountRate}
            onChange={(event) => updateConstraints({ maxDiscountRate: Number(event.target.value) })}
          />
        </label>
        <label>
          Zaman sınırı gün
          <input
            type="number"
            value={constraints.timeLimitDays}
            onChange={(event) => updateConstraints({ timeLimitDays: Number(event.target.value) })}
          />
        </label>
        <label>
          Risk seviyesi
          <select
            value={constraints.riskLevel}
            onChange={(event) => updateConstraints({ riskLevel: event.target.value as RiskLevel })}
          >
            <option value="low">Düşük</option>
            <option value="medium">Orta</option>
            <option value="high">Yüksek</option>
          </select>
        </label>
      </div>

      <div className="cc-plan-summary">{analysis.plan.summary}</div>

      {analysis.plan.actions.length ? (
        <div className="cc-stack">
          {analysis.plan.actions.map((action) => (
            <article key={`${action.dealId || 'global'}-${action.label}`} className={`cc-action ${action.risk}`}>
              <div>
                <strong>{action.label}</strong>
                <p>{action.reason}</p>
              </div>
              <span>{action.impact}</span>
            </article>
          ))}
        </div>
      ) : (
        <div className="cc-empty">Plan üretmek için aktif işlem ve hedef kaydı gerekiyor.</div>
      )}

      {analysis.plan.blocked.length > 0 && (
        <div className="cc-blocked">
          <h3>Kısıt Dışı Kalanlar</h3>
          {analysis.plan.blocked.map((item) => (
            <div key={item.dealId} className="cc-line">
              <span>{item.dealId}</span>
              <b>{item.reason}</b>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
