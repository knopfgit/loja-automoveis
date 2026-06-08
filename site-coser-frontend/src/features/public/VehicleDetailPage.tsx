import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { ErrorState, LoadingState } from '../../components/State';
import { formatCurrency, imageUrl } from '../../utils/format';
import { getVehicleBySlug, specialistContact, trackVehicleView } from './api';

export function VehicleDetailPage() {
  const { slug = '' } = useParams();
  const [lead, setLead] = useState({ name: '', phone: '' });
  const vehicle = useQuery({ queryKey: ['vehicle', slug], queryFn: () => getVehicleBySlug(slug), enabled: Boolean(slug) });
  const contact = useMutation({
    mutationFn: specialistContact,
    onSuccess: (data) => window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer'),
  });

  useEffect(() => {
    if (vehicle.data?.id) void trackVehicleView(vehicle.data.id);
  }, [vehicle.data?.id]);

  if (vehicle.isLoading) return <LoadingState />;
  if (vehicle.isError) return <ErrorState error={vehicle.error} />;
  if (!vehicle.data) return null;

  const mainImage = vehicle.data.media?.find((item) => item.isMain)?.url ?? vehicle.data.media?.[0]?.url;

  return (
    <div className="page">
      <section className="detail-layout">
        <div className="gallery">
          {mainImage ? <img src={imageUrl(mainImage)} alt={`${vehicle.data.brand} ${vehicle.data.model}`} /> : <div className="gallery-empty">Sem foto</div>}
          <div className="thumb-row">
            {vehicle.data.media?.slice(0, 5).map((media) => <img key={media.id ?? media.url} src={imageUrl(media.url)} alt="" />)}
          </div>
        </div>
        <aside className="detail-panel">
          <span className="eyebrow">{vehicle.data.publicCode}</span>
          <h1>{vehicle.data.brand} {vehicle.data.model}</h1>
          <p>{vehicle.data.version}</p>
          <strong className="price big">{formatCurrency(vehicle.data.price)}</strong>
          <dl className="spec-grid">
            <div><dt>Ano</dt><dd>{vehicle.data.modelYear}</dd></div>
            <div><dt>Km</dt><dd>{vehicle.data.mileage?.toLocaleString('pt-BR')}</dd></div>
            <div><dt>Cambio</dt><dd>{vehicle.data.transmission}</dd></div>
            <div><dt>Combustivel</dt><dd>{vehicle.data.fuel}</dd></div>
            <div><dt>Cor</dt><dd>{vehicle.data.color}</dd></div>
            <div><dt>Portas</dt><dd>{vehicle.data.doors}</dd></div>
          </dl>
          <form
            className="lead-form"
            onSubmit={(event) => {
              event.preventDefault();
              contact.mutate({ vehicleId: vehicle.data.id, ...lead });
            }}
          >
            <input required placeholder="Seu nome" value={lead.name} onChange={(event) => setLead((current) => ({ ...current, name: event.target.value }))} />
            <input required placeholder="WhatsApp" value={lead.phone} onChange={(event) => setLead((current) => ({ ...current, phone: event.target.value }))} />
            <button className="button button-dark" type="submit" disabled={contact.isPending}>
              <MessageCircle size={18} /> Falar com especialista
            </button>
          </form>
        </aside>
      </section>
      <section className="section">
        <h2>Ficha tecnica</h2>
        <p>{vehicle.data.description}</p>
        <div className="spec-list">
          {Object.entries(vehicle.data.spec ?? {}).map(([key, value]) => (
            <div key={key}><strong>{key}</strong><span>{Array.isArray(value) ? value.join(', ') : String(value)}</span></div>
          ))}
        </div>
      </section>
    </div>
  );
}
