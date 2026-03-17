const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vega-api-9ps9.onrender.com'

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}

export async function healthCheck() {
  return apiFetch('/api/v1/health')
}
