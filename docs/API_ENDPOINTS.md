# API ENDPOINTS

Base URL: `http://localhost:3000/api` (Swagger interativo em `/docs`).
Todas as respostas seguem o envelope `{ success, data, meta }`.
🔓 = público · 🔐 = autenticado · papéis indicados quando restrito.

## Auth
| Método | Rota | Acesso |
| --- | --- | --- |
| POST | `/auth/register` | 🔓 cria CUSTOMER |
| POST | `/auth/login` | 🔓 |
| POST | `/auth/refresh` | 🔓 |
| POST | `/auth/logout` | 🔐 |
| POST | `/auth/logout-all` | 🔐 |
| POST | `/auth/forgot-password` | 🔓 |
| POST | `/auth/reset-password` | 🔓 |
| POST | `/auth/change-password` | 🔐 |
| GET | `/auth/me` | 🔐 |

## Users & RBAC (ADMIN)
| Método | Rota |
| --- | --- |
| GET | `/users` |
| PATCH | `/users/:id/status` |
| GET | `/users/:id/login-history` |
| PATCH | `/users/:id/role-profile` |
| GET/POST | `/roles` |
| PATCH | `/roles/:id/permissions` |
| DELETE | `/roles/:id` |
| GET/POST | `/permissions` |

## Employees (ADMIN)
`POST /employees` · `GET /employees` · `GET /employees/:id` · `PATCH /employees/:id` · `DELETE /employees/:id`

## Customers
| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/customers/me` | CUSTOMER |
| PATCH | `/customers/me` | CUSTOMER |
| POST | `/customers/me/addresses` | CUSTOMER |
| POST | `/customers` | ADMIN, SELLER |
| GET | `/customers` | ADMIN, SELLER |
| GET | `/customers/:id` | ADMIN, SELLER |
| PATCH | `/customers/:id` | ADMIN, SELLER |
| POST/PATCH/DELETE | `/customers/:id/addresses[/:addressId]` | ADMIN, SELLER |

## Vehicle Specs (catálogo / ficha técnica)
| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/vehicle-specs/brands` | 🔓 |
| GET | `/vehicle-specs/models?brandId=` | 🔓 |
| GET | `/vehicle-specs/years?modelId=` | 🔓 |
| GET | `/vehicle-specs/versions?modelId=&year=` | 🔓 |
| GET | `/vehicle-specs/search?brand=&model=&year=&version=` | 🔓 |

## Vehicles (ADMIN, SELLER)
| Método | Rota |
| --- | --- |
| POST | `/vehicles` |
| GET | `/vehicles` (filtros + paginação) |
| GET | `/vehicles/:id` |
| PATCH | `/vehicles/:id` |
| POST | `/vehicles/:id/archive` (ADMIN) |
| POST | `/vehicles/:id/status` (estoque) |
| GET | `/vehicles/:id/stock-movements` |
| POST | `/vehicles/:id/apply-specs` |
| PUT | `/vehicles/:id/spec` |
| POST | `/vehicles/:id/media` |
| POST | `/vehicles/:id/media/upload` (multipart) |
| PATCH | `/vehicles/:id/media/reorder` |
| DELETE | `/vehicles/:id/media/:mediaId` |

## Parts & Suppliers
| Método | Rota | Acesso |
| --- | --- | --- |
| POST | `/parts` | ADMIN |
| GET | `/parts?lowStock=true` | ADMIN, SELLER |
| GET | `/parts/:id` | ADMIN, SELLER |
| PATCH | `/parts/:id` | ADMIN |
| POST | `/parts/:id/movements` | ADMIN |
| GET | `/parts/:id/movements` | ADMIN, SELLER |
| POST/GET | `/suppliers` | ADMIN / ADMIN,SELLER |
| PATCH/DELETE | `/suppliers/:id` | ADMIN |

## Maintenance (ADMIN, SELLER)
`POST /maintenances` · `GET /maintenances` · `GET /maintenances/:id` · `PATCH /maintenances/:id`
`POST /maintenances/:id/parts` · `DELETE /maintenances/:id/parts/:maintenancePartId`
`POST /maintenances/:id/complete` · `POST /maintenances/:id/cancel`

## Documents
| Método | Rota | Acesso |
| --- | --- | --- |
| GET | `/document-types` | ADMIN, SELLER |
| POST/PATCH | `/document-types[/:id]` | ADMIN |
| GET | `/document-checklists?stage=` | ADMIN, SELLER |
| PUT/DELETE | `/document-checklists[/:id]` | ADMIN |
| GET | `/document-checklists/status?stage=&vehicleId=` | ADMIN, SELLER |
| POST | `/documents` | ADMIN, SELLER |
| POST | `/documents/upload` (multipart) | 🔐 |
| POST | `/documents/:id/validate` | ADMIN, SELLER |
| GET | `/documents` | ADMIN, SELLER |
| GET | `/documents/:id` | 🔐 |
| GET | `/documents/:id/download` | 🔐 (cliente só os próprios) |
| POST | `/me/documents/upload` | CUSTOMER |
| GET | `/me/documents` | CUSTOMER |

## Commercial
| Método | Rota | Acesso |
| --- | --- | --- |
| POST/GET | `/acquisitions` | ADMIN |
| GET | `/acquisitions/:vehicleId` | ADMIN |
| POST/GET | `/reservations` | ADMIN, SELLER |
| PATCH | `/reservations/:id/cancel` | ADMIN, SELLER |
| POST/GET | `/sales` | ADMIN, SELLER |
| GET | `/sales/:id` | ADMIN, SELLER |
| PATCH | `/sales/:id` | ADMIN, SELLER |
| PATCH | `/sales/:id/status` | ADMIN, SELLER |
| PATCH | `/sales/:id/deliver` | ADMIN, SELLER |

## Financial & DRE (ADMIN)
`POST/GET/DELETE /financial-entries` · `GET /dre/consolidated` ·
`GET /dre/vehicle/:vehicleId[/detailed]` · `POST /dre/vehicle/:vehicleId/recalculate`

## Commissions
| Método | Rota | Acesso |
| --- | --- | --- |
| POST/GET/PATCH | `/commission-rules` | ADMIN |
| GET | `/commissions/me` | SELLER |
| GET | `/commissions` | ADMIN |
| PATCH | `/commissions/:id/approve\|pay\|cancel\|adjust` | ADMIN |

## Leads
| Método | Rota | Acesso |
| --- | --- | --- |
| POST | `/leads/specialist-contact` | 🔓 |
| GET | `/leads` | ADMIN, SELLER (vendedor: próprios) |
| GET | `/leads/:id` | ADMIN, SELLER |
| PATCH | `/leads/:id/status` | ADMIN, SELLER |
| POST | `/leads/:id/interactions` | ADMIN, SELLER |

## Privacy / Tracking / Favorites (LGPD)
| Método | Rota | Acesso |
| --- | --- | --- |
| POST | `/consents` | 🔓 |
| GET/PUT | `/consents/me` | 🔐 |
| POST | `/tracking/vehicle-view` | 🔓 |
| POST | `/tracking/location` | 🔐 |
| POST/DELETE | `/favorites/:vehicleId` | CUSTOMER |
| GET | `/favorites` | CUSTOMER |
| GET | `/me/view-history` | CUSTOMER |
| PUT | `/marketing/preferences` | CUSTOMER |
| POST | `/privacy/export-request` | CUSTOMER |
| POST | `/privacy/delete-request` | CUSTOMER |

## Dashboard
`GET /dashboard/admin` (ADMIN) · `GET /dashboard/seller` (SELLER)

## Store
`GET /store/location` (🔓) · `GET /store/config` (ADMIN) · `PUT /store/config` (ADMIN)

## Notifications (🔐)
`GET /notifications` · `GET /notifications/unread-count` ·
`PATCH /notifications/:id/read` · `PATCH /notifications/read-all`

## Reports (ADMIN, `?format=json|csv`)
`/reports/vehicles-stock` · `/reports/vehicles-sold` · `/reports/vehicles-available` ·
`/reports/vehicles-stale` · `/reports/dre-consolidated` · `/reports/dre-vehicle/:id` ·
`/reports/sales-by-period` · `/reports/sales-by-seller` · `/reports/commissions` ·
`/reports/documents-pending` · `/reports/documents-expiring` · `/reports/maintenances` ·
`/reports/future-revisions` · `/reports/parts-stock` · `/reports/parts-low-stock` ·
`/reports/leads` · `/reports/conversions` · `/reports/marketing-interested`

## Audit (ADMIN)
`GET /audit-logs?entity=&entityId=&actorId=&action=`

## Realtime
`GET /realtime/stream` (SSE, ADMIN/SELLER) · WebSocket namespace `/realtime`

## Public (🔓)
`GET /public/vehicles` · `GET /public/vehicles/featured` · `GET /public/vehicles/most-viewed` ·
`GET /public/vehicles/:slug` · `GET /public/filters` · `GET /public/store/location` ·
`POST /public/leads/specialist-contact` · `POST /public/tracking/vehicle-view` ·
`POST /public/consents` · `PUT /public/marketing/preferences`
