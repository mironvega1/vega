export type DealStatus = 'active' | 'won' | 'lost'
export type RiskLevel = 'low' | 'medium' | 'high'
export type StrategyMode = 'aggressive' | 'normal' | 'patient'
export type AnalysisSource = 'adres' | 'deal' | 'bolge' | 'risk' | 'valuation' | 'manual'

export type Customer = {
  id: string
  name: string
  segment: string
  urgency: number
  budget?: number
}

export type Portfolio = {
  id: string
  title: string
  type: string
  city?: string
  district?: string
  listPrice: number
  targetPrice?: number
}

export type Interaction = {
  id: string
  dealId: string
  customerId?: string
  type: 'call' | 'message' | 'meeting' | 'viewing' | 'follow_up'
  at: string
  quality: number
  note?: string
}

export type Offer = {
  id: string
  dealId: string
  amount: number
  at: string
  accepted: boolean
}

export type PriceChange = {
  id: string
  dealId: string
  from: number
  to: number
  at: string
  reason?: string
}

export type Deal = {
  id: string
  title: string
  customerId: string
  portfolioId: string
  status: DealStatus
  openedAt: string
  closedAt?: string
  expectedRevenue: number
  finalRevenue?: number
  strategy?: StrategyMode
  lostReason?: string
  actionDueAt?: string
}

export type Decision = {
  id: string
  dealId: string
  kind: 'price' | 'timing' | 'follow_up' | 'discount' | 'channel'
  label: string
  at: string
  result?: 'positive' | 'negative' | 'neutral'
}

export type Experiment = {
  id: string
  name: string
  variantA: string
  variantB: string
  metric: 'closeRate' | 'duration' | 'revenue'
  dealIdsA: string[]
  dealIdsB: string[]
}

export type ConstraintInput = {
  minimumRevenue: number
  maxDiscountRate: number
  timeLimitDays: number
  riskLevel: RiskLevel
}

export type CapturedAnalysis = {
  id: string
  source: AnalysisSource
  title: string
  createdAt: string
  location?: string
  portfolioId?: string
  dealId?: string
  score?: number
  price?: number
  marketPrice?: number
  riskScore?: number
  summary: string
  raw: string
}

export type ActionFeedback = {
  id: string
  actionId: string
  dealId?: string
  result: 'done' | 'ignored' | 'won' | 'lost'
  note?: string
  createdAt: string
}

export type CommandCenterData = {
  customers: Customer[]
  portfolios: Portfolio[]
  deals: Deal[]
  interactions: Interaction[]
  offers: Offer[]
  priceChanges: PriceChange[]
  decisions: Decision[]
  experiments: Experiment[]
  analysisResults: CapturedAnalysis[]
  actionFeedback: ActionFeedback[]
  constraints: ConstraintInput
}

export type FailureRecord = {
  dealId: string
  title: string
  durationDays: number
  primaryCause: string
  confidence: number
  signals: string[]
  missingActions: string[]
}

export type FailureAnalysisResult = {
  records: FailureRecord[]
  repeatedPatterns: Array<{ label: string; count: number; severity: RiskLevel }>
  topMistakes: Array<{ label: string; count: number }>
}

export type ExperimentResult = {
  id: string
  name: string
  variantA: StrategyVariantResult
  variantB: StrategyVariantResult
  winner: 'A' | 'B' | 'none'
  liftText: string
  warning?: string
}

export type StrategyVariantResult = {
  label: string
  sampleSize: number
  closeRate: number
  averageDuration: number
  averageRevenue: number
}

export type MemoryNode = {
  id: string
  label: string
  type: 'customer' | 'portfolio' | 'deal' | 'decision'
  weight: number
}

export type MemoryEdge = {
  from: string
  to: string
  type: 'interaction' | 'offer' | 'meeting' | 'result'
  strength: number
  label: string
}

export type MemoryGraphResult = {
  nodes: MemoryNode[]
  edges: MemoryEdge[]
  insights: string[]
  similarCases: Array<{ dealId: string; title: string; similarity: number; reason: string }>
  clusters: Array<{ label: string; count: number; behavior: string }>
}

export type ConstraintPlan = {
  feasibleDeals: string[]
  actions: Array<{ dealId?: string; label: string; reason: string; impact: number; risk: RiskLevel }>
  blocked: Array<{ dealId: string; reason: string }>
  summary: string
}

export type ProblemAsset = {
  id: string
  title: string
  kind: 'stale' | 'pricing' | 'performance' | 'analysis'
  severity: RiskLevel
  metric: string
  interpretation: string
  evidence: string[]
}

export type ActionRecommendation = {
  id: string
  dealId?: string
  title: string
  command: 'fiyatı düşür' | 'güncelle' | 'önceliklendir' | 'pasife al' | 'müşteri ara' | 'veri tamamla'
  priority: number
  impact: number
  risk: RiskLevel
  reason: string
  feedback?: ActionFeedback
}

export type RiskItem = {
  id: string
  label: string
  level: RiskLevel
  value: string
  interpretation: string
}

export type ForecastResult = {
  activeCount: number
  estimatedCloseRate: number
  expectedRevenue: number
  expectedWonRevenue: number
  expectedResult: string
  interpretation: string
}

export type CommandCenterAnalysis = {
  criticalAlerts: Array<{ label: string; detail: string; risk: RiskLevel }>
  problemAssets: ProblemAsset[]
  actions: ActionRecommendation[]
  risks: RiskItem[]
  forecast: ForecastResult
  contextualInsights: string[]
  failures: FailureAnalysisResult
  experiments: ExperimentResult[]
  memory: MemoryGraphResult
  plan: ConstraintPlan
}
