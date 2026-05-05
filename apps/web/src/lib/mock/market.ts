export type RiskLevel = 'low' | 'medium' | 'high'
export type LiquidityLevel = 'low' | 'medium' | 'high'
export type Opportunity = { id:string; title:string; city:string; district:string; neighborhood:string; price:number; estimatedMarketPrice:number; squareMeters:number; roomCount:string; listingType:'sale'|'rent'; source?:string; publishedAt:string; dealScore:number; discountRate:number; riskLevel:RiskLevel; liquidity:LiquidityLevel; aiSummary:string; tags:string[] }
export const opportunities: Opportunity[] = [
{ id:'opp-1', title:'Çukurova’da 3+1 Site İçi Daire', city:'Adana', district:'Çukurova', neighborhood:'Toros', price:3250000, estimatedMarketPrice:3750000, squareMeters:135, roomCount:'3+1', listingType:'sale', publishedAt:'2026-05-03T08:20:00Z', dealScore:88, discountRate:13.3, riskLevel:'medium', liquidity:'high', aiSummary:'Benzer ilanlara göre fiyat avantajı var. Tapu/kat mülkiyeti doğrulanmalı.', tags:['kritik','site-içi'] },
{ id:'opp-2', title:'Mahfesığmaz 2+1 Kiralık Yeni Bina', city:'Adana', district:'Çukurova', neighborhood:'Mahfesığmaz', price:28500, estimatedMarketPrice:32000, squareMeters:110, roomCount:'2+1', listingType:'rent', publishedAt:'2026-05-03T07:45:00Z', dealScore:82, discountRate:10.9, riskLevel:'low', liquidity:'high', aiSummary:'Kiralık talebi yüksek. Hızlı müşteri eşleşmesi mümkün.', tags:['kiralık','yüksek-talep'] },
{ id:'opp-3', title:'Reşatbey 4+1 Geniş Daire', city:'Adana', district:'Seyhan', neighborhood:'Reşatbey', price:4700000, estimatedMarketPrice:5300000, squareMeters:175, roomCount:'4+1', listingType:'sale', publishedAt:'2026-05-02T15:30:00Z', dealScore:79, discountRate:11.3, riskLevel:'medium', liquidity:'medium', aiSummary:'Metrekare avantajı iyi, pazarlık payı olabilir.', tags:['yatırım'] },]
export const marketPulse = { priceDirection: 2.1, hottestRegion: 'Seyhan', demandIncrease: 'Kiralık 2+1', newListings: 42, avgCloseDays: 31, lastUpdate: 'Bugün 09:30', aiDailyComment: 'Bugün Çukurova ve Seyhan hattında kiralık 2+1 talebi belirgin şekilde öne çıkıyor.' }
export const regions = [
{ name:'Çukurova / Toros', m2Price:34500, dailyChange:3.2, weeklyChange:5.9, newListings:12, avgDays:24, demand:'Yüksek', opportunity:'Orta', risk:'Düşük' },
{ name:'Seyhan / Reşatbey', m2Price:37200, dailyChange:2.8, weeklyChange:4.3, newListings:9, avgDays:27, demand:'Yüksek', opportunity:'Yüksek', risk:'Orta' },
{ name:'Yüreğir / Güzelyalı', m2Price:26800, dailyChange:1.1, weeklyChange:2.2, newListings:7, avgDays:35, demand:'Orta', opportunity:'Orta', risk:'Orta' },]
export const demandSignals = [
{ title:'2+1 Kiralık Talebi Artıyor', effect:'high', region:'Çukurova / Mahfesığmaz', action:'Fiyat güncellemesi ve hızlı müşteri eşleştirmesi yapın.' },
{ title:'3+1 Satılık İlanlar Hızlı Kapanıyor', effect:'medium', region:'Seyhan / Reşatbey', action:'Portföydeki 3+1 ilanlar için hızlı arama planı çıkarın.' },]
export const dailyActions = ['Çukurova 3+1 portföylerini tekrar fiyatlandır.','Kiralık 2+1 arayan müşterileri kontrol et.','Piyasa altı yeni ilanları Fırsat Radarı’ndan incele.','30+ gündür yayında olan portföyleri revize et.','En sıcak 3 bölge için müşteri mesajı hazırla.']
