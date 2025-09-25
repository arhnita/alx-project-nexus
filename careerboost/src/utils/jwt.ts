interface JWTPayload {
  token_type: string
  exp: number
  iat: number
  jti: string
  user_id: string
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  role?: string
  phone?: string
  status?: string
}

export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token)
  if (!payload) return true

  const now = Date.now() / 1000
  return payload.exp < now
}