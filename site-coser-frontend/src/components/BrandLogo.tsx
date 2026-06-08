import { useState } from 'react';
import { brandInitials, logoForBrand } from '../features/public/vehicleTheme';

export function BrandLogo({ name, className = '' }: { name: string; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <span className={`brand-logo ${className} ${loaded && !failed ? 'loaded' : ''}`}>
      {(!loaded || failed) && <span className="brand-logo-initials">{brandInitials(name)}</span>}
      {!failed && <img src={logoForBrand(name)} alt="" loading="lazy" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
    </span>
  );
}

