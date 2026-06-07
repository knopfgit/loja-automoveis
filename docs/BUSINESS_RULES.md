# BUSINESS RULES

Regras de negócio implementadas no backend.

## Ciclo do veículo (status)

```
DRAFT → AWAITING_INSPECTION → AWAITING_DOCUMENTS → IN_MAINTENANCE → AVAILABLE
AVAILABLE → RESERVED | NEGOTIATING | CONSIGNED | SOLD | ARCHIVED
RESERVED  → AVAILABLE | NEGOTIATING | SOLD
NEGOTIATING → AVAILABLE | RESERVED | SOLD
SOLD → DELIVERED → ARCHIVED
```

Transições inválidas retornam `VEHICLE_INVALID_STATUS_TRANSITION`. Toda mudança
gera `VehicleStockMovement` + auditoria + evento `vehicle.status_changed`.

## Estoque de peças

Movimentos que **aumentam**: `ENTRY`, `RETURN`, `CANCEL_RESERVE`, `REVERSAL`.
Movimentos que **diminuem**: `EXIT`, `RESERVE`, `APPLY_TO_VEHICLE`, `LOSS`.
`ADJUSTMENT` aceita quantidade com sinal. Saídas que zerariam o estoque abaixo de
zero são bloqueadas (`PART_INSUFFICIENT_STOCK`). `ENTRY` recalcula o **custo médio
ponderado**. Estoque ≤ mínimo dispara `part.stock_low` + notificação ao ADMIN.

## Manutenção → custos → DRE

- Ao **aplicar peça** (`POST /maintenances/:id/parts`): baixa de estoque
  (`APPLY_TO_VEHICLE`), cria `MaintenancePart`, lança despesa `Peças` na DRE e
  registra auditoria. Estorno (`DELETE .../parts/:id`) devolve estoque e remove o
  lançamento.
- Ao **finalizar** (`POST /maintenances/:id/complete`): lança a `Mão de obra`,
  atualiza custo total e prazos de revisão, emite `maintenance.completed` e
  recalcula a DRE.

## DRE por veículo

Calculada a partir dos `FinancialEntry` (status `CONFIRMED`) + `Commission`:

```
totalExpenses   = Σ despesas (exceto categoria "Comissão")     [inclui compra]
commissionTotal = Σ comissões do veículo (status ≠ CANCELED)
totalRevenue    = Σ receitas
grossProfit     = totalRevenue − totalExpenses
netProfit       = grossProfit − commissionTotal
profitMargin    = totalRevenue > 0 ? netProfit / totalRevenue × 100 : 0
daysInStock     = (soldAt | hoje) − entryDate
costPerDay      = totalInvested / max(1, daysInStock)
```

> Comissão é contabilizada **apenas** pela tabela `Commission` (nunca como
> `FinancialEntry`) para evitar dupla contagem. A compra entra como despesa
> `Compra do veículo` na confirmação da aquisição (fallback: `vehicle.purchasePrice`).

### Categorias canônicas
**Despesas:** Compra do veículo, Transporte, Guincho, Vistoria, Laudo cautelar,
Manutenção, Revisão, Peças, Mão de obra, Lavagem, Polimento, Funilaria, Pintura,
Documentação, Licenciamento, IPVA, Seguro, Taxas, Marketing, Comissão, Outros custos.
**Receitas:** Venda do veículo, Serviços adicionais, Garantia adicional, Outros recebimentos.

## Comissões

Tipos de regra (`CommissionRuleType`):
- `PERCENT_SALE` — `finalPrice × %`.
- `PERCENT_PROFIT` — `netProfit × %` (recalcula a DRE).
- `FIXED` — valor fixo.
- `PROGRESSIVE` — faixas `[{ min, max, percentage }]` sobre `finalPrice`.

Regra resolvida: regra padrão do vendedor → senão a regra `isDefault` da loja.
Gerada automaticamente ao concluir a venda; status
`PENDING → APPROVED → PAID` (ou `CANCELED`). Ajuste manual exige justificativa
(auditada). Vendedor vê **apenas** as próprias comissões.

## Venda

`LEAD_CREATED → CONTACT_STARTED → NEGOTIATING → AWAITING_CUSTOMER_DOCUMENTS →
AWAITING_PAYMENT → AWAITING_TRANSFER → READY_FOR_DELIVERY → COMPLETED | CANCELED`.

Ao **COMPLETED**: exige `finalPrice`, marca o veículo como `SOLD` (`soldPrice`,
`soldAt`), lança receita `Venda do veículo`, gera comissão, emite `sale.completed`
e recalcula a DRE. Ao cancelar, o veículo volta a `AVAILABLE` (se possível).

## Reserva

Cria reserva (validade `RESERVATION_DEFAULT_DAYS`), move o veículo para `RESERVED`.
Cancelamento devolve a `AVAILABLE`. Job horário expira reservas vencidas.

## Leads & "Falar com especialista"

`POST /leads/specialist-contact` (público): registra o lead, associa o veículo,
atribui um vendedor (`round_robin` ou `least_busy`), monta a URL do WhatsApp
(`wa.me/<DDI><numero>?text=...`), notifica o vendedor e retorna
`{ leadId, assignedSeller, whatsappUrl, status }`. Status do lead:
`NEW → ASSIGNED → CONTACTED → NEGOTIATING → CONVERTED | LOST`.

## Documentos

Tipos e checklists são **configuráveis** pelo ADMIN (sem regras fixas). O status
do checklist por etapa lista os documentos pendentes. Download de documentos é
restrito; o cliente acessa apenas os próprios. Jobs marcam documentos vencidos e
alertam sobre vencimentos próximos. **Não há aconselhamento jurídico automático.**

## LGPD / Privacidade

Consentimento por categoria (`ESSENTIAL`, `ANALYTICS`, `LOCATION`, `MARKETING`)
com versão dos termos, IP **hasheado** e user agent. Localização só é gravada com
consentimento `LOCATION`. Cliente pode exportar seus dados e solicitar exclusão
(job de anonimização diário). Endpoints públicos nunca expõem dados pessoais nem
campos internos do veículo.

## Campos nunca expostos publicamente

`purchasePrice`, `suggestedPrice`, `minPrice`, `soldPrice`, `internalNotes`,
`plate`, `renavam`, `chassis`, `engineNumber`, custos/aquisição, documentos
privados e dados pessoais. Veja `vehicles.serializer.ts`.
