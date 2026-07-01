import { setupServer } from 'msw/node'
import { authHandlers } from './handlers/auth.handlers'
import { accountHandlers } from './handlers/account.handlers'
import { rolesHandlers } from './handlers/roles.handlers'
import { comunicacionesHandlers } from './handlers/comunicaciones.handlers'
import { propiedadesHandlers } from './handlers/propiedades.handlers'
import { directorioHandlers } from './handlers/directorio.handlers'

export const server = setupServer(
  ...authHandlers,
  ...accountHandlers,
  ...rolesHandlers,
  ...comunicacionesHandlers,
  ...propiedadesHandlers,
  ...directorioHandlers,
)
