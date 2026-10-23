import { z } from 'zod';

import { MAX_CONTROLLERS, MIN_CONTROLLERS, SESSION_MODES } from '../db/schema/enums';

// Datos que el diálogo de sesión envía para abrir una sesión (HU-001).
export const startSessionSchema = z.object({
  consoleId: z.uuid(),
  controllerCount: z.number().int().min(MIN_CONTROLLERS).max(MAX_CONTROLLERS),
  mode: z.enum(SESSION_MODES),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
