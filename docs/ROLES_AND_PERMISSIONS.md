# ROLES AND PERMISSIONS

RBAC com três perfis principais (`UserRole`): `ADMIN`, `SELLER`, `CUSTOMER`.
O controle é feito por `JwtAuthGuard` (autenticação) + `RolesGuard` (autorização),
ambos globais. Rotas marcadas com `@Public()` dispensam autenticação.

Existe ainda uma camada configurável de `Role`/`Permission` (tabelas) que o ADMIN
pode gerenciar para granularidade futura (`/api/roles`, `/api/permissions`).

## ADMIN
Acesso total. Destaques:
- Faturamento, lucro total e por veículo, DRE consolidada.
- Vendas por período e por vendedor; comissões (todas).
- CRUD de veículos, peças, manutenções, documentos, despesas/receitas.
- Cadastro de funcionários e regras de comissão.
- Histórico de alterações (auditoria), dashboards, relatórios.
- Configuração da loja e integrações; gestão de permissões.

## SELLER (vendedor)
- Cadastrar/editar veículos (regra de negócio), ver disponíveis.
- Cadastrar clientes; registrar leads e oportunidades.
- Atualizar etapas da negociação; acompanhar documentação.
- Consultar **apenas as próprias** vendas e comissões.
- Ver seus leads e alertas; registrar observações internas.
- **Não** acessa faturamento geral, comissões de terceiros nem configurações.

## CUSTOMER (cliente)
- Criar/atualizar/consultar os próprios dados.
- Favoritar veículos; ver histórico de veículos acessados.
- Solicitar contato com especialista.
- Opt-in/opt-out de comunicações promocionais.
- Enviar documentos solicitados e consultar status da documentação da sua compra.
- Consultar os próprios atendimentos.

## Matriz resumida (principais grupos)

| Recurso | ADMIN | SELLER | CUSTOMER | Público |
| --- | :---: | :---: | :---: | :---: |
| `/public/*` | ✓ | ✓ | ✓ | ✓ |
| `/auth/*` | ✓ | ✓ | ✓ | login/registro |
| `/vehicles` (interno) | ✓ | ✓ | — | — |
| `/vehicles/:id/archive` | ✓ | — | — | — |
| `/employees` | ✓ | — | — | — |
| `/customers` (gestão) | ✓ | ✓ | — | — |
| `/customers/me` | — | — | ✓ | — |
| `/parts`, `/suppliers` (escrita) | ✓ | — | — | — |
| `/maintenances` | ✓ | ✓ | — | — |
| `/documents` (gestão) | ✓ | ✓ | — | — |
| `/me/documents` | — | — | ✓ | — |
| `/acquisitions` | ✓ | — | — | — |
| `/reservations` | ✓ | ✓ | — | — |
| `/sales` | ✓ | ✓ (próprias) | — | — |
| `/financial-entries`, `/dre/*` | ✓ | — | — | — |
| `/commission-rules` | ✓ | — | — | — |
| `/commissions` (todas) | ✓ | — | — | — |
| `/commissions/me` | — | ✓ | — | — |
| `/leads` | ✓ | ✓ (próprios) | — | — |
| `/favorites`, `/marketing/*`, `/privacy/*` | — | — | ✓ | — |
| `/dashboard/admin` | ✓ | — | — | — |
| `/dashboard/seller` | — | ✓ | — | — |
| `/reports/*` | ✓ | — | — | — |
| `/store/config` | ✓ | — | — | — |
| `/store/location` | ✓ | ✓ | ✓ | ✓ |
| `/audit-logs` | ✓ | — | — | — |

## Como aplicar no código

```ts
@Roles('ADMIN')                 // só admin
@Roles('ADMIN', 'SELLER')       // admin ou vendedor
@Public()                       // sem autenticação
```

`@CurrentUser()` injeta `{ userId, email, role, employeeId, customerId }`.
Vendedores são filtrados por `employeeId` para verem apenas seus dados.
