'use client'

import { useCommandCenter } from './CommandCenterContext'

export function FailureAnalysis() {
  const { analysis } = useCommandCenter()
  const { failures } = analysis

  return (
    <section className="cc-panel">
      <div className="cc-panel-head">
        <div>
          <div className="cc-kicker">BAŞARISIZLIK ANALİZİ</div>
          <h2>Kaybedilen İşler Paneli</h2>
        </div>
        <span className="cc-count">{failures.records.length} kayıt</span>
      </div>

      {failures.records.length === 0 ? (
        <div className="cc-empty">Kayıp işlem verisi yok. Sistem sahte sonuç üretmez.</div>
      ) : (
        <div className="cc-stack">
          {failures.records.map((record) => (
            <details key={record.dealId} className="cc-record">
              <summary>
                <span>{record.title}</span>
                <strong>{record.confidence}% güven</strong>
              </summary>
              <div className="cc-record-body">
                <p className="cc-primary">{record.primaryCause}</p>
                <div className="cc-metrics">
                  <span>{record.durationDays} gün</span>
                  <span>{record.missingActions.length} aksiyon açığı</span>
                </div>
                <ul>
                  {record.signals.map((signal) => (
                    <li key={signal}>{signal}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      )}

      <div className="cc-subgrid">
        <div>
          <h3>En Çok Yapılan Hata</h3>
          {failures.topMistakes.length ? (
            failures.topMistakes.map((mistake) => (
              <div key={mistake.label} className="cc-line">
                <span>{mistake.label}</span>
                <b>{mistake.count}</b>
              </div>
            ))
          ) : (
            <p className="cc-muted">Henüz hata paterni oluşmadı.</p>
          )}
        </div>
        <div>
          <h3>Tekrarlayan Pattern</h3>
          {failures.repeatedPatterns.length ? (
            failures.repeatedPatterns.map((pattern) => (
              <div key={pattern.label} className={`cc-pattern ${pattern.severity}`}>
                <span>{pattern.label}</span>
                <b>{pattern.count} tekrar</b>
              </div>
            ))
          ) : (
            <p className="cc-muted">Tekrar eden hata yok veya veri az.</p>
          )}
        </div>
      </div>
    </section>
  )
}
