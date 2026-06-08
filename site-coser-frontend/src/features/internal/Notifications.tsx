import { CheckCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useApiMutation, useList } from '../../services/data';
import { Badge, Card, Page, Table } from '../../components/ui';

type Row = Record<string, unknown> & { id: string };

export function NotificationsPage() {
  const listQuery = useList<Row>(['notifications', 'list'], '/notifications', { page: 1, limit: 50 });
  const readAll = useApiMutation(() => api.patch('/notifications/read-all'), {
    invalidate: [['notifications', 'list'], ['notifications', 'unread-count']],
  });
  const readOne = useApiMutation((id: string) => api.patch(`/notifications/${id}/read`), {
    invalidate: [['notifications', 'list'], ['notifications', 'unread-count']],
  });

  return (
    <Page
      eyebrow="Central"
      title="Notificações"
      actions={
        <button className="button button-ghost" onClick={() => readAll.mutate()} disabled={readAll.isPending}>
          <CheckCheck size={16} /> Marcar todas como lidas
        </button>
      }
    >
      <Card>
        <Table
          query={listQuery}
          empty="Nenhuma notificação."
          columns={[
            { key: 'read', label: '', align: 'center', render: (row) => (row.read ? '' : <span className="dot" />) },
            { key: 'title', label: 'Título' },
            { key: 'message', label: 'Mensagem' },
            { key: 'type', label: 'Tipo', render: (row) => (row.type ? <Badge value={String(row.type)} /> : '—') },
            { key: 'createdAt', label: 'Data' },
          ]}
          actions={(row) => (!row.read ? <button className="button button-ghost" onClick={() => readOne.mutate(row.id)}>Marcar lida</button> : null)}
        />
      </Card>
    </Page>
  );
}
