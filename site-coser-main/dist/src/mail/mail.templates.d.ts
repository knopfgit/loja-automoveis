export interface RenderedEmail {
    subject: string;
    html: string;
    text: string;
}
type TemplateFn = (ctx: Record<string, any>) => RenderedEmail;
export declare const MAIL_TEMPLATES: Record<string, TemplateFn>;
export declare function renderTemplate(template: string, context?: Record<string, any>): RenderedEmail;
export {};
