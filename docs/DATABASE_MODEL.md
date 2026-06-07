# DATABASE MODEL

PostgreSQL + Prisma. Chaves primárias UUID. Valores monetários `Decimal(14,2)`.
Schema completo em [`prisma/schema.prisma`](../prisma/schema.prisma).

## Entidades

### Identidade & acesso
- **User** — credenciais, papel (`UserRole`), status, bloqueio de login.
- **Role / Permission / RolePermission** — RBAC configurável.
- **RefreshToken** — sessões revogáveis (hash).
- **PasswordResetToken** — recuperação de senha.
- **LoginHistory** — auditoria de logins.
- **Employee** — funcionário/vendedor (1:1 com User).
- **Customer** — cliente PF/PJ (1:1 opcional com User).
- **Address** — endereços do cliente.

### Loja
- **Store** — dados, localização (lat/lng), horários, redes sociais, integrações.

### Veículos
- **Vehicle** — identificação + dados comerciais (internos) + métricas.
- **VehicleSpec** — ficha técnica (1:1), com origem por campo e sincronização.
- **VehicleMedia** — fotos/vídeos ordenados.
- **VehicleStockMovement** — histórico de estoque/status.
- **VehicleAcquisition** — compra do veículo (1:1).
- **VehicleReservation** — reservas.
- **VehicleSale** — vendas.

### Financeiro
- **FinancialEntry** — lançamentos (receita/despesa) por veículo.
- **VehicleDre** — DRE agregada por veículo (recalculada).
- **CommissionRule / Commission** — regras e comissões geradas.

### Peças & manutenção
- **Supplier** — fornecedores.
- **Part / PartStockMovement** — estoque de peças e movimentações.
- **Maintenance / MaintenancePart** — manutenções e peças aplicadas.

### Documentos
- **DocumentType** — tipos configuráveis (veículo/comprador/vendedor).
- **DocumentChecklist** — checklist por etapa.
- **Document / DocumentVersion** — documentos e versões.

### Leads & marketing
- **Lead / LeadInteraction** — leads e interações.
- **Favorite** — favoritos do cliente.
- **VehicleView** — visualizações (IP com hash).
- **CookieConsent** — consentimentos LGPD (inclui localização).
- **MarketingPreference** — preferências/interesses do cliente.
- **PrivacyRequest** — solicitações de exportação/exclusão.

### Operacional
- **Notification** — notificações in-app.
- **EmailQueue** — fila de e-mails (envio assíncrono).
- **AuditLog** — trilha de auditoria (antes/depois, ator, IP, origem).

## Relações principais

```
User 1—1 Employee
User 1—1 Customer
Vehicle 1—1 VehicleSpec
Vehicle 1—1 VehicleAcquisition
Vehicle 1—1 VehicleDre
Vehicle 1—* VehicleMedia / StockMovement / FinancialEntry / Maintenance /
           Document / Reservation / Sale / Lead / Favorite / VehicleView
Employee 1—* VehicleSale / Commission / Lead
Customer 1—* Address / Sale / Reservation / Favorite / Document / Lead
VehicleSale 1—1 Commission
Maintenance 1—* MaintenancePart *—1 Part
Part 1—* PartStockMovement
DocumentType 1—* Document / DocumentChecklist
Document 1—* DocumentVersion
CommissionRule 1—* Commission / Employee(default)
```

## Índices

Definidos para os campos mais consultados:
`slug`, `plate`, `renavam`, `chassis` (únicos); `status`, `brand`, `model`,
`modelYear`, `announcedPrice`, `viewCount`, `featured`, `availableForAd`;
`createdById`, `customerId`, `sellerId`/`assignedSellerId`; datas (`createdAt`,
`saleDate`, `expiresAt`, `expiryDate`); `Part.quantity`; `Commission.status`;
`Lead.status`; `AuditLog(entity, entityId, action, createdAt)`.

## Enums (resumo)

`UserRole`, `UserStatus`, `PersonType`, `VehicleStatus`, `VehicleCondition`,
`VehicleOrigin`, `FuelType`, `Transmission`, `SpecSource`, `StockMovementType`,
`PartStatus`, `PartMovementType`, `MaintenanceStatus`, `MaintenanceType`,
`DocumentOwnerType`, `DocumentStatus`, `ChecklistStage`, `AcquisitionType`,
`AcquisitionStatus`, `ReservationStatus`, `SaleStatus`, `PaymentMethod`,
`FinancialNature`, `FinancialOrigin`, `FinancialStatus`, `CommissionRuleType`,
`CommissionStatus`, `LeadStatus`, `LeadOrigin`, `ConsentCategory`,
`NotificationChannel`, `NotificationStatus`, `EmailStatus`, `AuditAction`,
`PrivacyRequestType`, `PrivacyRequestStatus`.
