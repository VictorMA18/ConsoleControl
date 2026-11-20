import { useEffect, useEffectEvent, useRef } from 'react';

import {
  type AlertableSession,
  createAlertTracker,
  getSessionAlertState,
  type SessionAlert,
  type SessionAlertState,
} from '../services/sessionAlerts';
import { useActiveSessions } from './useActiveSessions';
import { useNow } from './useNow';

// Avisa a la interfaz cuando una sesión activa pasa a «próxima a vencer» o a «tiempo cumplido»
// (HU-004, TW-110). Cada aviso llega una sola vez por sesión mientras la app está abierta
// (TW-111). La interfaz decide cómo reaccionar: ámbar titilante, vibración, mensaje (T16).
export function useSessionAlerts(onAlert: (alert: SessionAlert) => void): void {
  const { data: sessions } = useActiveSessions();
  const now = useNow();
  const tracker = useRef(createAlertTracker());
  const emit = useEffectEvent(onAlert);

  useEffect(() => {
    if (!sessions) {
      return;
    }
    tracker.current.check(sessions, now).forEach((alert) => emit(alert));
  }, [sessions, now]);
}

// Estado de alerta de una sesión, actualizado cada segundo, para el color de su tarjeta.
export function useSessionAlertState(session: AlertableSession): SessionAlertState {
  const now = useNow();
  return getSessionAlertState(session, now);
}
