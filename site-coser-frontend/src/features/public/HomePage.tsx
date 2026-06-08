import { useQuery } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/BrandLogo';
import { VehicleCard } from '../../components/VehicleCard';
import { VehicleSpecPanel } from '../../components/VehicleSpecPanel';
import type { Vehicle } from '../../types';
import { getFeaturedVehicles, getPublicFilters } from './api';
import { defaultBrandNames, getBrandProfile } from './vehicleTheme';

const previewVehicles: Vehicle[] = [
  {
    id: 'preview-porsche-panamera',
    brand: 'Porsche',
    model: 'Panamera',
    version: 'Turbo Sport Turismo',
    price: 920000,
    color: 'Preto',
    modelYear: 2024,
    manufactureYear: 2023,
    mileage: 4100,
    fuel: 'Gasolina',
    transmission: 'PDK 8 marchas',
    category: 'Sport Turismo',
    doors: 4,
    seats: 4,
    description: 'Configuracao de vitrine com acabamento esportivo, baixa quilometragem e pacote premium de conforto.',
    media: [{ url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1100&q=82', isMain: true }],
  },
  {
    id: 'preview-mclaren-720s',
    brand: 'McLaren',
    model: '720S',
    version: 'Performance Coupe',
    price: 1490000,
    color: 'Prata',
    modelYear: 2023,
    manufactureYear: 2022,
    mileage: 2800,
    fuel: 'Gasolina',
    transmission: 'Automatizado 7 marchas',
    category: 'Superesportivo',
    doors: 2,
    seats: 2,
    description: 'Coupe leve e preciso, selecionado para exposicao pelo conjunto visual, performance e estado de conservacao.',
    media: [{ url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1100&q=82', isMain: true }],
  },
  {
    id: 'preview-lamborghini-huracan',
    brand: 'Lamborghini',
    model: 'Huracan',
    version: 'EVO Coupe',
    price: 1320000,
    color: 'Amarelo',
    modelYear: 2022,
    manufactureYear: 2021,
    mileage: 6200,
    fuel: 'Gasolina',
    transmission: 'Automatizado 7 marchas',
    category: 'Superesportivo',
    doors: 2,
    seats: 2,
    description: 'Perfil de colecionador com presenca visual forte, tonalidade aquarela e configuracao esportiva.',
    media: [{ url: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1100&q=82', isMain: true }],
  },
  {
    id: 'preview-bugatti-chiron',
    brand: 'Bugatti',
    model: 'Chiron',
    version: 'Sport Verde Edition',
    price: 1180000,
    color: 'Verde',
    modelYear: 2024,
    manufactureYear: 2023,
    mileage: 1900,
    fuel: 'Gasolina',
    transmission: 'Automatica 8 marchas',
    category: 'Hypercar',
    doors: 2,
    seats: 2,
    description: 'Hypercar de baixa quilometragem com tonalidade verde aplicada ao card e ao painel de especificacoes.',
    media: [{ url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1100&q=82', isMain: true }],
  }
];

export function HomePage() {
  const featured = useQuery({ queryKey: ['featuredVehicles'], queryFn: getFeaturedVehicles });
  const filterOptions = useQuery({ queryKey: ['publicFilters'], queryFn: getPublicFilters });
  const [activeBrand, setActiveBrand] = useState(0);
  const [activeLandingVehicle, setActiveLandingVehicle] = useState<Vehicle | null>(null);
  const brandNames = filterOptions.data?.brands?.length ? filterOptions.data.brands : defaultBrandNames;
  const brands = useMemo(() => brandNames.map(getBrandProfile), [brandNames]);
  const brand = brands[activeBrand] ?? brands[0];

  useEffect(() => {
    const interval = window.setInterval(() => setActiveBrand((value) => (value + 1) % Math.max(brands.length, 1)), 3200);
    return () => window.clearInterval(interval);
  }, [brands.length]);

  useEffect(() => {
    if (activeBrand >= brands.length) setActiveBrand(0);
  }, [activeBrand, brands.length]);

  useEffect(() => {
    const root = document.documentElement;
    if (!brand) return;
    root.style.setProperty('--brand', brand.color);
    root.style.setProperty('--neon-a', brand.neonA);
    root.style.setProperty('--neon-b', brand.neonB);
    root.style.setProperty('--neon-c', brand.neonC);
    root.style.setProperty('--wash-a', brand.washA);
    root.style.setProperty('--wash-b', brand.washB);
    root.style.setProperty('--wash-c', brand.washC);
  }, [brand]);

  const landingVehicles = featured.data?.length ? featured.data : previewVehicles;
  const activeLandingHref = activeLandingVehicle && !activeLandingVehicle.id.startsWith('preview-')
    ? `/veiculos/${activeLandingVehicle.slug ?? activeLandingVehicle.id}`
    : undefined;

  return (
    <div className="page">
      <section className="hero glass" aria-label="Apresentacao">
        <div className="hero-copy">
          <span className="eyebrow"><span className="pip" /> Concessionaria multimarca</span>
          <h1>Estoque premium com <em>presenca visual.</em></h1>
          <p>Uma vitrine focada nos veiculos mais bonitos do estoque, com marcas selecionadas, fotos em primeiro plano e uma experiencia liquid glass inspirada em aquarela.</p>
          <div className="hero-cta">
            <Link className="button button-primary" to="/catalogo">Ver estoque</Link>
            <Link className="button button-ghost" to="/onde-estamos">Falar com consultor</Link>
          </div>
          <dl className="hero-stats">
            <div><dt>{brands.length.toString().padStart(2, '0')}</dt><dd>Marcas</dd></div>
            <div><dt>{featured.data?.length ?? '--'}</dt><dd>Destaques</dd></div>
            <div><dt>1:1</dt><dd>Atendimento</dd></div>
          </dl>
        </div>
        <div className="hero-stage" aria-label="Marcas em destaque">
          <div className="ghost-word">ESTOQUE</div>
          <Link
            className="brand-showcase-shape"
            to={`/catalogo?brand=${encodeURIComponent(brand.name)}`}
            aria-label={`Ver modelos ${brand.name}`}
            style={{ '--c': brand.color, '--wa': brand.washA, '--wb': brand.washB, '--wc': brand.washC } as CSSProperties}
          >
            <BrandLogo name={brand.name} className="brand-showcase-logo" />
            <span>{brand.name}</span>
            <small>Ver modelos no estoque</small>
          </Link>
          <div className="stage-caption">
            <span className="dot" />
            <span className="nm">{brand.name}</span>
            <span className="arr">Ver modelos</span>
          </div>
        </div>
      </section>
      <section className="marcas glass" aria-label="Nossas marcas">
        <div className="strip-head">
          <div>
            <p className="label">Estoque</p>
            <h2>Escolha a marca e veja os modelos disponiveis.</h2>
          </div>
          <Link className="see" to="/catalogo">Ver estoque completo</Link>
        </div>
        <div className="brand-list-grid">
          {brands.map((item) => (
            <Link className="brand-card" key={item.name} to={`/catalogo?brand=${encodeURIComponent(item.name)}`} style={{ '--c': item.color, '--wa': item.washA, '--wb': item.washB, '--wc': item.washC } as CSSProperties}>
              <BrandLogo name={item.name} className="brand-card-mark" />
              <span className="brand-card-copy">
                <strong>{item.name}</strong>
                <small>Ver veiculos</small>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section id="veiculos-em-destaque" className="section landing-vehicle-section" aria-label="Listagem de veiculos em destaque">
        <div className="section-header">
          <div>
            <span className="eyebrow">Selecao premium</span>
            <h2>Veiculos com presenca de vitrine</h2>
            <p>Uma listagem limpa e visual, com cards liquid glass que valorizam foto, tonalidade, versao e preco.</p>
          </div>
          <Link to="/catalogo" className="button button-ghost">Todos os veiculos</Link>
        </div>
        <div className={`vehicle-focus-layout ${activeLandingVehicle ? 'is-open' : ''}`}>
          {activeLandingVehicle && <button className="vehicle-focus-scrim" type="button" aria-label="Fechar especificacoes" onClick={() => setActiveLandingVehicle(null)} />}
          <div className="vehicle-grid landing-vehicle-grid">
            {landingVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                variant="landing"
                active={activeLandingVehicle?.id === vehicle.id}
                dimmed={Boolean(activeLandingVehicle && activeLandingVehicle.id !== vehicle.id)}
                onOpen={(nextVehicle) => setActiveLandingVehicle((current) => (current?.id === nextVehicle.id ? null : nextVehicle))}
              />
            ))}
          </div>
          {activeLandingVehicle && <VehicleSpecPanel vehicle={activeLandingVehicle} href={activeLandingHref} onClose={() => setActiveLandingVehicle(null)} />}
        </div>
      </section>
    </div>
  );
}
