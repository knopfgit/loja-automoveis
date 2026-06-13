import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Filter, LayoutGrid } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { combinedBrandProfile, getBrandProfile } from '../features/public/vehicleTheme';

type BrandSelectorProps = {
  brands: string[];
  selected: string[];
  onToggle: (brand: string) => void;
  /** Marcas com estoque. As que ficarem de fora aparecem em cinza com "Em breve". */
  availableBrands?: string[];
  /** Informa a marca sob o mouse (ou null) para que a pagina pinte o tema. */
  onHover?: (brand: string | null) => void;
  /** Aplica o filtro com as marcas selecionadas. */
  onFilter: () => void;
  /** Limpa o filtro e mostra todos os veiculos unificados. */
  onShowAll: () => void;
  /** Liga a transicao ambiente (realce girando entre as marcas quando nada esta ativo). */
  ambient?: boolean;
  /** 'panel' = secao completa com cabecalho; 'hero' = tiles grandes para o heroi. */
  variant?: 'panel' | 'hero';
  title?: string;
  subtitle?: string;
};

function normalizeName(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function brandVars(brand: string): CSSProperties {
  const profile = getBrandProfile(brand);
  return { '--c': profile.color, '--wa': profile.washA, '--wb': profile.washB, '--wc': profile.washC } as CSSProperties;
}

export function BrandSelector({
  brands,
  selected,
  onToggle,
  availableBrands,
  onHover,
  onFilter,
  onShowAll,
  ambient = false,
  variant = 'panel',
  title = 'Escolha as marcas',
  subtitle = 'Passe o mouse para colorir o site e clique para selecionar. Combine mais de uma para fundir as cores.',
}: BrandSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [ambientIndex, setAmbientIndex] = useState(0);
  const isHero = variant === 'hero';

  const availableSet = useMemo(
    () => (availableBrands ? new Set(availableBrands.map(normalizeName)) : null),
    [availableBrands],
  );
  const isAvailable = (brand: string) => !availableSet || availableSet.has(normalizeName(brand));

  // Apenas marcas com estoque entram no ciclo ambiente.
  const ambientPool = useMemo(() => brands.filter(isAvailable), [brands, availableSet]);
  const ambientActive = ambient && selected.length === 0 && hovered === null;

  useEffect(() => {
    if (!ambientActive || ambientPool.length === 0) return;
    const id = window.setInterval(() => setAmbientIndex((index) => (index + 1) % ambientPool.length), 2400);
    return () => window.clearInterval(id);
  }, [ambientActive, ambientPool.length]);

  function hover(brand: string | null) {
    setHovered(brand);
    onHover?.(brand);
  }

  const combined = combinedBrandProfile(selected);
  const filterStyle = {
    '--c': combined.color,
    '--wa': combined.washA,
    '--wb': combined.washB,
    '--wc': combined.washC,
  } as CSSProperties;

  const ambientBrand = ambientActive ? ambientPool[ambientIndex] : null;

  const tiles = (
    <div className={isHero ? 'brand-hero-grid' : 'brand-selector-grid'}>
      {brands.map((name, index) => {
        const available = isAvailable(name);
        const isSelected = selected.includes(name);
        const isAmbient = available && name === ambientBrand;
        if (!available) {
          return (
            <div
              key={name}
              className={`brand-chip ${isHero ? 'brand-chip-lg' : ''} is-coming-soon`}
              style={brandVars(name)}
              aria-disabled="true"
              title={`${name} — em breve no estoque`}
            >
              <BrandLogo name={name} className="brand-chip-logo" />
              <span className="brand-chip-name">{name}</span>
              <span className="brand-chip-soon">Em breve</span>
            </div>
          );
        }
        return (
          <button
            key={name}
            type="button"
            className={`brand-chip ${isHero ? 'brand-chip-lg' : ''} ${isSelected ? 'is-selected' : ''} ${isAmbient ? 'is-ambient' : ''}`}
            style={{ ...brandVars(name), animationDelay: `${index * 60}ms` } as CSSProperties}
            aria-pressed={isSelected}
            onClick={() => onToggle(name)}
            onMouseEnter={() => hover(name)}
            onMouseLeave={() => hover(null)}
            onFocus={() => hover(name)}
            onBlur={() => hover(null)}
          >
            <BrandLogo name={name} className="brand-chip-logo" />
            <span className="brand-chip-name">{name}</span>
            <span className="brand-chip-check" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );

  const actions = (
    <div className="brand-selector-actions">
      <button type="button" className="button filter-button" style={filterStyle} onClick={onFilter} disabled={selected.length === 0}>
        <Filter size={18} /> Filtrar{selected.length ? ` (${selected.length})` : ''}
      </button>
      <button type="button" className="button button-ghost show-all-button" onClick={onShowAll}>
        <LayoutGrid size={17} /> Ver todos veiculos
      </button>
    </div>
  );

  if (isHero) {
    return (
      <div className="brand-hero">
        {tiles}
        {actions}
      </div>
    );
  }

  return (
    <section className="brand-selector glass" aria-label="Selecionar marcas">
      <div className="brand-selector-head">
        <div>
          <p className="label">Marcas</p>
          <h2>{title}</h2>
          <p className="brand-selector-sub">{subtitle}</p>
        </div>
        {selected.length > 0 && (
          <span className="brand-selector-count">
            {`${selected.length} marca${selected.length > 1 ? 's' : ''} selecionada${selected.length > 1 ? 's' : ''}`}
          </span>
        )}
      </div>
      {tiles}
      {actions}
    </section>
  );
}
