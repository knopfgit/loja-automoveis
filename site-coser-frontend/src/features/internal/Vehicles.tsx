import { useState } from 'react';
import type { FormEvent } from 'react';
import { CheckCircle2, ImagePlus, Plus, RefreshCcw, Search, Sparkles, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useApiMutation, useItem, useList } from '../../services/data';
import {
  Badge,
  Card,
  DetailGrid,
  Drawer,
  ENUMS,
  EnumOptions,
  Field,
  FormGrid,
  Page,
  Table,
  Tabs,
} from '../../components/ui';
import { ErrorState, LoadingState } from '../../components/State';
import { formatCurrency, imageUrl } from '../../utils/format';

type V = Record<string, unknown> & { id: string; brand?: string; model?: string };

export function VehiclesAdminPage() {
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const listQuery = useList<V>(['adminVehicles', search], '/vehicles', { page: 1, limit: 50, search: search || undefined });

  const create = useApiMutation((payload: Record<string, unknown>) => api.post('/vehicles', payload), {
    invalidate: [['adminVehicles']],
    onSuccess: () => setCreating(false),
  });
  const changeStatus = useApiMutation(({ id, status }: { id: string; status: string }) => api.post(`/vehicles/${id}/status`, { status }), {
    invalidate: [['adminVehicles']],
  });

  function submitVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const raw = Object.fromEntries(form.entries());
    create.mutate({
      brand: raw.brand,
      model: raw.model,
      version: raw.version || undefined,
      manufactureYear: Number(raw.manufactureYear || raw.modelYear),
      modelYear: Number(raw.modelYear),
      category: raw.category || undefined,
      color: raw.color || undefined,
      fuel: raw.fuel || undefined,
      transmission: raw.transmission || undefined,
      mileage: Number(raw.mileage || 0),
      purchasePrice: raw.purchasePrice ? Number(raw.purchasePrice) : undefined,
      announcedPrice: raw.announcedPrice ? Number(raw.announcedPrice) : undefined,
      condition: raw.condition || undefined,
      publicDescription: raw.publicDescription || undefined,
    });
  }

  return (
    <Page
      eyebrow="Estoque"
      title="Veículos"
      actions={
        <button className="button button-primary" onClick={() => setCreating(true)}>
          <Plus size={17} /> Novo veículo
        </button>
      }
    >
      <Card>
        <form
          className="toolbar"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setSearch(String(form.get('q') ?? ''));
          }}
        >
          <input name="q" placeholder="Buscar por marca, modelo, placa..." style={{ maxWidth: 360 }} defaultValue={search} />
          <button className="button button-ghost" type="submit">
            <Search size={16} /> Buscar
          </button>
          <span className="hint">Fluxo: DRAFT → AVAILABLE → RESERVED → SOLD → ARCHIVED</span>
        </form>
        <Table
          query={listQuery}
          columns={[
            { key: 'vehicle', label: 'Veículo', render: (row) => `${row.brand ?? ''} ${row.model ?? ''} ${row.version ?? ''}`.trim() },
            { key: 'modelYear', label: 'Ano', align: 'center' },
            { key: 'status', label: 'Status', render: (row) => <Badge value={String(row.status ?? '—')} /> },
            { key: 'price', label: 'Preço', align: 'right', render: (row) => formatCurrency(Number(row.announcedPrice ?? row.price ?? 0)) },
          ]}
          actions={(row) => (
            <>
              <button className="button button-ghost" onClick={() => setSelected(row.id)}>
                Abrir
              </button>
              {row.status === 'DRAFT' && (
                <button className="button button-ghost" onClick={() => changeStatus.mutate({ id: row.id, status: 'AVAILABLE' })}>
                  <CheckCircle2 size={15} /> Publicar
                </button>
              )}
            </>
          )}
        />
      </Card>

      <Drawer open={creating} onClose={() => setCreating(false)} eyebrow="Cadastro" title="Novo veículo"
        footer={
          <>
            <button className="button button-ghost" onClick={() => setCreating(false)}>Cancelar</button>
            <button className="button button-primary" form="vehicle-form" type="submit" disabled={create.isPending}>Salvar rascunho</button>
          </>
        }
      >
        <form id="vehicle-form" onSubmit={submitVehicle}>
          <FormGrid cols={2}>
            <Field label="Marca"><input name="brand" required /></Field>
            <Field label="Modelo"><input name="model" required /></Field>
            <Field label="Versão"><input name="version" /></Field>
            <Field label="Ano modelo"><input name="modelYear" inputMode="numeric" required /></Field>
            <Field label="Ano fabricação"><input name="manufactureYear" inputMode="numeric" /></Field>
            <Field label="Quilometragem"><input name="mileage" inputMode="numeric" /></Field>
            <Field label="Cor"><input name="color" /></Field>
            <Field label="Categoria"><input name="category" /></Field>
            <Field label="Combustível"><select name="fuel" defaultValue=""><EnumOptions values={ENUMS.FuelType} placeholder="Selecione" /></select></Field>
            <Field label="Câmbio"><select name="transmission" defaultValue=""><EnumOptions values={ENUMS.Transmission} placeholder="Selecione" /></select></Field>
            <Field label="Condição"><select name="condition" defaultValue=""><option value="">Selecione</option><option value="NEW">Novo</option><option value="SEMINEW">Seminovo</option><option value="USED">Usado</option></select></Field>
            <Field label="Preço de compra (interno)"><input name="purchasePrice" inputMode="numeric" /></Field>
            <Field label="Preço anunciado"><input name="announcedPrice" inputMode="numeric" /></Field>
          </FormGrid>
          <Field label="Descrição pública"><textarea name="publicDescription" /></Field>
          {create.isError && <ErrorState error={create.error} />}
        </form>
      </Drawer>

      {selected && <VehicleDrawer id={selected} onClose={() => setSelected(null)} />}
    </Page>
  );
}

function VehicleDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const [tab, setTab] = useState('data');
  const vehicle = useItem<Record<string, unknown>>(['vehicle', id], `/vehicles/${id}`);
  const movements = useItem<Record<string, unknown>[]>(['vehicleStock', id], `/vehicles/${id}/stock-movements`, tab === 'stock');

  const applySpecs = useApiMutation(
    (payload: Record<string, unknown>) => api.post(`/vehicles/${id}/apply-specs`, payload),
    { invalidate: [['vehicle', id]] },
  );
  const changeStatus = useApiMutation((status: string) => api.post(`/vehicles/${id}/status`, { status }), {
    invalidate: [['vehicle', id], ['adminVehicles']],
  });
  const uploadMedia = useApiMutation(
    (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return api.post(`/vehicles/${id}/media/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    { invalidate: [['vehicle', id]] },
  );
  const removeMedia = useApiMutation((mediaId: string) => api.delete(`/vehicles/${id}/media/${mediaId}`), { invalidate: [['vehicle', id]] });

  const data = vehicle.data ?? {};
  const media = (data.media as { id?: string; url: string; isMain?: boolean }[] | undefined) ?? [];
  const spec = (data.spec as Record<string, unknown> | undefined) ?? {};

  return (
    <Drawer
      open
      onClose={onClose}
      eyebrow={String(data.publicCode ?? 'Veículo')}
      title={`${data.brand ?? ''} ${data.model ?? ''}`.trim() || 'Veículo'}
      footer={
        <select className="status-select" style={{ width: 200 }} value="" onChange={(event) => event.target.value && changeStatus.mutate(event.target.value)}>
          <EnumOptions values={ENUMS.VehicleStatus} placeholder="Alterar status…" />
        </select>
      }
    >
      {vehicle.isLoading && <LoadingState />}
      {vehicle.isError && <ErrorState error={vehicle.error} />}
      {vehicle.data && (
        <>
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { id: 'data', label: 'Dados' },
              { id: 'spec', label: 'Ficha técnica' },
              { id: 'media', label: 'Mídia' },
              { id: 'stock', label: 'Estoque' },
            ]}
          />

          {tab === 'data' && (
            <DetailGrid
              data={data}
              only={['status', 'brand', 'model', 'version', 'modelYear', 'manufactureYear', 'color', 'fuel', 'transmission', 'mileage', 'category', 'condition', 'purchasePrice', 'announcedPrice', 'suggestedPrice', 'minPrice', 'plate', 'renavam', 'viewCount', 'favoriteCount', 'publicDescription', 'internalNotes']}
            />
          )}

          {tab === 'spec' && (
            <>
              <Card title="Preencher automaticamente" subtitle="Busca a ficha técnica pelo provedor e aplica.">
                <form
                  onSubmit={(event: FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    applySpecs.mutate({
                      brand: form.get('brand') || data.brand,
                      model: form.get('model') || data.model,
                      year: Number(form.get('year') || data.modelYear),
                      version: form.get('version') || data.version || undefined,
                    });
                  }}
                >
                  <FormGrid cols={2}>
                    <Field label="Marca"><input name="brand" defaultValue={String(data.brand ?? '')} /></Field>
                    <Field label="Modelo"><input name="model" defaultValue={String(data.model ?? '')} /></Field>
                    <Field label="Ano"><input name="year" inputMode="numeric" defaultValue={String(data.modelYear ?? '')} /></Field>
                    <Field label="Versão"><input name="version" defaultValue={String(data.version ?? '')} /></Field>
                  </FormGrid>
                  <div className="form-actions">
                    <button className="button button-primary" type="submit" disabled={applySpecs.isPending}>
                      <Sparkles size={16} /> Aplicar ficha técnica
                    </button>
                  </div>
                  {applySpecs.isError && <ErrorState error={applySpecs.error} />}
                  {applySpecs.isSuccess && <div className="success-box">Ficha técnica aplicada.</div>}
                </form>
              </Card>
              {Object.keys(spec).length > 0 ? (
                <div className="spec-list">
                  {Object.entries(spec)
                    .filter(([key]) => !['id', 'vehicleId', 'createdAt', 'updatedAt'].includes(key))
                    .map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}</strong>
                        <span>{Array.isArray(value) ? value.join(', ') : String(value ?? '—')}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="hint">Sem ficha técnica ainda. Use o preenchimento automático acima.</p>
              )}
            </>
          )}

          {tab === 'media' && (
            <>
              <label className="button button-primary" style={{ width: 'fit-content' }}>
                <ImagePlus size={16} /> Enviar foto
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) return alert('Arquivo acima de 10MB.');
                    uploadMedia.mutate(file);
                  }}
                />
              </label>
              {uploadMedia.isError && <ErrorState error={uploadMedia.error} />}
              {media.length === 0 ? (
                <p className="hint">Nenhuma imagem cadastrada.</p>
              ) : (
                <div className="thumb-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {media.map((m) => (
                    <div key={m.id ?? m.url} className="stack">
                      <img src={imageUrl(m.url)} alt="" style={{ borderRadius: 16, aspectRatio: '4/3', objectFit: 'cover' }} />
                      {m.id && (
                        <button className="button button-ghost" onClick={() => removeMedia.mutate(m.id!)}>
                          <Trash2 size={14} /> Remover
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'stock' && (
            <>
              {movements.isLoading && <LoadingState />}
              <Table
                rows={movements.data ?? []}
                empty="Sem movimentações de estoque."
                columns={[
                  { key: 'type', label: 'Tipo', render: (row) => <Badge value={String(row.type ?? '—')} /> },
                  { key: 'reason', label: 'Motivo' },
                  { key: 'createdAt', label: 'Data' },
                ]}
              />
            </>
          )}
        </>
      )}
    </Drawer>
  );
}
