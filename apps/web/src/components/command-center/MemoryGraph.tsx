'use client'

import { useCommandCenter } from './CommandCenterContext'

const typeColor = {
  customer: '#FFD700',
  portfolio: '#38bdf8',
  deal: '#22c55e',
  decision: '#e879f9',
}

export function MemoryGraph() {
  const { analysis } = useCommandCenter()
  const { memory } = analysis
  const visibleNodes = memory.nodes.slice(0, 18)

  return (
    <section className="cc-panel">
      <div className="cc-panel-head">
        <div>
          <div className="cc-kicker">HAFIZA GRAF</div>
          <h2>Geçmişte Ne Oldu?</h2>
        </div>
        <span className="cc-count">{memory.nodes.length} node</span>
      </div>

      {memory.nodes.length === 0 ? (
        <div className="cc-empty">Graph için müşteri, portföy, işlem ve karar node’ları gerekiyor.</div>
      ) : (
        <>
          <div className="cc-graph">
            {visibleNodes.map((node, index) => (
              <div
                key={node.id}
                className="cc-node"
                style={{
                  borderColor: typeColor[node.type],
                  color: typeColor[node.type],
                  left: `${12 + (index % 6) * 15}%`,
                  top: `${18 + Math.floor(index / 6) * 28}%`,
                  transform: `scale(${Math.min(1.25, 0.84 + node.weight / 18)})`,
                }}
              >
                <span>{node.label}</span>
                <small>{node.type}</small>
              </div>
            ))}
          </div>

          <div className="cc-subgrid">
            <div>
              <h3>Bağlamsal İçgörü</h3>
              {memory.insights.map((insight) => (
                <p key={insight} className="cc-insight">{insight}</p>
              ))}
            </div>
            <div>
              <h3>Benzer Durumlar</h3>
              {memory.similarCases.length ? (
                memory.similarCases.map((item) => (
                  <div key={item.dealId} className="cc-line">
                    <span>{item.title}</span>
                    <b>%{item.similarity}</b>
                  </div>
                ))
              ) : (
                <p className="cc-muted">Benzerlik analizi için aktif ve tamamlanmış işlem gerekir.</p>
              )}
            </div>
          </div>

          <div className="cc-clusters">
            {memory.clusters.map((cluster) => (
              <div key={cluster.label}>
                <strong>{cluster.label}</strong>
                <span>{cluster.count} kayıt</span>
                <small>{cluster.behavior}</small>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
