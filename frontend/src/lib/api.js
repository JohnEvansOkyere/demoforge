const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

async function request(path, options = {}) {
  const { headers: customHeaders, ...rest } = options
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(customHeaders || {}),
    },
  })

  if (!res.ok) {
    const text = await res.text()
    let message = `Request failed with status ${res.status}`
    try {
      const json = JSON.parse(text)
      message = json.detail || message
    } catch {
      if (text) message = text
    }
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  if (res.status === 204) return null
  return res.json()
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function generateDemo({ idea, vibe, token }) {
  return request('/api/demos/generate', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ idea, vibe }),
  })
}

export async function fetchMyDemos(token) {
  return request('/api/demos', { headers: authHeaders(token) })
}

export async function fetchDemoById(id) {
  return request(`/api/demos/${id}`)
}

export async function deleteDemo(id, token) {
  return request(`/api/demos/${id}`, { method: 'DELETE', headers: authHeaders(token) })
}

export async function fetchCredits(token) {
  return request('/api/payments/credits', { headers: authHeaders(token) })
}

export async function initializePayment({ email, callbackUrl, token }) {
  return request('/api/payments/initialize', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ email, callback_url: callbackUrl }),
  })
}

export async function verifyPayment(reference, token) {
  return request(`/api/payments/verify/${reference}`, { headers: authHeaders(token) })
}
