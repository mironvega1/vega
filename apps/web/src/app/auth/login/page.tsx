'use client'
import { useState } from 'react'
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
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const s = {
    page: {minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#080808',fontFamily:"'Helvetica Neue',Helvetica,Arial,sans-serif"} as React.CSSProperties,
    card: {background:'#0d0d0d',padding:'40px',borderRadius:'14px',border:'1px solid #1a1a1a',width:'100%',maxWidth:'400px'} as React.CSSProperties,
    label: {display:'block',fontSize:'12px',marginBottom:'6px',color:'#666',letterSpacing:1} as React.CSSProperties,
    input: {width:'100%',padding:'10px 14px',borderRadius:'8px',border:'1px solid #222',fontSize:'13px',background:'#111',color:'#e0e0e0',boxSizing:'border-box' as const,outline:'none'} as React.CSSProperties,
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{marginBottom:28}}>
          <div style={{fontSize:18,color:'#FFD700',letterSpacing:4,fontWeight:300,marginBottom:4}}>VEGA</div>
          <div style={{fontSize:20,fontWeight:500,color:'#e0e0e0'}}>Giriş yap</div>
          <div style={{color:'#444',fontSize:13,marginTop:4}}>Emlak zeka platformuna hoş geldin</div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{marginBottom:14}}>
            <label style={s.label}>E-POSTA</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              placeholder="ornek@email.com" style={s.input} />
          </div>
          <div style={{marginBottom:24}}>
            <label style={s.label}>ŞİFRE</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              placeholder="••••••••" style={s.input} />
          </div>

          {error && <div style={{color:'#f87171',fontSize:13,marginBottom:16,padding:'10px 14px',background:'rgba(248,113,113,0.08)',borderRadius:8}}>{error}</div>}

          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'12px',background:loading?'#222':'#FFD700',color:loading?'#555':'#000',
              borderRadius:'8px',border:'none',fontSize:'14px',fontWeight:'700',cursor:loading?'not-allowed':'pointer',
              letterSpacing:0.5,transition:'all 0.15s'}}>
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#444'}}>
          Hesabın yok mu?{' '}
          <a href="/auth/signup" style={{color:'#FFD700',fontWeight:500,textDecoration:'none'}}>Kayıt ol</a>
        </div>
      </div>
    </div>
  )
}
