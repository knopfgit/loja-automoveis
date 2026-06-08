# COSER Frontend

Frontend React + TypeScript + Vite para consumir a API NestJS do projeto `site-coser-main`.
O visual usa a base Vertex Motors em liquid glass, com fundo branco por padrao e tema black via toggle.

## Requisitos

- Node.js 20+
- Backend rodando em `http://localhost:3000/api`

## Como rodar

```bash
cp .env.example .env
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## Rodar unificado pelo backend

Na pasta `site-coser-main`, rode:

```bash
npm run build:all
npm run start:prod
```

O backend passa a servir o frontend em `http://localhost:3000`, mantendo a API em `/api`, Swagger em `/docs` e uploads em `/uploads`.

## Credenciais de teste

- ADMIN: `admin@autodealer.local` / `Admin@123`
- SELLER: `carlos@autodealer.local` / `Seller@123`
- CUSTOMER: `maria@cliente.com` / `Customer@123`

## O que foi implementado

- Cliente Axios centralizado com envelope da API, mensagens de erro e refresh token em interceptor.
- `accessToken` mantido em memoria; `refreshToken` mantido em `sessionStorage`.
- RBAC na navegacao e nas rotas para ADMIN, SELLER e CUSTOMER.
- Catalogo publico, detalhe do veiculo, contato via WhatsApp, localizacao da loja e consentimento LGPD.
- Area do cliente: conta, favoritos, historico, privacidade/LGPD, compras e documentos.
- Area interna: dashboard em tempo real, veiculos, funil comercial, comissoes, DRE, pecas, documentos, leads, notificacoes, relatorios e auditoria.
- Socket.IO em `/realtime` assinando os eventos principais do backend.
