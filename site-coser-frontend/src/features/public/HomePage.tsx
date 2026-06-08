import { useQuery } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, LoadingState, EmptyState } from '../../components/State';
import { VehicleCard } from '../../components/VehicleCard';
import { getFeaturedVehicles } from './api';

const brands = [
  { name: 'BMW', slug: 'bmw', color: '#1266d8', neonA: '#1266d8', neonB: '#67e8f9', neonC: '#6d5dfc' },
  { name: 'Porsche', slug: 'porsche', color: '#b00000', neonA: '#b00000', neonB: '#ff4d5e', neonC: '#d4af37' },
  { name: 'Mercedes-Benz', slug: 'mercedes', color: '#7c8694', neonA: '#7c8694', neonB: '#d7dde7', neonC: '#9fe8ff' },
  { name: 'Audi', slug: 'audi', color: '#b8141f', neonA: '#b8141f', neonB: '#ff6b75', neonC: '#9ca3af' },
  { name: 'Ferrari', slug: 'ferrari', color: '#dd1f2d', neonA: '#dd1f2d', neonB: '#ffd43b', neonC: '#22c55e' },
  { name: 'Lamborghini', slug: 'lamborghini', color: '#d7a80d', neonA: '#d7a80d', neonB: '#fff45f', neonC: '#a3e635' },
];

function logoFor(slug: string, color: string) {
  return `https://cdn.simpleicons.org/${slug}/${color.replace('#', '')}`;
}

export function HomePage() {
  const featured = useQuery({ queryKey: ['featuredVehicles'], queryFn: getFeaturedVehicles });
  const [activeBrand, setActiveBrand] = useState(0);
  const brand = brands[activeBrand];

  useEffect(() => {
    const interval = window.setInterval(() => setActiveBrand((value) => (value + 1) % brands.length), 2800);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand', brand.color);
    root.style.setProperty('--neon-a', brand.neonA);
    root.style.setProperty('--neon-b', brand.neonB);
    root.style.setProperty('--neon-c', brand.neonC);
  }, [brand]);

  return (
    <div className="page">
      <section className="hero glass" aria-label="Apresentacao">
        <div className="hero-copy">
          <span className="eyebrow"><span className="pip" /> Concessionaria multimarca</span>
          <h1>As marcas que voce admira, <em>num so lugar.</em></h1>
          <p>Curadoria premium de esportivos, SUVs e sedas com atendimento direto, catalogo conectado ao estoque real e operacao interna em tempo real.</p>
          <div className="hero-cta">
            <Link className="button button-primary" to="/catalogo">Ver catalogo</Link>
            <Link className="button button-ghost" to="/onde-estamos">Falar com consultor</Link>
          </div>
          <dl className="hero-stats">
            <div><dt>{brands.length.toString().padStart(2, '0')}</dt><dd>Marcas</dd></div>
            <div><dt>{featured.data?.length ?? '--'}</dt><dd>Destaques</dd></div>
            <div><dt>1:1</dt><dd>Atendimento</dd></div>
          </dl>
        </div>
        <div className="hero-stage" aria-label="Marcas em destaque">
          <div className="ghost-word">Vertex</div>
          <Link className="orb" to={`/catalogo?brand=${encodeURIComponent(brand.name)}`} aria-label={`Ver modelos ${brand.name}`}>
            <img src={logoFor(brand.slug, brand.color)} alt={brand.name} />
            <span className="logo-fallback">{brand.name}</span>
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
            <p className="label">Catalogo</p>
            <h2>Seis marcas. Uma curadoria.</h2>
          </div>
          <Link className="see" to="/catalogo">Ver todas</Link>
        </div>
        <div className="strip-grid">
          {brands.map((item) => (
            <Link className="marca-chip" key={item.name} to={`/catalogo?brand=${encodeURIComponent(item.name)}`} style={{ '--c': item.color } as CSSProperties} data-name={item.name}>
              <img src={logoFor(item.slug, item.color)} alt={item.name} loading="lazy" />
              <span className="cf">{item.name}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="section-header">
          <div>
            <span className="eyebrow">Vitrine</span>
            <h2>Veiculos em destaque</h2>
          </div>
          <Link to="/catalogo" className="button button-ghost">Todos os veiculos</Link>
        </div>
        {featured.isLoading && <LoadingState />}
        {featured.isError && <ErrorState error={featured.error} />}
        {featured.data?.length === 0 && <EmptyState />}
        <div className="vehicle-grid">
          {featured.data?.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
        </div>
      </section>
    </div>
  );
}
