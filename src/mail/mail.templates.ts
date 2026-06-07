/**
 * Simple template registry. Each template returns { subject, html, text }.
 * Keeps the project dependency-free (no template engine required), while the
 * structure is ready to swap for Handlebars/MJML later.
 */
export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

type TemplateFn = (ctx: Record<string, any>) => RenderedEmail;

const layout = (title: string, body: string): string => `
<!doctype html>
<html lang="pt-BR"><body style="font-family:Arial,sans-serif;color:#222">
  <h2>${title}</h2>
  ${body}
  <hr/>
  <p style="font-size:12px;color:#888">Auto Dealer — mensagem automática.</p>
</body></html>`;

export const MAIL_TEMPLATES: Record<string, TemplateFn> = {
  welcome: (ctx) => ({
    subject: 'Bem-vindo(a) à Auto Dealer',
    html: layout(
      'Bem-vindo(a)!',
      `<p>Olá ${ctx.name || ''}, sua conta foi criada com sucesso.</p>`,
    ),
    text: `Olá ${ctx.name || ''}, sua conta foi criada com sucesso.`,
  }),

  'password-reset': (ctx) => ({
    subject: 'Redefinição de senha',
    html: layout(
      'Redefinição de senha',
      `<p>Use o token abaixo para redefinir sua senha (válido por ${ctx.expiresMin} minutos):</p>
       <p style="font-size:18px"><b>${ctx.token}</b></p>`,
    ),
    text: `Token de redefinição: ${ctx.token} (válido por ${ctx.expiresMin} min).`,
  }),

  'document-pending': (ctx) => ({
    subject: 'Documento pendente',
    html: layout(
      'Documento pendente',
      `<p>O documento <b>${ctx.documentName}</b> está pendente${ctx.vehicle ? ` para o veículo ${ctx.vehicle}` : ''}.</p>`,
    ),
    text: `Documento pendente: ${ctx.documentName}.`,
  }),

  'document-expiring': (ctx) => ({
    subject: 'Documento próximo do vencimento',
    html: layout(
      'Documento próximo do vencimento',
      `<p>O documento <b>${ctx.documentName}</b> vence em ${ctx.expiryDate}.</p>`,
    ),
    text: `Documento ${ctx.documentName} vence em ${ctx.expiryDate}.`,
  }),

  'part-stock-low': (ctx) => ({
    subject: 'Estoque mínimo de peça atingido',
    html: layout(
      'Estoque baixo',
      `<p>A peça <b>${ctx.partName}</b> está com ${ctx.quantity} unidade(s) (mínimo ${ctx.minQuantity}).</p>`,
    ),
    text: `Estoque baixo: ${ctx.partName} (${ctx.quantity}/${ctx.minQuantity}).`,
  }),

  'lead-assigned': (ctx) => ({
    subject: 'Nova oportunidade de atendimento',
    html: layout(
      'Novo lead atribuído',
      `<p>Você recebeu um novo lead${ctx.vehicle ? ` para o veículo ${ctx.vehicle}` : ''}.</p>
       <p>Cliente: ${ctx.name || 'Visitante'} — ${ctx.phone || ''}</p>`,
    ),
    text: `Novo lead: ${ctx.name || 'Visitante'} (${ctx.phone || ''}).`,
  }),

  'commission-approved': (ctx) => ({
    subject: 'Comissão aprovada',
    html: layout(
      'Comissão aprovada',
      `<p>Sua comissão de R$ ${ctx.amount} foi aprovada.</p>`,
    ),
    text: `Comissão aprovada: R$ ${ctx.amount}.`,
  }),

  'commission-paid': (ctx) => ({
    subject: 'Comissão paga',
    html: layout(
      'Comissão paga',
      `<p>Sua comissão de R$ ${ctx.amount} foi paga.</p>`,
    ),
    text: `Comissão paga: R$ ${ctx.amount}.`,
  }),

  'reservation-expiring': (ctx) => ({
    subject: 'Reserva próxima do vencimento',
    html: layout(
      'Reserva expirando',
      `<p>A reserva do veículo ${ctx.vehicle} expira em ${ctx.expiresAt}.</p>`,
    ),
    text: `Reserva do veículo ${ctx.vehicle} expira em ${ctx.expiresAt}.`,
  }),

  promotion: (ctx) => ({
    subject: ctx.subject || 'Novidades e promoções',
    html: layout('Promoções', `<p>${ctx.message || ''}</p>`),
    text: ctx.message || '',
  }),

  generic: (ctx) => ({
    subject: ctx.subject || 'Notificação',
    html: layout(ctx.title || 'Notificação', `<p>${ctx.message || ''}</p>`),
    text: ctx.message || '',
  }),
};

export function renderTemplate(
  template: string,
  context: Record<string, any> = {},
): RenderedEmail {
  const fn = MAIL_TEMPLATES[template] || MAIL_TEMPLATES.generic;
  return fn(context);
}
