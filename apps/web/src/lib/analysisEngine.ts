import type {
  CommandCenterAnalysis,
  CommandCenterData,
  ConstraintPlan,
  Deal,
  ExperimentResult,
  FailureAnalysisResult,
  FailureRecord,
  MemoryGraphResult,
  StrategyVariantResult,
} from './commandCenterTypes'

const DAY = 24 * 60 * 60 * 1000

export const defaultCommandCenterData: CommandCenterData = {
  customers: [],
  portfolios: [],
  deals: [],
  interactions: [],
  offers: [],
  priceChanges: [],
  decisions: [],
  experiments: [],
  constraints: {
    minimumRevenue: 0,
    maxDiscountRate: 8,
    timeLimitDays: 30,
    riskLevel: 'medium',
  },
}

export function analyzeCommandCenter(data: CommandCenterData): CommandCenterAnalysis {
  const failures = analyzeFailures(data)
  const experiments = analyzeExperiments(data)
  const memory = buildMemoryGraph(data)
  const plan = buildConstraintPlan(data)

  return {
    criticalAlerts: buildCriticalAlerts(data, failures, plan),
    failures,
    experiments,
    memory,
    plan,
  }
}

export function normalizeCommandCenterData(input: unknown): CommandCenterData {
  const raw = typeof input === 'object' && input !== null ? (input as Partial<CommandCenterData>) : {}
  return {
    customers: Array.isArray(raw.customers) ? raw.customers : [],
    portfolios: Array.isArray(raw.portfolios) ? raw.portfolios : [],
    deals: Array.isArray(raw.deals) ? raw.deals : [],
    interactions: Array.isArray(raw.interactions) ? raw.interactions : [],
    offers: Array.isArray(raw.offers) ? raw.offers : [],
    priceChanges: Array.isArray(raw.priceChanges) ? raw.priceChanges : [],
    decisions: Array.isArray(raw.decisions) ? raw.decisions : [],
    experiments: Array.isArray(raw.experiments) ? raw.experiments : [],
    constraints: {
      ...defaultCommandCenterData.constraints,
      ...(typeof raw.constraints === 'object' && raw.constraints !== null ? raw.constraints : {}),
    },
  }
}

export function analyzeFailures(data: CommandCenterData): FailureAnalysisResult {
  const lostDeals = data.deals.filter((deal) => deal.status === 'lost')
  const records = lostDeals.map((deal) => analyzeLostDeal(data, deal))
  const mistakeCounts = countLabels(records.flatMap((record) => [record.primaryCause, ...record.missingActions]))

  return {
    records,
    repeatedPatterns: mistakeCounts
      .filter((item) => item.count > 1)
      .map((item) => ({
        label: item.label,
        count: item.count,
        severity: item.count >= 4 ? 'high' : item.count >= 2 ? 'medium' : 'low',
      })),
    topMistakes: mistakeCounts.slice(0, 6),
  }
}

function analyzeLostDeal(data: CommandCenterData, deal: Deal): FailureRecord {
  const interactions = data.interactions.filter((item) => item.dealId === deal.id)
  const priceChanges = data.priceChanges.filter((item) => item.dealId === deal.id)
  const offers = data.offers.filter((item) => item.dealId === deal.id)
  const decisions = data.decisions.filter((item) => item.dealId === deal.id)
  const durationDays = getDurationDays(deal)
  const avgQuality = interactions.length
    ? interactions.reduce((sum, item) => sum + item.quality, 0) / interactions.length
    : 0
  const lastTouchGap = getLastTouchGapDays(deal, interactions.map((item) => item.at))
  const discountRate = getDiscountRate(priceChanges)

  const signals: string[] = []
  const missingActions: string[] = []

  if (interactions.length < 3 || lastTouchGap > 10) {
    signals.push(`Takip yoğunluğu düşük: ${interactions.length} etkileşim, son temas boşluğu ${lastTouchGap} gün`)
    missingActions.push('Müşteri takibi eksik')
  }
  if (avgQuality > 0 && avgQuality < 55) {
    signals.push(`Etkileşim kalitesi zayıf: ${Math.round(avgQuality)}/100`)
    missingActions.push('Etkileşim kalitesi düşük')
  }
  if (discountRate > 0 && discountRate < 3 && durationDays > 21) {
    signals.push(`Fiyat uzun süre dirençli kaldı: ${durationDays} gün, indirim ${discountRate.toFixed(1)}%`)
    missingActions.push('Fiyat stratejisi geç revize edildi')
  }
  if (offers.length === 0 && durationDays > 14) {
    signals.push('Teklif oluşmadan süreç kaybedildi')
    missingActions.push('Teklif üretimi eksik')
  }
  if (!decisions.some((decision) => decision.kind === 'timing') && durationDays > 30) {
    signals.push('Zamanlama kararı kaydı yok')
    missingActions.push('Zamanlama problemi')
  }

  const primaryCause = choosePrimaryCause(missingActions, deal.lostReason)

  return {
    dealId: deal.id,
    title: deal.title,
    durationDays,
    primaryCause,
    confidence: Math.min(95, 45 + signals.length * 13 + (deal.lostReason ? 12 : 0)),
    signals: signals.length ? signals : ['Kayıp nedeni için yeterli operasyon izi yok'],
    missingActions: missingActions.length ? missingActions : ['Veri kaydı eksik'],
  }
}

export function analyzeExperiments(data: CommandCenterData): ExperimentResult[] {
  return data.experiments.map((experiment) => {
    const variantA = buildVariantResult(experiment.variantA, experiment.dealIdsA, data)
    const variantB = buildVariantResult(experiment.variantB, experiment.dealIdsB, data)
    const warning =
      variantA.sampleSize < 5 || variantB.sampleSize < 5
        ? 'Yeterli veri yok: her varyant için en az 5 işlem önerilir.'
        : undefined
    const winner = pickWinner(variantA, variantB, experiment.metric)
    return {
      id: experiment.id,
      name: experiment.name,
      variantA,
      variantB,
      winner,
      liftText: buildLiftText(variantA, variantB, experiment.metric, winner),
      warning,
    }
  })
}

function buildVariantResult(label: string, dealIds: string[], data: CommandCenterData): StrategyVariantResult {
  const deals = data.deals.filter((deal) => dealIds.includes(deal.id))
  const wonDeals = deals.filter((deal) => deal.status === 'won')
  return {
    label,
    sampleSize: deals.length,
    closeRate: deals.length ? wonDeals.length / deals.length : 0,
    averageDuration: average(deals.map(getDurationDays)),
    averageRevenue: average(wonDeals.map((deal) => deal.finalRevenue ?? deal.expectedRevenue)),
  }
}

export function buildMemoryGraph(data: CommandCenterData): MemoryGraphResult {
  const nodes = [
    ...data.customers.map((item) => ({
      id: item.id,
      label: item.name,
      type: 'customer' as const,
      weight: 1 + data.interactions.filter((interaction) => interaction.customerId === item.id).length,
    })),
    ...data.portfolios.map((item) => ({
      id: item.id,
      label: item.title,
      type: 'portfolio' as const,
      weight: 1 + data.deals.filter((deal) => deal.portfolioId === item.id).length,
    })),
    ...data.deals.map((item) => ({
      id: item.id,
      label: item.title,
      type: 'deal' as const,
      weight: item.status === 'won' ? 4 : item.status === 'lost' ? 3 : 2,
    })),
    ...data.decisions.map((item) => ({
      id: item.id,
      label: item.label,
      type: 'decision' as const,
      weight: item.result === 'positive' ? 3 : item.result === 'negative' ? 2 : 1,
    })),
  ]

  const edges = [
    ...data.deals.flatMap((deal) => [
      {
        from: deal.customerId,
        to: deal.id,
        type: 'interaction' as const,
        strength: data.interactions.filter((item) => item.dealId === deal.id).length || 1,
        label: 'müşteri süreci',
      },
      {
        from: deal.portfolioId,
        to: deal.id,
        type: 'result' as const,
        strength: deal.status === 'won' ? 5 : deal.status === 'lost' ? 3 : 2,
        label: deal.status,
      },
    ]),
    ...data.offers.map((offer) => ({
      from: offer.dealId,
      to: offer.id,
      type: 'offer' as const,
      strength: offer.accepted ? 5 : 2,
      label: offer.accepted ? 'kabul edilen teklif' : 'reddedilen teklif',
    })),
    ...data.decisions.map((decision) => ({
      from: decision.dealId,
      to: decision.id,
      type: 'result' as const,
      strength: decision.result === 'positive' ? 5 : decision.result === 'negative' ? 2 : 3,
      label: decision.kind,
    })),
  ]

  return {
    nodes,
    edges,
    insights: buildMemoryInsights(data),
    similarCases: findSimilarCases(data),
    clusters: buildClusters(data),
  }
}

export function buildConstraintPlan(data: CommandCenterData): ConstraintPlan {
  const activeDeals = data.deals.filter((deal) => deal.status === 'active')
  const blocked: ConstraintPlan['blocked'] = []
  const actions: ConstraintPlan['actions'] = []
  const feasibleDeals: string[] = []

  activeDeals.forEach((deal) => {
    const priceChanges = data.priceChanges.filter((item) => item.dealId === deal.id)
    const discountRate = getDiscountRate(priceChanges)
    const durationDays = getDurationDays(deal)
    const interactions = data.interactions.filter((item) => item.dealId === deal.id)
    const portfolio = data.portfolios.find((item) => item.id === deal.portfolioId)

    if (discountRate > data.constraints.maxDiscountRate) {
      blocked.push({ dealId: deal.id, reason: `İndirim sınırı aşılıyor: ${discountRate.toFixed(1)}%` })
      return
    }
    if (durationDays > data.constraints.timeLimitDays && data.constraints.riskLevel === 'low') {
      blocked.push({ dealId: deal.id, reason: 'Zaman sınırı düşük risk profili için aşıldı' })
      return
    }

    feasibleDeals.push(deal.id)

    if (durationDays > data.constraints.timeLimitDays * 0.7) {
      actions.push({
        dealId: deal.id,
        label: `${deal.title} hızlandırılmalı`,
        reason: `${durationDays} gündür açık; zaman sınırına yaklaşıyor`,
        impact: 75,
        risk: 'medium',
      })
    }
    if (interactions.length < 3) {
      actions.push({
        dealId: deal.id,
        label: `${deal.title} için müşteri iletişimi kurulmalı`,
        reason: 'Takip izi hedef seviyenin altında',
        impact: 68,
        risk: 'low',
      })
    }
    if (portfolio && portfolio.targetPrice && portfolio.listPrice > portfolio.targetPrice) {
      const gap = ((portfolio.listPrice - portfolio.targetPrice) / portfolio.listPrice) * 100
      if (gap <= data.constraints.maxDiscountRate) {
        actions.push({
          dealId: deal.id,
          label: `${portfolio.title} fiyatı revize edilmeli`,
          reason: `Hedef fiyatla liste fiyatı arasında ${gap.toFixed(1)}% fark var`,
          impact: 72,
          risk: gap > 6 ? 'medium' : 'low',
        })
      }
    }
  })

  const expectedRevenue = activeDeals.reduce((sum, deal) => sum + deal.expectedRevenue, 0)
  if (expectedRevenue < data.constraints.minimumRevenue) {
    actions.unshift({
      label: 'Gelir hedefi için yeni yüksek değerli işlem eklenmeli',
      reason: `Aktif beklenen gelir ${formatMoney(expectedRevenue)}, hedef ${formatMoney(data.constraints.minimumRevenue)}`,
      impact: 90,
      risk: 'high',
    })
  }

  return {
    feasibleDeals,
    actions: actions.sort((a, b) => b.impact - a.impact).slice(0, 8),
    blocked,
    summary: actions.length
      ? `${actions.length} aksiyon önerildi, ${blocked.length} işlem kısıt dışı kaldı.`
      : 'Kısıtları karşılayan açık aksiyon bulunamadı.',
  }
}

function buildCriticalAlerts(data: CommandCenterData, failures: FailureAnalysisResult, plan: ConstraintPlan) {
  const alerts: CommandCenterAnalysis['criticalAlerts'] = []
  const overdueDeals = data.deals.filter((deal) => deal.status === 'active' && getDurationDays(deal) > data.constraints.timeLimitDays)

  if (overdueDeals.length) {
    alerts.push({
      label: 'Zaman sınırı aşıldı',
      detail: `${overdueDeals.length} aktif işlem hedef sürenin üzerinde.`,
      risk: 'high',
    })
  }
  if (failures.repeatedPatterns.some((pattern) => pattern.severity === 'high')) {
    alerts.push({
      label: 'Tekrarlayan kayıp paterni',
      detail: 'Aynı hata birden fazla süreçte tekrar ediyor.',
      risk: 'high',
    })
  }
  if (plan.blocked.length) {
    alerts.push({
      label: 'Kısıt dışı işlemler',
      detail: `${plan.blocked.length} işlem hedef veya risk sınırına takıldı.`,
      risk: 'medium',
    })
  }
  if (!data.deals.length) {
    alerts.push({
      label: 'Kullanıcı verisi yok',
      detail: 'Karar makinesi çalışmak için müşteri, portföy ve işlem kayıtlarına ihtiyaç duyar.',
      risk: 'medium',
    })
  }

  return alerts
}

function buildMemoryInsights(data: CommandCenterData): string[] {
  const insights: string[] = []
  const segments = groupBy(data.customers, (customer) => customer.segment || 'Segment yok')

  Object.entries(segments).forEach(([segment, customers]) => {
    const customerIds = new Set(customers.map((customer) => customer.id))
    const deals = data.deals.filter((deal) => customerIds.has(deal.customerId))
    if (deals.length >= 2) {
      const wonRate = deals.filter((deal) => deal.status === 'won').length / deals.length
      insights.push(`${segment} müşteri tipi geçmişte %${Math.round(wonRate * 100)} kapanma oranı üretti.`)
    }
  })

  const portfolioGroups = groupBy(data.portfolios, (portfolio) => portfolio.type || 'Tip yok')
  Object.entries(portfolioGroups).forEach(([type, portfolios]) => {
    const portfolioIds = new Set(portfolios.map((portfolio) => portfolio.id))
    const deals = data.deals.filter((deal) => portfolioIds.has(deal.portfolioId) && deal.status !== 'active')
    if (deals.length >= 2) {
      insights.push(`${type} portföy tipi ortalama ${Math.round(average(deals.map(getDurationDays)))} günde sonuçlandı.`)
    }
  })

  return insights.length ? insights : ['Graph insight üretmek için tamamlanmış işlem geçmişi gerekiyor.']
}

function findSimilarCases(data: CommandCenterData) {
  const active = data.deals.find((deal) => deal.status === 'active')
  if (!active) return []
  const activePortfolio = data.portfolios.find((item) => item.id === active.portfolioId)
  const activeCustomer = data.customers.find((item) => item.id === active.customerId)

  return data.deals
    .filter((deal) => deal.id !== active.id && deal.status !== 'active')
    .map((deal) => {
      const portfolio = data.portfolios.find((item) => item.id === deal.portfolioId)
      const customer = data.customers.find((item) => item.id === deal.customerId)
      let score = 0
      if (portfolio?.type && portfolio.type === activePortfolio?.type) score += 35
      if (portfolio?.district && portfolio.district === activePortfolio?.district) score += 25
      if (customer?.segment && customer.segment === activeCustomer?.segment) score += 25
      if (deal.strategy && deal.strategy === active.strategy) score += 15
      return {
        dealId: deal.id,
        title: deal.title,
        similarity: score,
        reason: `${portfolio?.type || 'Portföy'} / ${customer?.segment || 'Müşteri'} benzerliği`,
      }
    })
    .filter((item) => item.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)
}

function buildClusters(data: CommandCenterData) {
  const clusters = Object.entries(groupBy(data.deals, (deal) => deal.strategy || 'Strateji yok')).map(([label, deals]) => {
    const wonRate = deals.length ? deals.filter((deal) => deal.status === 'won').length / deals.length : 0
    return {
      label,
      count: deals.length,
      behavior: `Kapanma eğilimi %${Math.round(wonRate * 100)}`,
    }
  })
  return clusters.filter((cluster) => cluster.count > 0)
}

function pickWinner(a: StrategyVariantResult, b: StrategyVariantResult, metric: 'closeRate' | 'duration' | 'revenue') {
  if (!a.sampleSize || !b.sampleSize) return 'none'
  if (metric === 'duration') {
    if (a.averageDuration === b.averageDuration) return 'none'
    return a.averageDuration < b.averageDuration ? 'A' : 'B'
  }
  const aMetric = metric === 'revenue' ? a.averageRevenue : a.closeRate
  const bMetric = metric === 'revenue' ? b.averageRevenue : b.closeRate
  if (aMetric === bMetric) return 'none'
  return aMetric > bMetric ? 'A' : 'B'
}

function buildLiftText(
  a: StrategyVariantResult,
  b: StrategyVariantResult,
  metric: 'closeRate' | 'duration' | 'revenue',
  winner: 'A' | 'B' | 'none',
) {
  if (winner === 'none') return 'Anlamlı kazanan yok.'
  const left = winner === 'A' ? a : b
  const right = winner === 'A' ? b : a
  if (metric === 'duration') {
    const lift = right.averageDuration ? ((right.averageDuration - left.averageDuration) / right.averageDuration) * 100 : 0
    return `${left.label} süre metriğinde %${Math.round(lift)} daha iyi performans gösterdi.`
  }
  const leftValue = metric === 'revenue' ? left.averageRevenue : left.closeRate
  const rightValue = metric === 'revenue' ? right.averageRevenue : right.closeRate
  const lift = rightValue ? ((leftValue - rightValue) / rightValue) * 100 : 0
  return `${left.label} %${Math.round(lift)} daha iyi performans gösterdi.`
}

function choosePrimaryCause(missingActions: string[], lostReason?: string) {
  if (lostReason) return lostReason
  if (missingActions.includes('Müşteri takibi eksik')) return 'Bu işlem müşteri takibi eksik olduğu için kaybedildi'
  if (missingActions.includes('Fiyat stratejisi geç revize edildi')) return 'Fiyat stratejisi hatalı'
  if (missingActions.includes('Zamanlama problemi')) return 'Zamanlama problemi'
  return missingActions[0] || 'Kayıp nedeni için veri yetersiz'
}

function getDurationDays(deal: Deal) {
  const start = new Date(deal.openedAt).getTime()
  const end = deal.closedAt ? new Date(deal.closedAt).getTime() : Date.now()
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0
  return Math.max(0, Math.ceil((end - start) / DAY))
}

function getLastTouchGapDays(deal: Deal, dates: string[]) {
  if (!dates.length) return getDurationDays(deal)
  const last = Math.max(...dates.map((date) => new Date(date).getTime()).filter(Number.isFinite))
  const end = deal.closedAt ? new Date(deal.closedAt).getTime() : Date.now()
  return Math.max(0, Math.ceil((end - last) / DAY))
}

function getDiscountRate(priceChanges: Array<{ from: number; to: number }>) {
  if (!priceChanges.length) return 0
  const first = priceChanges[0]
  const last = priceChanges[priceChanges.length - 1]
  if (!first.from) return 0
  return Math.max(0, ((first.from - last.to) / first.from) * 100)
}

function countLabels(labels: string[]) {
  const counts = labels.reduce<Record<string, number>>((acc, label) => {
    acc[label] = (acc[label] || 0) + 1
    return acc
  }, {})
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

function average(values: number[]) {
  const valid = values.filter((value) => Number.isFinite(value))
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0
}

function groupBy<T>(items: T[], getKey: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = getKey(item)
    acc[key] = acc[key] || []
    acc[key].push(item)
    return acc
  }, {})
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}
