import { useEffect, useRef, useState } from 'react';
import { RotateCw as Rotate } from 'lucide-react';

type Vehicle360ViewerProps = {
  /** URLs já resolvidas dos frames, em ordem de giro. */
  frames: string[];
  alt?: string;
};

/**
 * Visualizador 360° por sequência de fotos.
 * Recebe N frames (fotos do carro girando) e troca o frame conforme o arraste
 * horizontal — o mesmo princípio dos visualizadores de produto.
 * Não é 3D real: é foto. Por isso depende de um conjunto de fotos bem tirado
 * (mesma posição/luz, fundo neutro) marcado como role = SPIN_360 no banco.
 */
export function Vehicle360Viewer({ frames, alt = 'Veículo em 360°' }: Vehicle360ViewerProps) {
  const total = frames.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const acc = useRef(0);

  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [hintVisible, setHintVisible] = useState(true);

  // Pré-carrega todos os frames pra o giro não "piscar".
  useEffect(() => {
    let active = true;
    setLoaded(0);
    frames.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        if (active) setLoaded((n) => n + 1);
      };
      img.src = src;
    });
    return () => {
      active = false;
    };
  }, [frames]);

  function step(deltaX: number) {
    const width = containerRef.current?.clientWidth ?? 600;
    // pixels que o dedo precisa arrastar pra avançar 1 frame
    const pxPerFrame = Math.max(6, width / total);
    acc.current += deltaX;
    while (Math.abs(acc.current) >= pxPerFrame) {
      const dir = acc.current > 0 ? 1 : -1;
      acc.current -= dir * pxPerFrame;
      setIndex((i) => (i + dir + total) % total);
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    lastX.current = e.clientX;
    acc.current = 0;
    setHintVisible(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    step(dx);
  }
  function onPointerUp() {
    dragging.current = false;
  }

  const ready = loaded >= total;

  return (
    <div
      ref={containerRef}
      className="viewer360"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      role="img"
      aria-label={alt}
    >
      {!ready && (
        <div className="viewer360-loading">
          Carregando giro… {Math.round((loaded / Math.max(total, 1)) * 100)}%
        </div>
      )}

      {/* Frame atual. Os demais já estão em cache pelo preload. */}
      <img src={frames[index]} alt="" draggable={false} style={{ opacity: ready ? 1 : 0 }} />

      <span className="viewer360-badge">
        <Rotate size={14} /> 360°
      </span>

      {ready && hintVisible && (
        <div className="viewer360-hint">Clique e arraste para girar</div>
      )}
    </div>
  );
}