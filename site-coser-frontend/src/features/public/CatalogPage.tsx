import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ErrorState, LoadingState, EmptyState } from '../../components/State';
import { VehicleCard } from '../../components/VehicleCard';
import { getPublicFilters, getPublicVehicles, type VehicleFilters } from './api';

export function CatalogPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<VehicleFilters>({ page: 1, limit: 12, sortBy: 'price', sortOrder: 'asc' });
  const vehicles = useQuery({ queryKey: ['publicVehicles', filters], queryFn: () => getPublicVehicles(filters) });
  const filterOptions = useQuery({ queryKey: ['publicFilters'], queryFn: getPublicFilters });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = Object.fromEntries([...form.entries()].filter(([, value]) => value !== '')) as VehicleFilters;
    setPage(1);
    setFilters({ ...next, page: 1, limit: 12 });
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    setFilters((current) => ({ ...current, page: nextPage }));
  }

  return (
    <div className="page">
      <section className="section compact">
        <div className="section-header">
          <div>
            <span className="eyebrow">Catalogo publico</span>
            <h1>Encontre seu proximo veiculo</h1>
          </div>
        </div>
        <form className="filter-bar" onSubmit={submit}>
          <input name="brand" placeholder="Marca" list="brands" />
          <input name="model" placeholder="Modelo" />
          <input name="priceMin" placeholder="Preco minimo" inputMode="numeric" />
          <input name="priceMax" placeholder="Preco maximo" inputMode="numeric" />
          <select name="fuel" defaultValue="">
            <option value="">Combustivel</option>
            {filterOptions.data?.fuel?.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select name="transmission" defaultValue="">
            <option value="">Cambio</option>
            {filterOptions.data?.transmission?.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="button button-dark" type="submit"><Search size={17} /> Filtrar</button>
          <datalist id="brands">
            {filterOptions.data?.brand?.map((item) => <option key={item} value={item} />)}
          </datalist>
        </form>
      </section>
      <section className="section">
        {vehicles.isLoading && <LoadingState />}
        {vehicles.isError && <ErrorState error={vehicles.error} />}
        {vehicles.data?.items.length === 0 && <EmptyState />}
        <div className="vehicle-grid">
          {vehicles.data?.items.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
        {vehicles.data && vehicles.data.meta.totalPages && vehicles.data.meta.totalPages > 1 && (
          <div className="pagination">
            <button className="button button-ghost" disabled={page <= 1} onClick={() => changePage(page - 1)}>Anterior</button>
            <span>Pagina {page} de {vehicles.data.meta.totalPages}</span>
            <button className="button button-ghost" disabled={page >= vehicles.data.meta.totalPages} onClick={() => changePage(page + 1)}>Proxima</button>
          </div>
        )}
      </section>
    </div>
  );
}
