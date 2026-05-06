'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type CenterKey = 'analysis' | 'ai' | 'portfolio' | 'documents' | 'operations'

const D = {
  bg2: '#0d0d0d',
  brd: '#161616',
  gold: '#FFD700',
  muted: '#555',
  dim: '#333',
}

const CENTER_NAV: Record<CenterKey, {
  title: string
  subtitle: string
  items: Array<{ href: string; label: string; icon: string; note: string }>
}> = {
  analysis: {
    title: 'Analiz Merkezi',
    subtitle: 'Fiyat, emsal ve bölge kararları',
    items: [
      { href: '/dashboard', label: 'Ana Ekran', icon: '◈', note: 'Merkezlere dön' },
      { href: '/analysis', label: '4 Ana Analiz', icon: '◎', note: 'Adres, deal, bölge, risk' },
      { href: '/valuation', label: 'Fiyat Tahmini', icon: '⚡', note: 'Mülkün değer aralığı' },
      { href: '/emsal', label: 'Emsal Araştırması', icon: '◭', note: 'Benzer ilan ve sapma' },
      { href: '/zone-scores', label: 'Bölge Skoru', icon: '◐', note: 'Lokasyon gücü' },
      { href: '/bina-karsilastirma', label: 'Kat Karşılaştırma', icon: '▤', note: 'Aynı binada kat farkı' },
      { href: '/map', label: 'Harita Görünümü', icon: '◉', note: 'Portföy konumları' },
    ],
  },
  portfolio: {
    title: 'Portföy Merkezi',
    subtitle: 'İlan, müşteri ve takip işleri',
    items: [
      { href: '/dashboard', label: 'Ana Ekran', icon: '◈', note: 'Merkezlere dön' },
      { href: '/listings', label: 'Portföy Girişi', icon: '▦', note: 'İlan ekle ve düzenle' },
      { href: '/command-center', label: 'İş Takibi', icon: '▧', note: 'Müşteri ve aksiyonlar' },
      { href: '/feature-training', label: 'Kullanım Durumu', icon: '▥', note: 'Eksik kalan alanlar' },
    ],
  },
  documents: {
    title: 'Belge Merkezi',
    subtitle: 'Sözleşme ve müşteri raporu',
    items: [
      { href: '/dashboard', label: 'Ana Ekran', icon: '◈', note: 'Merkezlere dön' },
      { href: '/sozlesme', label: 'Sözleşme Üret', icon: '▣', note: 'Kira ve satış belgeleri' },
      { href: '/report', label: 'PDF Rapor Hazırla', icon: '▣', note: 'Müşteri sunumu' },
      { href: '/command-center', label: 'İşe Bağla', icon: '▧', note: 'Belgeyi işlemle ilişkilendir' },
    ],
  },
  ai: {
    title: 'AI Merkezi',
    subtitle: 'Asistan ve kullanım yardımı',
    items: [
      { href: '/dashboard', label: 'Ana Ekran', icon: '◈', note: 'Merkezlere dön' },
      { href: '/ai', label: 'Emlak Asistanı', icon: '◈', note: 'Portföye göre cevap' },
      { href: '/feature-training', label: 'Özellik Rehberi', icon: '▥', note: 'Neyi nasıl beslerim?' },
      { href: '/command-center', label: 'İş Takibi', icon: '▧', note: 'Aksiyonlara dön' },
    ],
  },
  operations: {
    title: 'İş Takibi',
    subtitle: 'Müşteri, portföy ve aksiyon',
    items: [
      { href: '/dashboard', label: 'Ana Ekran', icon: '◈', note: 'Merkezlere dön' },
      { href: '/command-center', label: 'Günlük İşler', icon: '▧', note: 'Takip ve aksiyon' },
      { href: '/listings', label: 'Portföyler', icon: '▦', note: 'İlan kayıtları' },
      { href: '/feature-training', label: 'Eksik Bilgiler', icon: '▥', note: 'Tamamlanacak alanlar' },
    ],
  },
}

export function CenterSidebar({ center }: { center: CenterKey }) {
  const pathname = usePathname()
  const config = CENTER_NAV[center]

  return (
    <aside style={{ width: 282, borderRight: `1px solid ${D.brd}`, display: 'flex', flexDirection: 'column', background: D.bg2, flexShrink: 0 }}>
      <div style={{ padding: '22px 18px 18px', borderBottom: `1px solid ${D.brd}` }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: 20, color: D.gold, letterSpacing: 4, fontWeight: 300 }}>VEGA</div>
          <div style={{ fontSize: 9, color: D.dim, marginTop: 3, letterSpacing: 4 }}>INTELLIGENCE</div>
        </Link>
      </div>

      <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${D.brd}` }}>
        <div style={{ color: '#e0e0e0', fontSize: 14, fontWeight: 700 }}>{config.title}</div>
        <div style={{ color: D.muted, fontSize: 10, lineHeight: 1.45, marginTop: 5 }}>{config.subtitle}</div>
      </div>

      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {config.items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr',
                gap: 12,
                padding: '14px 13px',
                marginBottom: 8,
                color: active ? D.gold : D.muted,
                textDecoration: 'none',
                border: active ? `1px solid rgba(255,215,0,0.28)` : `1px solid ${D.brd}`,
                borderRadius: 10,
                background: active ? 'rgba(255,215,0,0.07)' : '#0a0a0a',
              }}
            >
              <span style={{ width: 36, height: 36, borderRadius: 8, border: active ? '1px solid rgba(255,215,0,0.28)' : `1px solid ${D.brd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, textAlign: 'center', lineHeight: '18px', color: active ? D.gold : D.muted, background: active ? 'rgba(255,215,0,0.08)' : '#080808' }}>{item.icon}</span>
              <span>
                <span style={{ display: 'block', fontSize: 14, fontWeight: active ? 800 : 650, color: active ? D.gold : '#d5d5d5' }}>{item.label}</span>
                <span style={{ display: 'block', fontSize: 11, lineHeight: 1.35, color: active ? 'rgba(255,215,0,0.62)' : D.muted, marginTop: 4 }}>{item.note}</span>
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
