# REALTIME EVENTS

Atualizações em tempo real são entregues por **WebSocket (Socket.IO)** e
**Server-Sent Events (SSE)**. Internamente os eventos passam por
`RealtimeService`, que faz fan-out para: RxJS (SSE), EventEmitter2 (listeners
in-process) e Redis pub/sub (escala multi-instância).

## Conexão WebSocket (recomendada)

Namespace: `/realtime`. Autentique com o access token.

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/realtime', {
  auth: { token: accessToken }, // ou header Authorization: Bearer <token>
});

socket.on('vehicle.created', (msg) => console.log(msg));
socket.on('lead.assigned',  (msg) => console.log(msg));
socket.on('dashboard.updated', () => refetchDashboard());
```

Ao conectar, o cliente entra automaticamente nas salas:
`role:<ROLE>`, `user:<userId>` e, se for vendedor, `seller:<employeeId>`.
Mensagens direcionadas só chegam ao público correto.

## Conexão SSE (alternativa)

```
GET /api/realtime/stream
Authorization: Bearer <token>     (ADMIN ou SELLER)
```

Cada evento é um `MessageEvent` com `type` = nome do evento e `data` = JSON.

## Formato da mensagem

```json
{
  "event": "sale.completed",
  "data": { "id": "uuid", "vehicleId": "uuid", "finalPrice": 116000 },
  "roles": ["ADMIN"],
  "sellerId": "uuid",
  "timestamp": "2026-01-01T10:00:00.000Z"
}
```

## Catálogo de eventos

| Evento | Quando | Público |
| --- | --- | --- |
| `vehicle.created` | veículo cadastrado | ADMIN, SELLER |
| `vehicle.updated` | veículo atualizado | ADMIN, SELLER |
| `vehicle.status_changed` | mudança de status/estoque | ADMIN, SELLER |
| `vehicle.viewed` | visualização registrada | ADMIN |
| `part.stock_low` | peça atingiu estoque mínimo | ADMIN |
| `maintenance.created` | manutenção aberta / revisão próxima | ADMIN |
| `maintenance.completed` | manutenção finalizada | ADMIN |
| `document.pending` | documento pendente | ADMIN, SELLER |
| `document.expiring` | documento próximo do vencimento | ADMIN, SELLER |
| `lead.created` | novo lead | ADMIN |
| `lead.assigned` | lead atribuído a vendedor | ADMIN + vendedor |
| `sale.created` | venda/negociação iniciada | ADMIN + vendedor |
| `sale.completed` | venda concluída | ADMIN + vendedor |
| `commission.generated` | comissão gerada | ADMIN + vendedor |
| `commission.approved` | comissão aprovada | ADMIN + vendedor |
| `commission.paid` | comissão paga | ADMIN + vendedor |
| `dashboard.updated` | recálculo periódico de dashboards | todos |

## Direcionamento

- `roles`: lista de papéis que recebem o evento (se ausente, broadcast).
- `sellerId`: entrega ao vendedor específico (ADMIN também recebe).

O SSE filtra por papel/vendedor por assinante; o WebSocket usa salas.
