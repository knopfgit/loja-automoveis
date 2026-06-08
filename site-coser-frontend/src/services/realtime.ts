import { io, type Socket } from 'socket.io-client';
import type { RealtimeMessage } from '../types';

const REALTIME_URL = import.meta.env.VITE_REALTIME_URL ?? 'http://localhost:3000/realtime';

const events = [
  'dashboard.updated',
  'lead.assigned',
  'sale.completed',
  'commission.generated',
  'notification.created',
  'vehicle.status_changed',
  'part.low_stock',
  'part.stock_low',
];

export function connectRealtime(accessToken: string, onEvent: (message: RealtimeMessage) => void): Socket {
  const socket = io(REALTIME_URL, {
    auth: { token: accessToken },
  });

  for (const event of events) {
    socket.on(event, (message: RealtimeMessage | unknown) => {
      const payload = typeof message === 'object' && message !== null ? (message as RealtimeMessage) : { event, data: message };
      onEvent({ ...payload, event: payload.event ?? event });
    });
  }

  return socket;
}
