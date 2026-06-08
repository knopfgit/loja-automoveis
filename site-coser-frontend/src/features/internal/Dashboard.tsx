import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { useItem } from '../../services/data';
import { connectRealtime } from '../../services/realtime';
import { Badge, Card, Page, Stat, StatGrid, Table } from '../../components/ui';
import { ErrorState, LoadingState } from '../../components/State';
import { useAuth } from '../auth/AuthProvider';
import { formatCurrency } from '../../utils/format';
import type { RealtimeMessage } from '../../types';

type AdminDashboard = {
  vehicles: { available: number; inMaintenance: number; reserved: number; sold: number };
  finance: {
    revenueMonth: number;
    revenueTotal: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
    avgMargin: number;
    commissionsPending: number;
    commissionsPaid: number;
  };
  alerts: { lowStockParts: number; pendingDocuments: number; expiringDocuments: number };
  sales: { thisMonth: number; bySeller: { name: string; count: number; total: number }[] };
  leads: { pending: number; total: number; converted: number; conversionRate: number };
  longestInStock: { vehicle: string; daysInStock: number; status: string }[];
};

type SellerDashboard = {
  leads: { total: number; pendingContacts: number; negotiations: number };
  sales: { thisMonth: number };
  commissions: { count: number; total: number; byStatus: { status: string; total: number }[] };
  reservationsExpiring: number;
};

export function DashboardPage() {
  const { user, accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<RealtimeMessage[]>([]);
  const isAdmin = user?.role === 'ADMIN';
  const endpoint = isAdmin ? '/dashboard/admin' : '/dashboard/seller';
  const dashboard = useItem<AdminDashboard & SellerDashboard>(['dashboard', user?.role], endpoint, isAdmin || user?.role === 'SELLER');

  useEffect(() => {
    if (!accessToken) return;
    const socket = connectRealtime(accessToken, (message) => {
      setEvents((current) => [message, ...current].slice(0, 8));
      if (message.event === 'dashboard.updated') void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (message.event === 'notification.created') void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => {
      socket.disconnect();
    };
  }, [accessToken, queryClient]);

  return (
    <Page eyebrow="Tempo real" title="Dashboard">
      {dashboard.isLoading && <LoadingState />}
      {dashboard.isError && <ErrorState error={dashboard.error} />}
      {dashboard.data && isAdmin && <AdminView data={dashboard.data} />}
      {dashboard.data && !isAdmin && <SellerView data={dashboard.data} />}

      <Card title="Eventos em tempo real" subtitle="Atualizações recebidas via WebSocket.">
        {events.length === 0 ? (
          <div className="state">
            <Activity size={20} /> Aguardando eventos…
          </div>
        ) : (
          <div className="list-rows">
            {events.map((event, index) => (
              <div className="list-row" key={index}>
                <Badge value={event.event} />
                <span className="meta">{event.timestamp ? new Date(event.timestamp).toLocaleTimeString('pt-BR') : 'agora'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </Page>
  );
}

function AdminView({ data }: { data: AdminDashboard }) {
  return (
    <>
      <StatGrid>
        <Stat tone="ok" label="Disponíveis" value={data.vehicles.available} hint="Veículos no estoque" />
        <Stat tone="warn" label="Reservados" value={data.vehicles.reserved} />
        <Stat tone="warn" label="Em manutenção" value={data.vehicles.inMaintenance} />
        <Stat tone="brand" label="Vendidos" value={data.vehicles.sold} />
      </StatGrid>
      <StatGrid>
        <Stat tone="ok" label="Receita do mês" value={formatCurrency(data.finance.revenueMonth)} />
        <Stat tone="brand" label="Lucro líquido" value={formatCurrency(data.finance.netProfit)} hint={`Margem média ${data.finance.avgMargin}%`} />
        <Stat tone="neutral" label="Despesas" value={formatCurrency(data.finance.totalExpenses)} />
        <Stat tone="warn" label="Comissões pendentes" value={formatCurrency(data.finance.commissionsPending)} />
      </StatGrid>
      <StatGrid>
        <Stat tone="brand" label="Vendas no mês" value={data.sales.thisMonth} />
        <Stat tone="warn" label="Leads pendentes" value={data.leads.pending} hint={`${data.leads.conversionRate}% de conversão`} />
        <Stat tone="danger" label="Peças em baixo estoque" value={data.alerts.lowStockParts} />
        <Stat tone="warn" label="Documentos pendentes" value={data.alerts.pendingDocuments} hint={`${data.alerts.expiringDocuments} a vencer`} />
      </StatGrid>
      <div className="split-2">
        <Card title="Vendas por vendedor (mês)">
          <Table
            rows={data.sales.bySeller}
            empty="Sem vendas no mês."
            columns={[
              { key: 'name', label: 'Vendedor' },
              { key: 'count', label: 'Qtde', align: 'center' },
              { key: 'total', label: 'Total', align: 'right' },
            ]}
          />
        </Card>
        <Card title="Mais tempo em estoque">
          <Table
            rows={data.longestInStock}
            empty="Estoque saudável."
            columns={[
              { key: 'vehicle', label: 'Veículo' },
              { key: 'daysInStock', label: 'Dias', align: 'center' },
              { key: 'status', label: 'Status' },
            ]}
          />
        </Card>
      </div>
    </>
  );
}

function SellerView({ data }: { data: SellerDashboard }) {
  return (
    <>
      <StatGrid>
        <Stat tone="brand" label="Meus leads" value={data.leads.total} />
        <Stat tone="warn" label="Aguardando contato" value={data.leads.pendingContacts} />
        <Stat tone="warn" label="Em negociação" value={data.leads.negotiations} />
        <Stat tone="danger" label="Reservas a expirar" value={data.reservationsExpiring} />
      </StatGrid>
      <StatGrid>
        <Stat tone="ok" label="Minhas vendas (mês)" value={data.sales.thisMonth} />
        <Stat tone="brand" label="Comissões" value={data.commissions.count} hint="No total" />
        <Stat tone="ok" label="Total em comissões" value={formatCurrency(data.commissions.total)} />
      </StatGrid>
      <Card title="Comissões por status">
        <Table
          rows={data.commissions.byStatus}
          empty="Nenhuma comissão ainda."
          columns={[
            { key: 'status', label: 'Status' },
            { key: 'total', label: 'Total', align: 'right' },
          ]}
        />
      </Card>
    </>
  );
}
