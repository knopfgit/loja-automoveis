import { Download, Heart, MapPin, Pencil, Plus, ShieldAlert, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../../services/api';
import { useApiMutation, useItem, useList } from '../../services/data';
import { Card, DetailGrid, Drawer, Field, FormGrid, Page, Table } from '../../components/ui';
import { EmptyState, ErrorState, LoadingState } from '../../components/State';
import { VehicleCard } from '../../components/VehicleCard';
import type { Vehicle } from '../../types';

const CONSENT_CATEGORIES = [
  { id: 'ESSENTIAL', label: 'Essenciais', locked: true },
  { id: 'ANALYTICS', label: 'Analytics' },
  { id: 'MARKETING', label: 'Marketing' },
  { id: 'LOCATION', label: 'Localização' },
];

/* --------------------------------------------------------------- Account */

type Address = Record<string, unknown> & { id?: string };

export function AccountPage() {
  const account = useItem<Record<string, unknown> & { addresses?: Address[] }>(['customerMe'], '/customers/me');
  const [editing, setEditing] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  const update = useApiMutation((payload: Record<string, unknown>) => api.patch('/customers/me', payload), {
    invalidate: [['customerMe']],
    onSuccess: () => setEditing(false),
  });
  const addAddress = useApiMutation((payload: Record<string, unknown>) => api.post('/customers/me/addresses', payload), {
    invalidate: [['customerMe']],
    onSuccess: () => setAddressOpen(false),
  });

  if (account.isLoading) return <LoadingState />;
  if (account.isError) return <ErrorState error={account.error} />;

  const data = account.data ?? {};
  const addresses = data.addresses ?? [];

  return (
    <Page
      eyebrow="Cliente"
      title="Minha conta"
      actions={
        <>
          <button className="button button-ghost" onClick={() => setAddressOpen(true)}>
            <MapPin size={17} /> Novo endereço
          </button>
          <button className="button button-dark" onClick={() => setEditing(true)}>
            <Pencil size={17} /> Editar perfil
          </button>
        </>
      }
    >
      <Card title="Dados pessoais">
        <DetailGrid
          data={data}
          only={['fullName', 'document', 'personType', 'email', 'phone', 'whatsapp', 'birthDate', 'marketingConsent', 'cookieConsent', 'createdAt']}
        />
      </Card>

      <Card title="Endereços">
        {addresses.length === 0 ? (
          <EmptyState title="Nenhum endereço cadastrado." />
        ) : (
          <div className="detail-grid">
            {addresses.map((address, index) => (
              <div key={address.id ?? index}>
                <strong>{String(address.label ?? 'Endereço')}</strong>
                <span>
                  {String(address.street ?? '')} {String(address.number ?? '')} — {String(address.city ?? '')}/{String(address.state ?? '')}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Drawer
        open={editing}
        onClose={() => setEditing(false)}
        eyebrow="Cliente"
        title="Editar perfil"
        footer={
          <>
            <button className="button button-ghost" onClick={() => setEditing(false)}>
              Cancelar
            </button>
            <button className="button button-primary" form="profile-form" type="submit" disabled={update.isPending}>
              Salvar
            </button>
          </>
        }
      >
        <form
          id="profile-form"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const raw = Object.fromEntries([...form.entries()].filter(([, value]) => value !== ''));
            update.mutate({ ...raw, marketingConsent: form.get('marketingConsent') === 'on' });
          }}
        >
          <FormGrid cols={1}>
            <Field label="Nome completo">
              <input name="fullName" defaultValue={String(data.fullName ?? '')} />
            </Field>
            <Field label="E-mail">
              <input name="email" type="email" defaultValue={String(data.email ?? '')} />
            </Field>
            <Field label="Telefone">
              <input name="phone" defaultValue={String(data.phone ?? '')} />
            </Field>
            <Field label="WhatsApp">
              <input name="whatsapp" defaultValue={String(data.whatsapp ?? '')} />
            </Field>
            <label className="toggle-chip">
              <input type="checkbox" name="marketingConsent" defaultChecked={Boolean(data.marketingConsent)} /> Aceito receber novidades
            </label>
          </FormGrid>
          {update.isError && <ErrorState error={update.error} />}
        </form>
      </Drawer>

      <Drawer
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        eyebrow="Cliente"
        title="Novo endereço"
        footer={
          <>
            <button className="button button-ghost" onClick={() => setAddressOpen(false)}>
              Cancelar
            </button>
            <button className="button button-primary" form="address-form" type="submit" disabled={addAddress.isPending}>
              Adicionar
            </button>
          </>
        }
      >
        <form
          id="address-form"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            addAddress.mutate(Object.fromEntries([...form.entries()].filter(([, value]) => value !== '')));
          }}
        >
          <FormGrid cols={2}>
            <Field label="Rótulo">
              <input name="label" placeholder="Casa, Trabalho..." />
            </Field>
            <Field label="CEP">
              <input name="zipCode" placeholder="95010000" />
            </Field>
            <Field label="Rua">
              <input name="street" />
            </Field>
            <Field label="Número">
              <input name="number" />
            </Field>
            <Field label="Complemento">
              <input name="complement" />
            </Field>
            <Field label="Bairro">
              <input name="district" />
            </Field>
            <Field label="Cidade">
              <input name="city" />
            </Field>
            <Field label="UF">
              <input name="state" maxLength={2} />
            </Field>
          </FormGrid>
          {addAddress.isError && <ErrorState error={addAddress.error} />}
        </form>
      </Drawer>
    </Page>
  );
}

/* --------------------------------------------------------------- Favorites */

export function FavoritesPage() {
  const list = useList<Vehicle>(['favorites'], '/favorites');
  const remove = useApiMutation((vehicleId: string) => api.delete(`/favorites/${vehicleId}`), { invalidate: [['favorites']] });

  return (
    <Page eyebrow="Garagem" title="Meus favoritos">
      {list.isLoading && <LoadingState />}
      {list.isError && <ErrorState error={list.error} />}
      {list.data?.items.length === 0 && <EmptyState title="Você ainda não favoritou veículos." />}
      <div className="vehicle-grid">
        {list.data?.items.map((favorite) => {
          const vehicle = (favorite as Record<string, unknown>).vehicle ? ((favorite as Record<string, unknown>).vehicle as Vehicle) : favorite;
          return (
            <div key={vehicle.id} className="stack">
              <VehicleCard vehicle={vehicle} />
              <button className="button button-ghost" onClick={() => remove.mutate(vehicle.id)}>
                <Heart size={17} /> Remover
              </button>
            </div>
          );
        })}
      </div>
    </Page>
  );
}

/* --------------------------------------------------------------- History */

export function ViewHistoryPage() {
  const history = useList(['viewHistory'], '/me/view-history');
  return (
    <Page eyebrow="Atividade" title="Histórico de visualizações">
      <Card>
        <Table query={history} empty="Nenhuma visualização registrada." />
      </Card>
    </Page>
  );
}

/* --------------------------------------------------------------- Purchases & documents */

export function PurchasesPage() {
  const docs = useList<Record<string, unknown> & { id: string; status?: string }>(['myDocuments'], '/me/documents');
  const upload = useApiMutation(
    ({ documentId, file }: { documentId: string; file: File }) => {
      const form = new FormData();
      form.append('file', file);
      form.append('documentId', documentId);
      return api.post('/me/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    { invalidate: [['myDocuments']] },
  );

  return (
    <Page eyebrow="Cliente" title="Compras & documentos">
      <Card subtitle="Envie aqui os documentos solicitados para concluir sua compra.">
        <Table
          query={docs}
          empty="Nenhum documento vinculado a você."
          columns={[
            { key: 'documentType', label: 'Documento', render: (row) => String((row.documentType as Record<string, unknown>)?.name ?? row.documentTypeId ?? '—') },
            { key: 'status', label: 'Status' },
            { key: 'expiryDate', label: 'Vencimento' },
          ]}
          actions={(row) => (
            <label className="button button-ghost">
              <Upload size={15} /> Enviar
              <input
                hidden
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) upload.mutate({ documentId: row.id, file });
                }}
              />
            </label>
          )}
        />
        {upload.isError && <ErrorState error={upload.error} />}
      </Card>
    </Page>
  );
}

/* --------------------------------------------------------------- Privacy & LGPD */

export function PrivacyPage() {
  const consents = useItem<{ category: string; granted: boolean }[]>(['myConsents'], '/consents/me');
  const exportRequest = useApiMutation(() => api.post('/privacy/export-request'));
  const deleteRequest = useApiMutation(() => api.post('/privacy/delete-request'));
  const saveConsents = useApiMutation((payload: Record<string, unknown>) => api.put('/consents/me', payload), { invalidate: [['myConsents']] });
  const marketing = useApiMutation((payload: Record<string, unknown>) => api.put('/marketing/preferences', payload));

  const granted = (category: string) => {
    const current = Array.isArray(consents.data) ? consents.data.find((c) => c.category === category) : undefined;
    return current?.granted ?? category === 'ESSENTIAL';
  };

  return (
    <Page eyebrow="LGPD" title="Privacidade & preferências">
      <div className="split-2">
        <Card title="Consentimento de cookies" subtitle="Você controla o uso dos seus dados a qualquer momento.">
          <form
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              saveConsents.mutate({
                termsVersion: '1.0',
                consents: CONSENT_CATEGORIES.map((category) => ({
                  category: category.id,
                  granted: category.locked ? true : form.get(category.id) === 'on',
                })),
              });
            }}
          >
            <div className="list-rows">
              {CONSENT_CATEGORIES.map((category) => (
                <label className="list-row" key={category.id}>
                  <span>{category.label}</span>
                  <input type="checkbox" name={category.id} defaultChecked={granted(category.id)} disabled={category.locked} />
                </label>
              ))}
            </div>
            <div className="form-actions">
              <button className="button button-primary" type="submit" disabled={saveConsents.isPending}>
                Salvar preferências
              </button>
            </div>
            {saveConsents.isSuccess && <div className="success-box">Consentimentos atualizados.</div>}
          </form>
        </Card>

        <Card title="Preferências de marketing" subtitle="Receba ofertas alinhadas ao seu interesse.">
          <form
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              marketing.mutate({
                emailOptIn: form.get('emailOptIn') === 'on',
                whatsappOptIn: form.get('whatsappOptIn') === 'on',
                interestBrands: String(form.get('interestBrands') ?? '')
                  .split(',')
                  .map((value) => value.trim())
                  .filter(Boolean),
                priceMin: form.get('priceMin') ? Number(form.get('priceMin')) : undefined,
                priceMax: form.get('priceMax') ? Number(form.get('priceMax')) : undefined,
              });
            }}
          >
            <div className="list-rows">
              <label className="list-row">
                <span>Receber por e-mail</span>
                <input type="checkbox" name="emailOptIn" defaultChecked />
              </label>
              <label className="list-row">
                <span>Receber por WhatsApp</span>
                <input type="checkbox" name="whatsappOptIn" />
              </label>
            </div>
            <FormGrid cols={1}>
              <Field label="Marcas de interesse (separe por vírgula)">
                <input name="interestBrands" placeholder="Volkswagen, Toyota" />
              </Field>
              <FormGrid cols={2}>
                <Field label="Preço mínimo">
                  <input name="priceMin" inputMode="numeric" />
                </Field>
                <Field label="Preço máximo">
                  <input name="priceMax" inputMode="numeric" />
                </Field>
              </FormGrid>
            </FormGrid>
            <div className="form-actions">
              <button className="button button-primary" type="submit" disabled={marketing.isPending}>
                Atualizar
              </button>
            </div>
            {marketing.isSuccess && <div className="success-box">Preferências salvas.</div>}
          </form>
        </Card>
      </div>

      <Card title="Seus direitos (LGPD)" subtitle="Solicite uma cópia ou a exclusão dos seus dados pessoais.">
        <div className="action-grid">
          <button className="button button-dark" onClick={() => exportRequest.mutate()} disabled={exportRequest.isPending}>
            <Download size={17} /> Exportar meus dados
          </button>
          <button className="button button-danger" onClick={() => deleteRequest.mutate()} disabled={deleteRequest.isPending}>
            <Trash2 size={17} /> Excluir minha conta
          </button>
        </div>
        {exportRequest.isSuccess && <div className="success-box">Exportação registrada — você receberá os dados em instantes.</div>}
        {deleteRequest.isSuccess && (
          <div className="success-box">
            <ShieldAlert size={16} /> Solicitação registrada. A anonimização será processada conforme nossa política.
          </div>
        )}
      </Card>
    </Page>
  );
}
