import { useState } from 'react';
import type { FormEvent } from 'react';
import { Ban, CheckCircle2, Plus, Wrench } from 'lucide-react';
import { api } from '../../services/api';
import { useApiMutation, useItem, useList } from '../../services/data';
import { Badge, Card, DetailGrid, Drawer, ENUMS, EnumOptions, Field, FormGrid, Page, Table, Tabs } from '../../components/ui';
import { ErrorState, LoadingState } from '../../components/State';
import { useAuth } from '../auth/AuthProvider';
import { formatCurrency } from '../../utils/format';
import { OptionList, usePartOptions, useSupplierOptions, useVehicleOptions } from './shared';

type Row = Record<string, unknown> & { id: string };

/* ------------------------------------------------------------ Parts & suppliers */

export function PartsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [tab, setTab] = useState('parts');
  const [lowStock, setLowStock] = useState(false);
  const [creatingPart, setCreatingPart] = useState(false);
  const [creatingSupplier, setCreatingSupplier] = useState(false);
  const [movePart, setMovePart] = useState<string | null>(null);

  const parts = useList<Row>(['parts', lowStock], '/parts', lowStock ? { lowStock: true } : undefined, tab === 'parts');
  const suppliers = useList<Row>(['suppliers'], '/suppliers', undefined, tab === 'suppliers');

  const createPart = useApiMutation((payload: Record<string, unknown>) => api.post('/parts', payload), { invalidate: [['parts']], onSuccess: () => setCreatingPart(false) });
  const createSupplier = useApiMutation((payload: Record<string, unknown>) => api.post('/suppliers', payload), { invalidate: [['suppliers']], onSuccess: () => setCreatingSupplier(false) });

  return (
    <Page
      eyebrow="Oficina"
      title="Peças & fornecedores"
      actions={
        isAdmin &&
        (tab === 'parts' ? (
          <button className="button button-primary" onClick={() => setCreatingPart(true)}><Plus size={17} /> Nova peça</button>
        ) : (
          <button className="button button-primary" onClick={() => setCreatingSupplier(true)}><Plus size={17} /> Novo fornecedor</button>
        ))
      }
    >
      <Tabs active={tab} onChange={setTab} tabs={[{ id: 'parts', label: 'Peças' }, { id: 'suppliers', label: 'Fornecedores' }]} />

      {tab === 'parts' && (
        <Card>
          <div className="toolbar" style={{ marginBottom: 14 }}>
            <label className="toggle-chip">
              <input type="checkbox" checked={lowStock} onChange={(event) => setLowStock(event.target.checked)} /> Somente baixo estoque
            </label>
          </div>
          <Table
            query={parts}
            columns={[
              { key: 'name', label: 'Peça' },
              { key: 'internalCode', label: 'Código' },
              { key: 'quantity', label: 'Estoque', align: 'center', render: (row) => <Badge value={String(row.quantity ?? 0)} tone={Number(row.quantity ?? 0) <= Number(row.minQuantity ?? 0) ? 'danger' : 'ok'} /> },
              { key: 'minQuantity', label: 'Mínimo', align: 'center' },
              { key: 'costPrice', label: 'Custo', align: 'right', render: (row) => formatCurrency(Number(row.costPrice ?? 0)) },
              { key: 'location', label: 'Local' },
            ]}
            actions={isAdmin ? (row) => <button className="button button-ghost" onClick={() => setMovePart(row.id)}>Movimentar</button> : undefined}
          />
        </Card>
      )}

      {tab === 'suppliers' && (
        <Card>
          <Table
            query={suppliers}
            columns={[
              { key: 'name', label: 'Fornecedor' },
              { key: 'document', label: 'Documento' },
              { key: 'phone', label: 'Telefone' },
              { key: 'email', label: 'E-mail' },
            ]}
          />
        </Card>
      )}

      {/* create part */}
      <Drawer open={creatingPart} onClose={() => setCreatingPart(false)} eyebrow="Oficina" title="Nova peça"
        footer={<><button className="button button-ghost" onClick={() => setCreatingPart(false)}>Cancelar</button><button className="button button-primary" form="part-form" type="submit" disabled={createPart.isPending}>Cadastrar</button></>}
      >
        <form id="part-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          createPart.mutate({
            internalCode: form.get('internalCode'),
            name: form.get('name'),
            sku: form.get('sku') || undefined,
            category: form.get('category') || undefined,
            brand: form.get('brand') || undefined,
            quantity: Number(form.get('quantity') || 0),
            minQuantity: Number(form.get('minQuantity') || 0),
            unit: form.get('unit') || undefined,
            costPrice: form.get('costPrice') ? Number(form.get('costPrice')) : undefined,
            location: form.get('location') || undefined,
          });
        }}>
          <FormGrid cols={2}>
            <Field label="Código interno"><input name="internalCode" required /></Field>
            <Field label="Nome"><input name="name" required /></Field>
            <Field label="SKU"><input name="sku" /></Field>
            <Field label="Categoria"><input name="category" /></Field>
            <Field label="Marca"><input name="brand" /></Field>
            <Field label="Unidade"><input name="unit" placeholder="UN" /></Field>
            <Field label="Estoque inicial"><input name="quantity" inputMode="numeric" /></Field>
            <Field label="Estoque mínimo"><input name="minQuantity" inputMode="numeric" /></Field>
            <Field label="Custo unitário"><input name="costPrice" inputMode="numeric" /></Field>
            <Field label="Localização"><input name="location" /></Field>
          </FormGrid>
          {createPart.isError && <ErrorState error={createPart.error} />}
        </form>
      </Drawer>

      {/* create supplier */}
      <Drawer open={creatingSupplier} onClose={() => setCreatingSupplier(false)} eyebrow="Oficina" title="Novo fornecedor"
        footer={<><button className="button button-ghost" onClick={() => setCreatingSupplier(false)}>Cancelar</button><button className="button button-primary" form="sup-form" type="submit" disabled={createSupplier.isPending}>Cadastrar</button></>}
      >
        <form id="sup-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          createSupplier.mutate(Object.fromEntries([...form.entries()].filter(([, value]) => value !== '')));
        }}>
          <FormGrid cols={2}>
            <Field label="Nome"><input name="name" required /></Field>
            <Field label="Documento"><input name="document" /></Field>
            <Field label="Telefone"><input name="phone" /></Field>
            <Field label="E-mail"><input name="email" type="email" /></Field>
            <Field label="Contato"><input name="contactName" /></Field>
            <Field label="Cidade"><input name="city" /></Field>
          </FormGrid>
          {createSupplier.isError && <ErrorState error={createSupplier.error} />}
        </form>
      </Drawer>

      {movePart && <MovementDrawer partId={movePart} onClose={() => setMovePart(null)} />}
    </Page>
  );
}

function MovementDrawer({ partId, onClose }: { partId: string; onClose: () => void }) {
  const movements = useItem<Row[]>(['part-movements', partId], `/parts/${partId}/movements`);
  const create = useApiMutation((payload: Record<string, unknown>) => api.post(`/parts/${partId}/movements`, payload), {
    invalidate: [['part-movements', partId], ['parts']],
  });

  return (
    <Drawer open onClose={onClose} eyebrow="Estoque de peças" title="Movimentações"
      footer={<button className="button button-primary" form="mov-form" type="submit" disabled={create.isPending}>Lançar movimento</button>}
    >
      <form id="mov-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        create.mutate({
          type: form.get('type'),
          quantity: Number(form.get('quantity')),
          unitCost: form.get('unitCost') ? Number(form.get('unitCost')) : undefined,
          reason: form.get('reason') || undefined,
        });
        event.currentTarget.reset();
      }}>
        <FormGrid cols={2}>
          <Field label="Tipo"><select name="type" required defaultValue=""><EnumOptions values={ENUMS.PartMovementType} placeholder="Selecione" /></select></Field>
          <Field label="Quantidade"><input name="quantity" inputMode="numeric" required /></Field>
          <Field label="Custo unitário"><input name="unitCost" inputMode="numeric" /></Field>
          <Field label="Motivo"><input name="reason" /></Field>
        </FormGrid>
        {create.isError && <ErrorState error={create.error} />}
      </form>
      {movements.isLoading && <LoadingState />}
      <Table
        rows={movements.data ?? []}
        empty="Sem movimentações."
        columns={[
          { key: 'type', label: 'Tipo', render: (row) => <Badge value={String(row.type ?? '—')} /> },
          { key: 'quantity', label: 'Qtde', align: 'center' },
          { key: 'reason', label: 'Motivo' },
          { key: 'createdAt', label: 'Data' },
        ]}
      />
    </Drawer>
  );
}

/* ------------------------------------------------------------ Maintenance */

export function MaintenancePage() {
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const listQuery = useList<Row>(['maintenances'], '/maintenances');
  const vehicles = useVehicleOptions(creating);
  const suppliers = useSupplierOptions(creating);
  const create = useApiMutation((payload: Record<string, unknown>) => api.post('/maintenances', payload), {
    invalidate: [['maintenances']],
    onSuccess: () => setCreating(false),
  });

  function vehicleName(row: Row) {
    const vehicle = row.vehicle as Record<string, unknown> | undefined;
    return vehicle ? `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() : '—';
  }

  return (
    <Page eyebrow="Oficina" title="Manutenções" actions={<button className="button button-primary" onClick={() => setCreating(true)}><Plus size={17} /> Nova ordem</button>}>
      <Card>
        <Table
          query={listQuery}
          columns={[
            { key: 'vehicle', label: 'Veículo', render: vehicleName },
            { key: 'type', label: 'Tipo' },
            { key: 'status', label: 'Status', render: (row) => <Badge value={String(row.status ?? '—')} /> },
            { key: 'laborCost', label: 'Mão de obra', align: 'right', render: (row) => formatCurrency(Number(row.laborCost ?? 0)) },
            { key: 'forecastDate', label: 'Previsão' },
          ]}
          actions={(row) => <button className="button button-ghost" onClick={() => setSelected(row.id)}><Wrench size={15} /> Abrir</button>}
        />
      </Card>

      <Drawer open={creating} onClose={() => setCreating(false)} eyebrow="Oficina" title="Nova ordem de manutenção"
        footer={<><button className="button button-ghost" onClick={() => setCreating(false)}>Cancelar</button><button className="button button-primary" form="maint-form" type="submit" disabled={create.isPending}>Abrir ordem</button></>}
      >
        <form id="maint-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          create.mutate({
            vehicleId: form.get('vehicleId'),
            type: form.get('type') || undefined,
            description: form.get('description') || undefined,
            workshop: form.get('workshop') || undefined,
            supplierId: form.get('supplierId') || undefined,
            forecastDate: form.get('forecastDate') || undefined,
            laborCost: form.get('laborCost') ? Number(form.get('laborCost')) : undefined,
          });
        }}>
          <FormGrid cols={1}>
            <Field label="Veículo"><select name="vehicleId" required defaultValue=""><OptionList options={vehicles} placeholder="Selecione" /></select></Field>
            <FormGrid cols={2}>
              <Field label="Tipo"><select name="type" defaultValue=""><EnumOptions values={ENUMS.MaintenanceType} placeholder="Selecione" /></select></Field>
              <Field label="Previsão"><input name="forecastDate" type="date" /></Field>
              <Field label="Oficina"><input name="workshop" /></Field>
              <Field label="Mão de obra"><input name="laborCost" inputMode="numeric" /></Field>
            </FormGrid>
            <Field label="Fornecedor"><select name="supplierId" defaultValue=""><OptionList options={suppliers} placeholder="Nenhum" /></select></Field>
            <Field label="Descrição"><textarea name="description" /></Field>
          </FormGrid>
          {create.isError && <ErrorState error={create.error} />}
        </form>
      </Drawer>

      {selected && <MaintenanceDrawer id={selected} onClose={() => setSelected(null)} />}
    </Page>
  );
}

function MaintenanceDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const maintenance = useItem<Record<string, unknown> & { parts?: Row[] }>(['maintenance', id], `/maintenances/${id}`);
  const parts = usePartOptions();
  const addPart = useApiMutation((payload: Record<string, unknown>) => api.post(`/maintenances/${id}/parts`, payload), { invalidate: [['maintenance', id]] });
  const complete = useApiMutation((payload: Record<string, unknown>) => api.post(`/maintenances/${id}/complete`, payload), { invalidate: [['maintenance', id], ['maintenances']], onSuccess: onClose });
  const cancel = useApiMutation(() => api.post(`/maintenances/${id}/cancel`, { reason: 'Cancelada no painel' }), { invalidate: [['maintenance', id], ['maintenances']], onSuccess: onClose });

  const data = maintenance.data ?? {};
  const usedParts = data.parts ?? [];
  const closed = data.status === 'COMPLETED' || data.status === 'CANCELED';

  return (
    <Drawer
      open
      onClose={onClose}
      eyebrow="Manutenção"
      title={String(data.type ?? 'Ordem de serviço')}
      footer={
        !closed && (
          <>
            <button className="button button-ghost" onClick={() => cancel.mutate()} disabled={cancel.isPending}><Ban size={15} /> Cancelar</button>
            <button className="button button-primary" form="complete-form" type="submit" disabled={complete.isPending}><CheckCircle2 size={15} /> Concluir</button>
          </>
        )
      }
    >
      {maintenance.isLoading && <LoadingState />}
      {maintenance.isError && <ErrorState error={maintenance.error} />}
      {maintenance.data && (
        <>
          <DetailGrid data={data} only={['status', 'type', 'description', 'workshop', 'forecastDate', 'laborCost', 'mileage', 'totalCost', 'invoiceNumber']} />

          <Card title="Peças utilizadas">
            <Table
              rows={usedParts}
              empty="Nenhuma peça aplicada."
              columns={[
                { key: 'part', label: 'Peça', render: (row) => String((row.part as Record<string, unknown>)?.name ?? row.partId ?? '—') },
                { key: 'quantity', label: 'Qtde', align: 'center' },
                { key: 'unitCost', label: 'Custo un.', align: 'right', render: (row) => formatCurrency(Number(row.unitCost ?? 0)) },
              ]}
            />
            {!closed && (
              <form
                className="toolbar"
                style={{ marginTop: 12 }}
                onSubmit={(event: FormEvent<HTMLFormElement>) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  if (!form.get('partId')) return;
                  addPart.mutate({ partId: form.get('partId'), quantity: Number(form.get('quantity') || 1) });
                  event.currentTarget.reset();
                }}
              >
                <select name="partId" defaultValue="" style={{ flex: 1, minWidth: 200 }}>
                  <OptionList options={parts} placeholder="Selecionar peça" />
                </select>
                <input name="quantity" inputMode="numeric" placeholder="Qtde" defaultValue="1" style={{ width: 90 }} />
                <button className="button button-ghost" type="submit" disabled={addPart.isPending}><Plus size={15} /> Adicionar</button>
              </form>
            )}
            {addPart.isError && <ErrorState error={addPart.error} />}
          </Card>

          {!closed && (
            <form id="complete-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              complete.mutate({
                laborCost: form.get('laborCost') ? Number(form.get('laborCost')) : undefined,
                nextRevisionDate: form.get('nextRevisionDate') || undefined,
              });
            }}>
              <Card title="Concluir ordem">
                <FormGrid cols={2}>
                  <Field label="Mão de obra final"><input name="laborCost" inputMode="numeric" /></Field>
                  <Field label="Próxima revisão"><input name="nextRevisionDate" type="date" /></Field>
                </FormGrid>
              </Card>
              {complete.isError && <ErrorState error={complete.error} />}
            </form>
          )}
        </>
      )}
    </Drawer>
  );
}
