"use client";

import { useAnimationFrame, useReducedMotion } from "framer-motion";
import { useRef } from "react";

// TODO: if an SVG version of the blob with 2-3 alternate "squashed" poses becomes available,
// replace the filter-based wobble with true path morphing using the `flubber` library
// (interpolate between pose paths on a timer/step-change) for higher-fidelity deformation.

export function HelpCharacter({ talking }: { talking: boolean }) {
  const reduced = useReducedMotion();
  const turbulence = useRef<SVGFETurbulenceElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const lastSeed = useRef(-1);
  const duration = useRef(1.7 + Math.random() * 0.8);

  useAnimationFrame((time) => {
    if (reduced) {
      if (body.current) body.current.style.opacity = String(0.72 + (Math.sin(time / 700) + 1) * 0.14);
      displacement.current?.setAttribute("scale", "0");
      return;
    }
    const seedBucket = Math.floor(time / 200);
    if (seedBucket !== lastSeed.current) {
      lastSeed.current = seedBucket;
      turbulence.current?.setAttribute("seed", String((seedBucket % 90) + 1));
    }
    const scale = talking ? 14 + Math.sin(time / 240) * 4 : 3 + Math.sin(time / 1100);
    displacement.current?.setAttribute("scale", scale.toFixed(2));
  });

  return (
    <div
      ref={body}
      className={reduced ? undefined : "help-blob-live"}
      style={reduced ? undefined : { animationDuration: `${duration.current.toFixed(2)}s` }}
      aria-hidden
    >
      <svg viewBox="0 0 160 160" width="132" height="132" className="overflow-visible">
        <filter id="help-blob-warp" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          <feTurbulence
            ref={turbulence}
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="2"
            seed="2"
            result="noise"
          />
          <feDisplacementMap
            ref={displacement}
            in="SourceGraphic"
            in2="noise"
            scale={reduced ? 0 : 3}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <image href="/help/blob-white.png" width="160" height="160" filter="url(#help-blob-warp)" />
      </svg>
    </div>
  );
}
