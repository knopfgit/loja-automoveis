# Prompt para gerar o frontend (Claude Code / ChatGPT / Cursor)

Copie e cole o prompt abaixo (em bloco, sem alterar) na ferramenta que for usar para construir o
frontend. Ele já contém todo o contexto necessário sobre a API pronta no backend.

---

## PROMPT

```
Você vai construir o FRONTEND de uma plataforma de compra e venda de veículos (concessionária/loja
de carros) no Brasil. O BACKEND já está 100% pronto, rodando e documentado — você não vai criar
nem alterar nada no backend, apenas consumi-lo via HTTP/WebSocket.

=== CONTEXTO DO BACKEND (pronto, não mexer) ===
- Stack: Node.js + TypeScript + NestJS + PostgreSQL + Prisma + Redis + Socket.IO/SSE.
- Repositório: https://github.com/knopfgit/site-coser (pasta raiz do backend).
- Para rodar localmente: cp .env.example .env && docker compose up -d && npm install &&
  npx prisma migrate dev && npx prisma db seed && npm run start:dev
- API base: http://localhost:3000/api
- Swagger (documentação viva, sempre atualizada): http://localhost:3000/docs
- WebSocket: ws://localhost:3000/realtime   |   SSE: GET /api/realtime/stream
- Documentação completa do backend está em /docs dentro do repositório:
  PROJECT_SETUP.md, ENVIRONMENT_VARIABLES.md, AUTHENTICATION.md, ROLES_AND_PERMISSIONS.md,
  REALTIME_EVENTS.md, API_ENDPOINTS.md, DATABASE_MODEL.md, BUSINESS_RULES.md,
  EXAMPLE_REQUESTS.md e — o mais importante para você — FRONTEND_INTEGRATION.md (leia esse
  arquivo primeiro, ele tem exemplos prontos de Axios/Fetch, fluxos completos e a estrutura
  exata de cada JSON retornado). Há também uma coleção Postman em docs/postman_collection.json.

=== CREDENCIAIS DE TESTE (seed) ===
- ADMIN:    admin@autodealer.local    / Admin@123
- SELLER:   carlos@autodealer.local   / Seller@123  (ou ana@autodealer.local)
- CUSTOMER: maria@cliente.com         / Customer@123 (ou joao@cliente.com)

=== FORMATO PADRÃO DE TODAS AS RESPOSTAS DA API (envelope) ===
Sucesso (item):  { "success": true,  "data": {...}, "meta": { "timestamp": "..." } }
Sucesso (lista): { "success": true,  "data": [...], "meta": { "page","limit","total","totalPages","timestamp" } }
Erro:            { "success": false, "error": { "code","message","details" }, "meta": { "timestamp","path" } }
Use sempre `error.code` (estável, em inglês, ex.: VEHICLE_NOT_FOUND, VALIDATION_ERROR, UNAUTHORIZED,
FORBIDDEN, ACCOUNT_LOCKED, RATE_LIMITED) para lógica condicional, e `error.message` (em pt-BR) para
exibir ao usuário. Erros de validação trazem detalhes por campo em `error.details`.

=== AUTENTICAÇÃO (implemente exatamente assim) ===
1. POST /auth/login { email, password } -> data.accessToken (curta duração) e data.refreshToken.
2. Envie sempre `Authorization: Bearer <accessToken>` nas chamadas autenticadas.
3. Ao receber 401, chame POST /auth/refresh { refreshToken }, substitua o par de tokens (o
   refresh antigo é invalidado — rotação) e repita a requisição original. Implemente isso como
   um interceptor único do Axios/Fetch.
4. GET /auth/me retorna o usuário logado e seu `role` (ADMIN | SELLER | CUSTOMER) — use isso para
   decidir quais telas/menus mostrar.
5. Nunca armazene o accessToken em localStorage de forma ingênua; prefira estado em memória
   (store/contexto) e, se possível, um BFF com cookie httpOnly para o refreshToken.

=== PERFIS E O QUE CADA UM PODE VER (RBAC — já garantido pelo backend, replique na UI) ===
- ADMIN: visão completa da loja — veículos, estoque, peças, manutenção, documentos, vendas,
  comissões de TODOS os vendedores, DRE consolidada e por veículo, dashboards globais,
  relatórios, auditoria, gestão de usuários/funcionários/clientes.
- SELLER: apenas seus próprios clientes/reservas/vendas/comissões e seu próprio dashboard —
  NUNCA mostre dados de outro vendedor nem faturamento consolidado (o backend já bloqueia, mas a
  UI deve refletir isso, ex.: nem exibir esses menus).
- CUSTOMER: autoatendimento — próprio cadastro/endereços, compras, documentos, favoritos,
  histórico de visualização, preferências de marketing, solicitações LGPD (exportar/excluir
  meus dados). Nunca dados de outro cliente.
- Visitante (sem login): catálogo público, filtros, localização da loja, botão "Falar com
  especialista" (WhatsApp), banner de consentimento de cookies.

=== O QUE CONSTRUIR (páginas/telas mínimas) ===
1. PÚBLICO (sem login, SEO-friendly):
   - Home / vitrine com veículos em destaque (GET /public/vehicles/featured)
   - Catálogo com filtros e paginação (GET /public/vehicles, GET /public/filters)
   - Página de detalhe do veículo por slug (GET /public/vehicles/:slug) com galeria de fotos,
     ficha técnica (spec) e botão "Falar com especialista" que chama
     POST /public/leads/specialist-contact e abre `whatsappUrl` retornada em nova aba.
   - Página "onde estamos" com mapa (GET /public/store/location -> coordinates, googleMapsUrl,
     directionsUrl, openingHours).
   - Banner de consentimento de cookies (LGPD) — registra via POST /consents ANTES de qualquer
     rastreamento; só envie localização (POST /tracking/location) se a categoria LOCATION foi
     consentida.
   - Login / Cadastro / Recuperação de senha.

2. ÁREA DO CLIENTE (CUSTOMER logado):
   - Minha conta (dados, endereços) — /customers/me
   - Meus favoritos (POST/DELETE/GET /favorites)
   - Histórico de visualizações
   - Preferências de marketing e privacidade — incluindo botões para "exportar meus dados" e
     "excluir minha conta" (fluxo LGPD)
   - Minhas compras / documentos relacionados

3. ÁREA INTERNA (ADMIN e/ou SELLER, conforme permissão):
   - Dashboard com indicadores em tempo real (assine o evento `dashboard.updated` via
     WebSocket para atualizar sem F5)
   - Gestão de veículos (CRUD), aplicação automática de ficha técnica
     (POST /vehicles/:id/apply-specs), upload de fotos, mudança de status no funil de estoque
     (DRAFT -> AVAILABLE -> RESERVED -> SOLD -> ARCHIVED — respeite que o backend recusa
     transições inválidas)
   - Funil comercial: aquisições, reservas e vendas (ao concluir uma venda, o backend já gera
     comissão e lançamento de DRE automaticamente — apenas exiba o resultado)
   - Extrato de comissões (ADMIN vê todas; SELLER vê só as suas — /commissions/me)
   - DRE por veículo e consolidada (consolidada é só ADMIN)
   - Gestão de peças, fornecedores e ordens de manutenção
   - Documentos (upload com tipo/checklist, status de pendências, download restrito)
   - Leads (funil de atendimento, atribuição automática a vendedores)
   - Notificações (sino com não lidas; combine com evento realtime `notification.created`)
   - Relatórios com exportação (CSV/JSON)
   - Auditoria (somente ADMIN)

=== TEMPO REAL ===
Conecte ao WebSocket com o token JWT:
  const socket = io('http://localhost:3000/realtime', { auth: { token: accessToken } });
Assine pelo menos: dashboard.updated, lead.assigned, sale.completed, commission.generated,
notification.created, vehicle.status_changed, part.low_stock. A lista completa (17 eventos,
payloads e quem recebe) está em docs/REALTIME_EVENTS.md.

=== REGRAS QUE A UI DEVE RESPEITAR (o backend já protege, mas a UX deve refletir) ===
- O catálogo público NUNCA mostra: purchasePrice, suggestedPrice, minPrice, soldPrice,
  internalNotes, plate, renavam, chassis, engineNumber, custos ou dados pessoais — use somente
  o campo `price`. Esses campos só aparecem nos endpoints autenticados internos.
- Trate 401 (renovar token), 403/FORBIDDEN (ação não permitida — esconda a opção), 423/
  ACCOUNT_LOCKED (conta bloqueada — oferecer recuperação de senha) e 429/RATE_LIMITED
  (aguardar e tentar de novo) com mensagens amigáveis em pt-BR.
- Uploads: respeite os limites de tamanho/tipo informados (UPLOAD_TOO_LARGE, UPLOAD_INVALID_TYPE)
  validando no cliente antes de enviar.

=== STACK SUGERIDA PARA O FRONTEND (decida e siga uma) ===
React + TypeScript + Vite (ou Next.js) + TailwindCSS + TanStack Query (cache/estado de servidor) +
Axios (com o interceptor de refresh descrito acima) + socket.io-client + React Hook Form + Zod
para validação de formulários espelhando as mensagens de erro do backend. Organize por feature
(ex.: features/vehicles, features/auth, features/dashboard), com camada de API isolada
(services/) que conhece o envelope de resposta e nunca vaza `data`/`meta` cru para os componentes.

=== ENTREGÁVEIS ESPERADOS ===
1. Projeto frontend completo, rodando com `npm run dev`, consumindo a API em
   http://localhost:3000/api (configurável via .env).
2. README explicando como rodar (junto com o backend).
3. Cobertura das telas listadas acima, responsivas (mobile-first), com estados de
   carregamento/erro/vazio tratados.
4. Tratamento de autenticação/refresh, RBAC na UI e tempo real funcionando.
5. Nenhuma chamada direta a banco de dados — tudo via API REST/WebSocket documentada.

Comece lendo docs/FRONTEND_INTEGRATION.md no repositório do backend (ele tem exemplos prontos de
Axios, estrutura exata dos JSONs e fluxos passo a passo) e o Swagger em /docs para conferir
qualquer endpoint em tempo real antes de integrá-lo.
```

---

## Observações de uso

- **Com Claude Code:** cole o prompt inteiro como primeira mensagem dentro da pasta onde o
  frontend será criado (pode ser uma pasta irmã do backend, ex.: `site-coser-frontend/`).
- **Com ChatGPT:** cole o prompt e peça para gerar a estrutura inicial do projeto + as primeiras
  telas (login, catálogo, dashboard); depois itere tela por tela citando o arquivo
  `docs/FRONTEND_INTEGRATION.md` como referência de contrato de API.
- Sempre que surgir dúvida sobre formato de payload/endpoint, a fonte de verdade é o **Swagger ao
  vivo** em `http://localhost:3000/docs` (gerado a partir do código real) — ele nunca fica
  desatualizado em relação ao backend rodando.
