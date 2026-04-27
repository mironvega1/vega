'use client'
import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [agencyCode, setAgencyCode] = useState('')
  const [mode, setMode] = useState<'create'|'join'>('create')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // agency_id: join existing (entered code) or create new (generated uuid)
    const agencyId = mode === 'join'
      ? agencyCode.trim()
      : crypto.randomUUID()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          agency_name: agencyName,
          agency_id: agencyId,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Ensure agency_id is set in metadata
    if (data.user) {
      await supabase.auth.updateUser({ data: { agency_id: agencyId } })
    }

    router.push('/dashboard')
  }

  const s = {
    page: {minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#080808',fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif"} as React.CSSProperties,
    card: {background:'#0d0d0d',padding:'40px',borderRadius:'14px',border:'1px solid #1a1a1a',width:'100%',maxWidth:'420px'} as React.CSSProperties,
    label: {display:'block',fontSize:'12px',marginBottom:'6px',color:'#666',letterSpacing:1} as React.CSSProperties,
    input: {width:'100%',padding:'10px 14px',borderRadius:'8px',border:'1px solid #222',fontSize:'13px',background:'#111',color:'#e0e0e0',boxSizing:'border-box' as const,outline:'none'} as React.CSSProperties,
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{marginBottom:28}}>
          <div style={{fontSize:18,color:'#FFD700',letterSpacing:4,fontWeight:300,marginBottom:4}}>VEGA</div>
          <div style={{fontSize:20,fontWeight:500,color:'#e0e0e0'}}>Hesap oluştur</div>
          <div style={{color:'#444',fontSize:13,marginTop:4}}>Emlak zeka platformuna katıl</div>
        </div>

        {/* Mode toggle */}
        <div style={{display:'flex',gap:0,marginBottom:24,background:'#111',borderRadius:8,border:'1px solid #1a1a1a',padding:3}}>
          {(['create','join'] as const).map(m => (
            <button key={m} onClick={()=>setMode(m)}
              style={{flex:1,padding:'8px',borderRadius:6,border:'none',fontSize:12,fontWeight:500,cursor:'pointer',
                background:mode===m?'#FFD700':'transparent',
                color:mode===m?'#000':'#555',transition:'all 0.15s'}}>
              {m==='create' ? 'Yeni Acente Kur' : 'Acente Katıl'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSignup}>
          <div style={{marginBottom:14}}>
            <label style={s.label}>ACENTE ADI</label>
            <input type="text" value={agencyName} onChange={e=>setAgencyName(e.target.value)} required
              placeholder="Örn: Miras Gayrimenkul" style={s.input} />
          </div>

          {mode === 'join' && (
            <div style={{marginBottom:14}}>
              <label style={s.label}>ACENTE KODU</label>
              <input type="text" value={agencyCode} onChange={e=>setAgencyCode(e.target.value)} required
                placeholder="Acente yöneticinizden alın" style={s.input} />
              <div style={{fontSize:11,color:'#333',marginTop:5}}>Ekibinizdeki biri size kodu paylaşacak</div>
            </div>
          )}

          <div style={{marginBottom:14}}>
            <label style={s.label}>E-POSTA</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              placeholder="ornek@email.com" style={s.input} />
          </div>

          <div style={{marginBottom:24}}>
            <label style={s.label}>ŞİFRE</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              placeholder="En az 6 karakter" style={s.input} />
          </div>

          {error && <div style={{color:'#f87171',fontSize:13,marginBottom:16,padding:'10px 14px',background:'rgba(248,113,113,0.08)',borderRadius:8}}>{error}</div>}

          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'12px',background:loading?'#222':'#FFD700',color:loading?'#555':'#000',
              borderRadius:'8px',border:'none',fontSize:'14px',fontWeight:'700',cursor:loading?'not-allowed':'pointer',
              letterSpacing:0.5,transition:'all 0.15s'}}>
            {loading ? 'Oluşturuluyor...' : mode==='create' ? 'Acente Hesabı Oluştur' : 'Acente\'ye Katıl'}
          </button>
        </form>

        <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#444'}}>
          Hesabın var mı?{' '}
          <a href="/auth/login" style={{color:'#FFD700',fontWeight:500,textDecoration:'none'}}>Giriş yap</a>
        </div>
      </div>
    </div>
  )
}
