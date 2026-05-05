'use client'

import { useCommandCenter } from './CommandCenterContext'

export function DataConsole() {
  const { data, jsonValue, jsonError, setJsonValue, importJson, clearData } = useCommandCenter()

  return (
    <section className="cc-panel cc-data-console">
      <div className="cc-panel-head">
        <div>
          <div className="cc-kicker">KULLANICI VERİSİ</div>
          <h2>Veri Girişi</h2>
        </div>
        <div className="cc-data-stats">
          <span>{data.customers.length} müşteri</span>
          <span>{data.portfolios.length} portföy</span>
          <span>{data.deals.length} işlem</span>
        </div>
      </div>

      <p className="cc-muted">
        Bu merkez dış API veya sahte veri kullanmaz. JSON alanına sadece kullanıcının kendi operasyon
        kayıtları girilir; tüm analiz tarayıcı içinde hesaplanır.
      </p>

      <textarea value={jsonValue} onChange={(event) => setJsonValue(event.target.value)} spellCheck={false} />
      {jsonError && <div className="cc-warning">{jsonError}</div>}

      <div className="cc-actions-row">
        <button type="button" onClick={importJson}>Veriyi Analiz Et</button>
        <button type="button" onClick={clearData} className="secondary">Temizle</button>
      </div>
    </section>
  )
}
