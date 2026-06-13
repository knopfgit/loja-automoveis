const uploadBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace('/api', '');

export function formatCurrency(value?: number | string | null) {
  // APIs com Decimal podem serializar o valor como string numerica.
  const amount = typeof value === 'string' ? Number(value) : value;
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'Consulte';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
}

export function formatDate(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

export function imageUrl(url: string) {
  if (url.startsWith('http')) return url;
  return `${uploadBase}${url.startsWith('/') ? '' : '/'}${url}`;
}
