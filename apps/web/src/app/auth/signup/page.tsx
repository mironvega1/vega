'use client'
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ROLES = [
  { id: 'danisман', label: 'Emlak Danışmanı', icon: '◈', desc: 'Bireysel portföy yönetimi' },
  { id: 'broker',  label: 'Broker / Acente Sahibi', icon: '▦', desc: 'Ekip ve ofis yönetimi' },
  { id: 'yatirimci', label: 'Yatırımcı', icon: '⚡', desc: 'Portföy & analiz odaklı' },
  { id: 'kurumsal', label: 'Kurumsal / Şirket', icon: '◎', desc: 'Çok lokasyonlu yapı' },
]

const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
  'Adana', 'Konya', 'Gaziantep', 'Kocaeli', 'Mersin',
  'Eskişehir', 'Bodrum', 'Trabzon', 'Diğer',
]

const PLANS = [
  {
    id: 'bireysel',
    name: 'Bireysel',
    price: '₺990',
    period: '/ay',
    tag: null,
    desc: 'Tek danışman için tüm analiz araçları',
    features: ['AI Değerleme', 'Analiz Merkezi', 'Sözleşme Üretici', 'PDF Rapor', 'Bölge Skoru'],
    missing: ['Canlı Harita', 'İlan CSV', 'Takım Workspace'],
    accent: '#e0e0e0',
  },
  {
    id: 'kurumsal',
    name: 'Kurumsal',
    price: '₺2.490',
    period: '/ay',
    tag: 'EN POPÜLER',
    desc: 'Tüm ofis — sınırsız kullanıcı, tam modüller',
    features: ['Her şey dahil', 'Canlı Harita', 'İlan CSV Yönetimi', 'Takım Workspace', 'Acente kodu ile davet', 'Öncelikli destek'],
    missing: [],
    accent: '#FFD700',
  },
]

type Step = 1 | 2 | 3 | 4 | 5

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
    setLoading(true)
    setError('')
    const agencyId = agencyMode === 'join' ? agencyCode.trim() : crypto.randomUUID()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          city,
          agency_name: agencyName,
          agency_id: agencyId,
          account_type: plan,
        },
      },
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await supabase.auth.updateUser({ data: { agency_id: agencyId, account_type: plan } })
    }
    router.push('/dashboard')
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 10,
    border: '1px solid #1c1c1c', fontSize: 14,
    background: '#0d0d0d', color: '#e0e0e0',
    boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  }

  const STEP_LABELS = ['Rol', 'Konum', 'Acente', 'Plan', 'Hesap']

  return (
    <div style={{
      minHeight: '100vh', background: '#050505',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      color: '#e0e0e0', display: 'flex', flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{ padding: '20px 48px', borderBottom: '1px solid #0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 20, color: '#FFD700', letterSpacing: 5, fontWeight: 200 }}>VEGA</span>
          <span style={{ fontSize: 8, color: '#1a1a1a', letterSpacing: 3, marginLeft: 8 }}>INTELLIGENCE</span>
        </div>
        <Link href="/auth/login" style={{ fontSize: 12, color: '#333', textDecoration: 'none' }}>
          Hesabın var mı? Giriş yap →
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 24px 80px' }}>
        <div style={{ width: '100%', maxWidth: 680 }}>

          {/* Adım göstergesi */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 52 }}>
            {STEP_LABELS.map((s, i) => {
              const num = i + 1
              const done = step > num
              const active = step === num
              return (
                <React.Fragment key={s}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: done ? '#FFD700' : active ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.02)',
                      border: done ? 'none' : active ? '1px solid rgba(255,215,0,0.4)' : '1px solid #1a1a1a',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 600,
                      color: done ? '#000' : active ? '#FFD700' : '#2a2a2a',
                    }}>
                      {done ? '✓' : num}
                    </div>
                    <div style={{ fontSize: 10, color: active ? '#FFD700' : done ? '#444' : '#1e1e1e', letterSpacing: 0.5 }}>{s}</div>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div style={{ flex: 1, height: 1, background: done ? 'rgba(255,215,0,0.25)' : '#111', margin: '0 8px', marginBottom: 22 }} />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* ── ADIM 1: Rol ── */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 28, fontWeight: 300, color: '#c0c0c0', marginBottom: 10 }}>
                  Nasıl kullanacaksınız?
                </div>
                <div style={{ fontSize: 14, color: '#2e2e2e' }}>Deneyiminizi kişiselleştirmek için rolünüzü seçin.</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
                {ROLES.map(r => (
                  <div key={r.id} onClick={() => setRole(r.id)} style={{
                    background: role === r.id ? 'rgba(255,215,0,0.05)' : 'rgba(255,255,255,0.015)',
                    border: `1px solid ${role === r.id ? 'rgba(255,215,0,0.35)' : '#161616'}`,
                    borderRadius: 12, padding: '22px', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ fontSize: 22, color: role === r.id ? '#FFD700' : '#2a2a2a', marginBottom: 12 }}>{r.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: role === r.id ? '#e0e0e0' : '#555', marginBottom: 6 }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: role === r.id ? '#444' : '#1e1e1e' }}>{r.desc}</div>
                  </div>
                ))}
              </div>
              <button onClick={next} disabled={!role} style={{
                width: '100%', padding: '14px', borderRadius: 10, border: 'none',
                background: role ? '#FFD700' : '#111', color: role ? '#000' : '#333',
                fontSize: 14, fontWeight: 700, cursor: role ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}>Devam Et →</button>
            </div>
          )}

          {/* ── ADIM 2: Konum + İsim ── */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 28, fontWeight: 300, color: '#c0c0c0', marginBottom: 10 }}>
                  Nerede faaliyet gösteriyorsunuz?
                </div>
                <div style={{ fontSize: 14, color: '#2e2e2e' }}>Bölgeye özel piyasa verisi ve analizler için konumunuzu seçin.</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 8, letterSpacing: 1.5 }}>ADINIZ SOYADINIZ</label>
                <input
                  style={inp} type="text" value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')}
                  onBlur={e => (e.target.style.borderColor = '#1c1c1c')}
                />
              </div>

              <div style={{ marginBottom: 32 }}>
                <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 12, letterSpacing: 1.5 }}>ÇALIŞTIĞINIZ ŞEHİR</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {CITIES.map(c => (
                    <div key={c} onClick={() => setCity(c)} style={{
                      padding: '8px 18px', borderRadius: 20, cursor: 'pointer',
                      background: city === c ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${city === c ? 'rgba(255,215,0,0.35)' : '#1a1a1a'}`,
                      fontSize: 13, color: city === c ? '#FFD700' : '#3a3a3a',
                      transition: 'all 0.12s',
                    }}>{c}</div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={back} style={{ padding: '14px 28px', borderRadius: 10, border: '1px solid #1a1a1a', background: 'transparent', color: '#444', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Geri</button>
                <button onClick={next} disabled={!city || !fullName.trim()} style={{
                  flex: 1, padding: '14px', borderRadius: 10, border: 'none',
                  background: city && fullName.trim() ? '#FFD700' : '#111',
                  color: city && fullName.trim() ? '#000' : '#333',
                  fontSize: 14, fontWeight: 700, cursor: city && fullName.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}>Devam Et →</button>
              </div>
            </div>
          )}

          {/* ── ADIM 3: Acente ── */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 28, fontWeight: 300, color: '#c0c0c0', marginBottom: 10 }}>
                  Acenteniz hakkında
                </div>
                <div style={{ fontSize: 14, color: '#2e2e2e' }}>Yeni bir acente kurun ya da mevcut bir acenteye katılın.</div>
              </div>

              <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 10, padding: 4 }}>
                {(['create', 'join'] as const).map(m => (
                  <button key={m} onClick={() => setAgencyMode(m)} style={{
                    flex: 1, padding: '11px', borderRadius: 8, border: 'none', fontSize: 13,
                    background: agencyMode === m ? '#FFD700' : 'transparent',
                    color: agencyMode === m ? '#000' : '#444',
                    fontWeight: agencyMode === m ? 700 : 400,
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}>
                    {m === 'create' ? 'Yeni Acente Kur' : 'Acenteye Katıl'}
                  </button>
                ))}
              </div>

              {agencyMode === 'create' ? (
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 8, letterSpacing: 1.5 }}>ACENTE / OFİS ADI</label>
                  <input
                    style={inp} type="text" value={agencyName}
                    onChange={e => setAgencyName(e.target.value)}
                    placeholder="Miras Gayrimenkul"
                    onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')}
                    onBlur={e => (e.target.style.borderColor = '#1c1c1c')}
                  />
                  <div style={{ fontSize: 11, color: '#222', marginTop: 8 }}>Ekip arkadaşlarınız bu isim altında görünecek.</div>
                </div>
              ) : (
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 8, letterSpacing: 1.5 }}>ACENTE KODU</label>
                  <input
                    style={inp} type="text" value={agencyCode}
                    onChange={e => setAgencyCode(e.target.value.toUpperCase())}
                    placeholder="MIRAS-2024"
                    onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')}
                    onBlur={e => (e.target.style.borderColor = '#1c1c1c')}
                  />
                  <div style={{ fontSize: 11, color: '#222', marginTop: 8 }}>Aynı kodu girerek ortak portföy ve ilanları paylaşırsınız.</div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={back} style={{ padding: '14px 28px', borderRadius: 10, border: '1px solid #1a1a1a', background: 'transparent', color: '#444', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Geri</button>
                <button onClick={next}
                  disabled={agencyMode === 'create' ? !agencyName.trim() : !agencyCode.trim()}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 10, border: 'none',
                    background: (agencyMode === 'create' ? agencyName.trim() : agencyCode.trim()) ? '#FFD700' : '#111',
                    color: (agencyMode === 'create' ? agencyName.trim() : agencyCode.trim()) ? '#000' : '#333',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}>Devam Et →</button>
              </div>
            </div>
          )}

          {/* ── ADIM 4: Plan ── */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 28, fontWeight: 300, color: '#c0c0c0', marginBottom: 10 }}>
                  Planınızı seçin
                </div>
                <div style={{ fontSize: 14, color: '#2e2e2e' }}>İstediğiniz zaman değiştirebilirsiniz.</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
                {PLANS.map(p => (
                  <div key={p.id} onClick={() => setPlan(p.id)} style={{
                    background: plan === p.id ? 'rgba(255,215,0,0.04)' : 'rgba(255,255,255,0.015)',
                    border: `1px solid ${plan === p.id ? 'rgba(255,215,0,0.4)' : '#161616'}`,
                    borderRadius: 14, padding: '24px', cursor: 'pointer',
                    transition: 'all 0.15s', position: 'relative',
                  }}>
                    {p.tag && (
                      <div style={{
                        position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                        background: '#FFD700', color: '#000', fontSize: 9, fontWeight: 800,
                        padding: '3px 12px', borderRadius: 10, letterSpacing: 1, whiteSpace: 'nowrap',
                      }}>{p.tag}</div>
                    )}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: plan === p.id ? '#FFD700' : '#666', marginBottom: 5 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#2a2a2a', marginBottom: 16, lineHeight: 1.5 }}>{p.desc}</div>
                      <div>
                        <span style={{ fontSize: 30, fontWeight: 700, color: plan === p.id ? '#FFD700' : '#444' }}>{p.price}</span>
                        <span style={{ fontSize: 12, color: '#2a2a2a' }}>{p.period}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {p.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#555' }}>
                          <span style={{ color: '#22c55e', fontSize: 10 }}>✓</span>{f}
                        </div>
                      ))}
                      {p.missing.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#1e1e1e' }}>
                          <span style={{ fontSize: 10 }}>—</span>
                          <span style={{ textDecoration: 'line-through' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={back} style={{ padding: '14px 28px', borderRadius: 10, border: '1px solid #1a1a1a', background: 'transparent', color: '#444', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Geri</button>
                <button onClick={next} style={{ flex: 1, padding: '14px', borderRadius: 10, border: 'none', background: '#FFD700', color: '#000', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Devam Et →
                </button>
              </div>
            </div>
          )}

          {/* ── ADIM 5: Hesap ── */}
          {step === 5 && (
            <div>
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 28, fontWeight: 300, color: '#c0c0c0', marginBottom: 10 }}>
                  Hesabınızı oluşturun
                </div>
                <div style={{ fontSize: 14, color: '#2e2e2e' }}>Son adım — e-posta ve şifrenizi girin.</div>
              </div>

              {/* Özet */}
              <div style={{ background: 'rgba(255,215,0,0.02)', border: '1px solid rgba(255,215,0,0.08)', borderRadius: 12, padding: '18px 22px', marginBottom: 28 }}>
                <div style={{ fontSize: 10, color: '#FFD700', letterSpacing: 1.5, marginBottom: 14 }}>SEÇİMLERİNİZ</div>
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Rol', val: ROLES.find(r => r.id === role)?.label || role },
                    { label: 'Şehir', val: city },
                    { label: agencyMode === 'create' ? 'Acente' : 'Acente Kodu', val: agencyMode === 'create' ? agencyName : agencyCode },
                    { label: 'Plan', val: PLANS.find(p => p.id === plan)?.name || plan },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: 1.5, marginBottom: 4 }}>{s.label.toUpperCase()}</div>
                      <div style={{ fontSize: 13, color: '#666' }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSignup}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 8, letterSpacing: 1.5 }}>E-POSTA</label>
                  <input
                    style={inp} type="email" value={email}
                    onChange={e => setEmail(e.target.value)} required
                    placeholder="ornek@email.com"
                    onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')}
                    onBlur={e => (e.target.style.borderColor = '#1c1c1c')}
                  />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 8, letterSpacing: 1.5 }}>ŞİFRE</label>
                  <input
                    style={inp} type="password" value={password}
                    onChange={e => setPassword(e.target.value)} required
                    placeholder="En az 6 karakter"
                    onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')}
                    onBlur={e => (e.target.style.borderColor = '#1c1c1c')}
                  />
                </div>

                {error && (
                  <div style={{ color: '#f87171', fontSize: 13, marginBottom: 20, padding: '12px 16px', background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: 10 }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={back} style={{ padding: '14px 28px', borderRadius: 10, border: '1px solid #1a1a1a', background: 'transparent', color: '#444', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>← Geri</button>
                  <button type="submit" disabled={loading} style={{
                    flex: 1, padding: '14px', borderRadius: 10, border: 'none',
                    background: loading ? '#111' : '#FFD700',
                    color: loading ? '#333' : '#000',
                    fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}>
                    {loading ? 'Oluşturuluyor…' : 'Hesabı Oluştur →'}
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#1a1a1a', lineHeight: 1.7 }}>
                  Devam ederek Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmiş olursunuz.
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
