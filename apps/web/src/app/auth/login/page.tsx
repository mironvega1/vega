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
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-posta veya şifre hatalı.')
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const modules = [
    { icon: '◈', label: 'Emlak Yapay Zekası', desc: 'Piyasa analizi & yatırım tavsiyeleri', accent: '#FFD700' },
    { icon: '⚡', label: 'AI Değerleme', desc: 'Makine öğrenmesi ile anlık fiyat tahmini', accent: '#38bdf8' },
    { icon: '▣', label: 'Sözleşme Merkezi', desc: 'Kira & satış sözleşmesi otomasyonu', accent: '#22c55e' },
    { icon: '◎', label: 'Analiz Merkezi', desc: 'Bölge hakimiyeti & risk skoru', accent: '#e879f9' },
    { icon: '◉', label: 'Canlı Harita', desc: 'İnteraktif fiyat & yoğunluk haritası', accent: '#fb923c' },
    { icon: '▣', label: 'PDF Rapor', desc: 'Profesyonel değerleme raporları', accent: '#a78bfa' },
  ]

  const stats = [
    { value: '50K+', label: 'Aktif İlan' },
    { value: '81', label: 'İl Kapsamı' },
    { value: '99.2%', label: 'Doğruluk' },
  ]

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      overflow: 'hidden',
      background: '#050505',
    }}>

      {/* ── Sol Panel ── */}
      <div style={{
        flex: 1,
        background: '#080808',
        borderRight: '1px solid #111',
        display: 'flex',
        flexDirection: 'column',
        padding: '48px 56px',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Arka plan dekor */}
        <div style={{
          position: 'absolute', top: -120, right: -120,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -80, left: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div>
          <div style={{ fontSize: 32, color: '#FFD700', letterSpacing: 8, fontWeight: 200 }}>VEGA</div>
          <div style={{ fontSize: 9, color: '#1e1e1e', letterSpacing: 6, marginTop: 4 }}>INTELLIGENCE PLATFORM</div>
        </div>

        {/* Ana başlık */}
        <div style={{ marginTop: 60 }}>
          <div style={{
            fontSize: 11, color: '#FFD700', letterSpacing: 3, marginBottom: 16,
            background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.12)',
            borderRadius: 20, padding: '5px 14px', display: 'inline-block',
          }}>
            TÜRKİYE #1 GAYRİMENKUL AI
          </div>
          <div style={{ fontSize: 34, fontWeight: 300, color: '#c0c0c0', lineHeight: 1.35, maxWidth: 420 }}>
            Akıllı Gayrimenkul<br />
            <span style={{ color: '#FFD700' }}>Kararları</span> için<br />
            Tek Platform
          </div>
          <div style={{ fontSize: 14, color: '#3a3a3a', marginTop: 20, maxWidth: 380, lineHeight: 1.7 }}>
            Yapay zeka destekli değerleme, otomatik sözleşme üretimi ve derin piyasa analiziyle emlak profesyonellerine güç verin.
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 40, display: 'flex', gap: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid #161616',
              borderRadius: 10, padding: '14px 20px', minWidth: 90,
            }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: '#FFD700', letterSpacing: -0.5 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#333', marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Modüller */}
        <div style={{ marginTop: 44, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
          {modules.map((m, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid #141414',
              borderRadius: 10, padding: '14px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              transition: 'border-color 0.2s',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: `${m.accent}12`,
                border: `1px solid ${m.accent}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: m.accent,
              }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 12, color: '#888', fontWeight: 500 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: '#2e2e2e', marginTop: 3, lineHeight: 1.4 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Alt */}
        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ fontSize: 11, color: '#2a2a2a' }}>Tüm sistemler aktif</span>
          </div>
          <div style={{ fontSize: 11, color: '#1a1a1a' }}>·</div>
          <span style={{ fontSize: 11, color: '#1a1a1a' }}>Güvenli SSL bağlantı</span>
          <div style={{ fontSize: 11, color: '#1a1a1a' }}>·</div>
          <span style={{ fontSize: 11, color: '#1a1a1a' }}>KVKK Uyumlu</span>
        </div>
      </div>

      {/* ── Sağ Panel ── */}
      <div style={{
        width: 460,
        flexShrink: 0,
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 48px',
      }}>
        <div style={{ width: '100%' }}>

          {/* Form başlığı */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 26, fontWeight: 500, color: '#e0e0e0', marginBottom: 8 }}>Hoş Geldiniz</div>
            <div style={{ fontSize: 13, color: '#383838', lineHeight: 1.6 }}>
              VEGA platformuna erişmek için giriş yapın.
            </div>
          </div>

          <form onSubmit={handleLogin}>

            {/* E-posta */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: '#3a3a3a', display: 'block', marginBottom: 8, letterSpacing: 1.5 }}>
                E-POSTA
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ornek@email.com"
                style={{
                  width: '100%',
                  background: '#0d0d0d',
                  border: '1px solid #1c1c1c',
                  borderRadius: 10,
                  color: '#e0e0e0',
                  padding: '13px 16px',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')}
                onBlur={e => (e.target.style.borderColor = '#1c1c1c')}
              />
            </div>

            {/* Şifre */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 11, color: '#3a3a3a', letterSpacing: 1.5 }}>
                  ŞİFRE
                </label>
                <a href="#" style={{ fontSize: 11, color: '#3a3a3a', textDecoration: 'none' }}>
                  Şifremi unuttum
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: '#0d0d0d',
                  border: '1px solid #1c1c1c',
                  borderRadius: 10,
                  color: '#e0e0e0',
                  padding: '13px 16px',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(255,215,0,0.3)')}
                onBlur={e => (e.target.style.borderColor = '#1c1c1c')}
              />
            </div>

            {/* Hata */}
            {error && (
              <div style={{
                color: '#f87171', fontSize: 13, marginBottom: 20,
                padding: '12px 16px',
                background: 'rgba(248,113,113,0.06)',
                border: '1px solid rgba(248,113,113,0.15)',
                borderRadius: 10,
              }}>
                {error}
              </div>
            )}

            {/* Giriş butonu */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#161616' : '#FFD700',
                color: loading ? '#444' : '#000',
                borderRadius: 10,
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: 0.5,
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}>
              {loading ? 'Giriş yapılıyor…' : 'Giriş Yap →'}
            </button>
          </form>

          {/* Ayırıcı */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#111' }} />
            <span style={{ fontSize: 11, color: '#252525' }}>VEYA</span>
            <div style={{ flex: 1, height: 1, background: '#111' }} />
          </div>

          {/* Kayıt ol */}
          <div style={{
            textAlign: 'center',
            padding: '16px',
            background: 'rgba(255,255,255,0.015)',
            border: '1px solid #141414',
            borderRadius: 10,
          }}>
            <span style={{ fontSize: 13, color: '#333' }}>Hesabınız yok mu? </span>
            <a href="/auth/signup" style={{ fontSize: 13, color: '#FFD700', fontWeight: 500, textDecoration: 'none' }}>
              Hesap oluşturun →
            </a>
          </div>

          {/* Alt not */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <div style={{ fontSize: 10, color: '#1e1e1e', lineHeight: 1.8, letterSpacing: 0.5 }}>
              Giriş yaparak Kullanım Koşulları'nı<br />ve Gizlilik Politikası'nı kabul etmiş olursunuz.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
