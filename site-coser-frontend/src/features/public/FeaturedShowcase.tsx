import type { CSSProperties } from 'react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Car, ChevronLeft, ChevronRight, DoorOpen, Fuel, Gauge, MessageCircle, Palette, Settings2, Users } from 'lucide-react';
import { BrandLogo } from '../../components/BrandLogo';
import type { Vehicle } from '../../types';
import { formatCurrency, imageUrl } from '../../utils/format';
import { getBrandProfile } from './vehicleTheme';

function display(value: unknown, fallback = 'Nao informado') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return value.toLocaleString('pt-BR');
  return String(value);
}

function brandThemeVars(brand: string): CSSProperties {
  const profile = getBrandProfile(brand);
  return {
    '--vehicle-brand': profile.color,
    '--vehicle-tone': profile.color,
    '--vehicle-neon-a': profile.neonA,
    '--vehicle-neon-b': profile.neonB,
    '--vehicle-neon-c': profile.neonC,
    '--vehicle-wash-a': profile.washA,
    '--vehicle-wash-b': profile.washB,
    '--vehicle-wash-c': profile.washC,
  } as CSSProperties;
}

function VehicleSlide({ vehicle }: { vehicle: Vehicle }) {
  const mainImage = vehicle.media?.find((item) => item.isMain)?.url ?? vehicle.media?.[0]?.url;
  const specs = [
    { label: 'Ano modelo', value: vehicle.modelYear, icon: Calendar },
    { label: 'Quilometragem', value: vehicle.mileage != null ? `${vehicle.mileage.toLocaleString('pt-BR')} km` : undefined, icon: Gauge },
    { label: 'Cambio', value: vehicle.transmission, icon: Settings2 },
    { label: 'Combustivel', value: vehicle.fuel, icon: Fuel },
    { label: 'Cor', value: vehicle.color, icon: Palette },
    { label: 'Categoria', value: vehicle.category, icon: Car },
    { label: 'Lugares', value: vehicle.seats, icon: Users },
    { label: 'Portas', value: vehicle.doors, icon: DoorOpen },
  ];

  return (
    <div className="brand-stock-slide">
      <div className="featured-photo">
        <span className="featured-photo-glow" aria-hidden="true" />
        {mainImage ? (
          <img src={imageUrl(mainImage)} alt={`${vehicle.brand} ${vehicle.model}`} />
        ) : (
          <span className="vehicle-placeholder">{vehicle.brand?.slice(0, 1)}{vehicle.model?.slice(0, 1)}</span>
        )}
      </div>
      <div className="featured-sheet">
        <span className="eyebrow"><span className="pip" /> {vehicle.publicCode ?? 'Selecao premium'}</span>
        <h3>{vehicle.brand} {vehicle.model}</h3>
        {vehicle.version && <p className="featured-version">{vehicle.version}</p>}
        <strong className="price big">{formatCurrency(vehicle.price)}</strong>
        <dl className="datasheet">
          {specs.map(({ label, value, icon: Icon }) => (
            <div className="datasheet-row" key={label}>
              <dt><Icon size={14} /> {label}</dt>
              <span className="datasheet-lead" aria-hidden="true" />
              <dd>{display(value)}</dd>
            </div>
          ))}
        </dl>
        <div className="featured-actions">
          <Link className="button button-dark" to={`/veiculos/${vehicle.slug ?? vehicle.id}`}>Ver ficha completa</Link>
          <Link className="button button-ghost" to={`/onde-estamos?veiculo=${encodeURIComponent(`${vehicle.brand} ${vehicle.model}`)}`}>
            <MessageCircle size={16} /> Falar com consultor
          </Link>
        </div>
      </div>
    </div>
  );
}

function BrandStockCard({ brand, models }: { brand: string; models: Vehicle[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = models.length;

  function go(target: number) {
    const next = Math.max(0, Math.min(count - 1, target));
    const el = scrollerRef.current;
    if (el) el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    setIndex(next);
  }

  function onScroll() {
    const el = scrollerRef.current;
    if (!el) return;
    const current = Math.round(el.scrollLeft / el.clientWidth);
    if (current !== index) setIndex(current);
  }

  return (
    <article className="brand-stock-card" style={brandThemeVars(brand)}>
      <div className="brand-stock-head">
        <div className="brand-stock-title">
          <BrandLogo name={brand} className="brand-stock-logo" />
          <span>Estoque {brand}</span>
        </div>
        <div className="brand-stock-nav">
          <span className="brand-stock-count">{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
          <button type="button" className="featured-nav-btn" onClick={() => go(index - 1)} disabled={index <= 0} aria-label={`Modelo anterior de ${brand}`}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="featured-nav-btn" onClick={() => go(index + 1)} disabled={index >= count - 1} aria-label={`Proximo modelo de ${brand}`}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <span className="brand-stock-sep" aria-hidden="true" />
      <div className="brand-stock-scroller" ref={scrollerRef} onScroll={onScroll}>
        {models.map((vehicle) => (
          <VehicleSlide key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
      {count > 1 && (
        <div className="brand-stock-dots" aria-hidden="true">
          {models.map((vehicle, dot) => (
            <span key={vehicle.id} className={dot === index ? 'is-active' : ''} />
          ))}
        </div>
      )}
    </article>
  );
}

export function FeaturedShowcase({ vehicles }: { vehicles: Vehicle[] }) {
  if (vehicles.length === 0) return null;

  // Agrupa por marca, preservando a ordem de aparicao, e mostra os 3 primeiros cards.
  const order: string[] = [];
  const groups = new Map<string, Vehicle[]>();
  for (const vehicle of vehicles) {
    if (!groups.has(vehicle.brand)) {
      groups.set(vehicle.brand, []);
      order.push(vehicle.brand);
    }
    groups.get(vehicle.brand)!.push(vehicle);
  }
  const brandCards = order.slice(0, 3).map((brand) => ({ brand, models: groups.get(brand)! }));

  return (
    <section className="section featured-showcase" aria-label="Estoque por marca em destaque">
      <div className="section-header">
        <div>
          <span className="eyebrow">Destaques</span>
          <h2>Principais do estoque</h2>
          <p>Cada card e um estoque de marca: role para o lado (ou use as setas) para ver os outros modelos com a ficha tecnica completa.</p>
        </div>
      </div>
      <div className="featured-stack">
        {brandCards.map(({ brand, models }) => (
          <BrandStockCard key={brand} brand={brand} models={models} />
        ))}
      </div>
    </section>
  );
}
