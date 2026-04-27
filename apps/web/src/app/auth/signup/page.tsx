'use client'
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { bg:"#080808", bg2:"#0d0d0d", brd:"#1a1a1a", brd2:"#222", gold:"#FFD700", text:"#e0e0e0", muted:"#555", dim:"#333" }
const inp: React.CSSProperties = { width:'100%', padding:'10px 13px', borderRadius:7, border:`1px solid ${D.brd2}`, fontSize:13, background:'#111', color:D.text, boxSizing:'border-box', outline:'none', fontFamily:'inherit' }
const lbl: React.CSSProperties = { display:'block', fontSize:11, marginBottom:5, color:D.muted, letterSpacing:1 }

const PLANS = [
  {
    id: 'individual',
    name: 'Bireysel',
    price: '₺990',
    period: '/ay',
    desc: 'Tek danışman',
    color: '#e0e0e0',
    features: [
      { text: 'AI Değerleme', ok: true },
      { text: 'Analiz Merkezi (tam)', ok: true },
      { text: 'Sözleşme Üretici', ok: true },
      { text: 'Bölge Skoru & Kat Analizi', ok: true },
      { text: 'PDF Rapor', ok: true },
      { text: 'Canlı Harita', ok: false },
      { text: 'İlan Yönetimi (CSV)', ok: false },
      { text: 'Takım Workspace', ok: false },
    ],
  },
  {
    id: 'agency',
    name: 'Kurumsal',
    price: '₺2.490',
    period: '/ay',
    desc: 'Tüm ofis — sınırsız kullanıcı',
    color: '#FFD700',
    features: [
      { text: 'Her şey dahil', ok: true },
      { text: 'Canlı Harita', ok: true },
      { text: 'İlan Yönetimi (CSV)', ok: true },
      { text: 'Takım Workspace', ok: true },
      { text: 'Acente kodu ile davet', ok: true },
      { text: 'Ortak portföy yönetimi', ok: true },
      { text: 'Öncelikli destek', ok: true },
    ],
  },
]

const STATS = [
  { val: '500+', label: 'Aktif ilan' },
  { val: '7', label: 'Şehir' },
  { val: '%94', label: 'Doğruluk' },
  { val: '3 sn', label: 'Analiz süresi' },
]

const FEATURES = [
  { icon: '◎', title: 'AI Değerleme', desc: 'Sokak bazlı fiyat tahmini, SHAP açıklaması ile her faktörü görün.' },
  { icon: '📋', title: 'Sözleşme Üretici', desc: 'Kira & satış sözleşmeleri, kefil, depozito, TC dahil tam hukuki taslak.' },
  { icon: '📍', title: 'Adres Analizi', desc: 'Sokak numarasına kadar inerek gerçekçi piyasa & yatırım analizi.' },
  { icon: '🎯', title: 'Deal Skoru', desc: 'Her mülk için 0-100 fırsat puanı — kaçırma / ortalama / pahalı.' },
  { icon: '◉', title: 'Canlı Harita', desc: 'Tüm acente portföyü harita üzerinde. (Kurumsal plan)' },
  { icon: '🏆', title: 'Bölge Hakimiyeti', desc: '90 günlük aksiyon planı ile hedef ilçede pazar liderliği.' },
]

export default function SignupPage() {
  const [plan, setPlan] = useState<'individual'|'agency'>('agency')
  const [mode, setMode] = useState<'create'|'join'>('create')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [agencyCode, setAgencyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const agencyId = mode === 'join' ? agencyCode.trim() : crypto.randomUUID()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { agency_name: agencyName, agency_id: agencyId, account_type: plan } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) await supabase.auth.updateUser({ data: { agency_id: agencyId, account_type: plan } })
    router.push('/dashboard')
  }

  return (
    <div style={{ background: D.bg, minHeight: '100vh', fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: D.text }}>

      {/* Hero */}
      <div style={{ borderBottom: `1px solid ${D.brd}`, padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, color: D.gold, letterSpacing: 4, fontWeight: 300 }}>VEGA</div>
          <div style={{ fontSize: 9, color: D.dim, letterSpacing: 4, marginTop: 2 }}>INTELLIGENCE PLATFORM</div>
        </div>
        <a href="/auth/login" style={{ color: D.muted, fontSize: 13, textDecoration: 'none' }}>Giriş yap →</a>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 20, padding: '5px 16px', fontSize: 11, color: D.gold, letterSpacing: 2, marginBottom: 20 }}>
            TÜRKİYE'NİN İLK EMLAK ZEKA PLATFORMU
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 300, lineHeight: 1.2, marginBottom: 16 }}>
            Akıllı araçlarla <span style={{ color: D.gold, fontWeight: 600 }}>daha fazla satış</span>
          </h1>
          <p style={{ color: D.muted, fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
            AI değerleme, sözleşme üretici, bölge analizi — emlakçılar için tasarlandı.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 60, marginBottom: 64, borderTop: `1px solid ${D.brd}`, borderBottom: `1px solid ${D.brd}`, padding: '24px 0' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: D.gold }}>{s.val}</div>
              <div style={{ fontSize: 11, color: D.dim, marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 72 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: D.bg2, border: `1px solid ${D.brd}`, borderRadius: 10, padding: '20px' }}>
              <div style={{ fontSize: 20, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: D.muted, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Plan + Form yan yana */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

          {/* Plan seçimi */}
          <div>
            <div style={{ fontSize: 13, color: D.muted, marginBottom: 16, letterSpacing: 1 }}>PLAN SEÇİN</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {PLANS.map(p => (
                <div key={p.id} onClick={() => setPlan(p.id as any)}
                  style={{ background: plan === p.id ? 'rgba(255,215,0,0.04)' : D.bg2, border: `1px solid ${plan === p.id ? D.gold : D.brd}`, borderRadius: 12, padding: '20px', cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}>
                  {p.id === 'agency' && (
                    <div style={{ position: 'absolute', top: -10, right: 16, background: D.gold, color: '#000', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 10, letterSpacing: 1 }}>
                      TOPLU İNDİRİM
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: plan === p.id ? D.gold : D.text }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: D.muted, marginTop: 3 }}>{p.desc}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 22, fontWeight: 700, color: plan === p.id ? D.gold : D.text }}>{p.price}</span>
                      <span style={{ fontSize: 11, color: D.muted }}>{p.period}</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                    {p.features.map(f => (
                      <div key={f.text} style={{ fontSize: 11, color: f.ok ? '#888' : D.dim, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ color: f.ok ? D.gold : '#2a2a2a', fontSize: 10 }}>{f.ok ? '✓' : '✗'}</span>
                        <span style={{ textDecoration: f.ok ? 'none' : 'line-through' }}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kayıt formu */}
          <div style={{ background: D.bg2, border: `1px solid ${D.brd}`, borderRadius: 14, padding: '28px' }}>
            <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>
              {plan === 'agency' ? 'Kurumsal Hesap' : 'Bireysel Hesap'}
            </div>
            <div style={{ fontSize: 12, color: D.muted, marginBottom: 20 }}>
              {plan === 'agency' ? 'Ofis ekibinizle birlikte kullanın' : 'Kişisel erişim'}
            </div>

            {plan === 'agency' && (
              <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#111', borderRadius: 8, border: `1px solid ${D.brd}`, padding: 3 }}>
                {(['create', 'join'] as const).map(m => (
                  <button key={m} onClick={() => setMode(m)}
                    style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 500, cursor: 'pointer', background: mode === m ? D.gold : 'transparent', color: mode === m ? '#000' : D.muted, transition: 'all 0.15s' }}>
                    {m === 'create' ? 'Yeni Acente Kur' : 'Acenteye Katıl'}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>{plan === 'agency' ? 'ACENTE ADI *' : 'AD SOYAD *'}</label>
                <input style={inp} type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} required placeholder={plan === 'agency' ? 'Miras Gayrimenkul' : 'Adınız Soyadınız'} />
              </div>

              {plan === 'agency' && mode === 'join' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={lbl}>ACENTE KODU *</label>
                  <input style={inp} type="text" value={agencyCode} onChange={e => setAgencyCode(e.target.value)} required placeholder="Yöneticinizden alın" />
                  <div style={{ fontSize: 11, color: D.dim, marginTop: 5 }}>Aynı acente kodunu girerek ortak portföye katılırsınız</div>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>E-POSTA *</label>
                <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="ornek@email.com" />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>ŞİFRE *</label>
                <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="En az 6 karakter" />
              </div>

              {error && (
                <div style={{ color: '#f87171', fontSize: 12, marginBottom: 16, padding: '10px 14px', background: 'rgba(248,113,113,0.06)', borderRadius: 8 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '12px', background: loading ? D.brd : D.gold, color: loading ? D.muted : '#000', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: 0.5 }}>
                {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: D.dim }}>
                Hesabın var mı?{' '}
                <a href="/auth/login" style={{ color: D.gold, fontWeight: 500, textDecoration: 'none' }}>Giriş yap</a>
              </div>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ textAlign: 'center', marginTop: 60, paddingTop: 32, borderTop: `1px solid ${D.brd}`, fontSize: 12, color: D.dim }}>
          Fiyatlandırma ve ödeme için{' '}
          <a href="mailto:info@vega.com" style={{ color: D.muted, textDecoration: 'none' }}>iletişime geçin</a>
          {' · '}© 2026 Vega Intelligence Platform
        </div>
      </div>
    </div>
  )
}
