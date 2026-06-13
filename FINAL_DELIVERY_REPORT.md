# FINAL DELIVERY REPORT — site-coser

Data: 2026-06-11 · Branch: `chore/finalizacao-site-coser`

## 1. Resumo executivo

Revisão técnica completa do monorepo (backend NestJS + frontend React/Vite) com
foco em integração real entre as camadas, consistência visual, limpeza de
artefatos versionados por engano e validação de build/testes. O projeto compila
sem erros nas duas camadas, os testes unitários do backend passam (25/25) e os
fluxos públicos foram navegados e validados no navegador.

**Status: pronto para entrega**, com uma pendência externa (infraestrutura de
banco/Redis para rodar o backend nesta máquina — ver §15).

## 2. Arquitetura identificada

| Camada | Stack | Local |
| --- | --- | --- |
| Backend | NestJS 10 · Prisma 5 · PostgreSQL · Redis · Socket.IO · Swagger | raiz do repositório (`src/`, `prisma/`) |
| Frontend | React 18 · TypeScript · Vite 6 · TanStack Query · Axios · React Router 7 | `site-coser-frontend/` |
| Infra dev | Docker Compose (PostgreSQL + Redis + MailHog) | `docker-compose.yml` |

- API: `http://localhost:3000/api` · Swagger: `/docs` · WebSocket: `/realtime`.
- Envelope de resposta: `{ success, data, meta }` (o frontend já consome via
  `services/api.ts` com refresh token em interceptor).
- RBAC: ADMIN / SELLER / CUSTOMER, espelhado nas rotas do frontend.

## 3. Correções de integração frontend ↔ backend

1. **Preço exibido como "Consulte" com backend real (bug crítico).**
   `Vehicle.price` vem de `announcedPrice` (Prisma `Decimal`), que serializa
   como *string* no JSON; o `formatCurrency` exigia `number`. Corrigido nos
   dois lados: o serializer público agora converte para número
   (`src/modules/vehicles/vehicles.serializer.ts`) e o `formatCurrency` aceita
   strings numéricas (`site-coser-frontend/src/utils/format.ts`).
2. **Formulário "Falar com especialista"** (`VehicleDetailPage`):
   - feedback visível de sucesso/erro (antes falhava em silêncio);
   - envia `sourcePage` e `message` com o veículo de interesse;
   - veículos de demonstração (`demo-*`) não enviam `vehicleId` inexistente;
   - trata `whatsappUrl` nula (loja sem WhatsApp configurado).
3. **Contrato conferido endpoint a endpoint**: todas as chamadas das áreas
   pública, cliente e interna correspondem a rotas reais do backend (incluindo
   `/audit-logs`, `/consents` público e `PUT /marketing/preferences`).
4. Tipos de filtro: o catálogo consome `GET /public/vehicles` real e aplica
   filtros client-side — necessário porque `fuel`/`transmission` no backend são
   enums Prisma e o fallback de demonstração usa rótulos em português. O
   fallback (`demoVehicles.ts`) está documentado e só entra quando a API não
   responde.

## 4. Limpeza segura (com justificativa)

| Item | Ação | Motivo |
| --- | --- | --- |
| `site-coser-main/` (28.950 arquivos versionados: `node_modules` inteiro + `dist` antigo, 364 MB) | Removido do índice do git (`git rm -r --cached`) + adicionado ao `.gitignore` | Cópia morta de build; o backend real vive na raiz. Nada no código a referencia. **A pasta segue no disco** — exclusão física requer sua confirmação (ver §15). |
| `.codex-run/` (logs de execução local) | Adicionado ao `.gitignore` | Artefato de ferramenta, não é código. |
| `README.md` raiz em UTF-16 | Convertido para UTF-8 | Renderizava quebrado no GitHub e em ferramentas. |
| `README.md` do frontend | Reescrito | Referenciava pasta `site-coser-main` e script `build:all` inexistentes. |
| Foto McLaren em veículos Mercedes GLE e Audi R8 (dados demo) | Substituída por fotos coerentes com a marca | Aparência de projeto incompleto; entrada `mclarenSilver` morta removida. |
| `.prettierrc` `endOfLine: lf → auto` | Ajuste | 12.712 falsos-erros de lint por CRLF em checkout Windows. |

Nenhum arquivo `.env`, migration, seed ou upload foi tocado.

## 5. Otimizações de performance

- **Code-splitting por rota** (`App.tsx` + `React.lazy`/`Suspense`): bundle
  inicial público caiu de **569 kB → 350 kB** (gzip 170 → 112 kB). Painel
  interno, área do cliente e telas de auth agora são chunks sob demanda.
- `@google/model-viewer` (1 MB) já era lazy — carrega só ao abrir o visor 3D.
- Fonte Nunito com `preconnect` + `display=swap`.

## 6. Revisão funcional executada (no navegador)

- **Home**: hero, seletor de marcas com tema dinâmico, CTA "Ver todos modelos",
  vitrine por marca com "Ver ficha completa" e "Falar com consultor".
- **Catálogo**: 12 veículos, cards com altura uniforme (420px), filtro glass,
  painel de especificações em modal centralizado (portal no `body`), galeria de
  ângulos clicáveis.
- **Detalhe do veículo**: galeria, specs, visor 3D lazy, formulário de lead com
  feedback de erro testado (backend off → mensagem clara ao usuário).
- **Login**: chunk lazy carrega e renderiza.
- **Onde estamos**: consome `GET /public/store/location` com `ErrorState`
  apropriado sem backend.
- **Responsivo**: catálogo em 375px empilha 1 coluna sem overflow horizontal.
- **Temas claro/escuro**: cards de veículo têm superfície clara fixa com texto
  sempre escuro — legível nos dois temas e em qualquer cor de marca.

## 7. Acessibilidade, SEO e segurança

- `aria-label`/`role` nos modais e botões de ícone; foco fechável por Escape no
  3D; formulários com `autoComplete`/`inputMode`; feedbacks com `role="alert"`.
- `index.html`: título real, descrição, `theme-color`, Open Graph, favicon SVG.
- `public/robots.txt` bloqueando `/interno/`, `/cliente/` e telas de auth.
- Varredura de segredos no frontend: limpa. `.env.example` só com placeholders.
- Tokens: access em memória, refresh em `sessionStorage` (documentado).
- Backend já traz Helmet, rate-limit, CORS configurável, validação por DTO.

## 8. Validações executadas

| Comando | Resultado |
| --- | --- |
| `npm run test` (backend, raiz) | **25/25 testes passando** (7 suítes) |
| `npm run lint:check` (backend) | **0 erros** (após fix `endOfLine`) |
| `npm run build` (backend, `nest build`) | **OK** (exit 0) |
| `npm run build` (frontend, `tsc -b && vite build`) | **OK** (exit 0) |
| Navegação manual (home, catálogo, detalhe, login, mobile) | **OK** |

Testes e2e (`npm run test:e2e`) exigem PostgreSQL/Redis + seed — não executados
nesta máquina (sem Docker; ver §15).

## 9. Arquivos relevantes alterados

**Backend**
- `src/modules/vehicles/vehicles.serializer.ts` — Decimal → number no preço público
- `.prettierrc` — endOfLine auto
- `.gitignore` — site-coser-main, .codex-run
- `README.md` — re-encodado UTF-8
- `tsconfig.build.json` — inclui `prisma/**` no build (pré-existente, mantido)

**Frontend** (`site-coser-frontend/`)
- `src/App.tsx` — code-splitting por rota + Suspense
- `src/features/public/VehicleDetailPage.tsx` — lead form com feedback
- `src/features/public/api.ts` — tipo `SpecialistContactInput` completo
- `src/features/public/demoVehicles.ts` — fotos coerentes por marca
- `src/utils/format.ts` — formatCurrency robusto
- `src/styles.css` — feedback de formulário + ajustes herdados da sessão
- `index.html` — SEO/OG/favicon · `public/favicon.svg` · `public/robots.txt`
- `README.md` — instruções corretas

## 10. Como executar

**Backend** (raiz) — requer PostgreSQL + Redis:
```bash
cp .env.example .env
docker compose up -d          # PostgreSQL + Redis + MailHog
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev             # API em http://localhost:3000/api · Swagger em /docs
```

**Frontend**:
```bash
cd site-coser-frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

## 11. Build de produção

```bash
npm run build                          # backend (raiz)
cd site-coser-frontend && npm run build  # frontend → dist/
```

## 12. Testes

```bash
npm run test          # unitários (sem banco)
npm run test:e2e      # e2e (requer infra docker + seed)
npm run lint:check    # eslint
```

## 13. Variáveis de ambiente

- Raiz: `.env.example` completo (DB, Redis, JWT, mail, storage, WhatsApp).
- Frontend: `site-coser-frontend/.env.example` → `VITE_API_URL`,
  `VITE_REALTIME_URL`.

## 14. Credenciais de desenvolvimento (seed)

ADMIN `admin@autodealer.local`/`Admin@123` · SELLER `carlos@autodealer.local`/
`Seller@123` · CUSTOMER `maria@cliente.com`/`Customer@123`.

## 15. Pendências externas (exigem decisão/ambiente seu)

1. **Apagar `site-coser-main/` do disco** (364 MB). Já está fora do git e
   ignorada; a exclusão física foi bloqueada pelo modo de permissão. Rode:
   `Remove-Item -Recurse -Force site-coser-main, .codex-run`
2. **Infra local**: sem Docker nesta máquina não há PostgreSQL/Redis, logo o
   backend não sobe aqui. O frontend funciona com fallback de demonstração.
3. **Logo real**: o header usa `public/coser-logo.png` se existir (componente
   `BrandLockup`); enquanto o arquivo não for salvo, mostra o emblema vetorial.
4. **WhatsApp da loja**: configurar `whatsapp`/`phone` da loja (seed ou painel
   `Config. da loja`) para o botão "Falar com especialista" gerar o link.
5. **Provider de ficha técnica** é mock por design (`README` raiz, "Limitações").

## 16. Próximos comandos sugeridos

```bash
git add -A
git commit -m "chore: finalizacao site-coser (integracao, limpeza, SEO, code-split)"
git push -u origin chore/finalizacao-site-coser
```
