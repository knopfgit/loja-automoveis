import { MapPin, Navigation } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ErrorState, LoadingState } from '../../components/State';
import { getStoreLocation } from './api';

export function LocationPage() {
  const location = useQuery({ queryKey: ['storeLocation'], queryFn: getStoreLocation });

  if (location.isLoading) return <LoadingState />;
  if (location.isError) return <ErrorState error={location.error} />;
  if (!location.data) return null;

  return (
    <div className="page">
      <section className="location-hero">
        <div>
          <span className="eyebrow">Onde estamos</span>
          <h1>{location.data.name}</h1>
          <p>{location.data.address?.street}, {location.data.address?.city} - {location.data.address?.state}</p>
          <div className="hero-actions">
            {location.data.directionsUrl && (
              <a className="button button-dark" href={location.data.directionsUrl} target="_blank" rel="noreferrer">
                <Navigation size={18} /> Como chegar
              </a>
            )}
            {location.data.googleMapsUrl && (
              <a className="button button-ghost" href={location.data.googleMapsUrl} target="_blank" rel="noreferrer">
                <MapPin size={18} /> Abrir mapa
              </a>
            )}
          </div>
        </div>
        <div className="map-panel">
          <MapPin size={36} />
          <strong>{location.data.coordinates?.latitude}, {location.data.coordinates?.longitude}</strong>
        </div>
      </section>
      <section className="section">
        <h2>Horario de atendimento</h2>
        <div className="info-grid">
          {Object.entries(location.data.openingHours ?? {}).map(([day, hour]) => (
            <div key={day}><strong>{day}</strong><span>{hour}</span></div>
          ))}
        </div>
      </section>
    </div>
  );
}
