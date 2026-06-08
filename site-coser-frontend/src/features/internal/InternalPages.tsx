import { CheckCircle2, Download, FileText, Plus, RefreshCcw, Upload } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, unwrapList } from '../../services/api';
import { connectRealtime } from '../../services/realtime';
import { EmptyState, ErrorState, LoadingState } from '../../components/State';
import { useAuth } from '../auth/AuthProvider';
import { DataTable, Panel } from '../customer/CustomerPages';
import type { RealtimeMessage, Vehicle } from '../../types';
import { formatCurrency } from '../../utils/format';

function rows(endpoint: string, params?: Record<string, unknown>) {
  return unwrapList<Record<string, unknown>>(api.get(endpoint, { params }));
}

function item(endpoint: string) {
  return unwrap<Record<string, unknown>>(api.get(endpoint));
}

export function DashboardPage() {
  const { user, accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<RealtimeMessage[]>([]);
  const endpoint = user?.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/seller';
  const dashboard = useQuery({ queryKey: ['dashboard', user?.role], queryFn: () => item(endpoint), enabled: user?.role === 'ADMIN' || user?.role === 'SELLER' });

  useEffect(() => {
    if (!accessToken) return;
    const socket = connectRealtime(accessToken, (message) => {
      setEvents((current) => [message, ...current].slice(0, 6));
      if (message.event === 'dashboard.updated') void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (message.event === 'notification.created') void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => {
      socket.disconnect();
    };
  }, [accessToken, queryClient]);

  return (
    <Panel title="Dashboard" eyebrow="Tempo real">
      {dashboard.isLoading && <LoadingState />}
      {dashboard.isError && <ErrorState error={dashboard.error} />}
      {dashboard.data && (
        <div className="metric-grid">
          {Object.entries(dashboard.data).slice(0, 8).map(([key, value]) => (
            <div className="metric" key={key}><span>{key}</span><strong>{typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value)}</strong></div>
          ))}
        </div>
      )}
      <h2>Eventos recentes</h2>
      {events.length === 0 ? <EmptyState title="Aguardando eventos do WebSocket." /> : <DataTable rows={events as unknown as Record<string, unknown>[]} />}
    </Panel>
  );
}

export function VehiclesAdminPage() {
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: ['adminVehicles'], queryFn: () => unwrapList<Vehicle>(api.get('/vehicles', { params: { page: 1, limit: 20 } })) });
  const create = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/vehicles', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminVehicles'] }),
  });
  const status = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => api.post(`/vehicles/${id}/status`, { status: next }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminVehicles'] }),
  });
  const specs = useMutation({ mutationFn: (id: string) => api.post(`/vehicles/${id}/apply-specs`, {}) });
  const upload = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      if (file.size > 10 * 1024 * 1024) throw new Error('Arquivo acima de 10MB.');
      if (!file.type.startsWith('image/')) throw new Error('Envie apenas imagens.');
      const form = new FormData();
      form.append('file', file);
      return api.post(`/vehicles/${id}/media/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminVehicles'] }),
  });

  function submitVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const raw = Object.fromEntries(form.entries());
    const payload = {
      brand: raw.brand,
      model: raw.model,
      version: raw.version,
      modelYear: Number(raw.modelYear),
      manufactureYear: Number(raw.manufactureYear || raw.modelYear),
      category: raw.category,
      color: raw.color,
      fuel: raw.fuel,
      transmission: raw.transmission,
      mileage: Number(raw.mileage || 0),
      price: Number(raw.price || 0),
      status: 'DRAFT',
      description: raw.description,
    };
    create.mutate(payload);
    event.currentTarget.reset();
  }

  return (
    <Panel title="Gestao de veiculos" eyebrow="Estoque">
      <form className="cadastro-panel glass-soft" onSubmit={submitVehicle}>
        <div className="cadastro-head">
          <div>
            <span className="eyebrow">Cadastro minimalista</span>
            <h2>Novo carro</h2>
          </div>
          <button className="button button-primary" type="submit" disabled={create.isPending}><Plus size={17} /> Salvar rascunho</button>
        </div>
        <div className="vehicle-form-grid">
          <input name="brand" placeholder="Marca" required />
          <input name="model" placeholder="Modelo" required />
          <input name="version" placeholder="Versao" />
          <input name="modelYear" placeholder="Ano modelo" inputMode="numeric" required />
          <input name="manufactureYear" placeholder="Ano fabricacao" inputMode="numeric" />
          <input name="price" placeholder="Preco anunciado" inputMode="numeric" required />
          <input name="mileage" placeholder="Quilometragem" inputMode="numeric" />
          <input name="color" placeholder="Cor" />
          <select name="fuel" defaultValue="">
            <option value="">Combustivel</option>
            <option value="FLEX">Flex</option>
            <option value="GASOLINE">Gasolina</option>
            <option value="DIESEL">Diesel</option>
            <option value="ELECTRIC">Eletrico</option>
            <option value="HYBRID">Hibrido</option>
          </select>
          <select name="transmission" defaultValue="">
            <option value="">Cambio</option>
            <option value="MANUAL">Manual</option>
            <option value="AUTOMATIC">Automatico</option>
          </select>
          <input name="category" placeholder="Categoria" />
          <input name="description" placeholder="Descricao curta" />
        </div>
      </form>
      <div className="action-grid">
        <span className="hint">{'Status: DRAFT -> AVAILABLE -> RESERVED -> SOLD -> ARCHIVED'}</span>
      </div>
      {list.isLoading && <LoadingState />}
      {list.isError && <ErrorState error={list.error} />}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Veiculo</th><th>Status</th><th>Preco</th><th>Acoes</th></tr></thead>
          <tbody>
            {list.data?.items.map((vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.brand} {vehicle.model}</td>
                <td>{vehicle.status ?? '-'}</td>
                <td>{formatCurrency(vehicle.price)}</td>
                <td className="row-actions">
                  <button className="button button-ghost" onClick={() => specs.mutate(vehicle.id)}><RefreshCcw size={16} /> Specs</button>
                  <button className="button button-ghost" onClick={() => status.mutate({ id: vehicle.id, next: 'AVAILABLE' })}><CheckCircle2 size={16} /> Publicar</button>
                  <select
                    className="status-select"
                    defaultValue=""
                    onChange={(event) => {
                      if (event.target.value) status.mutate({ id: vehicle.id, next: event.target.value });
                    }}
                  >
                    <option value="">Status</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="RESERVED">RESERVED</option>
                    <option value="SOLD">SOLD</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                  <label className="button button-ghost">
                    <Upload size={16} /> Foto
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) upload.mutate({ id: vehicle.id, file });
                      }}
                    />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function FunnelPage() {
  const acquisitions = useQuery({ queryKey: ['acquisitions'], queryFn: () => rows('/acquisitions'), retry: false });
  const reservations = useQuery({ queryKey: ['reservations'], queryFn: () => rows('/reservations') });
  const sales = useQuery({ queryKey: ['sales'], queryFn: () => rows('/sales') });

  return (
    <Panel title="Funil comercial" eyebrow="Aquisicoes, reservas e vendas">
      <ThreeColumns
        columns={[
          { title: 'Aquisicoes', query: acquisitions },
          { title: 'Reservas', query: reservations },
          { title: 'Vendas', query: sales },
        ]}
      />
    </Panel>
  );
}

export function CommissionsPage() {
  const { user } = useAuth();
  const endpoint = user?.role === 'ADMIN' ? '/commissions' : '/commissions/me';
  const list = useQuery({ queryKey: ['commissions', endpoint], queryFn: () => rows(endpoint) });
  return <SimpleList title="Extrato de comissoes" eyebrow={user?.role === 'ADMIN' ? 'Todas' : 'Minhas'} query={list} />;
}

export function DrePage() {
  const consolidated = useQuery({ queryKey: ['dre'], queryFn: () => item('/dre/consolidated') });
  return (
    <Panel title="DRE consolidada" eyebrow="Financeiro">
      {consolidated.isLoading && <LoadingState />}
      {consolidated.isError && <ErrorState error={consolidated.error} />}
      {consolidated.data && <DataTable rows={[consolidated.data]} />}
    </Panel>
  );
}

export function PartsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [lowStock, setLowStock] = useState(false);
  const parts = useQuery({ queryKey: ['parts', lowStock], queryFn: () => rows('/parts', lowStock ? { lowStock: true } : undefined) });
  const suppliers = useQuery({ queryKey: ['suppliers'], queryFn: () => rows('/suppliers') });
  const createPart = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.post('/parts', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parts'] }),
  });

  function submitPart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const raw = Object.fromEntries(form.entries());
    createPart.mutate({
      name: raw.name,
      sku: raw.sku,
      currentStock: Number(raw.currentStock || 0),
      minStock: Number(raw.minStock || 0),
      salePrice: Number(raw.salePrice || 0),
      location: raw.location,
    });
    event.currentTarget.reset();
  }

  return (
    <div className="page">
      <section className="section compact">
        <div className="cadastro-panel glass-soft">
          <div className="cadastro-head">
            <div>
              <span className="eyebrow">Liquid glass</span>
              <h1>Pecas e cadastros</h1>
            </div>
            <label className="toggle-chip">
              <input type="checkbox" checked={lowStock} onChange={(event) => setLowStock(event.target.checked)} />
              Somente baixo estoque
            </label>
          </div>
          {user?.role === 'ADMIN' && (
            <form className="piece-form-grid" onSubmit={submitPart}>
              <input name="name" placeholder="Nome da peca" required />
              <input name="sku" placeholder="SKU / codigo" />
              <input name="currentStock" placeholder="Estoque atual" inputMode="numeric" />
              <input name="minStock" placeholder="Estoque minimo" inputMode="numeric" />
              <input name="salePrice" placeholder="Preco de venda" inputMode="numeric" />
              <input name="location" placeholder="Localizacao" />
              <button className="button button-primary" type="submit" disabled={createPart.isPending}><Plus size={17} /> Cadastrar peca</button>
            </form>
          )}
        </div>
        <div className="column-grid">
          <div className="mini-panel"><h2>Pecas</h2><SimpleList title="" eyebrow="" query={parts} embedded /></div>
          <div className="mini-panel"><h2>Fornecedores</h2><SimpleList title="" eyebrow="" query={suppliers} embedded /></div>
        </div>
      </section>
    </div>
  );
}

export function DocumentsPage() {
  const docs = useQuery({ queryKey: ['documents'], queryFn: () => rows('/documents') });
  return (
    <Panel title="Documentos" eyebrow="Checklist e pendencias">
      <div className="upload-strip"><FileText size={18} /> Checklist, pendencias e arquivos restritos</div>
      <SimpleList title="" eyebrow="" query={docs} embedded />
    </Panel>
  );
}

export function LeadsPage() {
  const leads = useQuery({ queryKey: ['leads'], queryFn: () => rows('/leads') });
  return <SimpleList title="Leads" eyebrow="Atendimento" query={leads} />;
}

export function NotificationsPage() {
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: ['notifications'], queryFn: () => rows('/notifications') });
  const readAll = useMutation({ mutationFn: () => api.patch('/notifications/read-all'), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }) });
  return (
    <Panel title="Notificacoes" eyebrow="Central">
      <button className="button button-ghost" onClick={() => readAll.mutate()}>Marcar todas como lidas</button>
      <SimpleList title="" eyebrow="" query={list} embedded />
    </Panel>
  );
}

export function ReportsPage() {
  const reports = ['vehicles-stock', 'vehicles-sold', 'dre-consolidated', 'sales-by-period', 'commissions', 'documents-pending', 'parts-stock', 'leads'];
  return (
    <Panel title="Relatorios" eyebrow="Exportacao">
      <div className="report-grid">
        {reports.map((report) => (
          <a key={report} className="button button-ghost" href={`${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/reports/${report}?format=csv`}>
            <Download size={17} /> {report}
          </a>
        ))}
      </div>
    </Panel>
  );
}

export function AuditPage() {
  const audit = useQuery({ queryKey: ['audit'], queryFn: () => rows('/audit-logs') });
  return <SimpleList title="Auditoria" eyebrow="ADMIN" query={audit} />;
}

type QueryLike = ReturnType<typeof useQuery<Awaited<ReturnType<typeof rows>>>>;

function SimpleList({ title, eyebrow, query, embedded = false }: { title: string; eyebrow: string; query: QueryLike; embedded?: boolean }) {
  const body = (
    <>
      {query.isLoading && <LoadingState />}
      {query.isError && <ErrorState error={query.error} />}
      {query.data?.items.length === 0 && <EmptyState />}
      <DataTable rows={query.data?.items ?? []} />
    </>
  );
  if (embedded) return body;
  return <Panel title={title} eyebrow={eyebrow}>{body}</Panel>;
}

function ThreeColumns({ columns }: { columns: { title: string; query: QueryLike }[] }) {
  return (
    <div className="page">
      <section className="section compact">
        <div className="column-grid">
          {columns.map((column) => (
            <div className="mini-panel" key={column.title}>
              <h2>{column.title}</h2>
              {column.query.isLoading && <LoadingState />}
              {column.query.isError && <ErrorState error={column.query.error} />}
              {column.query.data?.items.length === 0 && <EmptyState />}
              <DataTable rows={column.query.data?.items ?? []} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
