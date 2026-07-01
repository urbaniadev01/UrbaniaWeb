// =====================================================================
// Tests del componente AnnouncementRow
// =====================================================================
// Verifica renderizado de la fila, badge de estado, pin, fecha
// programada y callback onView al hacer click.
// =====================================================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnnouncementRow } from '@/features/comunicaciones/components/AnnouncementRow'
import type { Announcement } from '@/features/comunicaciones/types/comunicaciones.types'

const mockAnnouncement: Announcement = {
  id: 'ann-1',
  titulo: 'Corte de agua programado',
  cuerpo: 'Mañana no habrá agua...',
  segmento: 'todos',
  target_id: null,
  estado: 'enviado',
  programado_para: null,
  fijado: true,
  canales: ['email', 'whatsapp'],
  metrics: { enviados: 120, entregados: 118, leidos: 87 },
  created_at: '2026-06-20T08:00:00Z',
  updated_at: '2026-06-20T08:00:00Z',
}

describe('AnnouncementRow', () => {
  it('renderiza el título y el segmento', () => {
    const onView = vi.fn()
    render(
      <table>
        <tbody>
          <AnnouncementRow announcement={mockAnnouncement} onView={onView} />
        </tbody>
      </table>,
    )
    expect(screen.getByText('Corte de agua programado')).toBeInTheDocument()
    // SEGMENT_LABEL['todos'] === 'Todos'
    expect(screen.getByText('Todos')).toBeInTheDocument()
  })

  it('muestra el badge de estado "Enviado"', () => {
    const onView = vi.fn()
    render(
      <table>
        <tbody>
          <AnnouncementRow announcement={mockAnnouncement} onView={onView} />
        </tbody>
      </table>,
    )
    // STATUS_LABEL['enviado'] === 'Enviado'
    expect(screen.getByText('Enviado')).toBeInTheDocument()
  })

  it('llama onView al hacer click en la fila', async () => {
    const onView = vi.fn()
    render(
      <table>
        <tbody>
          <AnnouncementRow announcement={mockAnnouncement} onView={onView} />
        </tbody>
      </table>,
    )
    await userEvent.click(screen.getByText('Corte de agua programado'))
    expect(onView).toHaveBeenCalledWith('ann-1')
  })

  it('muestra el pin si fijado es true', () => {
    const onView = vi.fn()
    render(
      <table>
        <tbody>
          <AnnouncementRow announcement={mockAnnouncement} onView={onView} />
        </tbody>
      </table>,
    )
    expect(screen.getByLabelText('Fijado en cartelera')).toBeInTheDocument()
  })

  it('muestra guión si no hay fecha programada', () => {
    const onView = vi.fn()
    render(
      <table>
        <tbody>
          <AnnouncementRow announcement={mockAnnouncement} onView={onView} />
        </tbody>
      </table>,
    )
    // Em dash cuando programado_para es null
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('muestra la fecha programada si existe', () => {
    const onView = vi.fn()
    const scheduled = {
      ...mockAnnouncement,
      programado_para: '2026-07-10T19:00:00.000Z',
      fijado: false,
    }
    render(
      <table>
        <tbody>
          <AnnouncementRow announcement={scheduled} onView={onView} />
        </tbody>
      </table>,
    )
    // Debe formatear la fecha con Intl.DateTimeFormat (mes corto en es-CO)
    expect(screen.getByText(/jul/i)).toBeInTheDocument()
  })
})
