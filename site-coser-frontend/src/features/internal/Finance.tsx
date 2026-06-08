import { useState } from 'react';
import type { FormEvent } from 'react';
import { BadgeCheck, Ban, Banknote, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useApiMutation, useItem, useList } from '../../services/data';
import { Badge, Card, DetailGrid, Drawer, ENUMS, EnumOptions, Field, FormGrid, Page, Stat, StatGrid, Table, Tabs } from '../../components/ui';
import { ErrorState, LoadingState } from '../../components/State';
import { useAuth } from '../auth/AuthProvider';
import { formatCurrency } from '../../utils/format';
import { OptionList, useVehicleOptions } from './shared';

type Row = Record<string, unknown> & { id: string };

function sellerName(row: Row) {
  const seller = row.seller as Record<string, unknown> | undefined;
  return seller ? String(seller.fullName ?? '—') : String(row.sellerId ?? '—');
}
function vehicleName(row: Row) {
  const vehicle = row.vehicle as Record<string, unknown> | undefined;
  return vehicle ? `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() : '—';
}

/* ------------------------------------------------------------ Commissions */

export function CommissionsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const endpoint = isAdmin ? '/commissions' : '/commissions/me';
  const listQuery = useList<Row>(['commissions', endpoint], endpoint);

  const approve = useApiMutation((id: string) => api.patch(`/commissions/${id}/approve`), { invalidate: [['commissions', endpoint]] });
  const pay = useApiMutation((id: string) => api.patch(`/commissions/${id}/pay`), { invalidate: [['commissions', endpoint]] });
  const cancel = useApiMutation((id: string) => api.patch(`/commissions/${id}/cancel`, { reason: 'Cancelada no painel' }), { invalidate: [['commissions', endpoint]] });

  return (
    <Page eyebrow={isAdmin ? 'Financeiro · todas' : 'Minhas comissões'} title="Comissões">
      <Card>
        <Table
          query={listQuery}
          columns={[
            ...(isAdmin ? [{ key: 'seller', label: 'Vendedor', render: sellerName }] : []),
            { key: 'vehicle', label: 'Veículo', render: vehicleName },
            { key: 'amount', label: 'Valor', align: 'right' as const, render: (row: Row) => formatCurrency(Number(row.amount ?? 0)) },
            { key: 'status', label: 'Status', render: (row: Row) => <Badge value={String(row.status ?? '—')} /> },
          ]}
          actions={
            isAdmin
              ? (row) => (
                  <>
                    {row.status === 'PENDING' && (
                      <button className="button button-ghost" onClick={() => approve.mutate(row.id)}>
                        <BadgeCheck size={15} /> Aprovar
                      </button>
                    )}
                    {row.status === 'APPROVED' && (
                      <button className="button button-ghost" onClick={() => pay.mutate(row.id)}>
                        <Banknote size={15} /> Pagar
                      </button>
                    )}
                    {(row.status === 'PENDING' || row.status === 'APPROVED') && (
                      <button className="button button-ghost" onClick={() => cancel.mutate(row.id)}>
                        <Ban size={15} /> Cancelar
                      </button>
                    )}
                  </>
                )
              : undefined
          }
        />
      </Card>
    </Page>
  );
}

/* ------------------------------------------------------------ DRE */

type Consolidated = {
  totals: { totalRevenue: number; totalExpenses: number; grossProfit: number; commissionTotal: number; netProfit: number; vehicles: number };
  mostProfitable: { vehicle: string; netProfit: number }[];
  longestInStock: { vehicle: string; daysInStock: number }[];
  highestCost: { vehicle: string; totalInvested: number }[];
};

export function DrePage() {
  const [tab, setTab] = useState('consolidated');
  const [vehicleId, setVehicleId] = useState('');
  const consolidated = useItem<Consolidated>(['dre'], '/dre/consolidated', tab === 'consolidated');
  const vehicles = useVehicleOptions(tab === 'vehicle');
  const perVehicle = useItem<Record<string, unknown>>(['dre', vehicleId], `/dre/vehicle/${vehicleId}`, tab === 'vehicle' && Boolean(vehicleId));
  const recalc = useApiMutation(() => api.post(`/dre/vehicle/${vehicleId}/recalculate`), { invalidate: [['dre', vehicleId], ['dre']] });

  return (
    <Page eyebrow="Financeiro" title="DRE — Demonstrativo de resultado">
      <Tabs active={tab} onChange={setTab} tabs={[{ id: 'consolidated', label: 'Consolidada' }, { id: 'vehicle', label: 'Por veículo' }]} />

      {tab === 'consolidated' && (
        <>
          {consolidated.isLoading && <LoadingState />}
          {consolidated.isError && <ErrorState error={consolidated.error} />}
          {consolidated.data && (
            <>
              <StatGrid>
                <Stat tone="ok" label="Receita total" value={formatCurrency(consolidated.data.totals.totalRevenue)} />
                <Stat tone="neutral" label="Despesas" value={formatCurrency(consolidated.data.totals.totalExpenses)} />
                <Stat tone="brand" label="Lucro bruto" value={formatCurrency(consolidated.data.totals.grossProfit)} />
                <Stat tone="warn" label="Comissões" value={formatCurrency(consolidated.data.totals.commissionTotal)} />
                <Stat tone="ok" label="Lucro líquido" value={formatCurrency(consolidated.data.totals.netProfit)} hint={`${consolidated.data.totals.vehicles} veículos`} />
              </StatGrid>
              <div className="split-2">
                <Card title="Mais lucrativos">
                  <Table rows={consolidated.data.mostProfitable} columns={[{ key: 'vehicle', label: 'Veículo' }, { key: 'netProfit', label: 'Lucro líq.', align: 'right' }]} />
                </Card>
                <Card title="Maior investimento">
                  <Table rows={consolidated.data.highestCost} columns={[{ key: 'vehicle', label: 'Veículo' }, { key: 'totalInvested', label: 'Investido', align: 'right' }]} />
                </Card>
                <Card title="Mais tempo em estoque">
                  <Table rows={consolidated.data.longestInStock} columns={[{ key: 'vehicle', label: 'Veículo' }, { key: 'daysInStock', label: 'Dias', align: 'center' }]} />
                </Card>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'vehicle' && (
        <Card
          title="DRE por veículo"
          actions={
            vehicleId && (
              <button className="button button-ghost" onClick={() => recalc.mutate()} disabled={recalc.isPending}>
                <RefreshCcw size={15} /> Recalcular
              </button>
            )
          }
        >
          <Field label="Veículo">
            <select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
              <OptionList options={vehicles} placeholder="Selecione um veículo" />
            </select>
          </Field>
          {perVehicle.isLoading && <LoadingState />}
          {perVehicle.isError && <ErrorState error={perVehicle.error} />}
          {perVehicle.data && <DetailGrid data={(perVehicle.data.summary as Record<string, unknown>) ?? perVehicle.data} />}
        </Card>
      )}
    </Page>
  );
}

/* ------------------------------------------------------------ Financial entries */

export function FinancialPage() {
  const [vehicleId, setVehicleId] = useState('');
  const [creating, setCreating] = useState(false);
  const vehicles = useVehicleOptions();
  const entries = useList<Row>(['financial-entries', vehicleId], '/financial-entries', { vehicleId }, Boolean(vehicleId));
  const create = useApiMutation((payload: Record<string, unknown>) => api.post('/financial-entries', payload), {
    invalidate: [['financial-entries', vehicleId]],
    onSuccess: () => setCreating(false),
  });
  const remove = useApiMutation((id: string) => api.delete(`/financial-entries/${id}`), { invalidate: [['financial-entries', vehicleId]] });

  return (
    <Page
      eyebrow="Financeiro"
      title="Lançamentos financeiros"
      actions={<button className="button button-primary" onClick={() => setCreating(true)} disabled={!vehicleId}><Plus size={17} /> Novo lançamento</button>}
    >
      <Card>
        <Field label="Veículo">
          <select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} style={{ maxWidth: 420 }}>
            <OptionList options={vehicles} placeholder="Selecione um veículo para ver os lançamentos" />
          </select>
        </Field>
        {vehicleId && (
          <Table
            query={entries}
            columns={[
              { key: 'nature', label: 'Natureza', render: (row) => <Badge value={String(row.nature ?? '—')} tone={row.nature === 'REVENUE' ? 'ok' : 'danger'} /> },
              { key: 'category', label: 'Categoria' },
              { key: 'amount', label: 'Valor', align: 'right', render: (row) => formatCurrency(Number(row.amount ?? 0)) },
              { key: 'date', label: 'Data' },
              { key: 'origin', label: 'Origem' },
            ]}
            actions={(row) => (row.origin === 'MANUAL' ? <button className="button button-ghost" onClick={() => remove.mutate(row.id)}><Trash2 size={15} /></button> : null)}
          />
        )}
      </Card>

      <Drawer open={creating} onClose={() => setCreating(false)} eyebrow="Financeiro" title="Novo lançamento"
        footer={<><button className="button button-ghost" onClick={() => setCreating(false)}>Cancelar</button><button className="button button-primary" form="fin-form" type="submit" disabled={create.isPending}>Lançar</button></>}
      >
        <form id="fin-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          create.mutate({
            vehicleId,
            nature: form.get('nature'),
            category: form.get('category'),
            amount: Number(form.get('amount')),
            description: form.get('description') || undefined,
            date: form.get('date') || undefined,
          });
        }}>
          <FormGrid cols={1}>
            <Field label="Natureza"><select name="nature" required defaultValue=""><EnumOptions values={ENUMS.FinancialNature} placeholder="Selecione" /></select></Field>
            <Field label="Categoria"><input name="category" placeholder="Ex.: Transporte, Documentação" required /></Field>
            <FormGrid cols={2}>
              <Field label="Valor"><input name="amount" inputMode="numeric" required /></Field>
              <Field label="Data"><input name="date" type="date" /></Field>
            </FormGrid>
            <Field label="Descrição"><input name="description" /></Field>
          </FormGrid>
          {create.isError && <ErrorState error={create.error} />}
        </form>
      </Drawer>
    </Page>
  );
}

/* ------------------------------------------------------------ Commission rules */

export function CommissionRulesPage() {
  const [creating, setCreating] = useState(false);
  const listQuery = useList<Row>(['commission-rules'], '/commission-rules');
  const create = useApiMutation((payload: Record<string, unknown>) => api.post('/commission-rules', payload), {
    invalidate: [['commission-rules']],
    onSuccess: () => setCreating(false),
  });
  const setDefault = useApiMutation((id: string) => api.patch(`/commission-rules/${id}`, { isDefault: true }), { invalidate: [['commission-rules']] });

  return (
    <Page eyebrow="Financeiro" title="Regras de comissão" actions={<button className="button button-primary" onClick={() => setCreating(true)}><Plus size={17} /> Nova regra</button>}>
      <Card>
        <Table
          query={listQuery}
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'type', label: 'Tipo', render: (row) => <Badge value={String(row.type ?? '—')} /> },
            { key: 'percentage', label: 'Percentual', align: 'right', render: (row) => (row.percentage != null ? `${row.percentage}%` : '—') },
            { key: 'fixedAmount', label: 'Valor fixo', align: 'right', render: (row) => (row.fixedAmount != null ? formatCurrency(Number(row.fixedAmount)) : '—') },
            { key: 'isDefault', label: 'Padrão', align: 'center', render: (row) => (row.isDefault ? <Badge value="PADRÃO" tone="ok" /> : '—') },
          ]}
          actions={(row) => (!row.isDefault ? <button className="button button-ghost" onClick={() => setDefault.mutate(row.id)}>Tornar padrão</button> : null)}
        />
      </Card>

      <Drawer open={creating} onClose={() => setCreating(false)} eyebrow="Financeiro" title="Nova regra de comissão"
        footer={<><button className="button button-ghost" onClick={() => setCreating(false)}>Cancelar</button><button className="button button-primary" form="rule-form" type="submit" disabled={create.isPending}>Criar</button></>}
      >
        <form id="rule-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          create.mutate({
            name: form.get('name'),
            type: form.get('type'),
            percentage: form.get('percentage') ? Number(form.get('percentage')) : undefined,
            fixedAmount: form.get('fixedAmount') ? Number(form.get('fixedAmount')) : undefined,
            isDefault: form.get('isDefault') === 'on',
            description: form.get('description') || undefined,
          });
        }}>
          <FormGrid cols={1}>
            <Field label="Nome"><input name="name" required /></Field>
            <Field label="Tipo"><select name="type" required defaultValue=""><EnumOptions values={ENUMS.CommissionRuleType} placeholder="Selecione" /></select></Field>
            <FormGrid cols={2}>
              <Field label="Percentual (ex.: 3.5)"><input name="percentage" inputMode="decimal" /></Field>
              <Field label="Valor fixo"><input name="fixedAmount" inputMode="numeric" /></Field>
            </FormGrid>
            <Field label="Descrição"><input name="description" /></Field>
            <label className="toggle-chip"><input type="checkbox" name="isDefault" /> Definir como regra padrão</label>
          </FormGrid>
          <p className="hint">Tipos: PERCENT_SALE (sobre a venda), PERCENT_PROFIT (sobre o lucro), FIXED (valor fixo), PROGRESSIVE (faixas).</p>
          {create.isError && <ErrorState error={create.error} />}
        </form>
      </Drawer>
    </Page>
  );
}
