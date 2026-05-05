'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'
import {
  analyzeCommandCenter,
  defaultCommandCenterData,
  normalizeCommandCenterData,
} from '@/lib/analysisEngine'
import type { CommandCenterAnalysis, CommandCenterData, RiskLevel } from '@/lib/commandCenterTypes'

type CommandCenterContextValue = {
  data: CommandCenterData
  analysis: CommandCenterAnalysis
  jsonValue: string
  jsonError: string
  setJsonValue: (value: string) => void
  importJson: () => void
  clearData: () => void
  updateConstraints: (patch: Partial<CommandCenterData['constraints']>) => void
}

const STORAGE_KEY = 'vega.commandCenter.userData.v1'
const CommandCenterContext = createContext<CommandCenterContextValue | null>(null)

export function CommandCenterProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CommandCenterData>(() => readStoredData())
  const [jsonValue, setJsonValue] = useState(() => JSON.stringify(readStoredData(), null, 2))
  const [jsonError, setJsonError] = useState('')

  const analysis = useMemo(() => analyzeCommandCenter(data), [data])

  const persist = (next: CommandCenterData) => {
    setData(next)
    setJsonValue(JSON.stringify(next, null, 2))
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    }
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

function readStoredData() {
  if (typeof window === 'undefined') return defaultCommandCenterData
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaultCommandCenterData
  try {
    return normalizeCommandCenterData(JSON.parse(stored) as unknown)
  } catch {
    return defaultCommandCenterData
  }
}
