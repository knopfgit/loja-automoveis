import { Search } from 'lucide-react';
import type { CSSProperties } from 'react';
import { FormEvent, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';
import { ErrorState, LoadingState, EmptyState } from '../../components/State';
import { VehicleCard } from '../../components/VehicleCard';
import { VehicleSpecPanel } from '../../components/VehicleSpecPanel';
import type { Vehicle } from '../../types';
import { getPublicFilters, getPublicVehicles, type VehicleFilters } from './api';
import { defaultBrandNames, getBrandProfile } from './vehicleTheme';

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const brandParam = searchParams.get('brand') || undefined;
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<VehicleFilters>({ brand: brandParam, page: 1, limit: 12, sortBy: 'announcedPrice', sortOrder: 'asc' });
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const vehicles = useQuery({ queryKey: ['publicVehicles', filters], queryFn: () => getPublicVehicles(filters) });
  const filterOptions = useQuery({ queryKey: ['publicFilters'], queryFn: getPublicFilters });
  const stockBrands = filterOptions.data?.brands ?? filterOptions.data?.brand ?? [];
  const brands = stockBrands.length
    ? stockBrands
    : [...new Set([brandParam, ...defaultBrandNames].filter((item): item is string => Boolean(item)))];

  useEffect(() => {
    setFilters((current) => {
      if ((current.brand || undefined) === brandParam) return current;
      return { ...current, brand: brandParam, page: 1 };
    });
    setPage(1);
  }, [brandParam]);

  useEffect(() => {
    setActiveVehicle(null);
  }, [filters.brand, filters.model, filters.priceMin, filters.priceMax, filters.fuel, filters.transmission, page]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = Object.fromEntries([...form.entries()].filter(([, value]) => value !== '')) as VehicleFilters;
    setPage(1);
    setFilters({ ...next, page: 1, limit: 12, sortBy: 'announcedPrice', sortOrder: 'asc' });
    if (next.brand) setSearchParams({ brand: String(next.brand) });
    else setSearchParams({});
  }

  function selectBrand(brand?: string) {
    setPage(1);
    setFilters((current) => ({ ...current, brand, page: 1 }));
    if (brand) setSearchParams({ brand });
    else setSearchParams({});
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
            <span className="eyebrow">Estoque</span>
            <h1>Encontre seu proximo veiculo</h1>
            <p>Filtre por marca ou use a busca fina para ver apenas os modelos disponiveis para anuncio.</p>
          </div>
        </div>
        <div className="stock-brand-panel" aria-label="Filtrar por marca">
          <div className="stock-brand-head">
            <div>
              <strong>Marcas no estoque</strong>
              <span>{filters.brand ? `Mostrando ${filters.brand}` : 'Escolha uma marca para entrar direto nos modelos'}</span>
            </div>
            {filters.brand && (
              <button className="button button-ghost" type="button" onClick={() => selectBrand(undefined)}>
                Limpar marca
              </button>
            )}
          </div>
          <div className="stock-brand-grid">
            {brands.map((name) => {
              const profile = getBrandProfile(name);
              const active = filters.brand === name;
              return (
                <button
                  className={`stock-brand ${active ? 'active' : ''}`}
                  key={name}
                  type="button"
                  onClick={() => selectBrand(name)}
                  style={{ '--c': profile.color, '--wa': profile.washA, '--wb': profile.washB, '--wc': profile.washC } as CSSProperties}
                >
                  <BrandLogo name={name} className="stock-brand-logo" />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <form className="filter-bar" onSubmit={submit}>
          <input key={`brand-${filters.brand ?? ''}`} name="brand" placeholder="Marca" list="brands" defaultValue={filters.brand ?? ''} />
          <input name="model" placeholder="Modelo" defaultValue={filters.model ?? ''} />
          <input name="priceMin" placeholder="Preco minimo" inputMode="numeric" defaultValue={filters.priceMin ?? ''} />
          <input name="priceMax" placeholder="Preco maximo" inputMode="numeric" defaultValue={filters.priceMax ?? ''} />
          <select name="fuel" defaultValue="">
            <option value="">Combustivel</option>
            {(filterOptions.data?.fuels ?? filterOptions.data?.fuel ?? []).map((item) => <option key={item}>{item}</option>)}
          </select>
          <select name="transmission" defaultValue="">
            <option value="">Cambio</option>
            {(filterOptions.data?.transmissions ?? filterOptions.data?.transmission ?? []).map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="button button-dark" type="submit"><Search size={17} /> Filtrar</button>
          <datalist id="brands">
            {brands.map((item) => <option key={item} value={item} />)}
          </datalist>
        </form>
      </section>
      <section className="section">
        {vehicles.isLoading && <LoadingState />}
        {vehicles.isError && <ErrorState error={vehicles.error} />}
        {vehicles.data?.items.length === 0 && <EmptyState />}
        <div className={`vehicle-focus-layout ${activeVehicle ? 'is-open' : ''}`}>
          {activeVehicle && <button className="vehicle-focus-scrim" type="button" aria-label="Fechar especificacoes" onClick={() => setActiveVehicle(null)} />}
          <div className="vehicle-grid stock-grid">
            {vehicles.data?.items.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                active={activeVehicle?.id === vehicle.id}
                dimmed={Boolean(activeVehicle && activeVehicle.id !== vehicle.id)}
                onOpen={(nextVehicle) => setActiveVehicle((current) => (current?.id === nextVehicle.id ? null : nextVehicle))}
              />
            ))}
          </div>
          {activeVehicle && (
            <VehicleSpecPanel
              vehicle={activeVehicle}
              href={`/veiculos/${activeVehicle.slug ?? activeVehicle.id}`}
              onClose={() => setActiveVehicle(null)}
            />
          )}
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
