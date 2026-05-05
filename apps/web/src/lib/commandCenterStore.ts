import { defaultCommandCenterData, normalizeCommandCenterData } from './analysisEngine'
import type {
  ActionFeedback,
  CapturedAnalysis,
  CommandCenterData,
} from './commandCenterTypes'

export const COMMAND_CENTER_STORAGE_KEY = 'vega.commandCenter.userData.v1'

export function readCommandCenterData(): CommandCenterData {
  if (typeof window === 'undefined') return defaultCommandCenterData
  const stored = window.localStorage.getItem(COMMAND_CENTER_STORAGE_KEY)
  if (!stored) return defaultCommandCenterData
  try {
    return normalizeCommandCenterData(JSON.parse(stored) as unknown)
  } catch {
    return defaultCommandCenterData
  }
}

export function writeCommandCenterData(data: CommandCenterData) {
  const normalized = normalizeCommandCenterData(data)
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(COMMAND_CENTER_STORAGE_KEY, JSON.stringify(normalized))
  }
  return normalized
}

export function appendCapturedAnalysis(analysis: CapturedAnalysis) {
  const current = readCommandCenterData()
  return writeCommandCenterData({
    ...current,
    analysisResults: [
      analysis,
      ...current.analysisResults.filter((item) => item.id !== analysis.id),
    ].slice(0, 60),
  })
}

export function appendActionFeedback(feedback: ActionFeedback) {
  const current = readCommandCenterData()
  return writeCommandCenterData({
    ...current,
    actionFeedback: [
      feedback,
      ...current.actionFeedback.filter((item) => item.actionId !== feedback.actionId),
    ].slice(0, 120),
  })
}
