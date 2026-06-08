import { Download, Heart, ShieldAlert, Trash2, Upload } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, unwrapList } from '../../services/api';
import { EmptyState, ErrorState, LoadingState } from '../../components/State';
import { VehicleCard } from '../../components/VehicleCard';
import type { Vehicle } from '../../types';
import { formatDate } from '../../utils/format';

function customerMe() {
  return unwrap<Record<string, unknown>>(api.get('/customers/me'));
}

function favorites() {
  return unwrapList<Vehicle>(api.get('/favorites'));
}

function history() {
  return unwrapList<Record<string, unknown>>(api.get('/me/view-history'));
}

function documents() {
  return unwrapList<Record<string, unknown>>(api.get('/me/documents'));
}

export function AccountPage() {
  const account = useQuery({ queryKey: ['customerMe'], queryFn: customerMe });
  if (account.isLoading) return <LoadingState />;
  if (account.isError) return <ErrorState error={account.error} />;

  return (
    <Panel title="Minha conta" eyebrow="Cliente">
      <div className="info-grid">
        {Object.entries(account.data ?? {}).slice(0, 12).map(([key, value]) => (
          <div key={key}><strong>{key}</strong><span>{String(value ?? '-')}</span></div>
        ))}
      </div>
    </Panel>
  );
}

export function FavoritesPage() {
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: ['favorites'], queryFn: favorites });
  const remove = useMutation({
    mutationFn: (vehicleId: string) => api.delete(`/favorites/${vehicleId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  return (
    <Panel title="Meus favoritos" eyebrow="Garagem">
      {list.isLoading && <LoadingState />}
      {list.isError && <ErrorState error={list.error} />}
      {list.data?.items.length === 0 && <EmptyState />}
      <div className="vehicle-grid">
        {list.data?.items.map((vehicle) => (
          <div key={vehicle.id} className="stack">
            <VehicleCard vehicle={vehicle} />
            <button className="button button-ghost" onClick={() => remove.mutate(vehicle.id)}><Heart size={17} /> Remover favorito</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ViewHistoryPage() {
  const list = useQuery({ queryKey: ['viewHistory'], queryFn: history });
  return (
    <Panel title="Historico de visualizacoes" eyebrow="Atividade">
      {list.isLoading && <LoadingState />}
      {list.isError && <ErrorState error={list.error} />}
      {list.data?.items.length === 0 && <EmptyState />}
      <DataTable rows={list.data?.items ?? []} />
    </Panel>
  );
}

export function PrivacyPage() {
  const exportRequest = useMutation({ mutationFn: () => api.post('/privacy/export-request') });
  const deleteRequest = useMutation({ mutationFn: () => api.post('/privacy/delete-request') });
  const marketing = useMutation({ mutationFn: (payload: Record<string, boolean>) => api.put('/marketing/preferences', payload) });

  return (
    <Panel title="Privacidade e marketing" eyebrow="LGPD">
      <div className="action-grid">
        <button className="button button-dark" onClick={() => exportRequest.mutate()}><Download size={17} /> Exportar meus dados</button>
        <button className="button button-danger" onClick={() => deleteRequest.mutate()}><Trash2 size={17} /> Excluir minha conta</button>
        <button className="button button-ghost" onClick={() => marketing.mutate({ email: true, whatsapp: true, sms: false })}><ShieldAlert size={17} /> Atualizar preferencias</button>
      </div>
      {(exportRequest.isSuccess || deleteRequest.isSuccess || marketing.isSuccess) && <div className="success-box">Solicitacao registrada.</div>}
    </Panel>
  );
}

export function PurchasesPage() {
  const docs = useQuery({ queryKey: ['myDocuments'], queryFn: documents });
  return (
    <Panel title="Compras e documentos" eyebrow="Cliente">
      <div className="upload-strip">
        <Upload size={18} />
        <span>Documentos pessoais e pendencias da compra</span>
      </div>
      {docs.isLoading && <LoadingState />}
      {docs.isError && <ErrorState error={docs.error} />}
      {docs.data?.items.length === 0 && <EmptyState title="Nenhum documento encontrado." />}
      <DataTable rows={docs.data?.items ?? []} />
    </Panel>
  );
}

export function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="page">
      <section className="section compact">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {children}
      </section>
    </div>
  );
}

export function DataTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (rows.length === 0) return null;
  const keys = Object.keys(rows[0]).slice(0, 6);
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{keys.map((key) => <th key={key}>{key}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)}>
              {keys.map((key) => <td key={key}>{key.toLowerCase().includes('date') ? formatDate(String(row[key])) : String(row[key] ?? '-')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
