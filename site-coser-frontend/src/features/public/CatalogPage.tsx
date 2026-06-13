import { Search } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { BrandSelector } from '../../components/BrandSelector';
import { EmptyState } from '../../components/State';
import { VehicleCard } from '../../components/VehicleCard';
import { VehicleSpecPanel } from '../../components/VehicleSpecPanel';
import type { Vehicle } from '../../types';
import { getPublicVehicles } from './api';
import { demoVehicles } from './demoVehicles';
import {
  applyGlobalTheme,
  clearGlobalTheme,
  combinedBrandProfile,
  defaultBrandNames,
  getBrandProfile,
  neutralProfile,
} from './vehicleTheme';

function normalize(value?: string) {
  return (value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function parseBrands(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

type FormFilters = { model: string; priceMin: string; priceMax: string; fuel: string; transmission: string };

const emptyForm: FormFilters = { model: '', priceMin: '', priceMax: '', fuel: '', transmission: '' };

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedBrands = useMemo(() => parseBrands(searchParams.get('brand')), [searchParams]);
  const [selected, setSelected] = useState<string[]>(appliedBrands);
  const [hovered, setHovered] = useState<string | null>(null);
  const [formFilters, setFormFilters] = useState<FormFilters>(emptyForm);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);

  // Busca na API; se nao responder (backend fora do ar), usa os carros de demonstracao.
  const vehiclesQuery = useQuery({
    queryKey: ['publicVehicles'],
    queryFn: () => getPublicVehicles({ page: 1, limit: 60 }),
    retry: false,
  });
  const source = vehiclesQuery.data?.items?.length ? vehiclesQuery.data.items : demoVehicles;

  const brands = useMemo(() => [...new Set([...defaultBrandNames, ...source.map((vehicle) => vehicle.brand)])], [source]);
  const fuels = useMemo(() => [...new Set(source.map((vehicle) => vehicle.fuel).filter(Boolean) as string[])], [source]);
  const transmissions = useMemo(() => [...new Set(source.map((vehicle) => vehicle.transmission).filter(Boolean) as string[])], [source]);

  const filtered = useMemo(() => {
    const brandSet = new Set(appliedBrands.map((brand) => normalize(brand)));
    const model = normalize(formFilters.model).trim();
    const min = formFilters.priceMin ? Number(formFilters.priceMin) : undefined;
    const max = formFilters.priceMax ? Number(formFilters.priceMax) : undefined;
    const fuel = normalize(formFilters.fuel);
    const transmission = normalize(formFilters.transmission);
    return source.filter((vehicle) => {
      if (brandSet.size && !brandSet.has(normalize(vehicle.brand))) return false;
      if (model && !normalize(`${vehicle.model} ${vehicle.version ?? ''}`).includes(model)) return false;
      if (min != null && !Number.isNaN(min) && (vehicle.price ?? 0) < min) return false;
      if (max != null && !Number.isNaN(max) && (vehicle.price ?? 0) > max) return false;
      if (fuel && normalize(vehicle.fuel) !== fuel) return false;
      if (transmission && normalize(vehicle.transmission) !== transmission) return false;
      return true;
    });
  }, [source, appliedBrands, formFilters]);

  // Mantem a selecao local em sincronia com a marca aplicada na URL (vinda da Home, por ex.).
  useEffect(() => {
    setSelected(appliedBrands);
  }, [appliedBrands]);

  useEffect(() => {
    setActiveVehicle(null);
  }, [appliedBrands, formFilters]);

  // Tema: hover pinta na hora; senao a combinacao das marcas selecionadas; senao neutro.
  const activeProfile = useMemo(() => {
    if (hovered) return getBrandProfile(hovered);
    if (selected.length) return combinedBrandProfile(selected);
    return neutralProfile;
  }, [hovered, selected]);

  useEffect(() => {
    applyGlobalTheme(activeProfile);
  }, [activeProfile]);

  useEffect(() => () => clearGlobalTheme(), []);

  function toggle(brand: string) {
    setSelected((current) => (current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]));
  }

  function goToFilter() {
    if (selected.length) setSearchParams({ brand: selected.join(',') });
    else setSearchParams({});
  }

  function showAll() {
    setSelected([]);
    setSearchParams({});
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFormFilters({
      model: String(form.get('model') ?? ''),
      priceMin: String(form.get('priceMin') ?? ''),
      priceMax: String(form.get('priceMax') ?? ''),
      fuel: String(form.get('fuel') ?? ''),
      transmission: String(form.get('transmission') ?? ''),
    });
  }

  const heading = appliedBrands.length
    ? `Estoque ${appliedBrands.join(' + ')}`
    : 'Estoque completo';

  return (
    <div className="page">
      <section className="section compact">
        <div className="section-header">
          <div>
            <span className="eyebrow">Estoque</span>
            <h1>{heading}</h1>
            <p>{filtered.length} veiculo{filtered.length === 1 ? '' : 's'} {appliedBrands.length ? 'na(s) marca(s) escolhida(s)' : 'disponiveis'}. Selecione marcas para colorir e filtrar.</p>
          </div>
        </div>
        <BrandSelector
          brands={brands}
          selected={selected}
          onToggle={toggle}
          onHover={setHovered}
          onFilter={goToFilter}
          onShowAll={showAll}
          title="Filtre por marca"
          subtitle="Clique para selecionar (pode mais de uma). O estoque fica na cor da marca; juntando marcas, as cores se fundem."
        />
        <form className="filter-bar glass" onSubmit={submit}>
          <input name="model" placeholder="Modelo ou versao" defaultValue={formFilters.model} />
          <input name="priceMin" placeholder="Preco minimo" inputMode="numeric" defaultValue={formFilters.priceMin} />
          <input name="priceMax" placeholder="Preco maximo" inputMode="numeric" defaultValue={formFilters.priceMax} />
          <select name="fuel" defaultValue={formFilters.fuel}>
            <option value="">Combustivel</option>
            {fuels.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select name="transmission" defaultValue={formFilters.transmission}>
            <option value="">Cambio</option>
            {transmissions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="button filter-bar-submit" type="submit"><Search size={17} /> Filtrar</button>
        </form>
      </section>
      <section className="section">
        {filtered.length === 0 && <EmptyState />}
        <div className={`vehicle-focus-layout ${activeVehicle ? 'is-open' : ''}`}>
          {activeVehicle && <button className="vehicle-focus-scrim" type="button" aria-label="Fechar especificacoes" onClick={() => setActiveVehicle(null)} />}
          <div className="vehicle-grid stock-showcase-grid">
            {filtered.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                variant="landing"
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
      </section>
    </div>
  );
}
