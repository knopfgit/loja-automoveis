import { useState } from 'react';
import type { FormEvent } from 'react';
import { Check, Download, Plus, Trash2, Upload, X } from 'lucide-react';
import { api } from '../../services/api';
import { useApiMutation, useItem, useList } from '../../services/data';
import { Badge, Card, Drawer, ENUMS, EnumOptions, Field, FormGrid, Page, Stat, StatGrid, Table, Tabs } from '../../components/ui';
import { ErrorState, LoadingState } from '../../components/State';
import { OptionList, useCustomerOptions, useVehicleOptions } from './shared';

type Row = Record<string, unknown> & { id: string };

async function downloadDocument(id: string, fileName: string) {
  const response = await api.get(`/documents/${id}/download`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data as Blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function typeName(row: Row) {
  const type = row.documentType as Record<string, unknown> | undefined;
  return type ? String(type.name ?? '—') : String(row.documentTypeId ?? '—');
}

/* ----------------------------------------------------------- Documents list */

export function DocumentsPage() {
  const [uploading, setUploading] = useState(false);
  const listQuery = useList<Row>(['documents'], '/documents', { page: 1, limit: 50 });
  const validate = useApiMutation(({ id, status, reason }: { id: string; status: string; reason?: string }) => api.post(`/documents/${id}/validate`, { status, rejectionReason: reason }), {
    invalidate: [['documents']],
  });

  return (
    <Page eyebrow="Documentos" title="Documentos" actions={<button className="button button-primary" onClick={() => setUploading(true)}><Upload size={17} /> Enviar documento</button>}>
      <ChecklistStatusCard />
      <Card title="Arquivos">
        <Table
          query={listQuery}
          columns={[
            { key: 'documentType', label: 'Documento', render: typeName },
            { key: 'ownerType', label: 'Dono' },
            { key: 'status', label: 'Status', render: (row) => <Badge value={String(row.status ?? '—')} /> },
            { key: 'expiryDate', label: 'Vencimento' },
          ]}
          actions={(row) => (
            <>
              {row.storageKey != null && (
                <button className="button button-ghost" onClick={() => downloadDocument(row.id, String(typeName(row)))}><Download size={15} /></button>
              )}
              <button className="button button-ghost" onClick={() => validate.mutate({ id: row.id, status: 'APPROVED' })}><Check size={15} /></button>
              <button className="button button-ghost" onClick={() => validate.mutate({ id: row.id, status: 'REJECTED', reason: 'Reprovado no painel' })}><X size={15} /></button>
            </>
          )}
        />
      </Card>

      {uploading && <UploadDrawer onClose={() => setUploading(false)} />}
    </Page>
  );
}

function ChecklistStatusCard() {
  const [stage, setStage] = useState('SALE');
  const [vehicleId, setVehicleId] = useState('');
  const vehicles = useVehicleOptions();
  const status = useItem<{ total: number; satisfied: number; pendingCount: number; complete: boolean; items: Row[] }>(
    ['checklist-status', stage, vehicleId],
    `/document-checklists/status?stage=${stage}&vehicleId=${vehicleId}`,
    Boolean(vehicleId),
  );

  return (
    <Card title="Status do checklist" subtitle="Acompanhe os documentos exigidos por etapa.">
      <div className="toolbar" style={{ marginBottom: 12 }}>
        <select value={stage} onChange={(event) => setStage(event.target.value)} style={{ maxWidth: 220 }}>
          <EnumOptions values={ENUMS.ChecklistStage} />
        </select>
        <select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} style={{ maxWidth: 320 }}>
          <OptionList options={vehicles} placeholder="Selecione um veículo" />
        </select>
      </div>
      {status.isLoading && <LoadingState />}
      {status.data && (
        <>
          <StatGrid>
            <Stat tone="neutral" label="Itens" value={status.data.total} />
            <Stat tone="ok" label="Satisfeitos" value={status.data.satisfied} />
            <Stat tone={status.data.pendingCount ? 'danger' : 'ok'} label="Pendentes" value={status.data.pendingCount} />
            <Stat tone={status.data.complete ? 'ok' : 'warn'} label="Completo" value={status.data.complete ? 'Sim' : 'Não'} />
          </StatGrid>
          <Table
            rows={status.data.items}
            columns={[
              { key: 'name', label: 'Documento' },
              { key: 'required', label: 'Obrigatório', align: 'center', render: (row) => (row.required ? 'Sim' : 'Não') },
              { key: 'status', label: 'Status', render: (row) => <Badge value={String(row.status ?? '—')} /> },
            ]}
          />
        </>
      )}
    </Card>
  );
}

function UploadDrawer({ onClose }: { onClose: () => void }) {
  const types = useList<Row>(['document-types'], '/document-types');
  const vehicles = useVehicleOptions();
  const customers = useCustomerOptions();
  const [ownerType, setOwnerType] = useState('VEHICLE');
  const upload = useApiMutation(
    (form: FormData) => api.post('/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
    { invalidate: [['documents']], onSuccess: onClose },
  );

  return (
    <Drawer open onClose={onClose} eyebrow="Documentos" title="Enviar documento"
      footer={<><button className="button button-ghost" onClick={onClose}>Cancelar</button><button className="button button-primary" form="doc-upload" type="submit" disabled={upload.isPending}>Enviar</button></>}
    >
      <form id="doc-upload" onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        if (ownerType !== 'VEHICLE') form.delete('vehicleId');
        if (ownerType !== 'CUSTOMER' && ownerType !== 'BUYER') form.delete('customerId');
        upload.mutate(form);
      }}>
        <FormGrid cols={1}>
          <Field label="Tipo de documento">
            <select name="documentTypeId" required defaultValue="">
              <option value="">Selecione</option>
              {types.data?.items.map((type) => <option key={type.id} value={type.id}>{String(type.name)}</option>)}
            </select>
          </Field>
          <Field label="Vinculado a">
            <select name="ownerType" value={ownerType} onChange={(event) => setOwnerType(event.target.value)}>
              <EnumOptions values={ENUMS.DocumentOwnerType} />
            </select>
          </Field>
          {ownerType === 'VEHICLE' && <Field label="Veículo"><select name="vehicleId" defaultValue=""><OptionList options={vehicles} placeholder="Selecione" /></select></Field>}
          {(ownerType === 'CUSTOMER' || ownerType === 'BUYER') && <Field label="Cliente"><select name="customerId" defaultValue=""><OptionList options={customers} placeholder="Selecione" /></select></Field>}
          <Field label="Arquivo"><input name="file" type="file" required /></Field>
        </FormGrid>
        {upload.isError && <ErrorState error={upload.error} />}
      </form>
    </Drawer>
  );
}

/* ----------------------------------------------------------- Document config */

export function DocumentConfigPage() {
  const [tab, setTab] = useState('types');
  const [creatingType, setCreatingType] = useState(false);
  const [creatingChecklist, setCreatingChecklist] = useState(false);
  const types = useList<Row>(['document-types'], '/document-types', undefined, true);
  const checklists = useList<Row>(['document-checklists'], '/document-checklists', undefined, tab === 'checklists');

  const createType = useApiMutation((payload: Record<string, unknown>) => api.post('/document-types', payload), { invalidate: [['document-types']], onSuccess: () => setCreatingType(false) });
  const upsertChecklist = useApiMutation((payload: Record<string, unknown>) => api.put('/document-checklists', payload), { invalidate: [['document-checklists']], onSuccess: () => setCreatingChecklist(false) });
  const removeChecklist = useApiMutation((id: string) => api.delete(`/document-checklists/${id}`), { invalidate: [['document-checklists']] });

  return (
    <Page
      eyebrow="Administração"
      title="Configuração de documentos"
      actions={
        tab === 'types' ? (
          <button className="button button-primary" onClick={() => setCreatingType(true)}><Plus size={17} /> Novo tipo</button>
        ) : (
          <button className="button button-primary" onClick={() => setCreatingChecklist(true)}><Plus size={17} /> Item de checklist</button>
        )
      }
    >
      <Tabs active={tab} onChange={setTab} tabs={[{ id: 'types', label: 'Tipos de documento' }, { id: 'checklists', label: 'Checklists por etapa' }]} />

      {tab === 'types' && (
        <Card>
          <Table
            query={types}
            columns={[
              { key: 'code', label: 'Código' },
              { key: 'name', label: 'Nome' },
              { key: 'ownerType', label: 'Dono' },
              { key: 'hasExpiry', label: 'Vence?', align: 'center', render: (row) => (row.hasExpiry ? 'Sim' : 'Não') },
              { key: 'active', label: 'Ativo', align: 'center', render: (row) => (row.active === false ? <Badge value="INACTIVE" /> : <Badge value="ACTIVE" />) },
            ]}
          />
        </Card>
      )}

      {tab === 'checklists' && (
        <Card>
          <Table
            query={checklists}
            columns={[
              { key: 'stage', label: 'Etapa' },
              { key: 'documentType', label: 'Documento', render: typeName },
              { key: 'required', label: 'Obrigatório', align: 'center', render: (row) => (row.required ? 'Sim' : 'Não') },
              { key: 'position', label: 'Ordem', align: 'center' },
            ]}
            actions={(row) => <button className="button button-ghost" onClick={() => removeChecklist.mutate(row.id)}><Trash2 size={15} /></button>}
          />
        </Card>
      )}

      <Drawer open={creatingType} onClose={() => setCreatingType(false)} eyebrow="Documentos" title="Novo tipo de documento"
        footer={<><button className="button button-ghost" onClick={() => setCreatingType(false)}>Cancelar</button><button className="button button-primary" form="type-form" type="submit" disabled={createType.isPending}>Criar</button></>}
      >
        <form id="type-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          createType.mutate({
            code: form.get('code'),
            name: form.get('name'),
            ownerType: form.get('ownerType'),
            hasExpiry: form.get('hasExpiry') === 'on',
            description: form.get('description') || undefined,
          });
        }}>
          <FormGrid cols={1}>
            <FormGrid cols={2}>
              <Field label="Código"><input name="code" required /></Field>
              <Field label="Nome"><input name="name" required /></Field>
            </FormGrid>
            <Field label="Dono"><select name="ownerType" required defaultValue=""><EnumOptions values={ENUMS.DocumentOwnerType} placeholder="Selecione" /></select></Field>
            <Field label="Descrição"><input name="description" /></Field>
            <label className="toggle-chip"><input type="checkbox" name="hasExpiry" /> Possui validade/vencimento</label>
          </FormGrid>
          {createType.isError && <ErrorState error={createType.error} />}
        </form>
      </Drawer>

      <Drawer open={creatingChecklist} onClose={() => setCreatingChecklist(false)} eyebrow="Documentos" title="Item de checklist"
        footer={<><button className="button button-ghost" onClick={() => setCreatingChecklist(false)}>Cancelar</button><button className="button button-primary" form="checklist-form" type="submit" disabled={upsertChecklist.isPending}>Salvar</button></>}
      >
        <form id="checklist-form" onSubmit={(event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          upsertChecklist.mutate({
            stage: form.get('stage'),
            documentTypeId: form.get('documentTypeId'),
            required: form.get('required') === 'on',
            position: Number(form.get('position') || 0),
          });
        }}>
          <FormGrid cols={1}>
            <Field label="Etapa"><select name="stage" required defaultValue=""><EnumOptions values={ENUMS.ChecklistStage} placeholder="Selecione" /></select></Field>
            <Field label="Tipo de documento">
              <select name="documentTypeId" required defaultValue="">
                <option value="">Selecione</option>
                {types.data?.items.map((type) => <option key={type.id} value={type.id}>{String(type.name)}</option>)}
              </select>
            </Field>
            <Field label="Ordem"><input name="position" inputMode="numeric" defaultValue="0" /></Field>
            <label className="toggle-chip"><input type="checkbox" name="required" defaultChecked /> Documento obrigatório</label>
          </FormGrid>
          {upsertChecklist.isError && <ErrorState error={upsertChecklist.error} />}
        </form>
      </Drawer>
    </Page>
  );
}
