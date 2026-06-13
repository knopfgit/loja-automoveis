// Marca COSER recriada como vetor (sem fundo cinza da foto, escala nitida em qualquer
// tamanho). Emblema de bussola dourada sobre grafite, no espirito "premium cars".
export function CoserLogo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="COSER">
      <defs>
        <linearGradient id="coser-ring" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d271" />
          <stop offset="0.46" stopColor="#cf9c2e" />
          <stop offset="0.54" stopColor="#2c313c" />
          <stop offset="1" stopColor="#0f131b" />
        </linearGradient>
        <linearGradient id="coser-star-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8da7e" />
          <stop offset="1" stopColor="#c9982f" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="23" fill="url(#coser-ring)" />
      <circle cx="24" cy="24" r="18.5" fill="#0f131b" />
      {/* rosa dos ventos */}
      <path d="M24 6.5 L27 22 L24 24 L21 22 Z" fill="#f8da7e" />
      <path d="M41.5 24 L26 27 L24 24 L26 21 Z" fill="#c9982f" />
      <path d="M24 41.5 L21 26 L24 24 L27 26 Z" fill="#a97f27" />
      <path d="M6.5 24 L22 21 L24 24 L22 27 Z" fill="#dbac45" />
      <circle cx="24" cy="24" r="2.5" fill="url(#coser-star-a)" />
    </svg>
  );
}
