import { analyzeCommandCenter } from './analysisEngine'
import type { CommandCenterData } from './commandCenterTypes'

export type TrainingLevel = 'weak' | 'learning' | 'strong'

export type FeatureTrainingDefinition = {
  id: string
  title: string
  href: string
  category: 'operasyon' | 'analiz' | 'rapor' | 'zeka'
  mission: string
  requiredData: string[]
  qualityRules: string[]
  outputContract: string[]
  failureModes: string[]
  handoff: string
}

export type FeatureTrainingResult = FeatureTrainingDefinition & {
  readiness: number
  level: TrainingLevel
  currentSignals: string[]
  missingData: string[]
  nextTrainingActions: string[]
}

export const featureTrainingDefinitions: FeatureTrainingDefinition[] = [
  {
    id: 'command-center',
    title: 'Command Center',
    href: '/command-center',
    category: 'operasyon',
    mission: 'Tüm müşteri, portföy, işlem, analiz ve geri bildirim verisini tek karar motorunda birleştirir.',
    requiredData: ['müşteri', 'portföy', 'işlem', 'temas', 'fiyat revizyonu', 'geri bildirim'],
    qualityRules: [
      'Aktif işlemde en az bir müşteri ve bir portföy bağlantısı olmalı.',
      'Takip kalitesi 0-100 arasında sayısal iz bırakmalı.',
      'Aksiyon yapıldı bilgisi bir sonraki öneriyi etkilemeli.',
    ],
    outputContract: ['problemli varlık', 'aksiyon önceliği', 'risk seviyesi', 'kapanma tahmini'],
    failureModes: ['veri yoksa karar uydurmak', 'herkese aynı piyasa yorumu göstermek', 'aksiyonu geri bildirime bağlamamak'],
    handoff: 'Analiz Merkezi ve AI sayfasına kişisel operasyon bağlamı sağlar.',
  },
  {
    id: 'analysis',
    title: 'Analiz Merkezi',
    href: '/analysis',
    category: 'analiz',
    mission: 'Adres, deal, bölge ve risk analizlerini kişisel hafızaya yazılabilir sinyale çevirir.',
    requiredData: ['adres', 'fiyat', 'metrekare', 'lokasyon', 'risk hedefi'],
    qualityRules: [
      'Sonuç mutlaka Command Center hafızasına kaydedilmeli.',
      'Skor düşükse risk paneline sinyal düşmeli.',
      'Bağlantı hatası gerçek analiz sonucu gibi kaydedilmemeli.',
    ],
    outputContract: ['analiz özeti', 'skor', 'risk sinyali', 'önerilen takip adımı'],
    failureModes: ['boş formdan analiz üretmek', 'sonucu ortak state dışında bırakmak', 'skoru yorumsuz göstermek'],
    handoff: 'Command Center problemli varlık ve aksiyon motorunu besler.',
  },
  {
    id: 'listings',
    title: 'İlan Yönetimi',
    href: '/listings',
    category: 'operasyon',
    mission: 'Portföy kayıtlarını satış/kiralama süreci ve takip aksiyonlarıyla ilişkilendirir.',
    requiredData: ['portföy başlığı', 'liste fiyatı', 'hedef fiyat', 'durum', 'lokasyon'],
    qualityRules: [
      'Liste fiyatı ve hedef fiyat ayrımı korunmalı.',
      'Portföy işlem kaydına bağlanmadıysa karar motoru bunu eksik veri saymalı.',
      'Güncelleme tarihi takip boşluğu hesabına etki etmeli.',
    ],
    outputContract: ['fiyat farkı', 'portföy sağlığı', 'güncelleme ihtiyacı'],
    failureModes: ['portföyü bağımsız kart gibi bırakmak', 'fiyat farkını aksiyona çevirmemek'],
    handoff: 'Command Center fiyat revizyonu ve risk paneline veri taşır.',
  },
  {
    id: 'ai',
    title: 'Emlak Yapay Zekası',
    href: '/ai',
    category: 'zeka',
    mission: 'Genel cevap yerine kullanıcının kendi operasyon bağlamını okuyarak yanıt verir.',
    requiredData: ['müşteri sayısı', 'portföy sayısı', 'aktif işlem', 'riskler', 'öncelikli aksiyon'],
    qualityRules: [
      'Veri yoksa veri yok demeli.',
      'Kullanıcının aksiyon listesinden en önemli işi öne çıkarmalı.',
      'Sahte bölge veya piyasa sonucu uydurmamalı.',
    ],
    outputContract: ['kısa cevap', 'bağlamsal gerekçe', 'sonraki aksiyon'],
    failureModes: ['her kullanıcıya aynı piyasa yorumu', 'Command Center bağlamını okumamak'],
    handoff: 'Kullanıcının sorduğu soruyu risk ve aksiyon motoruyla yorumlar.',
  },
  {
    id: 'valuation',
    title: 'AI Değerleme',
    href: '/valuation',
    category: 'analiz',
    mission: 'Değerleme çıktısını fiyat stratejisi ve risk kontrolüne bağlar.',
    requiredData: ['fiyat', 'metrekare', 'lokasyon', 'mülk tipi', 'bina bilgisi'],
    qualityRules: [
      'Eksik metrekare veya fiyatla güven seviyesi yükselmemeli.',
      'Piyasa üstü fiyat Command Center aksiyonuna dönüşmeli.',
      'Değerleme sonucu rapor ve sözleşme akışına aktarılabilir olmalı.',
    ],
    outputContract: ['tahmini değer', 'sapma', 'güven seviyesi', 'fiyat aksiyonu'],
    failureModes: ['tek fiyat üretip gerekçe vermemek', 'sapmayı takip planına bağlamamak'],
    handoff: 'Rapor Merkezi ve Command Center fiyat kararlarını besler.',
  },
  {
    id: 'contracts',
    title: 'Sözleşme Merkezi',
    href: '/sozlesme',
    category: 'rapor',
    mission: 'Kapanışa yaklaşan işlemleri doğru belge akışına çevirir.',
    requiredData: ['taraf bilgisi', 'portföy bilgisi', 'bedel', 'tarih', 'ödeme koşulu'],
    qualityRules: [
      'Eksik taraf bilgisiyle hazır belge gibi davranmamalı.',
      'İşlem durumu kapanışa yakınsa belge önerisi üretmeli.',
      'Belge çıktısı kullanıcı verisiyle tutarlı olmalı.',
    ],
    outputContract: ['belge tipi', 'eksik alan listesi', 'PDF çıktısı'],
    failureModes: ['sözleşmeyi işlemden bağımsız üretmek', 'eksik alanı gizlemek'],
    handoff: 'Kazanılma ihtimali yüksek işlemlerde rapor ve belge akışını hızlandırır.',
  },
  {
    id: 'report',
    title: 'PDF Rapor Merkezi',
    href: '/report',
    category: 'rapor',
    mission: 'Analiz ve değerleme sonuçlarını müşteriye sunulabilir rapora dönüştürür.',
    requiredData: ['müşteri', 'portföy', 'analiz sonucu', 'değerleme', 'özet'],
    qualityRules: [
      'Rapor gerçek analiz sonucu olmadan güçlü iddia üretmemeli.',
      'Müşteri dili net, kısa ve kanıtlı olmalı.',
      'Eksik veri raporda açıkça görünmeli.',
    ],
    outputContract: ['müşteri özeti', 'kanıt listesi', 'PDF'],
    failureModes: ['boş raporu profesyonel gibi sunmak', 'analiz kanıtını göstermemek'],
    handoff: 'AI, değerleme ve analiz çıktısını müşteri dokümanına taşır.',
  },
  {
    id: 'emsal',
    title: 'Emsal İstihbarat',
    href: '/emsal',
    category: 'analiz',
    mission: 'Kullanıcının girdiği kriterlere göre emsal, sapma ve likidite yorumu üretir.',
    requiredData: ['lokasyon', 'mülk tipi', 'm2 aralığı', 'fiyat aralığı'],
    qualityRules: [
      'Arama yapılmadan emsal sonucu oluşmamalı.',
      'Sapma negatif/pozitif yönü açık yorumlanmalı.',
      'Emsal sonucu portföy fiyat stratejisine bağlanmalı.',
    ],
    outputContract: ['emsal listesi', 'sapma', 'likidite', 'önerilen fiyat davranışı'],
    failureModes: ['emsal yokken fırsat demek', 'sapmayı aksiyona çevirmemek'],
    handoff: 'Fiyat revizyonu ve rapor kararlarını destekler.',
  },
  {
    id: 'zone-score',
    title: 'Bölge Skoru',
    href: '/zone-scores',
    category: 'analiz',
    mission: 'Kullanıcının seçtiği bölgeyi yatırım ve operasyon riski açısından puanlar.',
    requiredData: ['şehir', 'ilçe', 'mahalle', 'hedef', 'mülk tipi'],
    qualityRules: [
      'Bölge seçilmeden genelleme yapılmamalı.',
      'Skor yanında neden ve aksiyon verilmeli.',
      'Kullanıcının portföyleriyle eşleşen bölge sinyali önceliklenmeli.',
    ],
    outputContract: ['bölge skoru', 'nedenler', 'risk', 'takip aksiyonu'],
    failureModes: ['her kullanıcıya aynı bölgeyi önermek', 'skoru yorumsuz bırakmak'],
    handoff: 'Analiz Merkezi ve Command Center risk paneline sinyal sağlar.',
  },
  {
    id: 'building-floor',
    title: 'Kat Analizi',
    href: '/bina-karsilastirma',
    category: 'analiz',
    mission: 'Bina içi kat ve konum farkını fiyat kararına dönüştürür.',
    requiredData: ['bina', 'kat', 'toplam kat', 'm2', 'fiyat'],
    qualityRules: [
      'Kat etkisi fiyat sapmasıyla birlikte yorumlanmalı.',
      'Eksik bina bilgisi güveni düşürmeli.',
      'Sonuç portföy fiyatına aksiyon olarak bağlanmalı.',
    ],
    outputContract: ['kat primi', 'sapma', 'fiyat notu'],
    failureModes: ['katı tek başına değer nedeni saymak', 'fiyat etkisini göstermemek'],
    handoff: 'Değerleme ve portföy fiyat revizyonu kararlarını destekler.',
  },
]

export function buildFeatureTraining(data: CommandCenterData): FeatureTrainingResult[] {
  const analysis = analyzeCommandCenter(data)
  const baseSignals = {
    customers: data.customers.length,
    portfolios: data.portfolios.length,
    deals: data.deals.length,
    interactions: data.interactions.length,
    priceChanges: data.priceChanges.length,
    analysisResults: data.analysisResults.length,
    feedback: data.actionFeedback.length,
    experiments: data.experiments.length,
    risks: analysis.risks.filter((risk) => risk.level !== 'low').length,
    actions: analysis.actions.length,
  }

  return featureTrainingDefinitions.map((definition) => {
    const score = scoreFeature(definition.id, baseSignals)
    return {
      ...definition,
      readiness: score,
      level: score >= 76 ? 'strong' : score >= 42 ? 'learning' : 'weak',
      currentSignals: buildCurrentSignals(definition.id, baseSignals),
      missingData: buildMissingData(definition, baseSignals),
      nextTrainingActions: buildNextActions(definition.id, baseSignals),
    }
  })
}

function scoreFeature(id: string, signals: Record<string, number>) {
  const scores: Record<string, number> = {
    'command-center': weighted([
      [signals.customers, 15],
      [signals.portfolios, 15],
      [signals.deals, 20],
      [signals.interactions, 20],
      [signals.feedback, 15],
      [signals.actions, 15],
    ]),
    analysis: weighted([[signals.analysisResults, 50], [signals.risks, 20], [signals.actions, 30]]),
    listings: weighted([[signals.portfolios, 40], [signals.deals, 25], [signals.priceChanges, 35]]),
    ai: weighted([[signals.customers + signals.portfolios + signals.deals, 45], [signals.risks, 25], [signals.actions, 30]]),
    valuation: weighted([[signals.analysisResults, 30], [signals.portfolios, 30], [signals.priceChanges, 40]]),
    contracts: weighted([[signals.deals, 35], [signals.customers, 25], [signals.portfolios, 25], [signals.feedback, 15]]),
    report: weighted([[signals.analysisResults, 40], [signals.customers, 20], [signals.portfolios, 20], [signals.deals, 20]]),
    emsal: weighted([[signals.analysisResults, 35], [signals.portfolios, 35], [signals.priceChanges, 30]]),
    'zone-score': weighted([[signals.analysisResults, 45], [signals.portfolios, 25], [signals.risks, 30]]),
    'building-floor': weighted([[signals.analysisResults, 35], [signals.portfolios, 35], [signals.priceChanges, 30]]),
  }
  return Math.min(100, Math.round(scores[id] ?? 0))
}

function weighted(items: Array<[number, number]>) {
  return items.reduce((sum, [count, weight]) => sum + Math.min(1, count / 2) * weight, 0)
}

function buildCurrentSignals(id: string, signals: Record<string, number>) {
  const common = [
    `${signals.customers} müşteri`,
    `${signals.portfolios} portföy`,
    `${signals.deals} işlem`,
  ]
  if (id === 'analysis') return [`${signals.analysisResults} analiz sonucu`, `${signals.risks} risk sinyali`]
  if (id === 'listings') return [`${signals.portfolios} portföy`, `${signals.priceChanges} fiyat revizyonu`]
  if (id === 'ai') return [...common, `${signals.actions} aksiyon bağlamı`]
  if (id === 'command-center') return [...common, `${signals.interactions} temas`, `${signals.feedback} geri bildirim`]
  return [...common, `${signals.analysisResults} analiz sonucu`]
}

function buildMissingData(definition: FeatureTrainingDefinition, signals: Record<string, number>) {
  const missing: string[] = []
  if (definition.requiredData.includes('müşteri') && !signals.customers) missing.push('müşteri kaydı')
  if (definition.requiredData.includes('portföy') && !signals.portfolios) missing.push('portföy kaydı')
  if (definition.requiredData.includes('işlem') && !signals.deals) missing.push('işlem kaydı')
  if (definition.requiredData.includes('temas') && !signals.interactions) missing.push('temas kaydı')
  if (definition.requiredData.includes('fiyat revizyonu') && !signals.priceChanges) missing.push('fiyat revizyonu')
  if (definition.requiredData.includes('analiz sonucu') && !signals.analysisResults) missing.push('analiz sonucu')
  return missing.length ? missing : ['ana veri tamam, kalite için daha fazla örnek eklenebilir']
}

function buildNextActions(id: string, signals: Record<string, number>) {
  const actions: string[] = []
  if (!signals.customers) actions.push('Command Center içinde ilk müşteri kaydını oluştur.')
  if (!signals.portfolios) actions.push('Portföy başlığı, liste fiyatı ve hedef fiyat gir.')
  if (!signals.deals) actions.push('Müşteri ile portföyü bir işlem kaydında bağla.')
  if (!signals.interactions && ['command-center', 'ai', 'contracts'].includes(id)) {
    actions.push('Aktif işlem için arama, mesaj veya görüşme kaydı ekle.')
  }
  if (!signals.analysisResults && id !== 'listings') {
    actions.push('Analiz Merkezi’nde gerçek bir analiz üretip hafızaya yaz.')
  }
  if (!signals.feedback && id === 'command-center') {
    actions.push('Bir aksiyonu tamamlandı olarak işaretleyip geri bildirim ver.')
  }
  return actions.slice(0, 4)
}
