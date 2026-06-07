# FRONTEND INTEGRATION

Guia completo para o time de frontend integrar com a API.

---

## 1. URL base

```
Desenvolvimento: http://localhost:3000/api
Swagger:         http://localhost:3000/docs
WebSocket:       ws://localhost:3000/realtime
Uploads (dev):   http://localhost:3000/uploads/<key>
```

Todas as respostas seguem o envelope padrão (ver seção 7/10).

## 2. Como autenticar

```ts
const { data } = await axios.post('/api/auth/login', { email, password });
const { accessToken, refreshToken, user } = data.data;
// envie em todas as chamadas autenticadas:
axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
```

Guarde o `accessToken` em memória e o `refreshToken` de forma segura
(ex.: cookie httpOnly gerenciado pelo seu BFF, ou storage com cuidado).

## 3. Como renovar o token

O access token dura ~15min. Ao receber `401 UNAUTHORIZED`, chame:

```ts
const { data } = await axios.post('/api/auth/refresh', { refreshToken });
// substitua o par de tokens (o refresh anterior é invalidado — rotação)
```

Interceptor Axios sugerido:

```ts
axios.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const { data } = await axios.post('/api/auth/refresh', { refreshToken });
      setTokens(data.data);
      error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return axios(error.config);
    }
    return Promise.reject(error);
  },
);
```

## 4. Como enviar arquivos

`multipart/form-data` com o campo `file`:

```ts
const form = new FormData();
form.append('file', file);
await axios.post(`/api/vehicles/${id}/media/upload`, form, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

Documentos:

```ts
const form = new FormData();
form.append('file', file);
form.append('documentTypeId', typeId);
form.append('ownerType', 'VEHICLE');     // ou BUYER/SELLER/CUSTOMER
form.append('vehicleId', vehicleId);
await axios.post('/api/documents/upload', form);
```

Limites: `UPLOAD_MAX_SIZE` (10MB) e MIME types em `UPLOAD_ALLOWED_MIME`.
Erros: `UPLOAD_TOO_LARGE`, `UPLOAD_INVALID_TYPE`.

## 5. Como consumir paginação

Query params `page` (1-based), `limit` (máx 100), `sortBy`, `sortOrder`.
Resposta de lista:

```json
{
  "success": true,
  "data": [ /* itens */ ],
  "meta": { "page": 1, "limit": 20, "total": 100, "totalPages": 5, "timestamp": "..." }
}
```

## 6. Como aplicar filtros

Catálogo público (`GET /public/vehicles`) e listagem interna (`GET /vehicles`):

| Filtro | Param |
| --- | --- |
| Marca / Modelo | `brand`, `model` |
| Ano | `yearMin`, `yearMax` |
| Preço | `priceMin`, `priceMax` |
| Combustível / Câmbio | `fuel`, `transmission` |
| Cor / Categoria | `color`, `category` |
| Destaque | `featured=true` |
| Ordenação | `sortBy`, `sortOrder` |
| Paginação | `page`, `limit` |

`GET /public/filters` retorna os valores disponíveis para montar os selects.

## 7. Como tratar erros

```json
{
  "success": false,
  "error": { "code": "VEHICLE_NOT_FOUND", "message": "Veículo não encontrado.", "details": [] },
  "meta": { "timestamp": "...", "path": "/api/vehicles/xxx" }
}
```

Use `error.code` (estável) para lógica e `error.message` (pt-BR) para o usuário.
Erros de validação trazem a lista em `error.details`. Códigos comuns:
`VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`,
`INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, `INVALID_REFRESH_TOKEN`,
`VEHICLE_INVALID_STATUS_TRANSITION`, `PART_INSUFFICIENT_STOCK`, `RATE_LIMITED`.

## 8. Endpoints públicos

`GET /public/vehicles`, `/public/vehicles/featured`, `/public/vehicles/most-viewed`,
`/public/vehicles/:slug`, `/public/filters`, `/public/store/location`,
`POST /public/leads/specialist-contact`, `POST /public/tracking/vehicle-view`,
`POST /public/consents`, `PUT /public/marketing/preferences`.
Também públicos: `/auth/login|register|refresh|forgot-password|reset-password`,
`/vehicle-specs/*`, `/store/location`, `/consents`, `/tracking/vehicle-view`,
`/leads/specialist-contact`.

## 9. Endpoints privados

Todo o restante exige `Authorization: Bearer`. Ver `API_ENDPOINTS.md` e
`ROLES_AND_PERMISSIONS.md` para a matriz por papel.

## 10. Estrutura dos principais JSONs

**Veículo público** (catálogo):
```json
{
  "id": "uuid", "publicCode": "VEI-AB12CD", "slug": "vw-t-cross-2023",
  "brand": "Volkswagen", "model": "T-Cross", "version": "200 TSI",
  "modelYear": 2023, "manufactureYear": 2022, "category": "SUV",
  "color": "Prata", "fuel": "FLEX", "transmission": "AUTOMATIC",
  "doors": 4, "mileage": 32000, "seats": 5, "condition": "USED",
  "price": 119900, "featured": true, "available": true,
  "description": "...", "viewCount": 120, "favoriteCount": 8,
  "spec": { "engine": "1.0 TSI", "power": "128 cv", "safetyItems": ["ABS"] },
  "media": [ { "url": "...", "isMain": true, "position": 0 } ]
}
```

**Lead (specialist-contact):**
```json
{ "leadId": "uuid", "assignedSeller": { "id": "uuid", "name": "Carlos" },
  "whatsappUrl": "https://wa.me/5554999990002?text=...", "status": "ASSIGNED" }
```

**Localização da loja:**
```json
{ "name": "Auto Dealer", "phone": "...", "whatsapp": "...",
  "address": { "street": "...", "city": "...", "state": "RS", "zipCode": "..." },
  "coordinates": { "latitude": -29.16, "longitude": -51.17 },
  "openingHours": { "seg_sex": "08:00-18:00" },
  "googleMapsUrl": "...", "directionsUrl": "...", "socialLinks": { "instagram": "..." } }
```

## 11. Eventos em tempo real

Conecte via Socket.IO ou SSE (ver `REALTIME_EVENTS.md`).

```ts
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000/realtime', { auth: { token: accessToken } });
socket.on('dashboard.updated', () => refetchDashboard());
socket.on('lead.assigned', (m) => toast(`Novo lead!`, m.data));
```

## 12. Exemplos Axios e Fetch

```ts
// Axios
const api = axios.create({ baseURL: 'http://localhost:3000/api' });
api.defaults.headers.common.Authorization = `Bearer ${token}`;
const { data } = await api.get('/public/vehicles', { params: { brand: 'Volkswagen', page: 1 } });

// Fetch
const res = await fetch('http://localhost:3000/api/public/vehicles?brand=Volkswagen', {
  headers: { 'Content-Type': 'application/json' },
});
const json = await res.json(); // { success, data, meta }
```

## 13. Fluxo: cadastro de veículo

1. `POST /vehicles` com dados básicos → recebe `id`.
2. (opcional) `POST /vehicles/:id/apply-specs` para preencher a ficha técnica.
3. `POST /vehicles/:id/media/upload` para fotos.
4. `POST /vehicles/:id/status` `{ "status": "AVAILABLE" }` e `availableForAd: true`
   (via `PATCH /vehicles/:id`) para publicar.

## 14. Fluxo: preenchimento automático da ficha técnica

1. `GET /vehicle-specs/brands` → escolha a marca.
2. `GET /vehicle-specs/models?brandId=` → escolha o modelo.
3. `GET /vehicle-specs/years?modelId=` e `/versions?modelId=&year=`.
4. `POST /vehicles/:id/apply-specs` `{ brand, model, year, version, manualOverrides }`.
   Retorna `{ spec, source, providerMatched }`. Se `providerMatched=false`, edite
   manualmente via `PUT /vehicles/:id/spec` (fallback).

## 15. Fluxo: contato via WhatsApp

1. Usuário clica em **"Falar com especialista"** na página do veículo.
2. `POST /public/leads/specialist-contact { vehicleId, name, phone }`.
3. Abra `whatsappUrl` retornada em nova aba:
   `window.open(resp.data.whatsappUrl, '_blank')`.

## 16. Fluxo: favoritos

```ts
await api.post(`/favorites/${vehicleId}`);   // adicionar
await api.delete(`/favorites/${vehicleId}`); // remover
const { data } = await api.get('/favorites');
```
(Requer login como CUSTOMER.)

## 17. Fluxo: consentimento de cookies

```ts
await api.post('/consents', {
  sessionId, termsVersion: '1.0',
  consents: [
    { category: 'ESSENTIAL', granted: true },
    { category: 'ANALYTICS', granted: true },
    { category: 'MARKETING', granted: false },
    { category: 'LOCATION',  granted: false },
  ],
});
```
Localização só pode ser enviada (`POST /tracking/location`) se `LOCATION=granted`.

## 18. Fluxo: mapa da loja

```ts
const { data } = await api.get('/public/store/location');
// use data.data.coordinates para o mapa e data.data.directionsUrl no botão "Como chegar"
window.open(data.data.directionsUrl, '_blank');
```

## 19. Fluxo: dashboards

```ts
const admin  = await api.get('/dashboard/admin');   // ADMIN
const seller = await api.get('/dashboard/seller');  // SELLER
// assine 'dashboard.updated' no WebSocket para atualizar em tempo real
```

## 20. Regras para o frontend público

Nunca exiba campos internos. O catálogo público **já omite**:
`purchasePrice`, `suggestedPrice`, `minPrice`, `soldPrice`, `internalNotes`,
`plate`, `renavam`, `chassis`, `engineNumber`, custos e dados pessoais.
Use `price` (= valor anunciado) como único valor exibível. Para áreas internas
(admin/vendedor), use os endpoints autenticados (`/vehicles`) que retornam o
objeto completo.
