import { MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api } from '../services/api';

const key = 'coser.cookieConsent';

function sessionId() {
  const existing = sessionStorage.getItem('coser.sessionId');
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem('coser.sessionId', id);
  return id;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(() => localStorage.getItem(key) !== 'done');
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [location, setLocation] = useState(false);
  const consents = useMemo(
    () => [
      { category: 'ESSENTIAL', granted: true },
      { category: 'ANALYTICS', granted: analytics },
      { category: 'MARKETING', granted: marketing },
      { category: 'LOCATION', granted: location },
    ],
    [analytics, location, marketing],
  );

  if (!visible) return null;

  async function save() {
    await api.post('/consents', {
      sessionId: sessionId(),
      termsVersion: '1.0',
      consents,
    });
    localStorage.setItem(key, 'done');
    setVisible(false);
  }

  return (
    <section className="cookie-banner" aria-label="Consentimento de cookies">
      <div>
        <strong>Privacidade LGPD</strong>
        <p>Usamos cookies essenciais e, somente com seu consentimento, recursos de analise, marketing e localizacao.</p>
      </div>
      <label><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analise</label>
      <label><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Marketing</label>
      <label><input type="checkbox" checked={location} onChange={(e) => setLocation(e.target.checked)} /> <MapPin size={15} /> Localizacao</label>
      <button className="button button-dark" type="button" onClick={save}>Salvar</button>
    </section>
  );
}
