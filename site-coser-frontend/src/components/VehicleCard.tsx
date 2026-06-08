import { Heart, Gauge, Fuel, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../types';
import { formatCurrency, imageUrl } from '../utils/format';

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const mainImage = vehicle.media?.find((item) => item.isMain)?.url ?? vehicle.media?.[0]?.url;

  return (
    <article className="vehicle-card">
      <Link to={`/veiculos/${vehicle.slug ?? vehicle.id}`} className="vehicle-image-link" aria-label={`${vehicle.brand} ${vehicle.model}`}>
        {mainImage ? (
          <img src={imageUrl(mainImage)} alt={`${vehicle.brand} ${vehicle.model}`} />
        ) : (
          <div className="vehicle-placeholder">{vehicle.brand?.slice(0, 1)}{vehicle.model?.slice(0, 1)}</div>
        )}
      </Link>
      <div className="vehicle-card-body">
        <div className="vehicle-title-row">
          <div>
            <h3>{vehicle.brand} {vehicle.model}</h3>
            <p>{vehicle.version}</p>
          </div>
          {vehicle.featured && <span className="pill">Destaque</span>}
        </div>
        <strong className="price">{formatCurrency(vehicle.price)}</strong>
        <div className="vehicle-facts">
          <span><Calendar size={16} /> {vehicle.modelYear ?? '-'}</span>
          <span><Gauge size={16} /> {vehicle.mileage?.toLocaleString('pt-BR') ?? 0} km</span>
          <span><Fuel size={16} /> {vehicle.fuel ?? '-'}</span>
        </div>
        <div className="vehicle-actions">
          <Link className="button button-dark" to={`/veiculos/${vehicle.slug ?? vehicle.id}`}>Ver detalhes</Link>
          <button className="icon-button" type="button" title="Favoritar" aria-label="Favoritar">
            <Heart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
