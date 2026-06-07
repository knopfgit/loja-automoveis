# AUTHENTICATION

Autenticação via JWT (access token de curta duração) + refresh token rotativo e
revogável, persistido no banco (hash SHA-256).

## Fluxo

```
POST /api/auth/login      -> { accessToken, refreshToken, user }
(usar accessToken no header Authorization: Bearer <token>)
POST /api/auth/refresh    -> novo par de tokens (o refresh antigo é revogado)
POST /api/auth/logout     -> revoga o refresh token atual
POST /api/auth/logout-all -> revoga todas as sessões
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{ "email": "admin@autodealer.local", "password": "Admin@123" }
```

Resposta (envelope padrão):

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "ADMIN" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "tokenType": "Bearer",
    "expiresIn": "15m"
  },
  "meta": { "timestamp": "..." }
}
```

### Usando o token

```http
GET /api/vehicles
Authorization: Bearer eyJhbGci...
```

### Renovando o token

```http
POST /api/auth/refresh
Content-Type: application/json

{ "refreshToken": "eyJhbGci..." }
```

O refresh é **rotativo**: cada uso revoga o token anterior e emite um novo par.
Reuso de um refresh revogado/expirado retorna `INVALID_REFRESH_TOKEN`.

## Registro público (cliente)

```http
POST /api/auth/register
{
  "fullName": "João da Silva",
  "email": "joao@email.com",
  "password": "Senha@123",
  "document": "52998224725"
}
```

Cria um usuário com papel `CUSTOMER` e perfil de cliente vinculado.

## Recuperação e alteração de senha

```http
POST /api/auth/forgot-password   { "email": "..." }       # envia token por e-mail
POST /api/auth/reset-password    { "token": "...", "newPassword": "..." }
POST /api/auth/change-password   { "currentPassword": "...", "newPassword": "..." }  # autenticado
```

> Para evitar enumeração de usuários, `forgot-password` sempre responde sucesso.

## Segurança implementada

- Senhas com **bcrypt** (`BCRYPT_SALT_ROUNDS`).
- Access token de curta duração (`15m`), refresh de `7d`.
- Refresh tokens **persistidos e revogáveis** (revogados ao trocar senha/logout).
- **Bloqueio de conta** após `LOGIN_MAX_ATTEMPTS` tentativas (`ACCOUNT_LOCKED`).
- Histórico de login (`login_history`).
- Verificação de status do usuário em cada request (contas inativas/bloqueadas
  são rejeitadas mesmo com token válido).
- Rate limit no `/auth/login` (5 req/min por IP).

## WebSocket / SSE

O mesmo access token autentica o WebSocket (`/realtime`, via `auth.token` no
handshake ou header `Authorization`) e o SSE (`GET /api/realtime/stream`).
Veja `REALTIME_EVENTS.md`.
