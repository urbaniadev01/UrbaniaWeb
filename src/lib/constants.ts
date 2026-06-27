export const QUERY_KEYS = {
  AUTH: {
    ME: ['auth', 'me'] as const,
    SESSIONS: ['auth', 'sessions'] as const,
  },
  DASHBOARD: {
    STATS: ['dashboard', 'stats'] as const,
  },
  PROPERTIES: {
    ALL: ['properties'] as const,
    DETAIL: (id: string) => ['properties', id] as const,
  },
  RESIDENTS: {
    ALL: ['residents'] as const,
    DETAIL: (id: string) => ['residents', id] as const,
  },
  PAYMENTS: {
    ALL: ['payments'] as const,
    DETAIL: (id: string) => ['payments', id] as const,
    SUMMARY: ['payments', 'summary'] as const,
  },
  COMMON_ZONES: {
    ALL: ['common-zones'] as const,
    AVAILABILITY: (id: string) => ['common-zones', id, 'availability'] as const,
  },
  RESERVATIONS: {
    ALL: ['reservations'] as const,
  },
  PQR: {
    ALL: ['pqr'] as const,
    DETAIL: (id: string) => ['pqr', id] as const,
  },
  ENTRY_LOG: {
    ALL: ['entry-log'] as const,
  },
  CHAT: {
    CONVERSATIONS: ['chat', 'conversations'] as const,
    MESSAGES: (conversationId: string) => ['chat', 'messages', conversationId] as const,
  },
} as const
