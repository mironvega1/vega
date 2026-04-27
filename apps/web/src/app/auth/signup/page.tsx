'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { agency_name: agencyName } }
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Store agency_id = user.id so each user has their own tenant scope
      if (data.user) {
        await supabase.auth.updateUser({ data: { agency_id: data.user.id } })
      }
      router.push('/dashboard')
    }
  }

  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9f9f9'}}>
      <div style={{background:'white',padding:'2rem',borderRadius:'12px',border:'1px solid #eee',width:'100%',maxWidth:'400px'}}>
        <h1 style={{fontSize:'22px',fontWeight:'600',marginBottom:'0.5rem'}}>Hesap oluştur</h1>
        <p style={{color:'#666',fontSize:'14px',marginBottom:'1.5rem'}}>Vega'ya ücretsiz katıl</p>
        <form onSubmit={handleSignup}>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',fontSize:'13px',marginBottom:'4px',color:'#444'}}>Acente adı</label>
            <input
              type="text"
              value={agencyName}
              onChange={e => setAgencyName(e.target.value)}
              required
              style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'14px',boxSizing:'border-box'}}
              placeholder="Acente adınız"
            />
          </div>
          <div style={{marginBottom:'1rem'}}>
            <label style={{display:'block',fontSize:'13px',marginBottom:'4px',color:'#444'}}>E-posta</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'14px',boxSizing:'border-box'}}
              placeholder="ornek@email.com"
            />
          </div>
          <div style={{marginBottom:'1.5rem'}}>
            <label style={{display:'block',fontSize:'13px',marginBottom:'4px',color:'#444'}}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{width:'100%',padding:'10px 12px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'14px',boxSizing:'border-box'}}
              placeholder="En az 6 karakter"
            />
          </div>
          {error && <p style={{color:'#e53e3e',fontSize:'13px',marginBottom:'1rem'}}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{width:'100%',padding:'11px',background:'#000',color:'white',borderRadius:'8px',border:'none',fontSize:'14px',fontWeight:'500',cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1}}
          >
            {loading ? 'Kayıt olunuyor...' : 'Kayıt ol'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:'1rem',fontSize:'13px',color:'#666'}}>
          Hesabın var mı? <a href="/auth/login" style={{color:'#000',fontWeight:'500'}}>Giriş yap</a>
        </p>
      </div>
    </div>
  )
}
