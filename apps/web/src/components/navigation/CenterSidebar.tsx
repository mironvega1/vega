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
    subtitle: 'Değerleme · Emsal · Bölge · Kat',
    items: [
      { href: '/dashboard', label: 'Ana Merkez', icon: '◈', note: 'Genel operasyon' },
      { href: '/analysis', label: 'Analiz Merkezi', icon: '◎', note: 'Adres, deal, risk' },
      { href: '/valuation', label: 'AI Değerleme', icon: '⚡', note: 'Fiyat tahmini' },
      { href: '/emsal', label: 'Emsal İstihbarat', icon: '◭', note: 'Emsal ve sapma' },
      { href: '/zone-scores', label: 'Bölge Skoru', icon: '◐', note: 'Bölge puanı' },
      { href: '/bina-karsilastirma', label: 'Kat Analizi', icon: '▤', note: 'Bina içi fark' },
      { href: '/map', label: 'Canlı Harita', icon: '◉', note: 'Görsel analiz' },
    ],
  },
  portfolio: {
    title: 'Portföy Merkezi',
    subtitle: 'Kayıt · CSV · İşlem · Takip',
    items: [
      { href: '/dashboard', label: 'Ana Merkez', icon: '◈', note: 'Genel operasyon' },
      { href: '/listings', label: 'İlan Yönetimi', icon: '▦', note: 'Portföy girişi' },
      { href: '/command-center', label: 'Command Center', icon: '▧', note: 'Aksiyon motoru' },
      { href: '/feature-training', label: 'Feature Training', icon: '▥', note: 'Eğitim durumu' },
    ],
  },
  documents: {
    title: 'Belge Merkezi',
    subtitle: 'Sözleşme · PDF · Rapor',
    items: [
      { href: '/dashboard', label: 'Ana Merkez', icon: '◈', note: 'Genel operasyon' },
      { href: '/sozlesme', label: 'Sözleşme Merkezi', icon: '▣', note: 'Kira ve satış' },
      { href: '/report', label: 'PDF Rapor Merkezi', icon: '▣', note: 'Müşteri raporu' },
      { href: '/command-center', label: 'Command Center', icon: '▧', note: 'İşlem bağlamı' },
    ],
  },
  ai: {
    title: 'AI Merkezi',
    subtitle: 'Asistan · Context · Eğitim',
    items: [
      { href: '/dashboard', label: 'Ana Merkez', icon: '◈', note: 'Genel operasyon' },
      { href: '/ai', label: 'Emlak Yapay Zekası', icon: '◈', note: 'Veriye bağlı cevap' },
      { href: '/feature-training', label: 'Feature Training', icon: '▥', note: 'Modül eğitimi' },
      { href: '/command-center', label: 'Command Center', icon: '▧', note: 'Karar verisi' },
    ],
  },
  operations: {
    title: 'Operasyon Merkezi',
    subtitle: 'Karar · Eğitim · Portföy',
    items: [
      { href: '/dashboard', label: 'Ana Merkez', icon: '◈', note: 'Genel operasyon' },
      { href: '/command-center', label: 'Command Center', icon: '▧', note: 'Karar motoru' },
      { href: '/feature-training', label: 'Feature Training', icon: '▥', note: 'Eğitim planı' },
      { href: '/listings', label: 'İlan Yönetimi', icon: '▦', note: 'Portföy verisi' },
    ],
  },
}

export function CenterSidebar({ center }: { center: CenterKey }) {
  const pathname = usePathname()
  const config = CENTER_NAV[center]

  return (
    <aside style={{ width: 240, borderRight: `1px solid ${D.brd}`, display: 'flex', flexDirection: 'column', background: D.bg2, flexShrink: 0 }}>
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

      <nav style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
        {config.items.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'grid',
                gridTemplateColumns: '22px 1fr',
                gap: 10,
                padding: '10px 18px',
                color: active ? D.gold : D.muted,
                textDecoration: 'none',
                borderLeft: active ? `2px solid ${D.gold}` : '2px solid transparent',
                background: active ? 'rgba(255,215,0,0.06)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 15, textAlign: 'center', lineHeight: '18px' }}>{item.icon}</span>
              <span>
                <span style={{ display: 'block', fontSize: 12, fontWeight: active ? 700 : 500 }}>{item.label}</span>
                <span style={{ display: 'block', fontSize: 9, color: active ? 'rgba(255,215,0,0.55)' : D.dim, marginTop: 2 }}>{item.note}</span>
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
