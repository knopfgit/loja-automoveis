# COSER Frontend

Frontend React + TypeScript + Vite que consome a API NestJS deste repositório
(backend na raiz do projeto). O visual usa liquid glass, com tema claro por
padrão e tema escuro via toggle no cabeçalho.

## Requisitos

- Node.js 20+
- Backend rodando em `http://localhost:3000/api` (na raiz do repositório:
  `npm run start:dev`). Sem backend, o catálogo usa veículos de demonstração
  como fallback documentado (`src/features/public/demoVehicles.ts`).

## Como rodar

```bash
cp .env.example .env
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## Build de produção

```bash
npm run build     # gera dist/
npm run preview   # serve o build localmente
```

## Variáveis de ambiente

| Variável | Padrão | Uso |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000/api` | URL base da API |
| `VITE_REALTIME_URL` | `http://localhost:3000/realtime` | Socket.IO (painel interno) |

## Credenciais de teste (seed do backend)

- ADMIN: `admin@autodealer.local` / `Admin@123`
- SELLER: `carlos@autodealer.local` / `Seller@123`
- CUSTOMER: `maria@cliente.com` / `Customer@123`

## O que foi implementado

- Cliente Axios centralizado com envelope da API, mensagens de erro e refresh token em interceptor.
- `accessToken` mantido em memória; `refreshToken` mantido em `sessionStorage`.
- RBAC na navegação e nas rotas para ADMIN, SELLER e CUSTOMER.
- Catálogo público, detalhe do veículo, contato via WhatsApp, localização da loja e consentimento LGPD.
- Área do cliente: conta, favoritos, histórico, privacidade/LGPD, compras e documentos.
- Área interna: dashboard em tempo real, veículos, funil comercial, comissões, DRE, peças, documentos, leads, notificações, relatórios e auditoria.
- Socket.IO em `/realtime` assinando os eventos principais do backend.
