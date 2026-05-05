'use client'
import Link from 'next/link'
import { marketPulse, opportunities } from '@/lib/mock/market'

export default function Dashboard(){
  const top3 = opportunities.slice(0,3)
  return <div style={{minHeight:'100vh',background:'#080808',color:'#e0e0e0',fontFamily:'Arial',padding:24}}>
    <h1>Günaydın, bugün piyasada {opportunities.length} yeni fırsat var.</h1>
    <div style={{color:'#888',marginBottom:16}}>Son güncelleme: {marketPulse.lastUpdate}</div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginBottom:20}}>
      <div>Fırsat Sayısı: {opportunities.length}</div><div>Kritik Fırsat: {opportunities.filter(x=>x.dealScore>=85).length}</div><div>Piyasa Değişimi: +%{marketPulse.priceDirection}</div><div>En Sıcak Bölge: {marketPulse.hottestRegion}</div>
    </div>
    <section style={{border:'1px solid #222',padding:14,borderRadius:10,marginBottom:16}}>
      <h2>Fırsat Radarı</h2><p>Bugün piyasada öne çıkan ilanları keşfet.</p><Link href='/opportunities'>Fırsatları İncele</Link>
      {top3.map(x=><div key={x.id} style={{marginTop:8}}>{x.title} · {x.dealScore}/100</div>)}
    </section>
    <section style={{border:'1px solid #222',padding:14,borderRadius:10,marginBottom:16}}>
      <h2>Günlük Piyasa Nabzı</h2><p>{marketPulse.aiDailyComment}</p><Link href='/market-pulse'>Piyasayı İncele</Link>
    </section>
    <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10}}>
      <Link href='/analysis'>Analiz Merkezi</Link><Link href='/sozlesme'>Sözleşme Merkezi</Link><Link href='/report'>PDF/Rapor Merkezi</Link><Link href='/ai'>AI Asistan</Link>
    </section>
  </div>
}
