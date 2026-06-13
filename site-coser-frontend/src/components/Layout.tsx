import { Bell, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BrandLockup } from './BrandLockup';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../features/auth/AuthProvider';
import { customerNav, type NavGroup, type NavItem, publicNav, staffNav } from '../nav';
import { item } from '../services/data';

function useUnreadCount(enabled: boolean) {
  const query = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => item<{ count: number }>('/notifications/unread-count'),
    enabled,
    refetchInterval: 60000,
  });
  return query.data?.count ?? 0;
}

function SidebarLink({ item: link, unread, onClick }: { item: NavItem; unread: number; onClick?: () => void }) {
  const Icon = link.icon;
  return (
    <NavLink to={link.to} onClick={onClick} end={link.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
      <Icon size={18} />
      <span>{link.label}</span>
      {link.badge === 'notifications' && unread > 0 && <span className="count">{unread > 99 ? '99+' : unread}</span>}
    </NavLink>
  );
}

export function Layout() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('coser.theme') as 'light' | 'dark' | null) ?? 'light');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === 'ADMIN' || user?.role === 'SELLER';
  const unread = useUnreadCount(Boolean(isStaff));

  const groups: NavGroup[] = user?.role === 'CUSTOMER' ? customerNav : isStaff ? staffNav : [{ items: publicNav }];
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((entry) => !entry.roles || (user && entry.roles.includes(user.role))),
    }))
    .filter((group) => group.items.length > 0);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('coser.theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const roleLabel = user?.role === 'ADMIN' ? 'Administrador' : user?.role === 'SELLER' ? 'Vendedor' : user?.role === 'CUSTOMER' ? 'Cliente' : '';

  return (
    <div className="app-shell">
      <div className="aurora" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <header className="header glass">
        <BrandLockup />
        <nav className="main-nav" aria-label="Navegação principal">
          {publicNav.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="icon-button mobile-only"
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="mobile-sidebar"
        >
          {open ? <X size={21} /> : <Menu size={21} />}
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
          {isStaff && (
            <Link className="icon-button" to="/interno/notificacoes" aria-label="Notificações" title="Notificações" style={{ position: 'relative' }}>
              <Bell size={18} />
              {unread > 0 && <span className="count" style={{ position: 'absolute', top: -4, right: -4 }}>{unread > 99 ? '99+' : unread}</span>}
            </Link>
          )}
          {user ? (
            <>
              <span className="user-chip">{roleLabel}</span>
              <button className="button button-ghost" type="button" onClick={handleLogout}>
                <LogOut size={17} /> Sair
              </button>
            </>
          ) : (
            <>
              <Link className="button button-ghost" to="/login">
                Entrar
              </Link>
              <Link className="button button-dark" to="/cadastro">
                Criar conta
              </Link>
            </>
          )}
        </nav>
      </header>

      {open && <div className="sidebar-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}

      {/* Para visitantes a gaveta existe apenas no mobile (classe sidebar-public);
          logado, ela é a navegação lateral padrão. */}
      <aside id="mobile-sidebar" className={`sidebar glass ${user ? '' : 'sidebar-public'} ${open ? 'open' : ''}`}>
        <div className="sidebar-scroll">
          {user && user.role !== 'CUSTOMER' && (
            <div className="role-tag">
              <small>Painel</small>
              <strong>{roleLabel}</strong>
            </div>
          )}
          {visibleGroups.map((group, index) => (
            <div className="nav-group" key={group.label ?? index}>
              {group.label && <span className="nav-group-label">{group.label}</span>}
              {group.items.map((link) => (
                <SidebarLink key={link.to} item={link} unread={unread} onClick={() => setOpen(false)} />
              ))}
            </div>
          ))}
        </div>
      </aside>

      <main className={`main ${user ? '' : 'main-full'}`}>
        <Outlet />
      </main>
    </div>
  );
}
