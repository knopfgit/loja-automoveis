import { Calendar, Car, Fuel, Gauge, Hash, Palette, Settings2, Users, DoorOpen, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../types';
import { formatCurrency, imageUrl } from '../utils/format';
import { themeVarsForVehicle } from '../features/public/vehicleTheme';

type VehicleSpecPanelProps = {
  vehicle: Vehicle;
  href?: string;
  onClose: () => void;
};

function display(value: unknown, fallback = 'Nao informado') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return value.toLocaleString('pt-BR');
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback;
  return String(value);
}

export function VehicleSpecPanel({ vehicle, href, onClose }: VehicleSpecPanelProps) {
  const images = vehicle.media?.length ? vehicle.media : [];
  const mainImage = images.find((item) => item.isMain)?.url ?? images[0]?.url;
  const specItems = [
    { label: 'Ano modelo', value: vehicle.modelYear, icon: Calendar },
    { label: 'Fabricacao', value: vehicle.manufactureYear, icon: Calendar },
    { label: 'Quilometragem', value: vehicle.mileage != null ? `${vehicle.mileage.toLocaleString('pt-BR')} km` : undefined, icon: Gauge },
    { label: 'Cambio', value: vehicle.transmission, icon: Settings2 },
    { label: 'Combustivel', value: vehicle.fuel, icon: Fuel },
    { label: 'Cor', value: vehicle.color, icon: Palette },
    { label: 'Categoria', value: vehicle.category, icon: Car },
    { label: 'Lugares', value: vehicle.seats, icon: Users },
    { label: 'Portas', value: vehicle.doors, icon: DoorOpen },
  ];
  const extraSpecs = Object.entries(vehicle.spec ?? {}).slice(0, 4);

  return (
    <aside
      className="vehicle-spec-panel"
      style={themeVarsForVehicle(vehicle)}
      role="dialog"
      aria-modal="true"
      aria-label={`Especificacoes de ${vehicle.brand} ${vehicle.model}`}
      onClick={onClose}
    >
      <div className="vehicle-spec-sheet" onClick={(event) => event.stopPropagation()}>
        <button className="vehicle-spec-close" type="button" aria-label="Fechar especificacoes" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="vehicle-spec-visual">
          <div className="vehicle-spec-media">
            <span className="vehicle-spec-orb" />
            {mainImage ? (
              <img src={imageUrl(mainImage)} alt={`${vehicle.brand} ${vehicle.model}`} />
            ) : (
              <span className="vehicle-placeholder">{vehicle.brand?.slice(0, 1)}{vehicle.model?.slice(0, 1)}</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="vehicle-spec-thumbs">
              {images.slice(0, 5).map((media) => (
                <img key={media.id ?? media.url} src={imageUrl(media.url)} alt="" />
              ))}
            </div>
          )}
        </div>

        <div className="vehicle-spec-info">
          <div className="vehicle-spec-head">
            <span className="eyebrow"><span className="pip" /> {vehicle.publicCode ?? 'Selecao premium'}</span>
            <h3>{vehicle.brand} {vehicle.model}</h3>
            {vehicle.version && <p>{vehicle.version}</p>}
            <strong className="price big">{formatCurrency(vehicle.price)}</strong>
          </div>

          <dl className="vehicle-spec-list">
            {specItems.map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <dt><Icon size={15} /> {label}</dt>
                <dd>{display(value)}</dd>
              </div>
            ))}
            {vehicle.publicCode && (
              <div>
                <dt><Hash size={15} /> Codigo</dt>
                <dd>{vehicle.publicCode}</dd>
              </div>
            )}
          </dl>

          {(vehicle.description || extraSpecs.length > 0) && (
            <div className="vehicle-spec-notes">
              {vehicle.description && <p>{vehicle.description}</p>}
              {extraSpecs.map(([key, value]) => (
                <span key={key}><strong>{key}</strong>{display(value)}</span>
              ))}
            </div>
          )}

          <div className="vehicle-spec-actions">
            {href && <Link className="button button-dark" to={href}>Abrir ficha completa</Link>}
            <button className="button button-ghost" type="button" onClick={onClose}>Voltar a listagem</button>
          </div>
        </div>
      </div>
    </aside>
  );
}
