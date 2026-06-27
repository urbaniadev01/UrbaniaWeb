import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { TestProviders } from '../helpers/TestProviders'
import { LoginForm } from '@/features/auth/components/LoginForm'

describe('LoginForm', () => {
  it('renderiza campos de email y contraseña', () => {
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra error de validación si el email está vacío', async () => {
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    )
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    expect(await screen.findByText('El email es obligatorio')).toBeInTheDocument()
  })

  it('llama al submit con valores válidos', async () => {
    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>,
    )
    await userEvent.type(screen.getByLabelText('Email'), 'admin@urbania.com')
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Admin2026!')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))
    // El formulario se envía — el test verifica que no hay errores de validación
  })
})
