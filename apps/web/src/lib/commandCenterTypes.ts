export type DealStatus = 'active' | 'won' | 'lost'
export type RiskLevel = 'low' | 'medium' | 'high'
export type StrategyMode = 'aggressive' | 'normal' | 'patient'

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

export type CommandCenterData = {
  customers: Customer[]
  portfolios: Portfolio[]
  deals: Deal[]
  interactions: Interaction[]
  offers: Offer[]
  priceChanges: PriceChange[]
  decisions: Decision[]
  experiments: Experiment[]
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

export type CommandCenterAnalysis = {
  criticalAlerts: Array<{ label: string; detail: string; risk: RiskLevel }>
  failures: FailureAnalysisResult
  experiments: ExperimentResult[]
  memory: MemoryGraphResult
  plan: ConstraintPlan
}
