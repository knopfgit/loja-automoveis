import type { DetailedHTMLProps, HTMLAttributes } from 'react';

// O pacote expoe tipos apenas via "exports", que o moduleResolution "Node" nao le.
// So usamos o import dinamico pelo efeito colateral (registrar o custom element).
declare module '@google/model-viewer';

// Tipagem JSX para o custom element <model-viewer> (@google/model-viewer).
type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string;
  alt?: string;
  poster?: string;
  ar?: boolean;
  'camera-controls'?: boolean;
  'auto-rotate'?: boolean;
  'shadow-intensity'?: string | number;
  exposure?: string | number;
  'touch-action'?: string;
  'interaction-prompt'?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
    }
  }
}

export {};
