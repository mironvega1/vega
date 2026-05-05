'use client'
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-posta veya şifre hatalı.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const features = [
    'Adres bazlı piyasa zekası',
    'Deal skoru ile hızlı karar',
    'Bölge hakimiyeti ve risk analizi',
    'PDF değerleme ve sözleşme merkezi',
  ]
  const simulationRows = [
    { label: 'Takip ritmi', value: '12 temas', tone: '#22c55e' },
    { label: 'Fiyat baskısı', value: '%6.4', tone: '#FFD700' },
    { label: 'Risk uyarısı', value: '2 kritik', tone: '#f87171' },
  ]

  return (
    <div
      className="auth-login-page"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(360px,460px)',
        background: '#070707',
        color: '#e8e8e8',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <style>{`
        @media (max-width: 860px) {
          .auth-login-page {
            grid-template-columns: 1fr !important;
          }
          .auth-login-brand {
            border-right: 0 !important;
            border-bottom: 1px solid #151515;
            padding: 34px 24px 24px !important;
          }
          .auth-login-copy {
            margin-top: 34px !important;
          }
          .auth-login-copy h1 {
            font-size: 34px !important;
            line-height: 1.16 !important;
          }
          .auth-login-form {
            align-items: flex-start !important;
            padding: 30px 24px 42px !important;
          }
        }
        @media (max-width: 520px) {
          .auth-login-copy h1 {
            font-size: 30px !important;
          }
          .auth-login-features {
            gap: 8px !important;
          }
          .auth-sim-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <section className="auth-login-brand" style={{ padding: '52px 56px', borderRight: '1px solid #151515', position: 'relative' }}>
        <div style={{ fontSize: 30, letterSpacing: 8, fontWeight: 300, color: '#FFD700' }}>VEGA</div>
        <div style={{ fontSize: 10, color: '#686868', letterSpacing: 3, marginTop: 8 }}>EMLAK ZEKA PLATFORMU</div>

        <div className="auth-login-copy" style={{ marginTop: 56, maxWidth: 560 }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: 11,
              letterSpacing: 2,
              color: '#FFD700',
              border: '1px solid rgba(255,215,0,0.2)',
              borderRadius: 999,
              padding: '6px 14px',
              background: 'rgba(255,215,0,0.06)',
              marginBottom: 18,
            }}
          >
            PREMIUM PROFESYONEL DENEYİM
          </div>

          <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.25, fontWeight: 300 }}>
            Gayrimenkulde <span style={{ color: '#FFD700' }}>daha hızlı</span>,<br />
            daha güvenli kararlar alın.
          </h1>

          <p style={{ color: '#8c8c8c', fontSize: 15, lineHeight: 1.8, marginTop: 20 }}>
            VEGA; analiz, sözleşme ve rapor süreçlerini tek merkezde birleştirerek emlak ekiplerinin
            veriye dayalı, tutarlı ve ölçeklenebilir çalışmasını sağlar.
          </p>

          <div className="auth-login-features" style={{ marginTop: 28, display: 'grid', gap: 10 }}>
            {features.map((feature) => (
              <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#c5c5c5', fontSize: 14 }}>
                <span style={{ color: '#22c55e' }}>●</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 34,
              border: '1px solid #1c1c1c',
              borderRadius: 14,
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px), #090909',
              backgroundSize: '28px 28px',
              padding: 16,
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
              <div>
                <div style={{ color: '#FFD700', fontSize: 10, letterSpacing: 2 }}>CANLI SİMÜLASYON</div>
                <div style={{ color: '#d8d8d8', fontSize: 14, marginTop: 4 }}>Operasyon karar mimarisi</div>
              </div>
              <div style={{ color: '#4a4a4a', fontSize: 11 }}>veri akışı aktif</div>
            </div>

            <div className="auth-sim-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 12 }}>
              <div style={{ border: '1px solid #202020', borderRadius: 10, background: 'rgba(0,0,0,0.28)', padding: 13 }}>
                {[
                  ['Müşteri', 'Portföy', 'İşlem'],
                  ['Analiz', 'Risk', 'Aksiyon'],
                  ['Geri Bildirim', 'Hafıza', 'Tahmin'],
                ].map((row, rowIndex) => (
                  <div key={row.join('-')} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginTop: rowIndex ? 7 : 0 }}>
                    {row.map((item, itemIndex) => (
                      <div
                        key={item}
                        style={{
                          minHeight: 42,
                          border: `1px solid ${rowIndex === 1 && itemIndex === 1 ? 'rgba(255,215,0,0.45)' : '#202020'}`,
                          borderRadius: 8,
                          background: rowIndex === 1 && itemIndex === 1 ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.025)',
                          color: rowIndex === 1 && itemIndex === 1 ? '#FFD700' : '#777',
                          fontSize: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {simulationRows.map((row) => (
                  <div key={row.label} style={{ border: '1px solid #202020', borderRadius: 9, background: 'rgba(0,0,0,0.3)', padding: '10px 11px' }}>
                    <div style={{ color: '#666', fontSize: 10, marginBottom: 5 }}>{row.label}</div>
                    <div style={{ color: row.tone, fontSize: 16, fontWeight: 700 }}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-login-form" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 34px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h2 style={{ margin: 0, marginBottom: 8, fontSize: 28, fontWeight: 500, color: '#f5f5f5' }}>Giriş Yap</h2>
          <p style={{ margin: 0, marginBottom: 28, color: '#7b7b7b', fontSize: 13 }}>
            VEGA hesabınız ile devam edin.
          </p>

          <form onSubmit={handleLogin}>
            <label style={{ fontSize: 11, letterSpacing: 1.4, color: '#696969', display: 'block', marginBottom: 8 }}>E-POSTA</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder='ornek@email.com'
              style={{ width: '100%', marginBottom: 16, background: '#111', border: '1px solid #222', borderRadius: 10, padding: '13px 14px', color: '#f0f0f0', fontSize: 14 }}
            />

            <label style={{ fontSize: 11, letterSpacing: 1.4, color: '#696969', display: 'block', marginBottom: 8 }}>ŞİFRE</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder='••••••••'
              style={{ width: '100%', marginBottom: 16, background: '#111', border: '1px solid #222', borderRadius: 10, padding: '13px 14px', color: '#f0f0f0', fontSize: 14 }}
            />

            {error && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.24)', color: '#fda4a4', borderRadius: 8, padding: '10px 12px', fontSize: 12, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              style={{ width: '100%', border: 'none', borderRadius: 10, padding: '13px 14px', fontSize: 14, fontWeight: 700, background: loading ? '#2a2a2a' : '#FFD700', color: loading ? '#7a7a7a' : '#000', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Giriş yapılıyor...' : 'VEGA’ya Giriş Yap'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
