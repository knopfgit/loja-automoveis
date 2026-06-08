import {
  BadgeDollarSign,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Car,
  CalendarCheck,
  FileSignature,
  FileText,
  Filter,
  Heart,
  History,
  Home,
  LayoutDashboard,
  Lock,
  type LucideIcon,
  MapPin,
  Megaphone,
  Package,
  Percent,
  PieChart,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  User,
  UserCog,
  Users,
  Wrench,
} from 'lucide-react';
import type { Role } from './types';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
  /** key matching a live counter (e.g. notifications). */
  badge?: 'notifications';
};

export type NavGroup = {
  label?: string;
  items: NavItem[];
};

export const publicNav: NavItem[] = [
  { to: '/', label: 'Vitrine', icon: Home },
  { to: '/catalogo', label: 'Estoque', icon: Car },
  { to: '/onde-estamos', label: 'Onde estamos', icon: MapPin },
];

export const customerNav: NavGroup[] = [
  {
    label: 'Minha área',
    items: [
      { to: '/cliente/conta', label: 'Minha conta', icon: User },
      { to: '/cliente/favoritos', label: 'Favoritos', icon: Heart },
      { to: '/cliente/historico', label: 'Histórico', icon: History },
      { to: '/cliente/compras', label: 'Compras & documentos', icon: FileText },
      { to: '/cliente/privacidade', label: 'Privacidade & LGPD', icon: Lock },
    ],
  },
  {
    label: 'Loja',
    items: [
      { to: '/', label: 'Vitrine', icon: Home },
      { to: '/catalogo', label: 'Estoque', icon: Car },
      { to: '/onde-estamos', label: 'Onde estamos', icon: MapPin },
    ],
  },
];

export const staffNav: NavGroup[] = [
  {
    label: 'Visão geral',
    items: [{ to: '/interno/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SELLER'] }],
  },
  {
    label: 'Estoque & oficina',
    items: [
      { to: '/interno/veiculos', label: 'Veículos', icon: Car, roles: ['ADMIN', 'SELLER'] },
      { to: '/interno/pecas', label: 'Peças & fornecedores', icon: Package, roles: ['ADMIN', 'SELLER'] },
      { to: '/interno/manutencoes', label: 'Manutenções', icon: Wrench, roles: ['ADMIN', 'SELLER'] },
      { to: '/interno/documentos', label: 'Documentos', icon: FileText, roles: ['ADMIN', 'SELLER'] },
    ],
  },
  {
    label: 'Comercial',
    items: [
      { to: '/interno/funil', label: 'Funil', icon: Filter, roles: ['ADMIN', 'SELLER'] },
      { to: '/interno/aquisicoes', label: 'Aquisições', icon: Boxes, roles: ['ADMIN'] },
      { to: '/interno/reservas', label: 'Reservas', icon: CalendarCheck, roles: ['ADMIN', 'SELLER'] },
      { to: '/interno/vendas', label: 'Vendas', icon: ShoppingCart, roles: ['ADMIN', 'SELLER'] },
      { to: '/interno/leads', label: 'Leads', icon: Megaphone, roles: ['ADMIN', 'SELLER'] },
      { to: '/interno/clientes', label: 'Clientes', icon: Users, roles: ['ADMIN', 'SELLER'] },
    ],
  },
  {
    label: 'Financeiro',
    items: [
      { to: '/interno/comissoes', label: 'Comissões', icon: BadgeDollarSign, roles: ['ADMIN', 'SELLER'] },
      { to: '/interno/dre', label: 'DRE', icon: PieChart, roles: ['ADMIN'] },
      { to: '/interno/financeiro', label: 'Lançamentos', icon: Receipt, roles: ['ADMIN'] },
      { to: '/interno/regras-comissao', label: 'Regras de comissão', icon: Percent, roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Administração',
    items: [
      { to: '/interno/funcionarios', label: 'Funcionários', icon: UserCog, roles: ['ADMIN'] },
      { to: '/interno/usuarios', label: 'Usuários & acessos', icon: ShieldCheck, roles: ['ADMIN'] },
      { to: '/interno/config-documentos', label: 'Config. documentos', icon: FileSignature, roles: ['ADMIN'] },
      { to: '/interno/config-loja', label: 'Config. da loja', icon: Building2, roles: ['ADMIN'] },
      { to: '/interno/relatorios', label: 'Relatórios', icon: BarChart3, roles: ['ADMIN'] },
      { to: '/interno/auditoria', label: 'Auditoria', icon: ShieldCheck, roles: ['ADMIN'] },
    ],
  },
  {
    label: 'Conta',
    items: [{ to: '/interno/notificacoes', label: 'Notificações', icon: Bell, roles: ['ADMIN', 'SELLER'], badge: 'notifications' }],
  },
];
