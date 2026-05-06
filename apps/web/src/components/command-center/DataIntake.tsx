'use client'

import { useMemo, useState } from 'react'
import type { DealStatus, StrategyMode } from '@/lib/commandCenterTypes'
import { useCommandCenter } from './CommandCenterContext'

type IntakeTab = 'customer' | 'portfolio' | 'deal' | 'activity' | 'experiment'
type InteractionType = 'call' | 'message' | 'meeting' | 'viewing' | 'follow_up'

const today = () => new Date().toISOString().slice(0, 10)
const numberValue = (value: string) => Number(value.replace(/[^\d.-]/g, '')) || 0

export function DataIntake() {
  const {
    data,
    addCustomer,
    addPortfolio,
    addDeal,
    addInteraction,
    addPriceChange,
    addExperiment,
  } = useCommandCenter()
  const [tab, setTab] = useState<IntakeTab>('customer')
  const [message, setMessage] = useState('')
  const firstCustomer = data.customers[0]?.id || ''
  const firstPortfolio = data.portfolios[0]?.id || ''
  const firstDeal = data.deals[0]?.id || ''

  const [customer, setCustomer] = useState({ name: '', segment: 'Satıcı', urgency: '60', budget: '' })
  const [portfolio, setPortfolio] = useState({ title: '', type: 'Daire', city: '', district: '', listPrice: '', targetPrice: '' })
  const [deal, setDeal] = useState({
    title: '',
    customerId: firstCustomer,
    portfolioId: firstPortfolio,
    status: 'active' as DealStatus,
    expectedRevenue: '',
    openedAt: today(),
    actionDueAt: today(),
    strategy: 'normal' as StrategyMode,
  })
  const [activity, setActivity] = useState({
    dealId: firstDeal,
    customerId: firstCustomer,
    type: 'call' as InteractionType,
    at: today(),
    quality: '65',
    note: '',
    from: '',
    to: '',
  })
  const [experiment, setExperiment] = useState({
    name: '',
    variantA: 'Normal satış',
    variantB: 'Agresif satış',
    metric: 'closeRate' as const,
    dealIdsA: '',
    dealIdsB: '',
  })

  const dealOptions = useMemo(() => data.deals.map((item) => ({ id: item.id, label: item.title })), [data.deals])

  const submitCustomer = () => {
    if (!customer.name.trim()) return setMessage('Müşteri adı gerekli.')
    addCustomer({
      name: customer.name.trim(),
      segment: customer.segment.trim() || 'Segment yok',
      urgency: Math.max(0, Math.min(100, numberValue(customer.urgency))),
      budget: customer.budget ? numberValue(customer.budget) : undefined,
    })
    setCustomer({ name: '', segment: 'Satıcı', urgency: '60', budget: '' })
    setTab('portfolio')
    setMessage('Müşteri eklendi. Şimdi bu müşteriye bağlanacak portföyü ekle.')
  }

  const submitPortfolio = () => {
    if (!portfolio.title.trim() || !portfolio.listPrice) return setMessage('Portföy adı ve liste fiyatı gerekli.')
    addPortfolio({
      title: portfolio.title.trim(),
      type: portfolio.type.trim() || 'Portföy',
      city: portfolio.city.trim() || undefined,
      district: portfolio.district.trim() || undefined,
      listPrice: numberValue(portfolio.listPrice),
      targetPrice: portfolio.targetPrice ? numberValue(portfolio.targetPrice) : undefined,
    })
    setPortfolio({ title: '', type: 'Daire', city: '', district: '', listPrice: '', targetPrice: '' })
    setTab('deal')
    setMessage('Portföy eklendi. Şimdi müşteri + portföyü bir işlem olarak bağla.')
  }

  const submitDeal = () => {
    const customerId = deal.customerId || data.customers[0]?.id
    const portfolioId = deal.portfolioId || data.portfolios[0]?.id
    if (!deal.title.trim() || !customerId || !portfolioId) return setMessage('Önce müşteri ve portföy ekleyip işlem adı gir.')
    addDeal({
      title: deal.title.trim(),
      customerId,
      portfolioId,
      status: deal.status,
      openedAt: new Date(deal.openedAt).toISOString(),
      expectedRevenue: numberValue(deal.expectedRevenue),
      strategy: deal.strategy,
      actionDueAt: deal.actionDueAt ? new Date(deal.actionDueAt).toISOString() : undefined,
    })
    setDeal({ ...deal, title: '', expectedRevenue: '' })
    setTab('activity')
    setMessage('İşlem eklendi. Şimdi arama, görüşme veya fiyat revizyonu girersen ekrandaki tahmin ve öneriler değişir.')
  }

  const submitActivity = () => {
    const dealId = activity.dealId || data.deals[0]?.id
    if (!dealId) return setMessage('Temas veya fiyat revizyonu için önce işlem ekle.')
    addInteraction({
      dealId,
      customerId: activity.customerId || undefined,
      type: activity.type,
      at: new Date(activity.at).toISOString(),
      quality: Math.max(0, Math.min(100, numberValue(activity.quality))),
      note: activity.note.trim() || undefined,
    })
    if (activity.from && activity.to) {
      addPriceChange({
        dealId,
        from: numberValue(activity.from),
        to: numberValue(activity.to),
        at: new Date(activity.at).toISOString(),
        reason: 'Command Center fiyat revizyonu',
      })
    }
    setActivity({ ...activity, note: '', from: '', to: '' })
    setMessage('Temas kaydı işlendi. Takip boşluğu, fiyat baskısı ve yapılacak işler yeniden hesaplandı.')
  }

  const submitExperiment = () => {
    if (!experiment.name.trim()) return setMessage('Deney adı gerekli.')
    addExperiment({
      name: experiment.name.trim(),
      variantA: experiment.variantA.trim() || 'A',
      variantB: experiment.variantB.trim() || 'B',
      metric: experiment.metric,
      dealIdsA: splitIds(experiment.dealIdsA),
      dealIdsB: splitIds(experiment.dealIdsB),
    })
    setExperiment({ ...experiment, name: '', dealIdsA: '', dealIdsB: '' })
    setMessage('Strateji deneyi eklendi; yeterli veri varsa kazanan hesaplanacak.')
  }

  return (
    <section className="cc-panel cc-intake">
      <div className="cc-panel-head">
        <div>
          <div className="cc-kicker">KAYIT AKIŞI</div>
          <h2>Müşteri ve Portföy Ekle</h2>
        </div>
        <span>{data.customers.length + data.portfolios.length + data.deals.length} kayıt</span>
      </div>

      <div className="cc-intake-help">
        1 müşteri ekle, 2 portföy ekle, 3 ikisini işlem olarak bağla. Oranlar ve öneriler özellikle işlem bağlanınca değişir.
      </div>

      <div className="cc-intake-steps">
        {['Müşteri', 'Portföy', 'İşlem', 'Temas/Fiyat', 'Deney'].map((step, index) => (
          <div key={step}>
            <b>{index + 1}</b>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <div className="cc-tabs">
        {[
          ['customer', 'Müşteri'],
          ['portfolio', 'Portföy'],
          ['deal', 'İşlem'],
          ['activity', 'Temas'],
          ['experiment', 'Deney'],
        ].map(([id, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id as IntakeTab)}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'customer' && (
        <div className="cc-form">
          <Input label="Ad Soyad / Firma" value={customer.name} onChange={(value) => setCustomer({ ...customer, name: value })} />
          <Input label="Segment" value={customer.segment} onChange={(value) => setCustomer({ ...customer, segment: value })} />
          <div className="cc-two">
            <Input label="Aciliyet 0-100" value={customer.urgency} onChange={(value) => setCustomer({ ...customer, urgency: value })} />
            <Input label="Bütçe" value={customer.budget} onChange={(value) => setCustomer({ ...customer, budget: value })} />
          </div>
          <button onClick={submitCustomer}>Müşteriyi Ekle</button>
        </div>
      )}

      {tab === 'portfolio' && (
        <div className="cc-form">
          <Input label="Portföy Başlığı" value={portfolio.title} onChange={(value) => setPortfolio({ ...portfolio, title: value })} />
          <div className="cc-two">
            <Input label="Tip" value={portfolio.type} onChange={(value) => setPortfolio({ ...portfolio, type: value })} />
            <Input label="Şehir" value={portfolio.city} onChange={(value) => setPortfolio({ ...portfolio, city: value })} />
          </div>
          <Input label="İlçe" value={portfolio.district} onChange={(value) => setPortfolio({ ...portfolio, district: value })} />
          <div className="cc-two">
            <Input label="Liste Fiyatı" value={portfolio.listPrice} onChange={(value) => setPortfolio({ ...portfolio, listPrice: value })} />
            <Input label="Hedef Fiyat" value={portfolio.targetPrice} onChange={(value) => setPortfolio({ ...portfolio, targetPrice: value })} />
          </div>
          <button onClick={submitPortfolio}>Portföyü Ekle</button>
        </div>
      )}

      {tab === 'deal' && (
        <div className="cc-form">
          <Input label="İşlem Başlığı" value={deal.title} onChange={(value) => setDeal({ ...deal, title: value })} />
          <Select label="Müşteri" value={deal.customerId || firstCustomer} options={data.customers.map((item) => [item.id, item.name])} onChange={(value) => setDeal({ ...deal, customerId: value })} />
          <Select label="Portföy" value={deal.portfolioId || firstPortfolio} options={data.portfolios.map((item) => [item.id, item.title])} onChange={(value) => setDeal({ ...deal, portfolioId: value })} />
          <div className="cc-two">
            <Input label="Beklenen Gelir" value={deal.expectedRevenue} onChange={(value) => setDeal({ ...deal, expectedRevenue: value })} />
            <Select label="Strateji" value={deal.strategy} options={[['normal', 'Normal'], ['aggressive', 'Agresif'], ['patient', 'Sabırlı']]} onChange={(value) => setDeal({ ...deal, strategy: value as StrategyMode })} />
          </div>
          <Select label="Durum" value={deal.status} options={[['active', 'Aktif'], ['won', 'Kazanıldı'], ['lost', 'Kaybedildi']]} onChange={(value) => setDeal({ ...deal, status: value as DealStatus })} />
          <div className="cc-two">
            <Input label="Açılış Tarihi" type="date" value={deal.openedAt} onChange={(value) => setDeal({ ...deal, openedAt: value })} />
            <Input label="Aksiyon Tarihi" type="date" value={deal.actionDueAt} onChange={(value) => setDeal({ ...deal, actionDueAt: value })} />
          </div>
          <button onClick={submitDeal}>İşlemi Bağla</button>
        </div>
      )}

      {tab === 'activity' && (
        <div className="cc-form">
          <Select label="İşlem" value={activity.dealId || firstDeal} options={dealOptions.map((item) => [item.id, item.label])} onChange={(value) => setActivity({ ...activity, dealId: value })} />
          <div className="cc-two">
            <Select label="Temas Tipi" value={activity.type} options={[['call', 'Arama'], ['message', 'Mesaj'], ['meeting', 'Görüşme'], ['viewing', 'Gösterim'], ['follow_up', 'Takip']]} onChange={(value) => setActivity({ ...activity, type: value as InteractionType })} />
            <Input label="Kalite 0-100" value={activity.quality} onChange={(value) => setActivity({ ...activity, quality: value })} />
          </div>
          <Input label="Tarih" type="date" value={activity.at} onChange={(value) => setActivity({ ...activity, at: value })} />
          <Input label="Not" value={activity.note} onChange={(value) => setActivity({ ...activity, note: value })} />
          <div className="cc-two">
            <Input label="Eski Fiyat" value={activity.from} onChange={(value) => setActivity({ ...activity, from: value })} />
            <Input label="Yeni Fiyat" value={activity.to} onChange={(value) => setActivity({ ...activity, to: value })} />
          </div>
          <button onClick={submitActivity}>Teması İşle</button>
        </div>
      )}

      {tab === 'experiment' && (
        <div className="cc-form">
          <Input label="Deney Adı" value={experiment.name} onChange={(value) => setExperiment({ ...experiment, name: value })} />
          <div className="cc-two">
            <Input label="Strateji A" value={experiment.variantA} onChange={(value) => setExperiment({ ...experiment, variantA: value })} />
            <Input label="Strateji B" value={experiment.variantB} onChange={(value) => setExperiment({ ...experiment, variantB: value })} />
          </div>
          <Select label="Metrik" value={experiment.metric} options={[['closeRate', 'Kapanma'], ['duration', 'Süre'], ['revenue', 'Gelir']]} onChange={(value) => setExperiment({ ...experiment, metric: value as typeof experiment.metric })} />
          <Input label="A İşlem ID'leri" value={experiment.dealIdsA} onChange={(value) => setExperiment({ ...experiment, dealIdsA: value })} />
          <Input label="B İşlem ID'leri" value={experiment.dealIdsB} onChange={(value) => setExperiment({ ...experiment, dealIdsB: value })} />
          <button onClick={submitExperiment}>Deneyi Ekle</button>
        </div>
      )}

      {message && <div className="cc-form-note">{message}</div>}
    </section>
  )
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
}) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[][]
  onChange: (value: string) => void
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {!options.length && <option value="">Kayıt yok</option>}
        {options.map(([id, labelText]) => (
          <option key={id} value={id}>{labelText}</option>
        ))}
      </select>
    </label>
  )
}

function splitIds(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}
