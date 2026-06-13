import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CoserLogo } from './CoserLogo';

// Usa a imagem real da logo (public/coser-logo.png) EXATAMENTE como o arquivo esta,
// sem nenhuma alteracao. Se o arquivo ainda nao existir, cai no emblema vetorial.
export function BrandLockup() {
  const [imageOk, setImageOk] = useState(true);

  if (imageOk) {
    return (
      <Link to="/" className="brand-lockup brand-lockup-img" aria-label="COSER Premium Cars">
        <img
          className="brand-logo-img"
          src="/coser-logo.png"
          alt="COSER Premium Cars"
          onError={() => setImageOk(false)}
        />
      </Link>
    );
  }

  return (
    <Link to="/" className="brand-lockup" aria-label="COSER Premium Cars">
      <span className="brand-mark"><CoserLogo className="brand-mark-svg" /></span>
      <span>
        <strong>COSER</strong>
        <small>Premium Cars</small>
      </span>
    </Link>
  );
}
