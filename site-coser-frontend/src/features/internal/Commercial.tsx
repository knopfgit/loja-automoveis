import { useState } from 'react';
import type { FormEvent } from 'react';
import { Ban, Plus, Truck } from 'lucide-react';
import { api } from '../../services/api';
import { useApiMutation, useItem, useList } from '../../services/data';
import { Badge, Card, DetailGrid, Drawer, ENUMS, EnumOptions, Field, FormGrid, Page, Table } from '../../components/ui';
import { ErrorState, LoadingState } from '../../components/State';
import { useAuth } from '../auth/AuthProvider';
import { formatCurrency } from '../../utils/format';
import { OptionList, useCustomerOptions, useEmployeeOptions, useVehicleOptions } from './shared';

type Row = Record<string, unknown> & { id: string };

function vehicleLabel(row: Row) {
  const vehicle = row.vehicle as Record<string, unknown> | undefined;
  return vehicle ? `${vehicle.brand ?? ''} ${vehicle.model ?? ''} ${vehicle.modelYear ?? ''}`.trim() : String(row.vehicleId ?? '—');
}
function customerLabel(row: Row) {
  const customer = row.customer as Record<string, unknown> | undefined;
  return customer ? String(customer.fullName ?? '—') : String(row.customerId ?? '—');
}

/* ------------------------------------------------------------------ Funnel */

export function FunnelPage() {
  const { user } = useAuth();
  const acquisitions = useList<Row>(['acquisitions'], '/acquisitions', undefined, user?.role === 'ADMIN');
  const reservations = useList<Row>(['reservations'], '/reservations');
  const sales = useList<Row>(['sales'], '/sales');

  return (
    <Page eyebrow="Comercial" title="Funil de vendas">
      <div className="split-2">
        {user?.role === 'ADMIN' && (
          <Card title="Aquisições">
            <Table query={acquisitions} columns={[{ key: 'vehicle', label: 'Veículo', render: vehicleLabel }, { key: 'status', label: 'Status' }]} />
          </Card>
        )}
        <Card title="Reservas ativas">
          <Table query={reservations} columns={[{ key: 'vehicle', label: 'Veículo', render: vehicleLabel }, { key: 'customer', label: 'Cliente', render: customerLabel }, { key: 'status', label: 'Status' }]} />
        </Card>
        <Card title="Vendas">
          <Table query={sales} columns={[{ key: 'vehicle', label: 'Veículo', render: vehicleLabel }, { key: 'customer', label: 'Cliente', render: customerLabel }, { key: 'status', label: 'Status' }]} />
        </Card>
      </div>
    </Page>
  );
}

/* ------------------------------------------------------------------ Acquisitions */

export function AcquisitionsPage() {
  const [creating, setCreating] = useState(false);
  const listQuery = useList<Row>(['acquisitions'], '/acquisitions');
  const vehicles = useVehicleOptions(creating);
  const create = useApiMutation((payload: Record<string, unknown>) => api.post('/acquisitions', payload), {
    invalidate: [['acquisitions']],
    onSuccess: () => setCreating(false),
  });

  return (
    <Page eyebrow="Comercial" title="Aquisições" actions={<button className="button button-primary" onClick={() => setCreating(true)}><Plus size={17} /> Nova aquisição</button>}>
      <Card>
        <Table
          query={listQuery}
          columns={[
            { key: 'vehicle', label: 'Veículo', render: vehicleLabel },
            { key: 'type', label: 'Tipo' },
            { key: 'purchasePrice', label: 'Compra', align: 'right', render: (row) => formatCurrency(Number(row.purchasePrice ?? 0)) },
            { key: 'status', label: 'Status', render: (row) => <Badge value={String(row.status ?? '—')} /> },
            { key: 'purchaseDate', label: 'Data' },
          ]}
        />
      </Card>

      <Drawer open={creating} onClose={() => setCreating(false)} eyebrow="Comercial" title="Nova aquisição"
        footer={<><button className="button button-ghost" onClick={() => setCreating(false)}>Cancelar</button><button className="button button-primary" form="acq-form" type="submit" disabled={create.isPending}>Registrar</button></>}
      >
        <form id="acq-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          create.mutate({
            vehicleId: form.get('vehicleId'),
            type: form.get('type') || undefined,
            sellerName: form.get('sellerName') || undefined,
            purchasePrice: Number(form.get('purchasePrice')),
            purchaseDate: form.get('purchaseDate'),
            additionalCosts: form.get('additionalCosts') ? Number(form.get('additionalCosts')) : undefined,
            confirm: form.get('confirm') === 'on',
          });
        }}>
          <FormGrid cols={1}>
            <Field label="Veículo"><select name="vehicleId" required defaultValue=""><OptionList options={vehicles} placeholder="Selecione o veículo" /></select></Field>
            <FormGrid cols={2}>
              <Field label="Tipo"><select name="type" defaultValue=""><EnumOptions values={ENUMS.AcquisitionType} placeholder="Selecione" /></select></Field>
              <Field label="Data da compra"><input name="purchaseDate" type="date" required /></Field>
              <Field label="Preço de compra"><input name="purchasePrice" inputMode="numeric" required /></Field>
              <Field label="Custos adicionais"><input name="additionalCosts" inputMode="numeric" /></Field>
            </FormGrid>
            <Field label="Vendedor (quem vendeu à loja)"><input name="sellerName" /></Field>
            <label className="toggle-chip"><input type="checkbox" name="confirm" defaultChecked /> Confirmar e lançar no financeiro</label>
          </FormGrid>
          {create.isError && <ErrorState error={create.error} />}
        </form>
      </Drawer>
    </Page>
  );
}

/* ------------------------------------------------------------------ Reservations */

export function ReservationsPage() {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const listQuery = useList<Row>(['reservations'], '/reservations');
  const vehicles = useVehicleOptions(creating);
  const customers = useCustomerOptions(creating);
  const sellers = useEmployeeOptions(creating && user?.role === 'ADMIN');
  const create = useApiMutation((payload: Record<string, unknown>) => api.post('/reservations', payload), {
    invalidate: [['reservations']],
    onSuccess: () => setCreating(false),
  });
  const cancel = useApiMutation((id: string) => api.patch(`/reservations/${id}/cancel`, { reason: 'Cancelada no painel' }), {
    invalidate: [['reservations']],
  });

  return (
    <Page eyebrow="Comercial" title="Reservas" actions={<button className="button button-primary" onClick={() => setCreating(true)}><Plus size={17} /> Nova reserva</button>}>
      <Card>
        <Table
          query={listQuery}
          columns={[
            { key: 'vehicle', label: 'Veículo', render: vehicleLabel },
            { key: 'customer', label: 'Cliente', render: customerLabel },
            { key: 'depositAmount', label: 'Sinal', align: 'right', render: (row) => formatCurrency(Number(row.depositAmount ?? 0)) },
            { key: 'status', label: 'Status', render: (row) => <Badge value={String(row.status ?? '—')} /> },
            { key: 'expiresAt', label: 'Expira em' },
          ]}
          actions={(row) =>
            row.status === 'ACTIVE' ? (
              <button className="button button-ghost" onClick={() => cancel.mutate(row.id)}>
                <Ban size={15} /> Cancelar
              </button>
            ) : null
          }
        />
      </Card>

      <Drawer open={creating} onClose={() => setCreating(false)} eyebrow="Comercial" title="Nova reserva"
        footer={<><button className="button button-ghost" onClick={() => setCreating(false)}>Cancelar</button><button className="button button-primary" form="res-form" type="submit" disabled={create.isPending}>Reservar</button></>}
      >
        <form id="res-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          create.mutate({
            vehicleId: form.get('vehicleId'),
            customerId: form.get('customerId'),
            sellerId: form.get('sellerId') || undefined,
            durationDays: form.get('durationDays') ? Number(form.get('durationDays')) : undefined,
            depositAmount: form.get('depositAmount') ? Number(form.get('depositAmount')) : undefined,
          });
        }}>
          <FormGrid cols={1}>
            <Field label="Veículo"><select name="vehicleId" required defaultValue=""><OptionList options={vehicles} placeholder="Selecione" /></select></Field>
            <Field label="Cliente"><select name="customerId" required defaultValue=""><OptionList options={customers} placeholder="Selecione" /></select></Field>
            {user?.role === 'ADMIN' && <Field label="Vendedor"><select name="sellerId" defaultValue=""><OptionList options={sellers} placeholder="Padrão: você" /></select></Field>}
            <FormGrid cols={2}>
              <Field label="Validade (dias)"><input name="durationDays" inputMode="numeric" placeholder="Padrão da loja" /></Field>
              <Field label="Sinal"><input name="depositAmount" inputMode="numeric" /></Field>
            </FormGrid>
          </FormGrid>
          {create.isError && <ErrorState error={create.error} />}
        </form>
      </Drawer>
    </Page>
  );
}

/* ------------------------------------------------------------------ Sales */

export function SalesPage() {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const listQuery = useList<Row>(['sales'], '/sales');
  const vehicles = useVehicleOptions(creating);
  const customers = useCustomerOptions(creating);
  const sellers = useEmployeeOptions(creating && user?.role === 'ADMIN');
  const create = useApiMutation((payload: Record<string, unknown>) => api.post('/sales', payload), {
    invalidate: [['sales']],
    onSuccess: () => setCreating(false),
  });

  return (
    <Page eyebrow="Comercial" title="Vendas" actions={<button className="button button-primary" onClick={() => setCreating(true)}><Plus size={17} /> Nova venda</button>}>
      <Card>
        <Table
          query={listQuery}
          columns={[
            { key: 'vehicle', label: 'Veículo', render: vehicleLabel },
            { key: 'customer', label: 'Cliente', render: customerLabel },
            { key: 'price', label: 'Valor', align: 'right', render: (row) => formatCurrency(Number(row.finalPrice ?? row.negotiatedPrice ?? 0)) },
            { key: 'status', label: 'Status', render: (row) => <Badge value={String(row.status ?? '—')} /> },
          ]}
          actions={(row) => (
            <button className="button button-ghost" onClick={() => setSelected(row.id)}>
              Abrir
            </button>
          )}
        />
      </Card>

      <Drawer open={creating} onClose={() => setCreating(false)} eyebrow="Comercial" title="Nova venda"
        footer={<><button className="button button-ghost" onClick={() => setCreating(false)}>Cancelar</button><button className="button button-primary" form="sale-form" type="submit" disabled={create.isPending}>Registrar venda</button></>}
      >
        <form id="sale-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          create.mutate({
            vehicleId: form.get('vehicleId'),
            customerId: form.get('customerId'),
            sellerId: form.get('sellerId') || undefined,
            negotiatedPrice: form.get('negotiatedPrice') ? Number(form.get('negotiatedPrice')) : undefined,
            discount: form.get('discount') ? Number(form.get('discount')) : undefined,
            paymentMethod: form.get('paymentMethod') || undefined,
            financing: form.get('financing') === 'on',
          });
        }}>
          <FormGrid cols={1}>
            <Field label="Veículo"><select name="vehicleId" required defaultValue=""><OptionList options={vehicles} placeholder="Selecione" /></select></Field>
            <Field label="Cliente"><select name="customerId" required defaultValue=""><OptionList options={customers} placeholder="Selecione" /></select></Field>
            {user?.role === 'ADMIN' && <Field label="Vendedor"><select name="sellerId" defaultValue=""><OptionList options={sellers} placeholder="Padrão: você" /></select></Field>}
            <FormGrid cols={2}>
              <Field label="Valor negociado"><input name="negotiatedPrice" inputMode="numeric" /></Field>
              <Field label="Desconto"><input name="discount" inputMode="numeric" /></Field>
              <Field label="Pagamento"><select name="paymentMethod" defaultValue=""><EnumOptions values={ENUMS.PaymentMethod} placeholder="Selecione" /></select></Field>
            </FormGrid>
            <label className="toggle-chip"><input type="checkbox" name="financing" /> Venda com financiamento</label>
          </FormGrid>
          {create.isError && <ErrorState error={create.error} />}
        </form>
      </Drawer>

      {selected && <SaleDrawer id={selected} onClose={() => setSelected(null)} />}
    </Page>
  );
}

function SaleDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const sale = useItem<Record<string, unknown>>(['sale', id], `/sales/${id}`);
  const [finalPrice, setFinalPrice] = useState('');
  const changeStatus = useApiMutation((payload: Record<string, unknown>) => api.patch(`/sales/${id}/status`, payload), {
    invalidate: [['sale', id], ['sales']],
  });
  const deliver = useApiMutation(() => api.patch(`/sales/${id}/deliver`), { invalidate: [['sale', id], ['sales']] });

  const data = sale.data ?? {};
  const currentStatus = String(data.status ?? '');
  const currentIndex = ENUMS.SaleStatus.indexOf(currentStatus as (typeof ENUMS.SaleStatus)[number]);

  return (
    <Drawer
      open
      onClose={onClose}
      eyebrow="Venda"
      title={vehicleLabel(data as Row)}
      footer={
        <>
          <input placeholder="Valor final (ao concluir)" value={finalPrice} onChange={(event) => setFinalPrice(event.target.value)} style={{ maxWidth: 200 }} />
          <select
            className="status-select"
            value=""
            onChange={(event) => {
              if (!event.target.value) return;
              changeStatus.mutate({ status: event.target.value, finalPrice: finalPrice ? Number(finalPrice) : undefined });
            }}
          >
            <EnumOptions values={ENUMS.SaleStatus} placeholder="Mudar status…" />
          </select>
          <button className="button button-ghost" onClick={() => deliver.mutate()} disabled={deliver.isPending}>
            <Truck size={15} /> Entregar
          </button>
        </>
      }
    >
      {sale.isLoading && <LoadingState />}
      {sale.isError && <ErrorState error={sale.error} />}
      {sale.data && (
        <>
          <Card title="Andamento">
            <div className="timeline">
              {ENUMS.SaleStatus.filter((status) => status !== 'CANCELED').map((status, index) => (
                <div key={status} className={`timeline-step ${index < currentIndex ? 'done' : index === currentIndex ? 'current' : ''}`}>
                  <strong>{status}</strong>
                </div>
              ))}
            </div>
            {currentStatus === 'CANCELED' && <Badge value="CANCELED" />}
          </Card>
          <DetailGrid
            data={data}
            only={['status', 'announcedPrice', 'negotiatedPrice', 'discount', 'finalPrice', 'paymentMethod', 'financing', 'financialInstitution', 'downPayment', 'installments', 'saleDate', 'deliveryForecast', 'notes']}
          />
          {changeStatus.isError && <ErrorState error={changeStatus.error} />}
        </>
      )}
    </Drawer>
  );
}
