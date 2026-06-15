import type { KeyboardEvent, MouseEvent } from 'react';
import { Heart, Gauge, Fuel, Calendar, Cog } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../types';
import { formatCurrency, imageUrl } from '../utils/format';
import { themeVarsForVehicle } from '../features/public/vehicleTheme';

type VehicleCardVariant = 'standard' | 'showcase' | 'landing';

type VehicleCardProps = {
  vehicle: Vehicle;
  variant?: VehicleCardVariant;
  href?: string;
  active?: boolean;
  dimmed?: boolean;
  className?: string;
  onOpen?: (vehicle: Vehicle) => void;
};

export function VehicleCard({ vehicle, variant = 'standard', href, active, dimmed, className, onOpen }: VehicleCardProps) {
  const mainImage = vehicle.media?.find((item) => item.isMain)?.url ?? vehicle.media?.[0]?.url;
  const vehiclePath = href ?? `/veiculos/${vehicle.slug ?? vehicle.id}`;
  const cardClass = [
    'vehicle-card',
    `vehicle-card-${variant}`,
    onOpen ? 'vehicle-card-button' : '',
    active ? 'is-active' : '',
    dimmed ? 'is-dimmed' : '',
    className ?? '',
  ].filter(Boolean).join(' ');
  const openVehicle = () => onOpen?.(vehicle);
  const openVehicleFromControl = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    openVehicle();
  };
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onOpen || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    openVehicle();
  };
  const landingContent = (
    <>
      <span className="vehicle-tone-strip" aria-hidden="true" />
      <span className="vehicle-image-link vehicle-image-landing" aria-hidden="true">
        <span className="vehicle-image-halo" />
        {mainImage ? (
          <img src={imageUrl(mainImage)} alt="" />
        ) : (
          <span className="vehicle-placeholder">{vehicle.brand?.slice(0, 1)}{vehicle.model?.slice(0, 1)}</span>
        )}
      </span>
      <span className="vehicle-landing-body">
        <span className="vehicle-brand-label">{vehicle.brand}</span>
        <span className="vehicle-landing-title">{vehicle.model}</span>
        {vehicle.version && <span className="vehicle-landing-version">{vehicle.version}</span>}
        <span className="vehicle-landing-facts">
          <span><Calendar size={15} /> {vehicle.modelYear ?? '-'}</span>
          <span><Gauge size={15} /> {(vehicle.mileage ?? 0).toLocaleString('pt-BR')} km</span>
          {vehicle.fuel && <span><Fuel size={15} /> {vehicle.fuel}</span>}
          {vehicle.transmission && <span><Cog size={15} /> {vehicle.transmission}</span>}
        </span>
        <span className="vehicle-landing-footer">
          <strong className="price">{formatCurrency(vehicle.price)}</strong>
        </span>
      </span>
    </>
  );

  if (variant === 'landing') {
    if (onOpen) {
      return (
        <button className={cardClass} style={themeVarsForVehicle(vehicle)} type="button" onClick={openVehicle} aria-label={`Ver detalhes de ${vehicle.brand} ${vehicle.model}`} aria-pressed={active}>
          {landingContent}
        </button>
      );
    }

    return (
      <Link className={cardClass} style={themeVarsForVehicle(vehicle)} to={vehiclePath} aria-label={`Ver detalhes de ${vehicle.brand} ${vehicle.model}`}>
        {landingContent}
      </Link>
    );
  }

  return (
    <article
      className={cardClass}
      style={themeVarsForVehicle(vehicle)}
      onClick={onOpen ? openVehicle : undefined}
      onKeyDown={handleCardKeyDown}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-pressed={onOpen ? active : undefined}
    >
      <span className="vehicle-tone-strip" aria-hidden="true" />
      {onOpen ? (
        <button type="button" className="vehicle-image-link vehicle-image-button" onClick={openVehicleFromControl} aria-label={`Ver detalhes de ${vehicle.brand} ${vehicle.model}`}>
          {mainImage ? (
            <img src={imageUrl(mainImage)} alt={`${vehicle.brand} ${vehicle.model}`} />
          ) : (
            <div className="vehicle-placeholder">{vehicle.brand?.slice(0, 1)}{vehicle.model?.slice(0, 1)}</div>
          )}
        </button>
      ) : (
        <Link to={vehiclePath} className="vehicle-image-link" aria-label={`${vehicle.brand} ${vehicle.model}`}>
          {mainImage ? (
            <img src={imageUrl(mainImage)} alt={`${vehicle.brand} ${vehicle.model}`} />
          ) : (
            <div className="vehicle-placeholder">{vehicle.brand?.slice(0, 1)}{vehicle.model?.slice(0, 1)}</div>
          )}
        </Link>
      )}
      <div className="vehicle-card-body">
        <div className="vehicle-title-row">
          <div>
            <h3>{vehicle.brand} {vehicle.model}</h3>
            <p>{vehicle.version}</p>
          </div>
          {vehicle.featured && <span className="pill">Destaque</span>}
        </div>
        {vehicle.color && <span className="vehicle-color-chip">{vehicle.color}</span>}
        <strong className="price">{formatCurrency(vehicle.price)}</strong>
        <div className="vehicle-facts">
          <span><Calendar size={16} /> {vehicle.modelYear ?? '-'}</span>
          <span><Gauge size={16} /> {vehicle.mileage?.toLocaleString('pt-BR') ?? 0} km</span>
          <span><Fuel size={16} /> {vehicle.fuel ?? '-'}</span>
        </div>
        <div className="vehicle-actions">
          {onOpen ? (
            <button className="button button-dark" type="button" onClick={openVehicleFromControl}>Ver detalhes</button>
          ) : (
            <Link className="button button-dark" to={vehiclePath}>Ver detalhes</Link>
          )}
          <button className="icon-button" type="button" title="Favoritar" aria-label="Favoritar" onClick={(event) => event.stopPropagation()}>
            <Heart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
