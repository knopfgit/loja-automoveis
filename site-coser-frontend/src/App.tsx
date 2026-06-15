import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { CookieConsent } from './components/CookieConsent';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingState } from './components/State';
import { CatalogPage } from './features/public/CatalogPage';
import { HomePage } from './features/public/HomePage';
import { LocationPage } from './features/public/LocationPage';
import { VehicleDetailPage } from './features/public/VehicleDetailPage';

// Paginas autenticadas carregadas sob demanda: visitantes do site publico nao
// baixam o codigo do painel interno nem da area do cliente.
const auth = () => import('./features/auth/AuthPages');
const LoginPage = lazy(() => auth().then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => auth().then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => auth().then((m) => ({ default: m.ForgotPasswordPage })));

const customer = () => import('./features/customer/CustomerPages');
const AccountPage = lazy(() => customer().then((m) => ({ default: m.AccountPage })));
const FavoritesPage = lazy(() => customer().then((m) => ({ default: m.FavoritesPage })));
const ViewHistoryPage = lazy(() => customer().then((m) => ({ default: m.ViewHistoryPage })));
const PurchasesPage = lazy(() => customer().then((m) => ({ default: m.PurchasesPage })));
const PrivacyPage = lazy(() => customer().then((m) => ({ default: m.PrivacyPage })));

const internal = () => import('./features/internal');
const DashboardPage = lazy(() => internal().then((m) => ({ default: m.DashboardPage })));
const VehiclesAdminPage = lazy(() => internal().then((m) => ({ default: m.VehiclesAdminPage })));
const PartsPage = lazy(() => internal().then((m) => ({ default: m.PartsPage })));
const MaintenancePage = lazy(() => internal().then((m) => ({ default: m.MaintenancePage })));
const DocumentsPage = lazy(() => internal().then((m) => ({ default: m.DocumentsPage })));
const FunnelPage = lazy(() => internal().then((m) => ({ default: m.FunnelPage })));
const ReservationsPage = lazy(() => internal().then((m) => ({ default: m.ReservationsPage })));
const SalesPage = lazy(() => internal().then((m) => ({ default: m.SalesPage })));
const LeadsPage = lazy(() => internal().then((m) => ({ default: m.LeadsPage })));
const CustomersPage = lazy(() => internal().then((m) => ({ default: m.CustomersPage })));
const CommissionsPage = lazy(() => internal().then((m) => ({ default: m.CommissionsPage })));
const NotificationsPage = lazy(() => internal().then((m) => ({ default: m.NotificationsPage })));
const AcquisitionsPage = lazy(() => internal().then((m) => ({ default: m.AcquisitionsPage })));
const DrePage = lazy(() => internal().then((m) => ({ default: m.DrePage })));
const FinancialPage = lazy(() => internal().then((m) => ({ default: m.FinancialPage })));
const CommissionRulesPage = lazy(() => internal().then((m) => ({ default: m.CommissionRulesPage })));
const EmployeesPage = lazy(() => internal().then((m) => ({ default: m.EmployeesPage })));
const UsersAccessPage = lazy(() => internal().then((m) => ({ default: m.UsersAccessPage })));
const DocumentConfigPage = lazy(() => internal().then((m) => ({ default: m.DocumentConfigPage })));
const StoreConfigPage = lazy(() => internal().then((m) => ({ default: m.StoreConfigPage })));
const ReportsPage = lazy(() => internal().then((m) => ({ default: m.ReportsPage })));
const AuditPage = lazy(() => internal().then((m) => ({ default: m.AuditPage })));

export function App() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route element={<Layout />}>
          {/* Public */}
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="veiculos/:slug" element={<VehicleDetailPage />} />
          <Route path="onde-estamos" element={<LocationPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="cadastro" element={<RegisterPage />} />
          <Route path="recuperar-senha" element={<ForgotPasswordPage />} />

          {/* Customer */}
          <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
            <Route path="cliente/conta" element={<AccountPage />} />
            <Route path="cliente/favoritos" element={<FavoritesPage />} />
            <Route path="cliente/historico" element={<ViewHistoryPage />} />
            <Route path="cliente/compras" element={<PurchasesPage />} />
            <Route path="cliente/privacidade" element={<PrivacyPage />} />
          </Route>

          {/* Staff: ADMIN + SELLER */}
          <Route element={<ProtectedRoute roles={['ADMIN', 'SELLER']} />}>
            <Route path="interno/dashboard" element={<DashboardPage />} />
            <Route path="interno/veiculos" element={<VehiclesAdminPage />} />
            <Route path="interno/pecas" element={<PartsPage />} />
            <Route path="interno/manutencoes" element={<MaintenancePage />} />
            <Route path="interno/documentos" element={<DocumentsPage />} />
            <Route path="interno/funil" element={<FunnelPage />} />
            <Route path="interno/reservas" element={<ReservationsPage />} />
            <Route path="interno/vendas" element={<SalesPage />} />
            <Route path="interno/leads" element={<LeadsPage />} />
            <Route path="interno/clientes" element={<CustomersPage />} />
            <Route path="interno/comissoes" element={<CommissionsPage />} />
            <Route path="interno/notificacoes" element={<NotificationsPage />} />
          </Route>

          {/* Staff: ADMIN only */}
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="interno/aquisicoes" element={<AcquisitionsPage />} />
            <Route path="interno/dre" element={<DrePage />} />
            <Route path="interno/financeiro" element={<FinancialPage />} />
            <Route path="interno/regras-comissao" element={<CommissionRulesPage />} />
            <Route path="interno/funcionarios" element={<EmployeesPage />} />
            <Route path="interno/usuarios" element={<UsersAccessPage />} />
            <Route path="interno/config-documentos" element={<DocumentConfigPage />} />
            <Route path="interno/config-loja" element={<StoreConfigPage />} />
            <Route path="interno/relatorios" element={<ReportsPage />} />
            <Route path="interno/auditoria" element={<AuditPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <CookieConsent />
    </Suspense>
  );
}
