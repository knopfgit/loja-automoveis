import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Box, MessageCircle, X } from 'lucide-react';
import { ErrorState, LoadingState } from '../../components/State';
import { formatCurrency, imageUrl } from '../../utils/format';
import { getVehicleBySlug, specialistContact, trackVehicleView } from './api';
import { findDemoVehicleBySlug } from './demoVehicles';
import { applyGlobalTheme, clearGlobalTheme, getBrandProfile, themeVarsForVehicle } from './vehicleTheme';

// Modelo 3D de demonstracao. Pode ser sobrescrito por veiculo via spec.model3d (URL de um .glb).
const DEMO_CAR_GLB = 'https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/ToyCar/glTF-Binary/ToyCar.glb';

export function VehicleDetailPage() {
  const { slug = '' } = useParams();
  const [lead, setLead] = useState({ name: '', phone: '' });
  const [show3d, setShow3d] = useState(false);
  const [loading3d, setLoading3d] = useState(false);
  const viewerLoaded = useRef(false);
  const vehicleQuery = useQuery({ queryKey: ['vehicle', slug], queryFn: () => getVehicleBySlug(slug), enabled: Boolean(slug), retry: false });

  // Se a API nao responder, cai para o carro de demonstracao correspondente.
  const data = vehicleQuery.data ?? findDemoVehicleBySlug(slug);

  const contact = useMutation({
    mutationFn: specialistContact,
    onSuccess: (result) => {
      if (result.whatsappUrl) window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer');
    },
  });

  useEffect(() => {
    if (data?.id && !data.id.startsWith('demo-')) void trackVehicleView(data.id);
  }, [data?.id]);

  // Ao entrar no veiculo, pinta o site na cor da marca; limpa ao sair.
  useEffect(() => {
    if (!data?.brand) return;
    applyGlobalTheme(getBrandProfile(data.brand));
    return () => clearGlobalTheme();
  }, [data?.brand]);

  useEffect(() => {
    if (!show3d) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShow3d(false);
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [show3d]);

  async function open3d() {
    if (!viewerLoaded.current) {
      setLoading3d(true);
      try {
        await import('@google/model-viewer');
        viewerLoaded.current = true;
      } finally {
        setLoading3d(false);
      }
    }
    setShow3d(true);
  }

  if (vehicleQuery.isLoading && !data) return <LoadingState />;
  if (!data) {
    if (vehicleQuery.isError) return <ErrorState error={vehicleQuery.error} />;
    return null;
  }

  const mainImage = data.media?.find((item) => item.isMain)?.url ?? data.media?.[0]?.url;
  const specModel = data.spec?.model3d ?? data.spec?.model3dUrl;
  const model3dUrl = typeof specModel === 'string' && specModel ? specModel : DEMO_CAR_GLB;

  return (
    <div className="page">
      <section className="detail-layout vehicle-detail-watercolor" style={themeVarsForVehicle(data)}>
        <div className="gallery">
          {mainImage ? <img src={imageUrl(mainImage)} alt={`${data.brand} ${data.model}`} /> : <div className="gallery-empty">Sem foto</div>}
          <div className="thumb-row">
            {data.media?.slice(0, 5).map((media) => <img key={media.id ?? media.url} src={imageUrl(media.url)} alt="" />)}
          </div>
        </div>
        <aside className="detail-panel">
          <span className="eyebrow">{data.publicCode}</span>
          <h1>{data.brand} {data.model}</h1>
          <p>{data.version}</p>
          <strong className="price big">{formatCurrency(data.price)}</strong>
          <dl className="spec-grid">
            <div><dt>Ano</dt><dd>{data.modelYear}</dd></div>
            <div><dt>Km</dt><dd>{data.mileage?.toLocaleString('pt-BR')}</dd></div>
            <div><dt>Cambio</dt><dd>{data.transmission}</dd></div>
            <div><dt>Combustivel</dt><dd>{data.fuel}</dd></div>
            <div><dt>Cor</dt><dd>{data.color}</dd></div>
            <div><dt>Portas</dt><dd>{data.doors}</dd></div>
          </dl>
          <button type="button" className="button button-ghost view-3d-button" onClick={open3d} disabled={loading3d}>
            <Box size={18} /> {loading3d ? 'Carregando 3D...' : 'Ver veiculo em 3D'}
          </button>
          <form
            className="lead-form"
            onSubmit={(event) => {
              event.preventDefault();
              contact.mutate({
                // Veiculos de demonstracao nao existem no banco; o lead vai sem vinculo.
                vehicleId: data.id.startsWith('demo-') ? undefined : data.id,
                sourcePage: window.location.pathname,
                message: `Ola! Tenho interesse em ${data.brand} ${data.model}${data.version ? ` ${data.version}` : ''}. Pode me ajudar?`,
                ...lead,
              });
            }}
          >
            <input required placeholder="Seu nome" autoComplete="name" value={lead.name} onChange={(event) => setLead((current) => ({ ...current, name: event.target.value }))} />
            <input required placeholder="WhatsApp" autoComplete="tel" inputMode="tel" value={lead.phone} onChange={(event) => setLead((current) => ({ ...current, phone: event.target.value }))} />
            <button className="button button-dark" type="submit" disabled={contact.isPending}>
              <MessageCircle size={18} /> {contact.isPending ? 'Enviando...' : 'Falar com especialista'}
            </button>
            {contact.isError && (
              <p className="form-feedback form-feedback-error" role="alert">
                Nao foi possivel enviar agora. Tente novamente em instantes.
              </p>
            )}
            {contact.isSuccess && (
              <p className="form-feedback form-feedback-ok" role="status">
                Recebemos seu contato! {contact.data?.whatsappUrl ? 'Abrimos o WhatsApp para voce continuar a conversa.' : 'Um consultor falara com voce em breve.'}
              </p>
            )}
          </form>
        </aside>
      </section>
      <section className="section">
        <h2>Ficha tecnica</h2>
        <p>{data.description}</p>
        <div className="spec-list">
          {Object.entries(data.spec ?? {}).map(([key, value]) => (
            <div key={key}><strong>{key}</strong><span>{Array.isArray(value) ? value.join(', ') : String(value)}</span></div>
          ))}
        </div>
      </section>
      {show3d && (
        <div
          className="model-viewer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Visualizacao 3D de ${data.brand} ${data.model}`}
          onClick={() => setShow3d(false)}
        >
          <div className="model-viewer-shell" onClick={(event) => event.stopPropagation()}>
            <button className="model-viewer-close" type="button" aria-label="Fechar visualizacao 3D" onClick={() => setShow3d(false)}>
              <X size={18} />
            </button>
            <model-viewer
              src={model3dUrl}
              alt={`Modelo 3D de ${data.brand} ${data.model}`}
              poster={mainImage ? imageUrl(mainImage) : undefined}
              camera-controls={true}
              auto-rotate={true}
              shadow-intensity="1"
              exposure="1.1"
              touch-action="pan-y"
            />
            <span className="model-viewer-note">Modelo 3D de demonstracao — arraste para girar</span>
          </div>
        </div>
      )}
    </div>
  );
}
