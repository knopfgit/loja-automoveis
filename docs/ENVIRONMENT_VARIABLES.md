# ENVIRONMENT VARIABLES

Todas as variáveis estão documentadas no `.env.example`. Resumo abaixo.

## Aplicação
| Variável | Default | Descrição |
| --- | --- | --- |
| `NODE_ENV` | development | ambiente |
| `APP_PORT` | 3000 | porta HTTP |
| `APP_GLOBAL_PREFIX` | api | prefixo das rotas (`/api`) |
| `PUBLIC_URL` | http://localhost:3000 | base para URLs absolutas (uploads) |

## Banco de dados (PostgreSQL)
| Variável | Default | Descrição |
| --- | --- | --- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | autodealer | credenciais do container |
| `POSTGRES_PORT` | 5432 | porta |
| `DATABASE_URL` | postgresql://... | string de conexão do Prisma |

## Redis
| Variável | Default | Descrição |
| --- | --- | --- |
| `REDIS_HOST` | localhost | host |
| `REDIS_PORT` | 6379 | porta |
| `REDIS_PASSWORD` | _(vazio)_ | senha opcional |
| `CACHE_TTL` | 3600 | TTL padrão do cache (s) |

## JWT / Autenticação
| Variável | Default | Descrição |
| --- | --- | --- |
| `JWT_ACCESS_SECRET` | _(troque!)_ | segredo do access token |
| `JWT_ACCESS_EXPIRES_IN` | 15m | validade do access token |
| `JWT_REFRESH_SECRET` | _(troque!)_ | segredo do refresh token |
| `JWT_REFRESH_EXPIRES_IN` | 7d | validade do refresh token |
| `PASSWORD_RESET_EXPIRES_MIN` | 30 | validade do token de reset (min) |
| `LOGIN_MAX_ATTEMPTS` | 5 | tentativas antes do bloqueio |
| `LOGIN_LOCK_MINUTES` | 15 | duração do bloqueio |

## Segurança
| Variável | Default | Descrição |
| --- | --- | --- |
| `CORS_ORIGINS` | * | origens permitidas (CSV) |
| `THROTTLE_TTL` | 60 | janela do rate limit (s) |
| `THROTTLE_LIMIT` | 120 | requisições por janela |
| `BCRYPT_SALT_ROUNDS` | 10 | custo do hash de senha |

## Armazenamento de arquivos
| Variável | Default | Descrição |
| --- | --- | --- |
| `STORAGE_DRIVER` | local | `local` ou `s3` |
| `STORAGE_LOCAL_PATH` | ./storage | pasta de uploads (dev) |
| `UPLOAD_MAX_SIZE` | 10485760 | tamanho máximo (bytes) |
| `UPLOAD_ALLOWED_MIME` | image/jpeg,... | MIME types permitidos |
| `S3_*` | _(vazio)_ | configuração para produção (futuro) |

## E-mail (Nodemailer)
| Variável | Default | Descrição |
| --- | --- | --- |
| `MAIL_DRIVER` | console | `console` (loga) ou `smtp` |
| `MAIL_HOST` / `MAIL_PORT` | localhost / 1025 | SMTP (MailHog em dev) |
| `MAIL_FROM_NAME` / `MAIL_FROM_ADDRESS` | Auto Dealer / no-reply@... | remetente |

## Negócio / Integrações
| Variável | Default | Descrição |
| --- | --- | --- |
| `WHATSAPP_COUNTRY_CODE` | 55 | DDI para links wa.me |
| `LEAD_ASSIGNMENT_STRATEGY` | round_robin | `round_robin` ou `least_busy` |
| `DOC_EXPIRY_ALERT_DAYS` | 30 | antecedência de alerta de vencimento |
| `RESERVATION_DEFAULT_DAYS` | 3 | validade padrão de reserva |
| `VEHICLE_SPECS_PROVIDER` | mock | provedor de ficha técnica |
| `VEHICLE_SPECS_API_URL` / `_API_KEY` | _(vazio)_ | integração externa futura |
