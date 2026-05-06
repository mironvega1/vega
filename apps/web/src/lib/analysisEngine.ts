import type {
  CommandCenterAnalysis,
  CommandCenterData,
  ConstraintPlan,
  Deal,
  ExperimentResult,
  FailureAnalysisResult,
  FailureRecord,
  ProblemAsset,
  ActionRecommendation,
  RiskItem,
  ForecastResult,
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
  analysisResults: [],
  actionFeedback: [],
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
  const problemAssets = buildProblemAssets(data)
  const actions = buildActionEngine(data, problemAssets, plan)
  const risks = buildRiskPanel(data, failures, problemAssets)
  const forecast = buildForecast(data)
  const contextualInsights = buildContextualInsights(data, forecast, risks, problemAssets)

  return {
    criticalAlerts: buildCriticalAlerts(data, failures, plan, risks),
    problemAssets,
    actions,
    risks,
    forecast,
    contextualInsights,
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
    analysisResults: Array.isArray(raw.analysisResults) ? raw.analysisResults : [],
    actionFeedback: Array.isArray(raw.actionFeedback) ? raw.actionFeedback : [],
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

function buildProblemAssets(data: CommandCenterData): ProblemAsset[] {
  const items: ProblemAsset[] = []

  data.deals
    .filter((deal) => deal.status === 'active')
    .forEach((deal) => {
      const interactions = data.interactions.filter((item) => item.dealId === deal.id)
      const portfolio = data.portfolios.find((item) => item.id === deal.portfolioId)
      const durationDays = getDurationDays(deal)
      const lastTouchGap = getLastTouchGapDays(deal, interactions.map((item) => item.at))
      const avgQuality = interactions.length ? average(interactions.map((item) => item.quality)) : 0
      const discountRate = getDiscountRate(data.priceChanges.filter((item) => item.dealId === deal.id))

      if (lastTouchGap > 10 || durationDays > data.constraints.timeLimitDays) {
        items.push({
          id: `stale-${deal.id}`,
          title: deal.title,
          kind: 'stale',
          severity: lastTouchGap > 18 || durationDays > data.constraints.timeLimitDays ? 'high' : 'medium',
          metric: `${lastTouchGap} gün temassız`,
          interpretation:
            lastTouchGap > 18
              ? 'Bu değer riskli; süreç müşteri zihninden düşmüş olabilir.'
              : 'Bu değer normalin üstünde; takip ritmi zayıflıyor.',
          evidence: [
            `${durationDays} gündür açık`,
            interactions.length ? `${interactions.length} etkileşim kaydı var` : 'Etkileşim kaydı yok',
          ],
        })
      }

      if (portfolio?.targetPrice && portfolio.listPrice > portfolio.targetPrice) {
        const gap = ((portfolio.listPrice - portfolio.targetPrice) / portfolio.listPrice) * 100
        items.push({
          id: `pricing-${deal.id}`,
          title: portfolio.title,
          kind: 'pricing',
          severity: gap > 10 ? 'high' : gap > 5 ? 'medium' : 'low',
          metric: `%${gap.toFixed(1)} hedef üstü`,
          interpretation:
            gap > data.constraints.maxDiscountRate
              ? 'Bu fiyat kısıt sınırını aşıyor; fiyat stratejisi karar üretmeden kapanma zorlaşır.'
              : 'Bu değer izlenmeli; küçük revizyon kapanma ihtimalini artırabilir.',
          evidence: [
            `Liste fiyatı ${formatMoney(portfolio.listPrice)}`,
            `Hedef fiyat ${formatMoney(portfolio.targetPrice)}`,
            `Mevcut indirim izi %${discountRate.toFixed(1)}`,
          ],
        })
      }

      if ((avgQuality > 0 && avgQuality < 55) || (interactions.length < 2 && durationDays > 7)) {
        items.push({
          id: `performance-${deal.id}`,
          title: deal.title,
          kind: 'performance',
          severity: avgQuality > 0 && avgQuality < 45 ? 'high' : 'medium',
          metric: avgQuality ? `${Math.round(avgQuality)}/100 etkileşim kalitesi` : 'Düşük etkileşim',
          interpretation: 'Bu değer düşük; işlem var ama karar verdiren temas kalitesi oluşmamış.',
          evidence: [
            `${interactions.length} etkileşim`,
            deal.actionDueAt ? `Aksiyon tarihi: ${deal.actionDueAt}` : 'Planlı aksiyon tarihi yok',
          ],
        })
      }
    })

  data.analysisResults.forEach((analysis) => {
    const riskyScore = typeof analysis.score === 'number' && analysis.score < 55
    const riskyRisk = typeof analysis.riskScore === 'number' && analysis.riskScore > 65
    const priceGap =
      analysis.price && analysis.marketPrice
        ? ((analysis.price - analysis.marketPrice) / Math.max(analysis.price, 1)) * 100
        : 0

    if (riskyScore || riskyRisk || priceGap > 6) {
      items.push({
        id: `analysis-${analysis.id}`,
        title: analysis.title,
        kind: 'analysis',
        severity: riskyRisk || priceGap > 10 ? 'high' : 'medium',
        metric: riskyScore
          ? `Skor ${analysis.score}/100`
          : riskyRisk
            ? `Risk ${analysis.riskScore}/100`
            : `%${priceGap.toFixed(1)} piyasa üstü`,
        interpretation: 'Analiz sonucu iş takibine geldi; bu kayıt yapılacak işleri etkiliyor.',
        evidence: [analysis.location || 'Konum yok', analysis.summary.slice(0, 140)],
      })
    }
  })

  return items.sort((a, b) => riskWeight(b.severity) - riskWeight(a.severity)).slice(0, 12)
}

function buildActionEngine(
  data: CommandCenterData,
  problemAssets: ProblemAsset[],
  plan: ConstraintPlan,
): ActionRecommendation[] {
  const feedbackByAction = new Map(data.actionFeedback.map((item) => [item.actionId, item]))
  const actions: ActionRecommendation[] = []

  problemAssets.forEach((asset) => {
    const dealId = asset.id.split('-').slice(1).join('-') || undefined
    const command =
      asset.kind === 'pricing'
        ? 'fiyatı düşür'
        : asset.kind === 'stale'
          ? 'müşteri ara'
          : asset.kind === 'performance'
            ? 'önceliklendir'
            : 'güncelle'
    const actionId = `${command}-${asset.id}`
    actions.push({
      id: actionId,
      dealId,
      title: asset.title,
      command,
      priority: riskWeight(asset.severity) * 30 + (asset.kind === 'pricing' ? 8 : 0),
      impact: asset.severity === 'high' ? 88 : asset.severity === 'medium' ? 70 : 48,
      risk: asset.severity,
      reason: asset.interpretation,
      feedback: feedbackByAction.get(actionId),
    })
  })

  plan.actions.forEach((item, index) => {
    const actionId = `plan-${item.dealId || 'global'}-${index}`
    actions.push({
      id: actionId,
      dealId: item.dealId,
      title: item.label,
      command: item.dealId ? 'güncelle' : 'veri tamamla',
      priority: item.impact,
      impact: item.impact,
      risk: item.risk,
      reason: item.reason,
      feedback: feedbackByAction.get(actionId),
    })
  })

  if (!data.customers.length) {
    actions.push({
      id: 'setup-customer',
      title: 'İlk müşteriyi ekle',
      command: 'veri tamamla',
      priority: 95,
      impact: 100,
      risk: 'medium',
      reason: 'İş takibi müşteri kaydıyla başlar. Müşteri eklenince portföy adımına geçilir.',
      feedback: feedbackByAction.get('setup-customer'),
    })
  } else if (!data.portfolios.length) {
    actions.push({
      id: 'setup-portfolio',
      title: 'Müşteriye portföy ekle',
      command: 'veri tamamla',
      priority: 94,
      impact: 96,
      risk: 'medium',
      reason: `${data.customers.length} müşteri var; öneri ve tahmin için en az bir portföy kaydı gerekir.`,
      feedback: feedbackByAction.get('setup-portfolio'),
    })
  } else if (!data.deals.length) {
    actions.push({
      id: 'setup-deal',
      title: 'Müşteri ve portföyü işlem olarak bağla',
      command: 'veri tamamla',
      priority: 93,
      impact: 94,
      risk: 'medium',
      reason: 'Tahmin, risk ve aksiyonlar işlem kaydı oluşunca görünür hale gelir.',
      feedback: feedbackByAction.get('setup-deal'),
    })
  } else if (!data.interactions.length && data.deals.some((deal) => deal.status === 'active')) {
    actions.push({
      id: 'setup-interaction',
      title: 'İlk temas veya görüşmeyi kaydet',
      command: 'müşteri ara',
      priority: 85,
      impact: 82,
      risk: 'low',
      reason: 'Aktif işlem var; takip kalitesi için arama, mesaj veya görüşme kaydı girilmeli.',
      feedback: feedbackByAction.get('setup-interaction'),
    })
  }

  return actions
    .filter((action) => action.feedback?.result !== 'done')
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 14)
}

function buildRiskPanel(
  data: CommandCenterData,
  failures: FailureAnalysisResult,
  problemAssets: ProblemAsset[],
): RiskItem[] {
  const activeDeals = data.deals.filter((deal) => deal.status === 'active')
  const staleCount = problemAssets.filter((item) => item.kind === 'stale').length
  const pricingCount = problemAssets.filter((item) => item.kind === 'pricing').length
  const lostCount = data.deals.filter((deal) => deal.status === 'lost').length
  const totalExpected = activeDeals.reduce((sum, deal) => sum + deal.expectedRevenue, 0)
  const highProblemCount = problemAssets.filter((item) => item.severity === 'high').length

  return [
    {
      id: 'low-performance',
      label: 'Düşük performans',
      level: highProblemCount > 1 ? 'high' : problemAssets.length ? 'medium' : 'low',
      value: `${problemAssets.length} kayıt`,
      interpretation: problemAssets.length
        ? 'Bu değer operasyonun aksiyon beklediğini gösteriyor.'
        : 'Şu an problemli kayıt görünmüyor; veri kapsamı yine de izlenmeli.',
    },
    {
      id: 'delayed-deals',
      label: 'Geciken işlemler',
      level: staleCount > 2 ? 'high' : staleCount ? 'medium' : 'low',
      value: `${staleCount} süreç`,
      interpretation: staleCount
        ? 'Takip boşluğu kapanma oranını düşürebilir.'
        : 'Temas ritmi kritik eşik altında görünmüyor.',
    },
    {
      id: 'pricing-risk',
      label: 'Fiyat riski',
      level: pricingCount > 1 ? 'high' : pricingCount ? 'medium' : 'low',
      value: `${pricingCount} portföy`,
      interpretation: pricingCount
        ? 'Fiyat hedefle uyuşmuyor; revizyon veya savunma stratejisi gerekir.'
        : 'Fiyat kaynaklı belirgin baskı yok.',
    },
    {
      id: 'potential-loss',
      label: 'Potansiyel kayıp',
      level: totalExpected > 0 && highProblemCount ? 'high' : totalExpected > 0 ? 'medium' : 'low',
      value: formatMoney(totalExpected),
      interpretation: totalExpected
        ? 'Aktif beklenen gelir risk ağırlığıyla izlenmeli.'
        : 'Aktif işlem geliri kaydı yok.',
    },
    {
      id: 'learned-failures',
      label: 'Tekrarlayan hata',
      level: failures.repeatedPatterns.length ? 'high' : lostCount ? 'medium' : 'low',
      value: `${failures.repeatedPatterns.length} patern`,
      interpretation: failures.repeatedPatterns.length
        ? 'Aynı hata tekrar ediyor; sistem bunu aksiyon önceliğine taşıdı.'
        : 'Tekrarlayan kayıp paterni için yeterli veri oluşmadı.',
    },
  ]
}

function buildForecast(data: CommandCenterData): ForecastResult {
  const activeDeals = data.deals.filter((deal) => deal.status === 'active')
  const closedDeals = data.deals.filter((deal) => deal.status !== 'active')
  const historicalCloseRate = closedDeals.length
    ? closedDeals.filter((deal) => deal.status === 'won').length / closedDeals.length
    : 0
  const activeQuality = activeDeals.length
    ? average(
        activeDeals.map((deal) => {
          const interactions = data.interactions.filter((item) => item.dealId === deal.id)
          const portfolio = data.portfolios.find((item) => item.id === deal.portfolioId)
          const targetPenalty = portfolio?.targetPrice && portfolio.listPrice > portfolio.targetPrice ? 0.12 : 0
          const touchBonus = Math.min(interactions.length * 0.06, 0.24)
          return Math.max(0.12, Math.min(0.9, 0.36 + touchBonus - targetPenalty))
        }),
      )
    : 0
  const estimatedCloseRate = closedDeals.length ? historicalCloseRate * 0.65 + activeQuality * 0.35 : activeQuality
  const expectedRevenue = activeDeals.reduce((sum, deal) => sum + deal.expectedRevenue, 0)
  const expectedWonRevenue = expectedRevenue * estimatedCloseRate

  return {
    activeCount: activeDeals.length,
    estimatedCloseRate,
    expectedRevenue,
    expectedWonRevenue,
    expectedResult: activeDeals.length
      ? `${activeDeals.length} aktif kayıttan yaklaşık ${Math.round(activeDeals.length * estimatedCloseRate)} kapanış bekleniyor.`
      : data.customers.length || data.portfolios.length
        ? 'Müşteri/portföy kaydı geldi; tahmin için bunları işlem olarak bağla.'
        : 'Tahmin için önce müşteri, portföy ve işlem kaydı gerekir.',
    interpretation:
      estimatedCloseRate >= 0.65
        ? 'Bu değer güçlü; mevcut veri kapanma ihtimalinin yüksek olduğunu söylüyor.'
        : estimatedCloseRate >= 0.4
          ? 'Bu değer orta; doğru aksiyonlarla iyileştirilebilir.'
          : 'Bu değer düşük; sistem takip ve fiyat baskısını risk olarak görüyor.',
  }
}

function buildContextualInsights(
  data: CommandCenterData,
  forecast: ForecastResult,
  risks: RiskItem[],
  problemAssets: ProblemAsset[],
) {
  const insights: string[] = []
  const highRisks = risks.filter((risk) => risk.level === 'high')
  const latestAnalysis = [...data.analysisResults].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0]

  if (latestAnalysis) {
    insights.push(`Son analiz "${latestAnalysis.title}" iş takibine eklendi.`)
  }
  if (data.customers.length && !data.portfolios.length) {
    insights.push(`${data.customers.length} müşteri eklendi. Sıradaki adım: portföy eklemek.`)
  }
  if (data.customers.length && data.portfolios.length && !data.deals.length) {
    insights.push('Müşteri ve portföy hazır. Sıradaki adım: bunları işlem olarak bağlamak.')
  }
  if (data.deals.length && !data.interactions.length) {
    insights.push('İşlem kaydı hazır. İlk temas girilince takip ve risk önerileri değişir.')
  }
  if (highRisks.length) {
    insights.push(`Önce ${highRisks[0].label.toLowerCase()} çözülmeli; diğer öneriler bu riske göre sıralandı.`)
  }
  if (forecast.activeCount) {
    insights.push(`Mevcut kayıtlara göre ${formatMoney(forecast.expectedWonRevenue)} kapanabilir gelir görünüyor.`)
  }
  if (problemAssets.some((asset) => asset.kind === 'pricing')) {
    insights.push('Fiyat kaynaklı problem tespit edildi; analiz sonuçları risk paneliyle aynı yöne işaret ediyor.')
  }

  return insights.length ? insights : ['Sistem henüz kullanıcı verisi bekliyor; sahte sonuç üretilmedi.']
}

function buildCriticalAlerts(
  data: CommandCenterData,
  failures: FailureAnalysisResult,
  plan: ConstraintPlan,
  risks: RiskItem[],
) {
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
  if (risks.some((risk) => risk.level === 'high')) {
    alerts.push({
      label: 'Yüksek riskli operasyon',
      detail: 'Risk paneli en az bir başlığı kritik seviyeye taşıdı.',
      risk: 'high',
    })
  }
  if (!data.customers.length) {
    alerts.push({
      label: 'Müşteri bekleniyor',
      detail: 'İlk adım olarak müşteri kaydı eklenmeli.',
      risk: 'medium',
    })
  } else if (!data.portfolios.length) {
    alerts.push({
      label: 'Portföy bekleniyor',
      detail: `${data.customers.length} müşteri var; şimdi portföy eklenmeli.`,
      risk: 'medium',
    })
  } else if (!data.deals.length) {
    alerts.push({
      label: 'İşlem bağlantısı bekleniyor',
      detail: 'Müşteri ve portföy işlem olarak bağlanınca tahmin çalışır.',
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

function riskWeight(level: 'low' | 'medium' | 'high') {
  if (level === 'high') return 3
  if (level === 'medium') return 2
  return 1
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(value)
}
