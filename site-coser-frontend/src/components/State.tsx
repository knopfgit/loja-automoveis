import { Loader2 } from 'lucide-react';
import { getErrorMessage } from '../services/api';

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="state">
      <Loader2 className="spin" size={22} aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  return <div className="state state-error">{getErrorMessage(error)}</div>;
}

export function EmptyState({ title = 'Nenhum registro encontrado.' }: { title?: string }) {
  return <div className="state">{title}</div>;
}
