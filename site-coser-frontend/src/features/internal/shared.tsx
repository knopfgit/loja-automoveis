import { useList } from '../../services/data';

export type Option = { id: string; label: string; raw: Record<string, unknown> };

function toOptions<T extends Record<string, unknown>>(items: T[] | undefined, label: (row: T) => string): Option[] {
  return (items ?? []).map((row) => ({ id: String(row.id), label: label(row), raw: row }));
}

export function useVehicleOptions(enabled = true) {
  const query = useList<Record<string, unknown>>(['opt', 'vehicles'], '/vehicles', { page: 1, limit: 100 }, enabled);
  return toOptions(query.data?.items, (v) => `${v.brand} ${v.model} ${v.version ?? ''} ${v.modelYear ?? ''}`.trim());
}

export function useCustomerOptions(enabled = true) {
  const query = useList<Record<string, unknown>>(['opt', 'customers'], '/customers', { page: 1, limit: 100 }, enabled);
  return toOptions(query.data?.items, (c) => `${c.fullName ?? c.name} ${c.document ? `· ${c.document}` : ''}`.trim());
}

export function useEmployeeOptions(enabled = true) {
  const query = useList<Record<string, unknown>>(['opt', 'employees'], '/employees', { page: 1, limit: 100 }, enabled);
  return toOptions(query.data?.items, (e) => `${e.fullName} ${e.position ? `· ${e.position}` : ''}`.trim());
}

export function usePartOptions(enabled = true) {
  const query = useList<Record<string, unknown>>(['opt', 'parts'], '/parts', { page: 1, limit: 200 }, enabled);
  return toOptions(query.data?.items, (p) => `${p.name} ${p.internalCode ? `(${p.internalCode})` : ''} · ${p.quantity ?? 0} un`.trim());
}

export function useSupplierOptions(enabled = true) {
  const query = useList<Record<string, unknown>>(['opt', 'suppliers'], '/suppliers', { page: 1, limit: 100 }, enabled);
  return toOptions(query.data?.items, (s) => String(s.name));
}

export function useCommissionRuleOptions(enabled = true) {
  const query = useList<Record<string, unknown>>(['opt', 'commission-rules'], '/commission-rules', undefined, enabled);
  return toOptions(query.data?.items, (r) => `${r.name} (${r.type})`);
}

export function OptionList({ options, placeholder }: { options: Option[]; placeholder?: string }) {
  return (
    <>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </>
  );
}
