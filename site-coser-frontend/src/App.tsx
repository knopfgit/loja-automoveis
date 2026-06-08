import { Navigate, Route, Routes } from 'react-router-dom';
import { CookieConsent } from './components/CookieConsent';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ForgotPasswordPage, LoginPage, RegisterPage } from './features/auth/AuthPages';
import { AccountPage, FavoritesPage, PrivacyPage, PurchasesPage, ViewHistoryPage } from './features/customer/CustomerPages';
import {
  AuditPage,
  CommissionsPage,
  DashboardPage,
  DocumentsPage,
  DrePage,
  FunnelPage,
  LeadsPage,
  NotificationsPage,
  PartsPage,
  ReportsPage,
  VehiclesAdminPage,
} from './features/internal/InternalPages';
import { CatalogPage } from './features/public/CatalogPage';
import { HomePage } from './features/public/HomePage';
import { LocationPage } from './features/public/LocationPage';
import { VehicleDetailPage } from './features/public/VehicleDetailPage';

export function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogo" element={<CatalogPage />} />
          <Route path="veiculos/:slug" element={<VehicleDetailPage />} />
          <Route path="onde-estamos" element={<LocationPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="cadastro" element={<RegisterPage />} />
          <Route path="recuperar-senha" element={<ForgotPasswordPage />} />

          <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
            <Route path="cliente/conta" element={<AccountPage />} />
            <Route path="cliente/favoritos" element={<FavoritesPage />} />
            <Route path="cliente/historico" element={<ViewHistoryPage />} />
            <Route path="cliente/privacidade" element={<PrivacyPage />} />
            <Route path="cliente/compras" element={<PurchasesPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['ADMIN', 'SELLER']} />}>
            <Route path="interno/dashboard" element={<DashboardPage />} />
            <Route path="interno/veiculos" element={<VehiclesAdminPage />} />
            <Route path="interno/funil" element={<FunnelPage />} />
            <Route path="interno/comissoes" element={<CommissionsPage />} />
            <Route path="interno/pecas" element={<PartsPage />} />
            <Route path="interno/documentos" element={<DocumentsPage />} />
            <Route path="interno/leads" element={<LeadsPage />} />
            <Route path="interno/notificacoes" element={<NotificationsPage />} />
          </Route>

          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="interno/dre" element={<DrePage />} />
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
