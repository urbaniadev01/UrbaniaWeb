import { describe, it, expect } from 'vitest'
import { loginSchema, mfaCodeSchema } from '@/lib/validators'

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    const result = loginSchema.safeParse({ email: 'admin@test.com', password: '123456' })
    expect(result.success).toBe(true)
  })

  it('rechaza email inválido', () => {
    const result = loginSchema.safeParse({ email: 'no-email', password: '123456' })
    expect(result.success).toBe(false)
  })

  it('rechaza campos vacíos', () => {
    const result = loginSchema.safeParse({ email: '', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('mfaCodeSchema', () => {
  it('acepta código numérico', () => {
    const result = mfaCodeSchema.safeParse({ code: '123456' })
    expect(result.success).toBe(true)
  })

  it('rechaza código con letras', () => {
    const result = mfaCodeSchema.safeParse({ code: 'abc123' })
    expect(result.success).toBe(false)
  })

  it('rechaza código vacío', () => {
    const result = mfaCodeSchema.safeParse({ code: '' })
    expect(result.success).toBe(false)
  })
})
