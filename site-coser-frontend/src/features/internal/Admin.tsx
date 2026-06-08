import { useState } from 'react';
import type { FormEvent } from 'react';
import { Download, FileJson, Plus } from 'lucide-react';
import { api } from '../../services/api';
import { useApiMutation, useItem, useList } from '../../services/data';
import { Badge, Card, Drawer, ENUMS, EnumOptions, Field, FormGrid, Page, Table, Tabs } from '../../components/ui';
import { ErrorState, LoadingState } from '../../components/State';

type Row = Record<string, unknown> & { id: string };

async function downloadReport(name: string, format: 'csv' | 'json') {
  const response = await api.get(`/reports/${name}`, { params: { format }, responseType: 'blob' });
  const url = URL.createObjectURL(response.data as Blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${name}.${format}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/* ----------------------------------------------------------- Employees */

export function EmployeesPage() {
  const [creating, setCreating] = useState(false);
  const listQuery = useList<Row>(['employees'], '/employees', { page: 1, limit: 50 });
  const create = useApiMutation((payload: Record<string, unknown>) => api.post('/employees', payload), { invalidate: [['employees']], onSuccess: () => setCreating(false) });

  return (
    <Page eyebrow="Administração" title="Funcionários" actions={<button className="button button-primary" onClick={() => setCreating(true)}><Plus size={17} /> Novo funcionário</button>}>
      <Card>
        <Table
          query={listQuery}
          columns={[
            { key: 'fullName', label: 'Nome' },
            { key: 'position', label: 'Cargo' },
            { key: 'email', label: 'E-mail' },
            { key: 'active', label: 'Ativo', align: 'center', render: (row) => (row.active === false ? <Badge value="INACTIVE" /> : <Badge value="ACTIVE" />) },
          ]}
        />
      </Card>

      <Drawer open={creating} onClose={() => setCreating(false)} eyebrow="Equipe" title="Novo funcionário"
        footer={<><button className="button button-ghost" onClick={() => setCreating(false)}>Cancelar</button><button className="button button-primary" form="emp-form" type="submit" disabled={create.isPending}>Cadastrar</button></>}
      >
        <form id="emp-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          create.mutate({
            fullName: form.get('fullName'),
            cpf: form.get('cpf'),
            email: form.get('email'),
            password: form.get('password'),
            phone: form.get('phone') || undefined,
            position: form.get('position') || undefined,
            role: form.get('role') || 'SELLER',
            pixKey: form.get('pixKey') || undefined,
          });
        }}>
          <FormGrid cols={2}>
            <Field label="Nome completo"><input name="fullName" required /></Field>
            <Field label="CPF"><input name="cpf" required /></Field>
            <Field label="E-mail"><input name="email" type="email" required /></Field>
            <Field label="Senha (mín. 8)"><input name="password" type="password" required /></Field>
            <Field label="Telefone"><input name="phone" /></Field>
            <Field label="Cargo"><input name="position" /></Field>
            <Field label="Perfil"><select name="role" defaultValue="SELLER"><EnumOptions values={ENUMS.UserRole} /></select></Field>
            <Field label="Chave PIX"><input name="pixKey" /></Field>
          </FormGrid>
          {create.isError && <ErrorState error={create.error} />}
        </form>
      </Drawer>
    </Page>
  );
}

/* ----------------------------------------------------------- Users & access */

export function UsersAccessPage() {
  const [tab, setTab] = useState('users');
  const users = useList<Row>(['users'], '/users', { page: 1, limit: 50 }, tab === 'users');
  const roles = useList<Row>(['roles'], '/roles', undefined, tab === 'roles');
  const permissions = useList<Row>(['permissions'], '/permissions', undefined, tab === 'permissions');
  const setStatus = useApiMutation(({ id, status }: { id: string; status: string }) => api.patch(`/users/${id}/status`, { status }), { invalidate: [['users']] });

  return (
    <Page eyebrow="Administração" title="Usuários & acessos">
      <Tabs active={tab} onChange={setTab} tabs={[{ id: 'users', label: 'Usuários' }, { id: 'roles', label: 'Perfis' }, { id: 'permissions', label: 'Permissões' }]} />

      {tab === 'users' && (
        <Card>
          <Table
            query={users}
            columns={[
              { key: 'email', label: 'E-mail' },
              { key: 'role', label: 'Perfil', render: (row) => <Badge value={String(row.role ?? '—')} /> },
              { key: 'status', label: 'Status', render: (row) => <Badge value={String(row.status ?? '—')} /> },
            ]}
            actions={(row) => (
              <select
                className="status-select"
                value=""
                onChange={(event) => event.target.value && setStatus.mutate({ id: row.id, status: event.target.value })}
              >
                <option value="">Status…</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            )}
          />
        </Card>
      )}

      {tab === 'roles' && (
        <Card title="Perfis de acesso">
          <Table query={roles} columns={[{ key: 'name', label: 'Nome' }, { key: 'description', label: 'Descrição' }]} />
        </Card>
      )}

      {tab === 'permissions' && (
        <Card title="Permissões disponíveis">
          <Table query={permissions} columns={[{ key: 'code', label: 'Código' }, { key: 'description', label: 'Descrição' }]} />
        </Card>
      )}
    </Page>
  );
}

/* ----------------------------------------------------------- Store config */

const HOUR_DAYS = ['seg_sex', 'sabado', 'domingo'];

export function StoreConfigPage() {
  const config = useItem<Record<string, unknown>>(['storeConfig'], '/store/config');
  const save = useApiMutation((payload: Record<string, unknown>) => api.put('/store/config', payload), { invalidate: [['storeConfig'], ['storeLocation']] });

  if (config.isLoading) return <LoadingState />;
  if (config.isError) return <ErrorState error={config.error} />;
  const data = config.data ?? {};
  const hours = (data.openingHours as Record<string, string> | undefined) ?? {};
  const social = (data.socialLinks as Record<string, string> | undefined) ?? {};

  return (
    <Page eyebrow="Administração" title="Configuração da loja">
      <Card>
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            save.mutate({
              name: form.get('name'),
              cnpj: form.get('cnpj') || undefined,
              phone: form.get('phone') || undefined,
              whatsapp: form.get('whatsapp') || undefined,
              email: form.get('email') || undefined,
              street: form.get('street') || undefined,
              number: form.get('number') || undefined,
              district: form.get('district') || undefined,
              city: form.get('city') || undefined,
              state: form.get('state') || undefined,
              zipCode: form.get('zipCode') || undefined,
              latitude: form.get('latitude') ? Number(form.get('latitude')) : undefined,
              longitude: form.get('longitude') ? Number(form.get('longitude')) : undefined,
              openingHours: HOUR_DAYS.reduce<Record<string, string>>((acc, day) => {
                const value = form.get(`hour_${day}`);
                if (value) acc[day] = String(value);
                return acc;
              }, {}),
              socialLinks: {
                instagram: form.get('instagram') || undefined,
                facebook: form.get('facebook') || undefined,
              },
            });
          }}
        >
          <h2>Identificação</h2>
          <FormGrid cols={3}>
            <Field label="Nome"><input name="name" defaultValue={String(data.name ?? '')} required /></Field>
            <Field label="CNPJ"><input name="cnpj" defaultValue={String(data.cnpj ?? '')} /></Field>
            <Field label="E-mail"><input name="email" defaultValue={String(data.email ?? '')} /></Field>
            <Field label="Telefone"><input name="phone" defaultValue={String(data.phone ?? '')} /></Field>
            <Field label="WhatsApp"><input name="whatsapp" defaultValue={String(data.whatsapp ?? '')} /></Field>
          </FormGrid>

          <h2 style={{ marginTop: 18 }}>Endereço</h2>
          <FormGrid cols={3}>
            <Field label="Rua"><input name="street" defaultValue={String(data.street ?? '')} /></Field>
            <Field label="Número"><input name="number" defaultValue={String(data.number ?? '')} /></Field>
            <Field label="Bairro"><input name="district" defaultValue={String(data.district ?? '')} /></Field>
            <Field label="Cidade"><input name="city" defaultValue={String(data.city ?? '')} /></Field>
            <Field label="UF"><input name="state" maxLength={2} defaultValue={String(data.state ?? '')} /></Field>
            <Field label="CEP"><input name="zipCode" defaultValue={String(data.zipCode ?? '')} /></Field>
            <Field label="Latitude"><input name="latitude" defaultValue={String(data.latitude ?? '')} /></Field>
            <Field label="Longitude"><input name="longitude" defaultValue={String(data.longitude ?? '')} /></Field>
          </FormGrid>

          <h2 style={{ marginTop: 18 }}>Horário & redes</h2>
          <FormGrid cols={3}>
            <Field label="Seg–Sex"><input name="hour_seg_sex" defaultValue={hours.seg_sex ?? ''} placeholder="08:00-18:00" /></Field>
            <Field label="Sábado"><input name="hour_sabado" defaultValue={hours.sabado ?? ''} placeholder="09:00-13:00" /></Field>
            <Field label="Domingo"><input name="hour_domingo" defaultValue={hours.domingo ?? ''} placeholder="Fechado" /></Field>
            <Field label="Instagram"><input name="instagram" defaultValue={social.instagram ?? ''} /></Field>
            <Field label="Facebook"><input name="facebook" defaultValue={social.facebook ?? ''} /></Field>
          </FormGrid>

          <div className="form-actions" style={{ marginTop: 16 }}>
            <button className="button button-primary" type="submit" disabled={save.isPending}>Salvar configuração</button>
          </div>
          {save.isError && <ErrorState error={save.error} />}
          {save.isSuccess && <div className="success-box">Configuração salva.</div>}
        </form>
      </Card>
    </Page>
  );
}

/* ----------------------------------------------------------- Reports */

const REPORT_GROUPS: { label: string; reports: string[] }[] = [
  { label: 'Veículos', reports: ['vehicles-stock', 'vehicles-sold', 'vehicles-available', 'vehicles-stale'] },
  { label: 'Financeiro', reports: ['dre-consolidated', 'sales-by-period', 'sales-by-seller', 'commissions'] },
  { label: 'Documentos & oficina', reports: ['documents-pending', 'documents-expiring', 'maintenances', 'future-revisions'] },
  { label: 'Peças', reports: ['parts-stock', 'parts-low-stock'] },
  { label: 'Marketing & leads', reports: ['leads', 'conversions', 'marketing-interested'] },
];

export function ReportsPage() {
  return (
    <Page eyebrow="Administração" title="Relatórios" >
      {REPORT_GROUPS.map((group) => (
        <Card key={group.label} title={group.label}>
          <div className="report-grid">
            {group.reports.map((report) => (
              <div className="list-row" key={report}>
                <span>{report}</span>
                <div className="toolbar">
                  <button className="button button-ghost" onClick={() => downloadReport(report, 'csv')}><Download size={15} /> CSV</button>
                  <button className="button button-ghost" onClick={() => downloadReport(report, 'json')}><FileJson size={15} /> JSON</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </Page>
  );
}

/* ----------------------------------------------------------- Audit */

export function AuditPage() {
  const listQuery = useList<Row>(['audit'], '/audit-logs', { page: 1, limit: 50 });
  return (
    <Page eyebrow="Administração" title="Auditoria">
      <Card subtitle="Trilha de quem fez o quê, quando e por quê.">
        <Table
          query={listQuery}
          columns={[
            { key: 'action', label: 'Ação', render: (row) => <Badge value={String(row.action ?? '—')} /> },
            { key: 'entity', label: 'Entidade' },
            { key: 'entityId', label: 'Registro' },
            { key: 'reason', label: 'Motivo' },
            { key: 'createdAt', label: 'Data' },
          ]}
        />
      </Card>
    </Page>
  );
}
