import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { formatCurrency, formatDate } from '../utils/format';
import { EmptyState, ErrorState, LoadingState } from './State';

/* ----------------------------------------------------------------- Page / Card */

export function Page({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="page">
      <section className="section compact">
        <div className="section-header">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h1>{title}</h1>
          </div>
          {actions && <div className="toolbar">{actions}</div>}
        </div>
        {children}
      </section>
    </div>
  );
}

export function Card({
  title,
  subtitle,
  actions,
  soft = true,
  children,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  soft?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`ui-card ${soft ? 'glass-soft' : 'glass'}`}>
      {(title || actions) && (
        <div className="ui-card-head">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p className="hint">{subtitle}</p>}
          </div>
          {actions && <div className="toolbar">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------- Stats */

export type Tone = 'brand' | 'ok' | 'warn' | 'danger' | 'neutral';

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="metric-grid">{children}</div>;
}

export function Stat({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <div className={`metric tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {hint && <small className="hint">{hint}</small>}
    </div>
  );
}

/* ----------------------------------------------------------------- Badge */

const TONE_BY_STATUS: Record<string, Tone> = {};
const ok = ['AVAILABLE', 'APPROVED', 'PAID', 'COMPLETED', 'CONFIRMED', 'ACTIVE', 'CONVERTED', 'RECEIVED', 'DELIVERED', 'READY_FOR_DELIVERY'];
const warn = ['PENDING', 'RESERVED', 'NEGOTIATING', 'IN_MAINTENANCE', 'SCHEDULED', 'IN_PROGRESS', 'UNDER_REVIEW', 'NEW', 'ASSIGNED', 'CONTACTED', 'DRAFT', 'PENDING_REQUEST', 'AWAITING_INSPECTION', 'AWAITING_DOCUMENTS', 'AWAITING_PARTS', 'AWAITING_PAYMENT', 'AWAITING_TRANSFER', 'AWAITING_CUSTOMER_DOCUMENTS', 'CONSIGNED', 'LEAD_CREATED', 'CONTACT_STARTED'];
const danger = ['CANCELED', 'REJECTED', 'EXPIRED', 'LOST', 'BLOCKED', 'INACTIVE', 'ARCHIVED'];
ok.forEach((s) => (TONE_BY_STATUS[s] = 'ok'));
warn.forEach((s) => (TONE_BY_STATUS[s] = 'warn'));
danger.forEach((s) => (TONE_BY_STATUS[s] = 'danger'));

export function Badge({ value, tone }: { value: ReactNode; tone?: Tone }) {
  const resolved = tone ?? (typeof value === 'string' ? TONE_BY_STATUS[value] ?? 'brand' : 'brand');
  return <span className={`badge tone-${resolved}`}>{value}</span>;
}

/* ----------------------------------------------------------------- Tabs */

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={`tab ${active === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- Cell formatting */

const CURRENCY_HINT = /(price|amount|cost|value|profit|revenue|total|salary|deposit|margin|invested|expense|commission|labor|down|final|negotiated|announced|fipe)/i;
const DATE_HINT = /(date|at$|atendimento|expires|forecast|admission|birth|created|updated|processed)/i;

export function formatCell(key: string, value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (typeof value === 'number') {
    if (CURRENCY_HINT.test(key)) return formatCurrency(value);
    if (/margin|rate|percent/i.test(key)) return `${value}%`;
    return value.toLocaleString('pt-BR');
  }
  if (typeof value === 'string') {
    if (DATE_HINT.test(key) && /\d{4}-\d{2}-\d{2}/.test(value)) return formatDate(value);
    if (TONE_BY_STATUS[value] || /^[A-Z][A-Z_]{2,}$/.test(value)) return <Badge value={value} />;
    return value;
  }
  if (Array.isArray(value)) return `${value.length} item(ns)`;
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    return String(obj.name ?? obj.fullName ?? obj.title ?? obj.label ?? `${Object.keys(obj).length} campos`);
  }
  return String(value);
}

const PRETTY: Record<string, string> = {
  id: 'ID', brand: 'Marca', model: 'Modelo', version: 'Versão', status: 'Status', price: 'Preço',
  modelYear: 'Ano', manufactureYear: 'Fabricação', mileage: 'Km', color: 'Cor', fuel: 'Combustível',
  transmission: 'Câmbio', fullName: 'Nome', name: 'Nome', email: 'E-mail', phone: 'Telefone',
  whatsapp: 'WhatsApp', document: 'Documento', cpf: 'CPF', role: 'Perfil', position: 'Cargo',
  createdAt: 'Criado em', updatedAt: 'Atualizado em', amount: 'Valor', category: 'Categoria',
  nature: 'Natureza', description: 'Descrição', type: 'Tipo', quantity: 'Qtde', minQuantity: 'Mínimo',
  costPrice: 'Custo', location: 'Local', sku: 'SKU', internalCode: 'Código', date: 'Data',
  finalPrice: 'Valor final', negotiatedPrice: 'Negociado', saleDate: 'Data venda', netProfit: 'Lucro líq.',
  grossProfit: 'Lucro bruto', totalRevenue: 'Receita', totalExpenses: 'Despesas', totalInvested: 'Investido',
  daysInStock: 'Dias estoque', profitMargin: 'Margem', expiryDate: 'Vencimento', issueDate: 'Emissão',
  ownerType: 'Dono', supplierId: 'Fornecedor', vehicleId: 'Veículo', customerId: 'Cliente',
  sellerId: 'Vendedor', active: 'Ativo', required: 'Obrigatório', stage: 'Etapa', code: 'Código',
  laborCost: 'Mão de obra', workshop: 'Oficina', mainImage: 'Foto', action: 'Ação', entity: 'Entidade',
  reason: 'Motivo', notes: 'Obs.', percentage: 'Percentual', fixedAmount: 'Valor fixo', isDefault: 'Padrão',
  unit: 'Un.', barcode: 'Cód. barras', compatibleModel: 'Compatível', personType: 'Tipo pessoa',
  birthDate: 'Nascimento', marketingConsent: 'Marketing', city: 'Cidade', state: 'UF', read: 'Lida',
  title: 'Título', message: 'Mensagem', publicCode: 'Código', viewCount: 'Views', favoriteCount: 'Favoritos',
};

export function prettyKey(key: string) {
  return PRETTY[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

/* ----------------------------------------------------------------- Table */

export type Column<T> = {
  key: string;
  label?: string;
  render?: (row: T) => ReactNode;
  align?: 'right' | 'center';
};

type QueryLike<T> = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data?: { items: T[] } | undefined;
};

export function Table<T extends Record<string, unknown>>({
  query,
  rows,
  columns,
  actions,
  empty = 'Nenhum registro encontrado.',
  maxAutoCols = 6,
  hideKeys = ['id', 'createdAt', 'updatedAt', 'deletedAt'],
}: {
  query?: QueryLike<T>;
  rows?: T[];
  columns?: Column<T>[];
  actions?: (row: T) => ReactNode;
  empty?: string;
  maxAutoCols?: number;
  hideKeys?: string[];
}) {
  if (query?.isLoading) return <LoadingState />;
  if (query?.isError) return <ErrorState error={query.error} />;
  const data = rows ?? query?.data?.items ?? [];
  if (data.length === 0) return <EmptyState title={empty} />;

  const cols: Column<T>[] =
    columns ??
    Object.keys(data[0])
      .filter((key) => !hideKeys.includes(key) && typeof (data[0] as Record<string, unknown>)[key] !== 'object')
      .slice(0, maxAutoCols)
      .map((key) => ({ key }));

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {cols.map((col) => (
              <th key={col.key} className={col.align ? `col-${col.align}` : ''}>
                {col.label ?? prettyKey(col.key)}
              </th>
            ))}
            {actions && <th className="col-right">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={String((row as Record<string, unknown>).id ?? index)}>
              {cols.map((col) => (
                <td key={col.key} className={col.align ? `col-${col.align}` : ''}>
                  {col.render ? col.render(row) : formatCell(col.key, (row as Record<string, unknown>)[col.key])}
                </td>
              ))}
              {actions && <td className="row-actions col-right">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ----------------------------------------------------------------- DetailGrid */

export function DetailGrid({
  data,
  only,
  hide = ['id', 'password'],
}: {
  data?: Record<string, unknown> | null;
  only?: string[];
  hide?: string[];
}) {
  if (!data) return null;
  const entries = (only ?? Object.keys(data))
    .filter((key) => !hide.includes(key))
    .map((key) => [key, data[key]] as const);
  return (
    <div className="detail-grid">
      {entries.map(([key, value]) => (
        <div key={key}>
          <strong>{prettyKey(key)}</strong>
          <span>{formatCell(key, value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- Form helpers */

export function FormGrid({ children, cols = 3 }: { children: ReactNode; cols?: number }) {
  return (
    <div className="form-grid" style={{ ['--cols' as string]: cols }}>
      {children}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

/* ----------------------------------------------------------------- Drawer */

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer glass" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <header className="drawer-head">
          <div>
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            <h2>{title}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>
        <div className="drawer-body">{children}</div>
        {footer && <footer className="drawer-foot">{footer}</footer>}
      </aside>
    </div>
  );
}

/* ----------------------------------------------------------------- Enum select options */

export const ENUMS = {
  VehicleStatus: ['DRAFT', 'AWAITING_INSPECTION', 'AWAITING_DOCUMENTS', 'IN_MAINTENANCE', 'AVAILABLE', 'RESERVED', 'NEGOTIATING', 'SOLD', 'DELIVERED', 'CONSIGNED', 'ARCHIVED'],
  FuelType: ['GASOLINE', 'ETHANOL', 'FLEX', 'DIESEL', 'ELECTRIC', 'HYBRID', 'GNV'],
  Transmission: ['MANUAL', 'AUTOMATIC', 'CVT', 'AUTOMATED', 'DUAL_CLUTCH'],
  SaleStatus: ['LEAD_CREATED', 'CONTACT_STARTED', 'NEGOTIATING', 'AWAITING_CUSTOMER_DOCUMENTS', 'AWAITING_PAYMENT', 'AWAITING_TRANSFER', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELED'],
  PaymentMethod: ['CASH', 'PIX', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'FINANCING', 'CHECK', 'BANK_SLIP', 'TRADE_IN'],
  AcquisitionType: ['OWN_PURCHASE', 'CONSIGNMENT', 'TRADE_IN'],
  MaintenanceType: ['PREVENTIVE', 'CORRECTIVE', 'REVISION', 'AESTHETIC', 'INSPECTION', 'OTHER'],
  PartMovementType: ['ENTRY', 'EXIT', 'ADJUSTMENT', 'RESERVE', 'CANCEL_RESERVE', 'APPLY_TO_VEHICLE', 'REVERSAL', 'LOSS', 'RETURN'],
  DocumentOwnerType: ['VEHICLE', 'BUYER', 'SELLER', 'CUSTOMER'],
  ChecklistStage: ['PURCHASE', 'STOCK_ENTRY', 'AD_PREPARATION', 'RESERVATION', 'SALE', 'TRANSFER', 'DELIVERY', 'AFTER_SALES'],
  DocumentStatus: ['NOT_REQUESTED', 'PENDING_REQUEST', 'RECEIVED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED', 'NOT_APPLICABLE'],
  LeadStatus: ['NEW', 'ASSIGNED', 'CONTACTED', 'NEGOTIATING', 'CONVERTED', 'LOST'],
  CommissionRuleType: ['PERCENT_SALE', 'PERCENT_PROFIT', 'FIXED', 'PROGRESSIVE'],
  FinancialNature: ['REVENUE', 'EXPENSE'],
  UserRole: ['ADMIN', 'SELLER'],
  PersonType: ['INDIVIDUAL', 'COMPANY'],
} as const;

export function EnumOptions({ values, placeholder }: { values: readonly string[]; placeholder?: string }) {
  return (
    <>
      {placeholder && <option value="">{placeholder}</option>}
      {values.map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </>
  );
}
