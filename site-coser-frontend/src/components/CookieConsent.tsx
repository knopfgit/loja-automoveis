import { MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

// Versão do texto/política de consentimento. Suba este número quando a
// política mudar — o banner volta a aparecer pra todo mundo re-consentir.
const CONSENT_VERSION = '1.0';
const STORAGE_KEY = 'coser.cookieConsent';

type StoredConsent = {
  version: string;
  analytics: boolean;
  marketing: boolean;
  location: boolean;
  date: string;
};

function readStored(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredConsent) : null;
  } catch {
    return null;
  }
}

function sessionId() {
  const existing = sessionStorage.getItem('coser.sessionId');
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem('coser.sessionId', id);
  return id;
}

// ---- Helpers exportados (use em qualquer lugar antes de disparar scripts) ----

/** Retorna o consentimento salvo, ou null se o visitante ainda não decidiu. */
export function getCookieConsent(): StoredConsent | null {
  const stored = readStored();
  return stored && stored.version === CONSENT_VERSION ? stored : null;
}

/** true só se o visitante consentiu aquela categoria na versão atual. */
export function hasConsent(category: 'analytics' | 'marketing' | 'location') {
  const c = getCookieConsent();
  return Boolean(c && c[category]);
}

/** Reabre o painel pra revisar/retirar consentimento (ex.: link no rodapé). */
export function openCookiePreferences() {
  window.dispatchEvent(new Event('cookie:preferences'));
}

// -----------------------------------------------------------------------------

export function CookieConsent() {
  // Decisão pendente (nunca decidiu, ou a versão mudou) => mostra de cara.
  const [visible, setVisible] = useState(() => getCookieConsent() === null);
  const [manageMode, setManageMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Não-essenciais começam DESLIGADOS (LGPD: opt-in, sem caixa pré-marcada).
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [location, setLocation] = useState(false);

  // Permite reabrir via openCookiePreferences() — inclusive depois de decidido.
  useEffect(() => {
    function onOpen() {
      const current = readStored();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setLocation(current?.location ?? false);
      setManageMode(true);
      setVisible(true);
    }
    window.addEventListener('cookie:preferences', onOpen);
    return () => window.removeEventListener('cookie:preferences', onOpen);
  }, []);

  if (!visible) return null;

  async function persist(values: { analytics: boolean; marketing: boolean; location: boolean }) {
    setSaving(true);
    const consents = [
      { category: 'ESSENTIAL', granted: true },
      { category: 'ANALYTICS', granted: values.analytics },
      { category: 'MARKETING', granted: values.marketing },
      { category: 'LOCATION', granted: values.location },
    ];
    // Grava local primeiro pra UX não travar se a rede falhar.
    const stored: StoredConsent = {
      version: CONSENT_VERSION,
      ...values,
      date: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      /* storage indisponível — segue assim mesmo */
    }
    try {
      await api.post('/consents', {
        sessionId: sessionId(),
        termsVersion: CONSENT_VERSION,
        consents,
      });
    } catch (error) {
      // Registro no servidor falhou; o consentimento local vale e tentamos
      // de novo numa próxima visita. Não prende o visitante por causa disso.
      console.error('Falha ao registrar consentimento no servidor', error);
    } finally {
      setSaving(false);
      setManageMode(false);
      setVisible(false);
    }
  }

  const acceptAll = () => persist({ analytics: true, marketing: true, location: true });
  const rejectNonEssential = () => persist({ analytics: false, marketing: false, location: false });
  const saveChoices = () => persist({ analytics, marketing, location });

  return (
    <section className="cookie-banner" role="dialog" aria-modal="false" aria-label="Consentimento de cookies">
      <div className="cookie-banner-text">
        <strong>Privacidade e cookies</strong>
        <p>
          Usamos cookies essenciais para o site funcionar e, somente com seu consentimento,
          recursos de análise, marketing e localização. Você pode mudar ou retirar essa escolha
          quando quiser.
        </p>
      </div>

      <div className="cookie-banner-options">
        <label>
          <input type="checkbox" checked disabled /> Essenciais <span className="cookie-tag">sempre ativos</span>
        </label>
        <label>
          <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Análise
        </label>
        <label>
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Marketing
        </label>
        <label>
          <input type="checkbox" checked={location} onChange={(e) => setLocation(e.target.checked)} />{' '}
          <MapPin size={15} /> Localização
        </label>
      </div>

      <div className="cookie-banner-actions">
        {/* Recusar tão fácil quanto aceitar — mesmo peso visual (exigência LGPD). */}
        <button className="button button-ghost" type="button" onClick={rejectNonEssential} disabled={saving}>
          Recusar não-essenciais
        </button>
        <button className="button button-ghost" type="button" onClick={saveChoices} disabled={saving}>
          Salvar escolhas
        </button>
        <button className="button button-dark" type="button" onClick={acceptAll} disabled={saving}>
          Aceitar todos
        </button>
      </div>

      {manageMode && (
        <button
          className="cookie-banner-close"
          type="button"
          aria-label="Fechar"
          onClick={() => {
            setManageMode(false);
            setVisible(false);
          }}
        >
          <X size={18} />
        </button>
      )}
    </section>
  );
}
