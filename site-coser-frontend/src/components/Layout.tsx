import { Bell, Car, ChartNoAxesCombined, ClipboardList, Home, LogOut, Menu, Moon, Shield, Sun, User, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';

const publicLinks = [
  { to: '/', label: 'Vitrine', icon: Home },
  { to: '/catalogo', label: 'Catalogo', icon: Car },
  { to: '/onde-estamos', label: 'Onde estamos', icon: ClipboardList },
];

const customerLinks = [
  { to: '/cliente/conta', label: 'Minha conta', icon: User },
  { to: '/cliente/favoritos', label: 'Favoritos', icon: Car },
  { to: '/cliente/historico', label: 'Historico', icon: ClipboardList },
  { to: '/cliente/privacidade', label: 'Privacidade', icon: Shield },
  { to: '/cliente/compras', label: 'Compras', icon: ClipboardList },
];

const staffLinks = [
  { to: '/interno/dashboard', label: 'Dashboard', icon: ChartNoAxesCombined, roles: ['ADMIN', 'SELLER'] },
  { to: '/interno/veiculos', label: 'Veiculos', icon: Car, roles: ['ADMIN', 'SELLER'] },
  { to: '/interno/funil', label: 'Funil', icon: ClipboardList, roles: ['ADMIN', 'SELLER'] },
  { to: '/interno/comissoes', label: 'Comissoes', icon: ChartNoAxesCombined, roles: ['ADMIN', 'SELLER'] },
  { to: '/interno/dre', label: 'DRE', icon: ChartNoAxesCombined, roles: ['ADMIN'] },
  { to: '/interno/pecas', label: 'Pecas', icon: Wrench, roles: ['ADMIN', 'SELLER'] },
  { to: '/interno/documentos', label: 'Documentos', icon: ClipboardList, roles: ['ADMIN', 'SELLER'] },
  { to: '/interno/leads', label: 'Leads', icon: Bell, roles: ['ADMIN', 'SELLER'] },
  { to: '/interno/notificacoes', label: 'Notificacoes', icon: Bell, roles: ['ADMIN', 'SELLER'] },
  { to: '/interno/relatorios', label: 'Relatorios', icon: ClipboardList, roles: ['ADMIN'] },
  { to: '/interno/auditoria', label: 'Auditoria', icon: Shield, roles: ['ADMIN'] },
] as const;

function AppLink({ to, label, icon: Icon, onClick }: { to: string; label: string; icon: typeof Home; onClick?: () => void }) {
  return (
    <NavLink to={to} onClick={onClick} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export function Layout() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('coser.theme') as 'light' | 'dark' | null) ?? 'light');
  const { user, can, logout } = useAuth();
  const navigate = useNavigate();
  const links = user?.role === 'CUSTOMER' ? customerLinks : user ? staffLinks.filter((link) => can([...link.roles])) : publicLinks;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('coser.theme', theme);
  }, [theme]);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <div className="aurora" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <header className="header glass">
        <Link to="/" className="brand-lockup" aria-label="Vertex Motors">
          <span className="brand-mark">V</span>
          <span><strong>Vertex</strong><small>Motors</small></span>
        </Link>
        <nav className="main-nav" aria-label="Navegacao principal">
          {links.slice(0, 4).map((link) => (
            <NavLink key={link.to} to={link.to}>{link.label}</NavLink>
          ))}
        </nav>
        <button className="icon-button mobile-only" type="button" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
          <Menu size={21} />
        </button>
        <nav className="header-actions">
          <button
            className="icon-button"
            type="button"
            onClick={() => setTheme((value) => (value === 'light' ? 'dark' : 'light'))}
            aria-label="Alternar tema"
            title="Alternar tema"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {user ? (
            <>
              <span className="user-chip">{user.role}</span>
              <button className="button button-ghost" type="button" onClick={handleLogout}>
                <LogOut size={17} /> Sair
              </button>
            </>
          ) : (
            <>
              <Link className="button button-ghost" to="/login">Entrar</Link>
              <Link className="button button-dark" to="/cadastro">Criar conta</Link>
            </>
          )}
        </nav>
      </header>
      <aside className={`sidebar glass ${open ? 'open' : ''}`}>
        <nav>
          {links.map((link) => (
            <AppLink key={link.to} {...link} onClick={() => setOpen(false)} />
          ))}
        </nav>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
