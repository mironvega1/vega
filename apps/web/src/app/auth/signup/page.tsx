'use client'
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const D = { bg:"#080808", bg2:"#0d0d0d", brd:"#1a1a1a", brd2:"#222", gold:"#FFD700", text:"#e0e0e0", muted:"#555" }
const inp: React.CSSProperties = { width:'100%', padding:'9px 12px', borderRadius:7, border:`1px solid ${D.brd2}`, fontSize:13, background:'#111', color:D.text, boxSizing:'border-box', outline:'none', fontFamily:'inherit' }
const lbl: React.CSSProperties = { display:'block', fontSize:11, marginBottom:5, color:D.muted, letterSpacing:1 }

const PLANS = [
  {
    id: 'individual',
    name: 'Bireysel',
    price: 'Ücretsiz',
    desc: 'Tek kullanıcı',
    features: ['AI Değerleme', 'Bölge Skoru', 'Kat Analizi', 'PDF Rapor'],
    locked: ['Canlı Harita', 'İlan Yönetimi', 'Takım Workspace'],
  },
  {
    id: 'agency',
    name: 'Kurumsal',
    price: '₺2.990/ay',
    desc: 'Sınırsız takım üyesi',
    features: ['Her şey dahil', 'Canlı Harita', 'İlan Yönetimi', 'Takım Workspace', 'Analiz Merkezi (tam)', 'Sözleşme Üretici', 'Öncelikli destek'],
    locked: [],
  },
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
      email,
      password,
      options: {
        data: { agency_name: agencyName, agency_id: agencyId, account_type: plan }
      }
    })

    if (error) { setError(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.auth.updateUser({ data: { agency_id: agencyId, account_type: plan } })
    }
    router.push('/dashboard')
  }

  return (
    <div style={{minHeight:'100vh',background:D.bg,fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif",display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 20px',overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:720}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:22,color:D.gold,letterSpacing:4,fontWeight:300}}>VEGA</div>
          <div style={{fontSize:9,color:'#333',letterSpacing:4,marginTop:2}}>INTELLIGENCE PLATFORM</div>
        </div>

        {/* Plan Seçimi */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:28}}>
          {PLANS.map(p=>(
            <div key={p.id} onClick={()=>setPlan(p.id as any)}
              style={{background:plan===p.id?'rgba(255,215,0,0.05)':D.bg2, border:`1px solid ${plan===p.id?D.gold:D.brd}`,
                borderRadius:12, padding:'20px', cursor:'pointer', transition:'all 0.15s', position:'relative'}}>
              {p.id==='agency' && <div style={{position:'absolute',top:-10,right:16,background:D.gold,color:'#000',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:10,letterSpacing:1}}>ÖNERİLEN</div>}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:plan===p.id?D.gold:D.text}}>{p.name}</div>
                  <div style={{fontSize:11,color:D.muted,marginTop:2}}>{p.desc}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:16,fontWeight:700,color:plan===p.id?D.gold:D.text}}>{p.price}</div>
                </div>
              </div>
              <div style={{fontSize:11,color:'#444',lineHeight:1.8}}>
                {p.features.map(f=><div key={f} style={{color:'#555'}}>✓ {f}</div>)}
                {p.locked.map(f=><div key={f} style={{color:'#2a2a2a',textDecoration:'line-through'}}>✗ {f}</div>)}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{background:D.bg2,border:`1px solid ${D.brd}`,borderRadius:14,padding:'32px'}}>
          <div style={{fontSize:18,fontWeight:500,color:D.text,marginBottom:4}}>
            {plan==='agency' ? 'Kurumsal Hesap Oluştur' : 'Bireysel Hesap Oluştur'}
          </div>
          <div style={{fontSize:12,color:D.muted,marginBottom:24}}>
            {plan==='agency' ? 'Acente ekibinizle birlikte kullanın' : 'Kişisel kullanım için ücretsiz'}
          </div>

          {plan==='agency' && (
            <div style={{display:'flex',gap:0,marginBottom:20,background:'#111',borderRadius:8,border:`1px solid ${D.brd}`,padding:3}}>
              {(['create','join'] as const).map(m=>(
                <button key={m} onClick={()=>setMode(m)}
                  style={{flex:1,padding:'8px',borderRadius:6,border:'none',fontSize:12,fontWeight:500,cursor:'pointer',
                    background:mode===m?D.gold:'transparent',color:mode===m?'#000':D.muted,transition:'all 0.15s'}}>
                  {m==='create'?'Yeni Acente Kur':'Mevcut Acenteye Katıl'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div style={{marginBottom:14}}>
              <label style={lbl}>{plan==='agency'?'ACENTE ADI *':'AD SOYAD *'}</label>
              <input style={inp} type="text" value={agencyName} onChange={e=>setAgencyName(e.target.value)} required placeholder={plan==='agency'?"Miras Gayrimenkul":"Adınız Soyadınız"} />
            </div>

            {plan==='agency' && mode==='join' && (
              <div style={{marginBottom:14}}>
                <label style={lbl}>ACENTE KODU *</label>
                <input style={inp} type="text" value={agencyCode} onChange={e=>setAgencyCode(e.target.value)} required placeholder="Yöneticinizden alın (UUID formatı)" />
                <div style={{fontSize:11,color:'#333',marginTop:5}}>Acente yöneticiniz bu kodu size iletecek</div>
              </div>
            )}

            <div style={{marginBottom:14}}>
              <label style={lbl}>E-POSTA *</label>
              <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="ornek@email.com" />
            </div>

            <div style={{marginBottom:24}}>
              <label style={lbl}>ŞİFRE *</label>
              <input style={inp} type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="En az 6 karakter" />
            </div>

            {plan==='agency' && (
              <div style={{background:'rgba(255,215,0,0.04)',border:`1px solid rgba(255,215,0,0.1)`,borderRadius:8,padding:'12px 14px',marginBottom:20,fontSize:12,color:'#555'}}>
                <span style={{color:D.gold}}>Kurumsal plan:</span> Kayıt sonrası ekip üyelerinizi acente kodunuzla davet edebilirsiniz. Fiyatlandırma için iletişime geçin.
              </div>
            )}

            {error && <div style={{color:'#f87171',fontSize:12,marginBottom:16,padding:'10px 14px',background:'rgba(248,113,113,0.06)',borderRadius:8}}>{error}</div>}

            <button type="submit" disabled={loading}
              style={{width:'100%',padding:'12px',background:loading?D.brd:D.gold,color:loading?D.muted:'#000',
                borderRadius:8,border:'none',fontSize:14,fontWeight:700,cursor:loading?'not-allowed':'pointer',letterSpacing:0.5}}>
              {loading?'Oluşturuluyor...':`${plan==='agency'?'Kurumsal':'Bireysel'} Hesap Oluştur`}
            </button>
          </form>

          <div style={{textAlign:'center',marginTop:20,fontSize:12,color:D.muted}}>
            Hesabın var mı?{' '}
            <a href="/auth/login" style={{color:D.gold,fontWeight:500,textDecoration:'none'}}>Giriş yap</a>
          </div>
        </div>
      </div>
    </div>
  )
}
