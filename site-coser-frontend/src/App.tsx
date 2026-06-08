import { Navigate, Route, Routes } from 'react-router-dom';
import { CookieConsent } from './components/CookieConsent';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ForgotPasswordPage, LoginPage, RegisterPage } from './features/auth/AuthPages';
import { AccountPage, FavoritesPage, PrivacyPage, PurchasesPage, ViewHistoryPage } from './features/customer/CustomerPages';
import {
  AcquisitionsPage,
  AuditPage,
  CommissionRulesPage,
  CommissionsPage,
  CustomersPage,
  DashboardPage,
  DocumentConfigPage,
  DocumentsPage,
  DrePage,
  EmployeesPage,
  FinancialPage,
  FunnelPage,
  LeadsPage,
  MaintenancePage,
  NotificationsPage,
  PartsPage,
  ReportsPage,
  ReservationsPage,
  SalesPage,
  StoreConfigPage,
  UsersAccessPage,
  VehiclesAdminPage,
} from './features/internal';
import { CatalogPage } from './features/public/CatalogPage';
import { HomePage } from './features/public/HomePage';
import { LocationPage } from './features/public/LocationPage';
import { VehicleDetailPage } from './features/public/VehicleDetailPage';

export function App() {
  return (
    <>
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
    </>
  );
}
