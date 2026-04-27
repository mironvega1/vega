'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAgencyId() {
  const [agencyId, setAgencyId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      // agency_id from metadata (set during signup), fallback to user.id
      const id = user?.user_metadata?.agency_id || user?.id || ''
      setAgencyId(id)
      setLoading(false)
    })
  }, [])

  return { agencyId, loading: loading }
}
