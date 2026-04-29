'use client'
import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ROLES = [
  { id: 'danisман', label: 'Emlak Danışmanı', icon: '◈', desc: 'Bireysel portföy yönetimi',
    modules: ['AI Değerleme', 'Adres Analizi', 'Deal Skoru', 'PDF Rapor'] },
  { id: 'broker', label: 'Broker / Acente Sahibi', icon: '▦', desc: 'Ekip ve ofis yönetimi',
    modules: ['Takım Workspace', 'İlan Yönetimi', 'Bölge Hakimiyeti', 'Tüm Merkezler'] },
  { id: 'yatirimci', label: 'Yatırımcı', icon: '⚡', desc: 'Portföy & analiz odaklı',
    modules: ['Risk Analizi', 'Bölge Skoru', 'Emsal İstihbarat', 'AI Değerleme'] },
  { id: 'kurumsal', label: 'Kurumsal / Şirket', icon: '◎', desc: 'Çok lokasyonlu yapı',
    modules: ['Canlı Harita', 'Tüm Merkezler', 'Takım Workspace', 'İlan CSV'] },
]

const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
  'Adana', 'Konya', 'Gaziantep', 'Kocaeli', 'Mersin',
  'Eskişehir', 'Bodrum', 'Trabzon', 'Diğer',
]

const CITY_STATS: Record<string, { m2: string; rent: string; growth: string; supply: string }> = {
  'İstanbul': { m2: '₺89.400/m²', rent: '₺35.000/ay', growth: '+4.2%', supply: '12.400 ilan' },
  'Ankara':   { m2: '₺42.800/m²', rent: '₺18.000/ay', growth: '+3.1%', supply: '8.200 ilan' },
  'İzmir':    { m2: '₺61.200/m²', rent: '₺24.000/ay', growth: '+2.7%', supply: '5.600 ilan' },
  'Bursa':    { m2: '₺38.500/m²', rent: '₺14.000/ay', growth: '+2.2%', supply: '3.800 ilan' },
  'Antalya':  { m2: '₺52.000/m²', rent: '₺21.000/ay', growth: '+5.1%', supply: '4.200 ilan' },
  'Bodrum':   { m2: '₺95.000/m²', rent: '₺42.000/ay', growth: '+6.8%', supply: '1.800 ilan' },
}

const PLANS = [
  {
    id: 'bireysel', name: 'Bireysel', price: '₺990', period: '/ay', tag: null,
    desc: 'Tek danışman için tüm analiz araçları',
    features: ['AI Değerleme', 'Analiz Merkezi', 'Sözleşme Üretici', 'PDF Rapor', 'Bölge Skoru'],
    missing: ['Canlı Harita', 'İlan CSV', 'Takım Workspace'],
  },
  {
    id: 'kurumsal', name: 'Kurumsal', price: '₺2.490', period: '/ay', tag: 'EN POPÜLER',
    desc: 'Tüm ofis — sınırsız kullanıcı, tam modüller',
    features: ['Her şey dahil', 'Canlı Harita', 'İlan CSV', 'Takım Workspace', 'Acente kodu', 'Öncelikli destek'],
    missing: [],
  },
]

type Step = 1 | 2 | 3 | 4 | 5
const STEP_LABELS = ['Rol', 'Konum', 'Acente', 'Plan', 'Hesap']

/* ─── Simülasyon panelleri ─── */

function SimRole({ role }: { role: string }) {
  const r = ROLES.find(x => x.id === role)
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (!r) return
    const t = setInterval(() => setIdx(i => (i + 1) % r.modules.length), 1400)
    return () => clearInterval(t)
  }, [r])
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 11, color: '#2a2a2a', letterSpacing: 2, marginBottom: 4 }}>PLATFORM ÖNIZLEMESI</div>
      {r ? (
        <>
          <div style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.12)', borderRadius: 12, padding: '20px' }}>
            <div style={{ fontSize: 22, color: '#FFD700', marginBottom: 10 }}>{r.icon}</div>
            <div style={{ fontSize: 16, color: '#c0c0c0', fontWeight: 500, marginBottom: 6 }}>{r.label}</div>
            <div style={{ fontSize: 12, color: '#333', marginBottom: 16 }}>{r.desc}</div>
            <div style={{ fontSize: 10, color: '#2a2a2a', letterSpacing: 1, marginBottom: 10 }}>AKTİF MODÜLLER</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {r.modules.map((m, i) => (
                <div key={m} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 8,
                  background: idx === i ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.015)',
                  border: `1px solid ${idx === i ? 'rgba(255,215,0,0.2)' : '#161616'}`,
                  transition: 'all 0.3s',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: idx === i ? '#FFD700' : '#222', transition: 'background 0.3s' }} />
                  <span style={{ fontSize: 12, color: idx === i ? '#FFD700' : '#333', transition: 'color 0.3s' }}>{m}</span>
                  {idx === i && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#FFD700' }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ROLES.map(r => (
            <div key={r.id} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid #141414', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 16, color: '#2a2a2a' }}>{r.icon}</div>
              <div style={{ fontSize: 12, color: '#2a2a2a' }}>{r.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SimCity({ city }: { city: string }) {
  const stats = CITY_STATS[city]
  const [visible, setVisible] = useState(false)
  useEffect(() => { if (city) { setVisible(false); const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t) } }, [city])
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 11, color: '#2a2a2a', letterSpacing: 2, marginBottom: 4 }}>PIYASA VERİSİ</div>
      {city && stats ? (
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(10px)', transition: 'all 0.4s' }}>
          <div style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.1)', borderRadius: 12, padding: '20px', marginBottom: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 300, color: '#FFD700', letterSpacing: -1, marginBottom: 4 }}>{city}</div>
            <div style={{ fontSize: 11, color: '#2a2a2a' }}>Anlık piyasa verisi</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Ort. m² Fiyatı', val: stats.m2, color: '#FFD700' },
              { label: 'Ort. Kira', val: stats.rent, color: '#22c55e' },
              { label: 'Yıllık Büyüme', val: stats.growth, color: '#38bdf8' },
              { label: 'Aktif Arz', val: stats.supply, color: '#e879f9' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #161616', borderRadius: 9, padding: '12px 14px' }}>
                <div style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: 1, marginBottom: 5 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {['m² Fiyatı', 'Ort. Kira', 'Büyüme', 'Aktif Arz'].map(s => (
            <div key={s} style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid #141414', borderRadius: 9, padding: '14px', height: 64, display: 'flex', alignItems: 'center' }}>
              <div style={{ fontSize: 10, color: '#1a1a1a' }}>{s}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SimAgency({ mode, name }: { mode: 'create' | 'join'; name: string }) {
  const [dots, setDots] = useState(1)
  useEffect(() => { const t = setInterval(() => setDots(d => d < 3 ? d + 1 : 1), 600); return () => clearInterval(t) }, [])
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 11, color: '#2a2a2a', letterSpacing: 2, marginBottom: 4 }}>ÇALIŞMA ORTAMI</div>
      <div style={{ background: '#0a0a0a', border: '1px solid #161616', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #111', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 12, color: '#555' }}>{name || 'Acenteniz'}</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#2a2a2a' }}>Workspace</span>
        </div>
        <div style={{ padding: '14px 16px' }}>
          {mode === 'create' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, color: '#333', marginBottom: 6 }}>Ekip üyeleri</div>
              {['Siz (Yönetici)', 'Danışman 2', 'Danışman 3'].map((u, i) => (
                <div key={u} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid #141414', borderRadius: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.2)' : '#1a1a1a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: i === 0 ? '#FFD700' : '#333' }}>
                    {i === 0 ? '★' : '◈'}
                  </div>
                  <span style={{ fontSize: 11, color: i === 0 ? '#888' : '#2a2a2a' }}>{i > 0 && i === 2 ? `Davet bekleniyor${'.'.repeat(dots)}` : u}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)', borderRadius: 8, fontSize: 11, color: '#444' }}>
                Acente kodunuzu paylaşarak ekibinizi davet edin
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 11, color: '#333', marginBottom: 12 }}>Mevcut acenteye katılıyorsunuz</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Ortak portföy erişimi', 'Paylaşılan ilanlar', 'Takım analitiği'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#555' }}>
                    <span style={{ color: '#22c55e', fontSize: 10 }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SimPlan({ plan }: { plan: string }) {
  const p = PLANS.find(x => x.id === plan) || PLANS[1]
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 11, color: '#2a2a2a', letterSpacing: 2, marginBottom: 4 }}>PLAN DETAYI</div>
      <div style={{ background: plan === 'kurumsal' ? 'rgba(255,215,0,0.03)' : 'rgba(255,255,255,0.015)', border: `1px solid ${plan === 'kurumsal' ? 'rgba(255,215,0,0.15)' : '#161616'}`, borderRadius: 12, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: plan === 'kurumsal' ? '#FFD700' : '#888', marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: '#2a2a2a' }}>{p.desc}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: plan === 'kurumsal' ? '#FFD700' : '#666' }}>{p.price}</div>
            <div style={{ fontSize: 10, color: '#2a2a2a' }}>{p.period}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {p.features.slice(0, 5).map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #111', fontSize: 12, color: '#555' }}>
              <span style={{ color: '#22c55e', fontSize: 10 }}>✓</span>{f}
            </div>
          ))}
          {p.missing.slice(0, 2).map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 12, color: '#1e1e1e' }}>
              <span style={{ fontSize: 10 }}>—</span><span style={{ textDecoration: 'line-through' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SimSummary({ fullName, city, agencyName, plan }: any) {
  const [tick, setTick] = useState(0)
  useEffect(() => { const t = setInterval(() => setTick(i => i + 1), 80); return () => clearTimeout(t) }, [])
  const items = [
    { label: 'Ad', val: fullName || '—' },
    { label: 'Şehir', val: city || '—' },
    { label: 'Acente', val: agencyName || '—' },
    { label: 'Plan', val: PLANS.find(p => p.id === plan)?.name || '—' },
  ]
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 11, color: '#2a2a2a', letterSpacing: 2, marginBottom: 4 }}>HESAP ÖZETİ</div>
      <div style={{ background: 'rgba(255,215,0,0.03)', border: '1px solid rgba(255,215,0,0.1)', borderRadius: 12, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#FFD700' }}>◈</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(s => (
            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #111' }}>
              <span style={{ fontSize: 10, color: '#2a2a2a', letterSpacing: 1 }}>{s.label.toUpperCase()}</span>
              <span style={{ fontSize: 12, color: '#666' }}>{s.val}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#333', marginBottom: 8 }}>Platform hazır</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
            {['Analiz', 'Sözleşme', 'Rapor', 'AI', 'Harita'].map((m, i) => (
              <div key={m} style={{ padding: '3px 8px', background: tick > i * 8 ? 'rgba(255,215,0,0.08)' : 'transparent', border: `1px solid ${tick > i * 8 ? 'rgba(255,215,0,0.2)' : '#141414'}`, borderRadius: 4, fontSize: 9, color: tick > i * 8 ? '#FFD700' : '#1e1e1e', transition: 'all 0.3s' }}>{m}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  const [step, setStep] = useState<Step>(1)
  const [role, setRole] = useState('')
  const [city, setCity] = useState('')
  const [fullName, setFullName] = useState('')
  const [agencyMode, setAgencyMode] = useState<'create' | 'join'>('create')
  const [agencyName, setAgencyName] = useState('')
  const [agencyCode, setAgencyCode] = useState('')
  const [plan, setPlan] = useState('kurumsal')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const next = () => setStep(s => (s + 1) as Step)
  const back = () => setStep(s => (s - 1) as Step)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const agencyId = agencyMode === 'join' ? agencyCode.trim() : crypto.randomUUID()
    const { data, error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role, city, agency_name: agencyName, agency_id: agencyId, account_type: plan } },
    })
    if (err) { setError(err.message); setLoading(false); return }
    if (data.user) await supabase.auth.updateUser({ data: { agency_id: agencyId, account_type: plan } })
    router.push('/dashboard')
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '12px 15px', borderRadius: 9, border: '1px solid #1c1c1c',
    fontSize: 14, background: '#0d0d0d', color: '#e0e0e0',
    boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s',
  }

  const simPanel = (
    <div style={{ flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {step === 1 && <SimRole role={role} />}
      {step === 2 && <SimCity city={city} />}
      {step === 3 && <SimAgency mode={agencyMode} name={agencyMode === 'create' ? agencyName : agencyCode} />}
      {step === 4 && <SimPlan plan={plan} />}
      {step === 5 && <SimSummary fullName={fullName} city={city} agencyName={agencyMode === 'create' ? agencyName : agencyCode} plan={plan} />}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#050505', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: '#e0e0e0', display: 'flex', flexDirection: 'column' }}>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}.step-in{animation:fadeUp 0.35s ease both}`}</style>

      {/* Header */}
      <div style={{ padding: '18px 48px', borderBottom: '1px solid #0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <span style={{ fontSize: 19, color: '#FFD700', letterSpacing: 5, fontWeight: 200 }}>VEGA</span>
          <span style={{ fontSize: 8, color: '#1a1a1a', letterSpacing: 3, marginLeft: 8 }}>INTELLIGENCE</span>
        </div>
        <Link href="/auth/login" style={{ fontSize: 12, color: '#333', textDecoration: 'none' }}>Hesabın var mı? Giriş yap →</Link>
      </div>

      {/* Adım barı */}
      <div style={{ padding: '20px 48px', borderBottom: '1px solid #0a0a0a', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        {STEP_LABELS.map((s, i) => {
          const num = i + 1; const done = step > num; const active = step === num
          return (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: done ? '#FFD700' : active ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.02)', border: done ? 'none' : active ? '1px solid rgba(255,215,0,0.4)' : '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: done ? '#000' : active ? '#FFD700' : '#2a2a2a' }}>
                  {done ? '✓' : num}
                </div>
                <span style={{ fontSize: 11, color: active ? '#FFD700' : done ? '#444' : '#1e1e1e' }}>{s}</span>
              </div>
              {i < STEP_LABELS.length - 1 && <div style={{ flex: 1, height: 1, background: done ? 'rgba(255,215,0,0.2)' : '#111', margin: '0 12px' }} />}
            </React.Fragment>
          )
        })}
      </div>

      {/* İki kolon: form + simülasyon */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Sol: Form */}
        <div style={{ width: 520, borderRight: '1px solid #0e0e0e', padding: '48px 52px', overflowY: 'auto', flexShrink: 0 }}>

          {/* ── ADIM 1 ── */}
          {step === 1 && (
            <div className="step-in">
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 26, fontWeight: 300, color: '#c0c0c0', marginBottom: 8 }}>Nasıl kullanacaksınız?</div>
                <div style={{ fontSize: 13, color: '#2e2e2e' }}>Rolünüze göre platform kişiselleşir.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
                {ROLES.map(r => (
                  <div key={r.id} onClick={() => setRole(r.id)} style={{ background: role === r.id ? 'rgba(255,215,0,0.05)' : 'rgba(255,255,255,0.015)', border: `1px solid ${role === r.id ? 'rgba(255,215,0,0.35)' : '#161616'}`, borderRadius: 11, padding: '18px', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 20, color: role === r.id ? '#FFD700' : '#252525', marginBottom: 10 }}>{r.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: role === r.id ? '#e0e0e0' : '#484848', marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: role === r.id ? '#3a3a3a' : '#1c1c1c' }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={next} disabled={!role} style={{ width: '100%', padding: '13px', borderRadius: 9, border: 'none', background: role ? '#FFD700' : '#111', color: role ? '#000' : '#333', fontSize: 14, fontWeight: 700, cursor: role ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.15s' }}>Devam Et →</button>
            </div>
          )}

          {/* ── ADIM 2 ── */}
          {step === 2 && (
            <div className="step-in">
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 26, fontWeight: 300, color: '#c0c0c0', marginBottom: 8 }}>Nerede faaliyet gösteriyorsunuz?</div>
                <div style={{ fontSize: 13, color: '#2e2e2e' }}>Bölgesel piyasa verisi ve analizler için konumunuzu seçin.</div>
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 7, letterSpacing: 1.5 }}>ADINIZ SOYADINIZ</label>
                <input style={inp} type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ahmet Yılmaz" onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')} onBlur={e => (e.target.style.borderColor = '#1c1c1c')} />
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 10, letterSpacing: 1.5 }}>ŞEHİR</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {CITIES.map(c => (
                    <div key={c} onClick={() => setCity(c)} style={{ padding: '7px 16px', borderRadius: 18, cursor: 'pointer', background: city === c ? 'rgba(255,215,0,0.07)' : 'rgba(255,255,255,0.02)', border: `1px solid ${city === c ? 'rgba(255,215,0,0.35)' : '#1a1a1a'}`, fontSize: 12, color: city === c ? '#FFD700' : '#3a3a3a', transition: 'all 0.12s' }}>{c}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={back} style={{ padding: '13px 24px', borderRadius: 9, border: '1px solid #1a1a1a', background: 'transparent', color: '#444', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Geri</button>
                <button onClick={next} disabled={!city || !fullName.trim()} style={{ flex: 1, padding: '13px', borderRadius: 9, border: 'none', background: city && fullName.trim() ? '#FFD700' : '#111', color: city && fullName.trim() ? '#000' : '#333', fontSize: 14, fontWeight: 700, cursor: city && fullName.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'all 0.15s' }}>Devam Et →</button>
              </div>
            </div>
          )}

          {/* ── ADIM 3 ── */}
          {step === 3 && (
            <div className="step-in">
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 26, fontWeight: 300, color: '#c0c0c0', marginBottom: 8 }}>Acenteniz hakkında</div>
                <div style={{ fontSize: 13, color: '#2e2e2e' }}>Yeni kurun ya da mevcut acenteye katılın.</div>
              </div>
              <div style={{ display: 'flex', marginBottom: 24, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 9, padding: 3 }}>
                {(['create', 'join'] as const).map(m => (
                  <button key={m} onClick={() => setAgencyMode(m)} style={{ flex: 1, padding: '10px', borderRadius: 7, border: 'none', fontSize: 12, background: agencyMode === m ? '#FFD700' : 'transparent', color: agencyMode === m ? '#000' : '#444', fontWeight: agencyMode === m ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    {m === 'create' ? 'Yeni Acente Kur' : 'Acenteye Katıl'}
                  </button>
                ))}
              </div>
              {agencyMode === 'create' ? (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 7, letterSpacing: 1.5 }}>ACENTE / OFİS ADI</label>
                  <input style={inp} type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Miras Gayrimenkul" onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')} onBlur={e => (e.target.style.borderColor = '#1c1c1c')} />
                  <div style={{ fontSize: 11, color: '#1e1e1e', marginTop: 6 }}>Ekip arkadaşlarınız bu isim altında görünecek.</div>
                </div>
              ) : (
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 7, letterSpacing: 1.5 }}>ACENTE KODU</label>
                  <input style={inp} type="text" value={agencyCode} onChange={e => setAgencyCode(e.target.value.toUpperCase())} placeholder="MIRAS-2024" onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')} onBlur={e => (e.target.style.borderColor = '#1c1c1c')} />
                  <div style={{ fontSize: 11, color: '#1e1e1e', marginTop: 6 }}>Aynı kodu girerek ortak portföy ve ilanları paylaşırsınız.</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={back} style={{ padding: '13px 24px', borderRadius: 9, border: '1px solid #1a1a1a', background: 'transparent', color: '#444', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Geri</button>
                <button onClick={next} disabled={agencyMode === 'create' ? !agencyName.trim() : !agencyCode.trim()} style={{ flex: 1, padding: '13px', borderRadius: 9, border: 'none', background: (agencyMode === 'create' ? agencyName.trim() : agencyCode.trim()) ? '#FFD700' : '#111', color: (agencyMode === 'create' ? agencyName.trim() : agencyCode.trim()) ? '#000' : '#333', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>Devam Et →</button>
              </div>
            </div>
          )}

          {/* ── ADIM 4 ── */}
          {step === 4 && (
            <div className="step-in">
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 26, fontWeight: 300, color: '#c0c0c0', marginBottom: 8 }}>Planınızı seçin</div>
                <div style={{ fontSize: 13, color: '#2e2e2e' }}>İstediğiniz zaman değiştirebilirsiniz.</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {PLANS.map(p => (
                  <div key={p.id} onClick={() => setPlan(p.id)} style={{ background: plan === p.id ? 'rgba(255,215,0,0.04)' : 'rgba(255,255,255,0.015)', border: `1px solid ${plan === p.id ? 'rgba(255,215,0,0.4)' : '#161616'}`, borderRadius: 12, padding: '18px 20px', cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}>
                    {p.tag && <div style={{ position: 'absolute', top: -10, right: 16, background: '#FFD700', color: '#000', fontSize: 9, fontWeight: 800, padding: '3px 10px', borderRadius: 8, letterSpacing: 1 }}>{p.tag}</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: plan === p.id ? '#FFD700' : '#666' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#242424', marginTop: 3 }}>{p.desc}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 24, fontWeight: 700, color: plan === p.id ? '#FFD700' : '#444' }}>{p.price}</span>
                        <span style={{ fontSize: 11, color: '#2a2a2a' }}>{p.period}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {p.features.map(f => <span key={f} style={{ fontSize: 10, color: plan === p.id ? '#555' : '#242424', background: plan === p.id ? 'rgba(34,197,94,0.06)' : 'transparent', border: `1px solid ${plan === p.id ? 'rgba(34,197,94,0.15)' : '#141414'}`, borderRadius: 4, padding: '2px 8px' }}>{f}</span>)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={back} style={{ padding: '13px 24px', borderRadius: 9, border: '1px solid #1a1a1a', background: 'transparent', color: '#444', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Geri</button>
                <button onClick={next} style={{ flex: 1, padding: '13px', borderRadius: 9, border: 'none', background: '#FFD700', color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Devam Et →</button>
              </div>
            </div>
          )}

          {/* ── ADIM 5 ── */}
          {step === 5 && (
            <div className="step-in">
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 26, fontWeight: 300, color: '#c0c0c0', marginBottom: 8 }}>Hesabınızı oluşturun</div>
                <div style={{ fontSize: 13, color: '#2e2e2e' }}>Son adım.</div>
              </div>
              <form onSubmit={handleSignup}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 7, letterSpacing: 1.5 }}>E-POSTA</label>
                  <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ornek@email.com" onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')} onBlur={e => (e.target.style.borderColor = '#1c1c1c')} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 7, letterSpacing: 1.5 }}>ŞİFRE</label>
                  <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="En az 6 karakter" onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')} onBlur={e => (e.target.style.borderColor = '#1c1c1c')} />
                </div>
                {error && <div style={{ color: '#f87171', fontSize: 13, marginBottom: 16, padding: '11px 14px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 9 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={back} style={{ padding: '13px 24px', borderRadius: 9, border: '1px solid #1a1a1a', background: 'transparent', color: '#444', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Geri</button>
                  <button type="submit" disabled={loading} style={{ flex: 1, padding: '13px', borderRadius: 9, border: 'none', background: loading ? '#111' : '#FFD700', color: loading ? '#333' : '#000', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    {loading ? 'Oluşturuluyor…' : 'Hesabı Oluştur →'}
                  </button>
                </div>
                <div style={{ textAlign: 'center', marginTop: 16, fontSize: 10, color: '#1a1a1a' }}>Devam ederek Kullanım Koşulları'nı kabul etmiş olursunuz.</div>
              </form>
            </div>
          )}

        </div>

        {/* Sağ: Simülasyon */}
        <div style={{ flex: 1, background: '#080808', position: 'relative', overflow: 'hidden' }}>
          {/* Dekor */}
          <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: '0 40px', maxWidth: 380, margin: '0 auto' }}>
            {simPanel}
          </div>
        </div>

      </div>
    </div>
  )
}
