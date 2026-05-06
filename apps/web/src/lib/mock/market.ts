export type RiskLevel = 'low' | 'medium' | 'high'
export type LiquidityLevel = 'low' | 'medium' | 'high'
export const marketPulse = {
  priceDirection: 0,
  hottestRegion: 'Kullanıcı verisi yok',
  demandIncrease: 'Veri bekleniyor',
  newListings: 0,
  avgCloseDays: 0,
  lastUpdate: 'Kişisel veri bekleniyor',
  aiDailyComment: 'Bölge yorumu üretmek için kullanıcının kendi portföy, işlem ve analiz kayıtları gerekir.',
}
export const regions: Array<{
  name: string
  m2Price: number
  dailyChange: number
  weeklyChange: number
  newListings: number
  avgDays: number
  demand: string
  opportunity: string
  risk: string
}> = []
export const demandSignals: Array<{ title: string; effect: string; region: string; action: string }> = []
export const dailyActions = [
  'Command Center içinde müşteri ve portföy kaydı oluştur.',
  'Aktif işlemler için temas ve fiyat revizyonu gir.',
  'Analiz sonuçlarını kişisel hafızaya aktar.',
]
