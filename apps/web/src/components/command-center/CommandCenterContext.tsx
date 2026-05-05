'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'
import {
  analyzeCommandCenter,
  defaultCommandCenterData,
  normalizeCommandCenterData,
} from '@/lib/analysisEngine'
import {
  appendActionFeedback,
  readCommandCenterData,
  writeCommandCenterData,
} from '@/lib/commandCenterStore'
import type {
  ActionFeedback,
  CommandCenterAnalysis,
  CommandCenterData,
  Customer,
  Deal,
  Experiment,
  Interaction,
  Portfolio,
  PriceChange,
  RiskLevel,
} from '@/lib/commandCenterTypes'

type CommandCenterContextValue = {
  data: CommandCenterData
  analysis: CommandCenterAnalysis
  jsonValue: string
  jsonError: string
  setJsonValue: (value: string) => void
  importJson: () => void
  clearData: () => void
  updateConstraints: (patch: Partial<CommandCenterData['constraints']>) => void
  recordFeedback: (feedback: Omit<ActionFeedback, 'id' | 'createdAt'>) => void
  addCustomer: (customer: Omit<Customer, 'id'>) => void
  addPortfolio: (portfolio: Omit<Portfolio, 'id'>) => void
  addDeal: (deal: Omit<Deal, 'id'>) => void
  addInteraction: (interaction: Omit<Interaction, 'id'>) => void
  addPriceChange: (priceChange: Omit<PriceChange, 'id'>) => void
  addExperiment: (experiment: Omit<Experiment, 'id'>) => void
}

const CommandCenterContext = createContext<CommandCenterContextValue | null>(null)

export function CommandCenterProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CommandCenterData>(() => readCommandCenterData())
  const [jsonValue, setJsonValue] = useState(() => JSON.stringify(readCommandCenterData(), null, 2))
  const [jsonError, setJsonError] = useState('')

  const analysis = useMemo(() => analyzeCommandCenter(data), [data])

  const persist = (next: CommandCenterData) => {
    const normalized = writeCommandCenterData(next)
    setData(normalized)
    setJsonValue(JSON.stringify(normalized, null, 2))
  }

  const importJson = () => {
    try {
      const parsed = JSON.parse(jsonValue) as unknown
      const next = normalizeCommandCenterData(parsed)
      setJsonError('')
      persist(next)
    } catch {
      setJsonError('JSON okunamadı. Veri formatını kontrol edin.')
    }
  }

  const clearData = () => {
    setJsonError('')
    persist(defaultCommandCenterData)
  }

  const updateConstraints = (patch: Partial<CommandCenterData['constraints']>) => {
    const next = normalizeCommandCenterData({
      ...data,
      constraints: {
        ...data.constraints,
        ...patch,
        riskLevel: (patch.riskLevel || data.constraints.riskLevel) as RiskLevel,
      },
    })
    persist(next)
  }

  const recordFeedback = (feedback: Omit<ActionFeedback, 'id' | 'createdAt'>) => {
    const next = appendActionFeedback({
      ...feedback,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
    setData(next)
    setJsonValue(JSON.stringify(next, null, 2))
  }

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    persist({
      ...data,
      customers: [{ ...customer, id: crypto.randomUUID() }, ...data.customers],
    })
  }

  const addPortfolio = (portfolio: Omit<Portfolio, 'id'>) => {
    persist({
      ...data,
      portfolios: [{ ...portfolio, id: crypto.randomUUID() }, ...data.portfolios],
    })
  }

  const addDeal = (deal: Omit<Deal, 'id'>) => {
    persist({
      ...data,
      deals: [{ ...deal, id: crypto.randomUUID() }, ...data.deals],
    })
  }

  const addInteraction = (interaction: Omit<Interaction, 'id'>) => {
    persist({
      ...data,
      interactions: [{ ...interaction, id: crypto.randomUUID() }, ...data.interactions],
    })
  }

  const addPriceChange = (priceChange: Omit<PriceChange, 'id'>) => {
    persist({
      ...data,
      priceChanges: [{ ...priceChange, id: crypto.randomUUID() }, ...data.priceChanges],
    })
  }

  const addExperiment = (experiment: Omit<Experiment, 'id'>) => {
    persist({
      ...data,
      experiments: [{ ...experiment, id: crypto.randomUUID() }, ...data.experiments],
    })
  }

  return (
    <CommandCenterContext.Provider
      value={{
        data,
        analysis,
        jsonValue,
        jsonError,
        setJsonValue,
        importJson,
        clearData,
        updateConstraints,
        recordFeedback,
        addCustomer,
        addPortfolio,
        addDeal,
        addInteraction,
        addPriceChange,
        addExperiment,
      }}
    >
      {children}
    </CommandCenterContext.Provider>
  )
}

export function useCommandCenter() {
  const ctx = useContext(CommandCenterContext)
  if (!ctx) throw new Error('useCommandCenter must be used inside CommandCenterProvider')
  return ctx
}
