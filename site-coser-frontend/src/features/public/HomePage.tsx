import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandSelector } from '../../components/BrandSelector';
import { FeaturedShowcase } from './FeaturedShowcase';
import { demoBrandNames, demoVehicles } from './demoVehicles';
import {
  applyGlobalTheme,
  clearGlobalTheme,
  combinedBrandProfile,
  defaultBrandNames,
  getBrandProfile,
  neutralProfile,
} from './vehicleTheme';

// Marcas exibidas na vitrine. As que nao estao no estoque (demoBrandNames) aparecem
// em cinza com "Em breve".
const comingSoonBrands = ['Tesla', 'BYD', 'Volkswagen', 'Toyota', 'Honda', 'Ford'];

export function HomePage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const brands = useMemo(() => [...new Set([...defaultBrandNames, ...comingSoonBrands])], []);

  // Tema ativo: o que esta sob o mouse pinta na hora; senao a combinacao das
  // selecionadas; sem nada, o tema neutro "branco vidro".
  const activeProfile = useMemo(() => {
    if (hovered) return getBrandProfile(hovered);
    if (selected.length) return combinedBrandProfile(selected);
    return neutralProfile;
  }, [hovered, selected]);

  useEffect(() => {
    applyGlobalTheme(activeProfile);
  }, [activeProfile]);

  // Ao sair da Home, limpa o tema para nao vazar para as paginas internas.
  useEffect(() => () => clearGlobalTheme(), []);

  function toggle(brand: string) {
    setSelected((current) => (current.includes(brand) ? current.filter((item) => item !== brand) : [...current, brand]));
  }

  function goToFilter() {
    if (!selected.length) return;
    navigate(`/catalogo?brand=${encodeURIComponent(selected.join(','))}`);
  }

  function showAll() {
    navigate('/catalogo');
  }

  return (
    <div className="page">
      <section className="hero glass hero-rich" aria-label="Apresentacao">
        <div className="hero-road" aria-hidden="true">
          <span className="hero-road-img hero-road-img-a" />
          <span className="hero-road-img hero-road-img-b" />
          <span className="hero-road-streaks" />
        </div>
        <div className="hero-copy">
          <span className="eyebrow"><span className="pip" /> Concessionaria multimarca</span>
          <h1>Estoque premium em <em>branco vidro.</em></h1>
          <p>Comece no tema claro e detalhado. Passe o mouse sobre uma marca para pintar tudo na cor dela, selecione uma ou varias e filtre o estoque — as cores se fundem numa unica paleta.</p>
          <div className="hero-cta">
            <Link className="button button-primary" to="/catalogo">Ver estoque</Link>
            <Link className="button button-ghost" to="/onde-estamos">Falar com consultor</Link>
          </div>
        </div>
        <div className="hero-stage">
          <p className="hero-brands-label">Nossas marcas</p>
          <BrandSelector
            brands={brands}
            availableBrands={demoBrandNames}
            selected={selected}
            onToggle={toggle}
            onHover={setHovered}
            onFilter={goToFilter}
            onShowAll={showAll}
            variant="hero"
            ambient
          />
        </div>
      </section>
      <FeaturedShowcase vehicles={demoVehicles} />
    </div>
  );
}
