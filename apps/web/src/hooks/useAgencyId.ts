'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAgencyId() {
  const [agencyId, setAgencyId] = useState<string>('')
  const [agencyName, setAgencyName] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      const id = user?.user_metadata?.agency_id || user?.id || ''
      const name = user?.user_metadata?.agency_name || ''
      setAgencyId(id)
      setAgencyName(name)
      setUserEmail(user?.email || '')
      setLoading(false)
    })
  }, [])

  return { agencyId, agencyName, userEmail, loading }
}
