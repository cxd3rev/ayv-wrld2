"use client";

import { ayvBrand } from "@/config/brands";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export type EcosystemItem = {
  id: string;
  name: string;
  typeLabel: string;
  logo?: string;
  description: string;
  does: string;
  problem: string;
  route?: string;
};

export type StackProduct = EcosystemItem & {
  angle: number;
};

export type ExplorerLabels = {
  back: string;
  readMore: string;
  description: string;
  does: string;
  problem: string;
  stackHint: string;
};

const satellites = [
  { id: "kleuro", x: 18, y: 18 },
  { id: "rated", x: 82, y: 16 },
  { id: "one-man-army", x: 16, y: 48 },
  { id: "automation", x: 84, y: 46 },
  { id: "stack", x: 50, y: 78 },
] as const;

function Mark({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <Image src={src} alt={alt} width={512} height={512} sizes="180px" className={cn("object-contain", className)} />
  );
}

function InfoView({
  item,
  labels,
  onBack,
}: {
  item: EcosystemItem;
  labels: ExplorerLabels;
  onBack: () => void;
}) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
      <div className="flex min-h-72 items-center justify-center border border-white/10 bg-black/40 p-10">
        {item.logo ? (
          <Mark src={item.logo} alt={`${item.name} logo`} className="h-44 w-44 sm:h-56 sm:w-56" />
        ) : (
          <p className="display max-w-xs text-center text-4xl leading-none sm:text-5xl">{item.name}</p>
        )}
      </div>
      <div>
        <p className="kicker">{item.typeLabel}</p>
        <h2 className="display mt-4 text-4xl leading-none sm:text-6xl">{item.name}</h2>
        <dl className="mt-8 space-y-5 text-sm leading-relaxed text-muted">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/70">{labels.description}</dt>
            <dd className="mt-1.5 text-base text-foreground/90">{item.description}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/70">{labels.does}</dt>
            <dd className="mt-1.5">{item.does}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground/70">{labels.problem}</dt>
            <dd className="mt-1.5">{item.problem}</dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {item.route ? (
            <Link href={item.route} className="button-primary">
              {labels.readMore}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : null}
          <button type="button" onClick={onBack} className="button-secondary">
            {labels.back}
          </button>
        </div>
      </div>
    </div>
  );
}

function StackMark({
  products,
  activeId,
  labels,
  onSelect,
  onHover,
  compact,
}: {
  products: StackProduct[];
  activeId: string | null;
  labels: ExplorerLabels;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="border border-white/10 bg-black/30 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{labels.stackHint}</p>
        <ul className="mt-4 space-y-3">
          {products.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => onSelect(product.id)}
                className={cn(
                  "flex w-full items-center gap-3 text-left transition duration-300",
                  activeId === product.id ? "text-foreground" : "text-muted hover:text-foreground",
                )}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center">
                  {product.logo ? <Mark src={product.logo} alt="" className="h-10 w-10" /> : null}
                </span>
                <span aria-hidden className="h-px w-8 bg-current opacity-40" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em]">{product.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-[340px] w-full max-w-[560px]">
      {products.map((product) => {
        const rad = (product.angle * Math.PI) / 180;
        const lx = 50 + Math.cos(rad) * 28;
        const ly = 46 + Math.sin(rad) * 28;
        const nx = 50 + Math.cos(rad) * 44;
        const ny = 46 + Math.sin(rad) * 42;
        const active = activeId === product.id;
        const dim = activeId !== null && !active;
        return (
          <div key={product.id}>
            <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              <line
                x1={`${lx}%`}
                y1={`${ly}%`}
                x2={`${nx}%`}
                y2={`${ny}%`}
                stroke="currentColor"
                strokeWidth={active ? 1.4 : 0.6}
                className={cn("text-foreground transition-opacity duration-300", active ? "opacity-80" : "opacity-25")}
              />
            </svg>
            <button
              type="button"
              onMouseEnter={() => onHover?.(product.id)}
              onMouseLeave={() => onHover?.("stack")}
              onFocus={() => onHover?.(product.id)}
              onBlur={() => onHover?.(null)}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(product.id);
              }}
              style={{ left: `${lx}%`, top: `${ly}%` }}
              className={cn(
                "absolute z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition duration-300",
                active ? "scale-110" : "hover:scale-110",
                dim && "opacity-35",
              )}
              aria-label={product.name}
            >
              {product.logo ? <Mark src={product.logo} alt="" className={cn("h-14 w-14", active && "drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]")} /> : null}
            </button>
            <span
              style={{ left: `${nx}%`, top: `${ny}%` }}
              className={cn(
                "pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.16em] transition duration-300",
                active ? "text-foreground" : "text-muted",
                product.angle > -90 && product.angle < 90 ? "translate-x-0 text-left" : "",
              )}
            >
              {product.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function EcosystemExplorer({
  center,
  nodes,
  stackProducts,
  labels,
}: {
  center: EcosystemItem;
  nodes: EcosystemItem[];
  stackProducts: StackProduct[];
  labels: ExplorerLabels;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const catalog = [center, ...nodes, ...stackProducts];
  const selected = catalog.find((item) => item.id === selectedId) ?? null;
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));

  return (
    <div className="relative min-h-[640px]">
      <div className={cn("transition duration-500", selected ? "pointer-events-none absolute inset-0 scale-[0.98] opacity-0" : "opacity-100")}>
        <div className="lg:hidden">
          <button type="button" onClick={() => setSelectedId(center.id)} className="mx-auto flex flex-col items-center gap-3">
            <Mark src={ayvBrand.logo} alt="AYV WRLD logo" className="h-24 w-24" />
            <span className="font-mono text-[10px] uppercase tracking-[0.16em]">AYV WRLD</span>
          </button>
          <ul className="mx-auto mt-8 max-w-md space-y-3 border-l border-white/15 pl-5">
            {nodes.filter((node) => node.id !== "stack").map((node) => (
              <li key={node.id}>
                <button type="button" onClick={() => setSelectedId(node.id)} className="flex items-center gap-3 text-left">
                  {node.logo ? <Mark src={node.logo} alt="" className="h-10 w-10" /> : <span className="display text-lg">{node.name.slice(0, 1)}</span>}
                  <span>
                    <span className="block text-sm">{node.name}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{node.typeLabel}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <button type="button" onClick={() => setSelectedId("stack")} className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              AYV Automation Stack
            </button>
            <StackMark products={stackProducts} activeId={hoveredId} labels={labels} onSelect={setSelectedId} onHover={setHoveredId} compact />
          </div>
        </div>

        <div className="relative hidden h-[760px] lg:block">
          <svg className="absolute inset-0 h-full w-full" aria-hidden>
            {satellites.map((point) => (
              <line
                key={point.id}
                x1="50%"
                y1="34%"
                x2={`${point.x}%`}
                y2={`${point.y}%`}
                stroke="currentColor"
                strokeWidth={hoveredId === point.id ? 1.5 : 0.7}
                className={cn("text-foreground transition-opacity duration-300", hoveredId === point.id ? "opacity-80" : "opacity-25")}
              />
            ))}
          </svg>
          <button
            type="button"
            onClick={() => setSelectedId(center.id)}
            className="absolute left-1/2 top-[34%] z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 transition duration-300 hover:scale-105"
          >
            <Mark src={ayvBrand.logo} alt="AYV WRLD logo" className="h-28 w-28" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">AYV WRLD</span>
          </button>
          {satellites.filter((point) => point.id !== "stack").map((point) => {
            const node = byId[point.id];
            if (!node) return null;
            const hot = hoveredId === node.id;
            return (
              <button
                key={node.id}
                type="button"
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(node.id)}
                onBlur={() => setHoveredId(null)}
                onClick={() => setSelectedId(node.id)}
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
                className={cn(
                  "absolute z-10 flex w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center transition duration-300",
                  hot ? "scale-110" : "hover:scale-110",
                )}
              >
                {node.logo ? (
                  <Mark src={node.logo} alt="" className={cn("h-16 w-16", hot && "drop-shadow-[0_0_14px_rgba(255,255,255,0.28)]")} />
                ) : null}
                <span className={cn("font-mono text-[10px] uppercase tracking-[0.14em] text-muted", !node.logo && "max-w-28 text-xs leading-tight text-foreground")}>{node.name}</span>
              </button>
            );
          })}
          <div
            className="absolute left-1/2 top-[78%] z-10 w-[min(560px,70%)] -translate-x-1/2 -translate-y-1/2"
            onMouseEnter={() => setHoveredId("stack")}
            onMouseLeave={() => setHoveredId(null)}
          >
            <StackMark products={stackProducts} activeId={hoveredId} labels={labels} onSelect={setSelectedId} onHover={setHoveredId} />
            <button type="button" onClick={() => setSelectedId("stack")} className="mx-auto mt-2 block font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition hover:text-foreground">
              AYV Automation Stack
            </button>
          </div>
        </div>
      </div>

      <div className={cn("transition duration-500", selected ? "opacity-100" : "pointer-events-none absolute inset-0 translate-y-3 opacity-0")}>
        {selected ? <InfoView item={selected} labels={labels} onBack={() => setSelectedId(null)} /> : null}
      </div>
    </div>
  );
}
