import { Clock, Facebook, Instagram, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { openCookiePreferences } from './CookieConsent';

// TODO: centralizar estes dados (env, config ou endpoint /store) quando a loja
// puder editar pelo painel. Por ora ficam aqui — confirme com o cliente,
// principalmente o HORÁRIO, que é só um chute razoável.
const STORE = {
  address: 'Rua Ângelo Preto, 730 — Centro, Passo Fundo / RS',
  phone: '(54) 99671-4554',
  phoneHref: 'https://wa.me/5554996714554',
  hours: 'Seg a Sex, 8h30 às 18h30 · Sáb, 8h30 às 12h',
  instagram: 'https://instagram.com/coserpremiumcars',
  facebook: 'https://facebook.com/coserpremiumcars',
};

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-brand">
          <span className="footer-lockup">
            <strong>COSER</strong>
            <small>Premium Cars</small>
          </span>
          <p>Curadoria de carros premium, com procedência verificada, em Passo Fundo.</p>
          <div className="site-footer-social">
            <a href={STORE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href={STORE.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={18} />
            </a>
          </div>
        </div>

        <nav className="site-footer-col" aria-label="Navegação">
          <span className="site-footer-title">Navegação</span>
          <Link to="/">Vitrine</Link>
          <Link to="/catalogo">Estoque</Link>
          <Link to="/onde-estamos">Onde estamos</Link>
        </nav>

        <nav className="site-footer-col" aria-label="Institucional">
          <span className="site-footer-title">Institucional</span>
          <Link to="/onde-estamos">Sobre a Coser</Link>
          <Link to="/cliente/privacidade">Privacidade & LGPD</Link>
          <a href={STORE.phoneHref} target="_blank" rel="noopener noreferrer">Fale conosco</a>
        </nav>

        <div className="site-footer-col">
          <span className="site-footer-title">Contato</span>
          <p className="site-footer-line">
            <MapPin size={15} /> <span>{STORE.address}</span>
          </p>
          <p className="site-footer-line">
            <Phone size={15} /> <a href={STORE.phoneHref} target="_blank" rel="noopener noreferrer">{STORE.phone}</a>
          </p>
          <p className="site-footer-line">
            <Clock size={15} /> <span>{STORE.hours}</span>
          </p>
        </div>
      </div>

      <div className="site-footer-bar">
        <span>© {year} Coser Premium Cars. Todos os direitos reservados.</span>
        <span className="site-footer-legal">
          <Link to="/cliente/privacidade">Política de Privacidade</Link>
          <Link to="/cliente/privacidade">Termos de uso</Link>
          <button type="button" className="footer-link-button" onClick={openCookiePreferences}>
            Preferências de cookies
          </button>
        </span>
      </div>
    </footer>
  );
}

