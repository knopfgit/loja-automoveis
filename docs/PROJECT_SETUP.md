# PROJECT SETUP

Guia para executar o backend localmente.

## Requisitos

- Node.js 20+
- Docker e Docker Compose
- npm 10+

## Passo a passo

```bash
# 1. Variáveis de ambiente
cp .env.example .env

# 2. Subir infraestrutura (PostgreSQL, Redis, MailHog)
docker compose up -d

# 3. Instalar dependências
npm install

# 4. Gerar client + aplicar migrations
npx prisma migrate dev

# 5. Popular dados de exemplo
npx prisma db seed

# 6. Rodar em modo desenvolvimento
npm run start:dev
```

A API sobe em `http://localhost:3000/api` e o Swagger em `http://localhost:3000/docs`.

## Comandos úteis

| Comando | Descrição |
| --- | --- |
| `npm run start:dev` | Servidor em watch mode |
| `npm run build` | Compila para `dist/` |
| `npm run start:prod` | Roda a build de produção |
| `npm run test` | Testes unitários (sem banco) |
| `npm run test:e2e` | Testes e2e (requer infra + seed) |
| `npm run lint` | ESLint com auto-fix |
| `npm run prisma:studio` | Prisma Studio (UI do banco) |
| `npm run db:reset` | Reseta o banco e re-aplica migrations + seed |

## Subindo tudo via Docker (API incluída)

```bash
docker compose --profile app up -d --build
```

Isso sobe Postgres, Redis, MailHog e a API. As migrations são aplicadas
automaticamente no start do container (`prisma migrate deploy`).

## Serviços de infraestrutura

| Serviço | Porta | Observação |
| --- | --- | --- |
| PostgreSQL | 5432 | banco principal |
| Redis | 6379 | cache + pub/sub de eventos |
| MailHog (SMTP) | 1025 | captura de e-mails |
| MailHog (UI) | 8025 | http://localhost:8025 |

## Primeiros tokens

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@autodealer.local","password":"Admin@123"}'
```

## Troubleshooting

- **Prisma não conecta:** confirme que o `docker compose up -d` terminou e que
  `DATABASE_URL` no `.env` aponta para `localhost:5432`.
- **Redis recusando conexão:** confira `REDIS_HOST=localhost`.
- **E-mails não chegam:** com `MAIL_DRIVER=console` os e-mails são apenas logados.
  Para vê-los, use `MAIL_DRIVER=smtp` + MailHog (http://localhost:8025).
