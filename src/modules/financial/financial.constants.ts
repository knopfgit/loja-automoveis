/**
 * Canonical DRE categories. Free-text is allowed, but these are the suggested
 * values used by automatic postings and reports.
 */
export const EXPENSE_CATEGORIES = [
  'Compra do veículo',
  'Transporte',
  'Guincho',
  'Vistoria',
  'Laudo cautelar',
  'Manutenção',
  'Revisão',
  'Peças',
  'Mão de obra',
  'Lavagem',
  'Polimento',
  'Funilaria',
  'Pintura',
  'Documentação',
  'Licenciamento',
  'IPVA',
  'Seguro',
  'Taxas',
  'Marketing',
  'Comissão',
  'Outros custos',
] as const;

export const REVENUE_CATEGORIES = [
  'Venda do veículo',
  'Serviços adicionais',
  'Garantia adicional',
  'Outros recebimentos',
] as const;

export const FINANCIAL_CATEGORIES = {
  PURCHASE: 'Compra do veículo',
  MAINTENANCE: 'Manutenção',
  PARTS: 'Peças',
  LABOR: 'Mão de obra',
  COMMISSION: 'Comissão',
  SALE: 'Venda do veículo',
} as const;
