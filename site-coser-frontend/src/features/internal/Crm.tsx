import { useState } from 'react';
import type { FormEvent } from 'react';
import { MessageSquarePlus, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { useApiMutation, useItem, useList } from '../../services/data';
import { Badge, Card, DetailGrid, Drawer, ENUMS, EnumOptions, Field, FormGrid, Page, Table } from '../../components/ui';
import { ErrorState, LoadingState } from '../../components/State';

type Row = Record<string, unknown> & { id: string };

/* ---------------------------------------------------------------- Leads */

export function LeadsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const listQuery = useList<Row>(['leads'], '/leads', { page: 1, limit: 50 });

  function sellerName(row: Row) {
    const seller = row.assignedSeller as Record<string, unknown> | undefined;
    return seller ? String(seller.fullName ?? '—') : '—';
  }
  function vehicleName(row: Row) {
    const vehicle = row.vehicle as Record<string, unknown> | undefined;
    return vehicle ? `${vehicle.brand ?? ''} ${vehicle.model ?? ''}`.trim() : '—';
  }

  return (
    <Page eyebrow="Comercial" title="Leads">
      <Card>
        <Table
          query={listQuery}
          columns={[
            { key: 'name', label: 'Nome' },
            { key: 'phone', label: 'Telefone' },
            { key: 'vehicle', label: 'Veículo', render: vehicleName },
            { key: 'assignedSeller', label: 'Vendedor', render: sellerName },
            { key: 'status', label: 'Status', render: (row) => <Badge value={String(row.status ?? '—')} /> },
          ]}
          actions={(row) => <button className="button button-ghost" onClick={() => setSelected(row.id)}>Abrir</button>}
        />
      </Card>
      {selected && <LeadDrawer id={selected} onClose={() => setSelected(null)} />}
    </Page>
  );
}

function LeadDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const lead = useItem<Record<string, unknown> & { interactions?: Row[] }>(['lead', id], `/leads/${id}`);
  const changeStatus = useApiMutation((status: string) => api.patch(`/leads/${id}/status`, { status }), { invalidate: [['lead', id], ['leads']] });
  const addInteraction = useApiMutation((payload: Record<string, unknown>) => api.post(`/leads/${id}/interactions`, payload), { invalidate: [['lead', id]] });

  const data = lead.data ?? {};
  const interactions = data.interactions ?? [];

  return (
    <Drawer
      open
      onClose={onClose}
      eyebrow="Lead"
      title={String(data.name ?? 'Lead')}
      footer={
        <select className="status-select" style={{ width: 200 }} value="" onChange={(event) => event.target.value && changeStatus.mutate(event.target.value)}>
          <EnumOptions values={ENUMS.LeadStatus} placeholder="Mudar status…" />
        </select>
      }
    >
      {lead.isLoading && <LoadingState />}
      {lead.isError && <ErrorState error={lead.error} />}
      {lead.data && (
        <>
          <DetailGrid data={data} only={['status', 'name', 'phone', 'email', 'origin', 'message', 'createdAt']} />

          <Card title="Interações">
            <form
              className="toolbar"
              style={{ marginBottom: 12 }}
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                if (!form.get('content')) return;
                addInteraction.mutate({ type: form.get('type') || 'note', content: form.get('content') });
                event.currentTarget.reset();
              }}
            >
              <select name="type" defaultValue="note" style={{ width: 130 }}>
                <option value="note">Nota</option>
                <option value="call">Ligação</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
              </select>
              <input name="content" placeholder="Registrar interação..." style={{ flex: 1, minWidth: 180 }} />
              <button className="button button-ghost" type="submit" disabled={addInteraction.isPending}><MessageSquarePlus size={15} /> Adicionar</button>
            </form>
            <Table
              rows={interactions}
              empty="Nenhuma interação registrada."
              columns={[
                { key: 'type', label: 'Tipo' },
                { key: 'content', label: 'Conteúdo' },
                { key: 'createdAt', label: 'Data' },
              ]}
            />
          </Card>
        </>
      )}
    </Drawer>
  );
}

/* ---------------------------------------------------------------- Customers */

export function CustomersPage() {
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const listQuery = useList<Row>(['customers'], '/customers', { page: 1, limit: 50 });
  const create = useApiMutation((payload: Record<string, unknown>) => api.post('/customers', payload), { invalidate: [['customers']], onSuccess: () => setCreating(false) });

  return (
    <Page eyebrow="Comercial" title="Clientes" actions={<button className="button button-primary" onClick={() => setCreating(true)}><Plus size={17} /> Novo cliente</button>}>
      <Card>
        <Table
          query={listQuery}
          columns={[
            { key: 'fullName', label: 'Nome' },
            { key: 'document', label: 'Documento' },
            { key: 'email', label: 'E-mail' },
            { key: 'phone', label: 'Telefone' },
          ]}
          actions={(row) => <button className="button button-ghost" onClick={() => setSelected(row.id)}>Abrir</button>}
        />
      </Card>

      <Drawer open={creating} onClose={() => setCreating(false)} eyebrow="Comercial" title="Novo cliente"
        footer={<><button className="button button-ghost" onClick={() => setCreating(false)}>Cancelar</button><button className="button button-primary" form="cust-form" type="submit" disabled={create.isPending}>Cadastrar</button></>}
      >
        <form id="cust-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          create.mutate({
            fullName: form.get('fullName'),
            document: form.get('document'),
            personType: form.get('personType') || undefined,
            email: form.get('email') || undefined,
            phone: form.get('phone') || undefined,
            whatsapp: form.get('whatsapp') || undefined,
          });
        }}>
          <FormGrid cols={2}>
            <Field label="Nome completo"><input name="fullName" required /></Field>
            <Field label="CPF/CNPJ"><input name="document" required /></Field>
            <Field label="Tipo"><select name="personType" defaultValue=""><EnumOptions values={ENUMS.PersonType} placeholder="Selecione" /></select></Field>
            <Field label="E-mail"><input name="email" type="email" /></Field>
            <Field label="Telefone"><input name="phone" /></Field>
            <Field label="WhatsApp"><input name="whatsapp" /></Field>
          </FormGrid>
          {create.isError && <ErrorState error={create.error} />}
        </form>
      </Drawer>

      {selected && <CustomerDrawer id={selected} onClose={() => setSelected(null)} />}
    </Page>
  );
}

function CustomerDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const customer = useItem<Record<string, unknown> & { addresses?: Row[] }>(['customer', id], `/customers/${id}`);
  const data = customer.data ?? {};
  const addresses = data.addresses ?? [];

  return (
    <Drawer open onClose={onClose} eyebrow="Cliente" title={String(data.fullName ?? 'Cliente')}>
      {customer.isLoading && <LoadingState />}
      {customer.isError && <ErrorState error={customer.error} />}
      {customer.data && (
        <>
          <DetailGrid data={data} only={['fullName', 'document', 'personType', 'email', 'phone', 'whatsapp', 'birthDate', 'marketingConsent', 'createdAt']} />
          <Card title="Endereços">
            <Table
              rows={addresses}
              empty="Sem endereços."
              columns={[
                { key: 'label', label: 'Rótulo' },
                { key: 'street', label: 'Rua' },
                { key: 'city', label: 'Cidade' },
                { key: 'state', label: 'UF' },
              ]}
            />
          </Card>
        </>
      )}
    </Drawer>
  );
}
