"use client";

import { HelpCharacter } from "@/components/help/help-character";
import { useHelp } from "@/components/help/help-state";
import { getHelpTopic } from "@/lib/help-topics";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const MARGIN = 16;

type Point = { x: number; y: number };

function overlapArea(a: DOMRect, b: DOMRect) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return width * height;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function HelpBlob() {
  const { activeTopicId, currentStep, close, next, back } = useHelp();
  const topic = activeTopicId ? getHelpTopic(activeTopicId) : undefined;
  const step = topic?.steps[currentStep];
  const panelRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [talking, setTalking] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [position, setPosition] = useState<Point>({ x: MARGIN, y: MARGIN });
  const [anchor, setAnchor] = useState<DOMRect | null>(null);

  const place = useCallback(() => {
    const panel = panelRef.current;
    const trigger = activeTopicId
      ? document.querySelector<HTMLElement>(`[data-help-trigger="${activeTopicId}"]`)
      : null;
    if (!panel || !trigger) return;

    const narrow = window.innerWidth < 768;
    setMobile(narrow);
    const triggerRect = trigger.getBoundingClientRect();
    setAnchor(triggerRect);
    if (narrow) return;

    const width = panel.offsetWidth;
    const height = panel.offsetHeight;
    const maxX = Math.max(MARGIN, window.innerWidth - width - MARGIN);
    const maxY = Math.max(MARGIN, window.innerHeight - height - MARGIN);
    const avoid = [...document.querySelectorAll<HTMLElement>("[data-help-avoid]")]
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0);
    const candidates = [
      { x: triggerRect.right + 18, y: triggerRect.top - height + 36 },
      { x: triggerRect.left - width - 18, y: triggerRect.top - height + 36 },
      { x: triggerRect.right + 18, y: triggerRect.top },
      { x: triggerRect.left - width - 18, y: triggerRect.top },
      { x: triggerRect.left, y: triggerRect.top - height - 18 },
      { x: MARGIN, y: MARGIN },
      { x: maxX, y: MARGIN },
    ];

    const pushClear = (startX: number, startY: number) => {
      let x = clamp(startX, MARGIN, maxX);
      let y = clamp(startY, MARGIN, maxY);
      for (let pass = 0; pass < 12; pass += 1) {
        const box = new DOMRect(x, y, width, height);
        const hit = avoid.find((block) => overlapArea(box, block) > 1);
        if (!hit) break;
        const pushTop = box.bottom - hit.top;
        const pushBottom = hit.bottom - box.top;
        const pushLeft = box.right - hit.left;
        const pushRight = hit.right - box.left;
        const smallest = Math.min(pushTop, pushBottom, pushLeft, pushRight);
        if (smallest === pushTop) y -= pushTop + 8;
        else if (smallest === pushBottom) y += pushBottom + 8;
        else if (smallest === pushLeft) x -= pushLeft + 8;
        else x += pushRight + 8;
        x = clamp(x, MARGIN, maxX);
        y = clamp(y, MARGIN, maxY);
      }
      return { x, y };
    };

    let best = { x: MARGIN, y: MARGIN };
    let bestScore = Number.NEGATIVE_INFINITY;
    for (const candidate of candidates) {
      const next = pushClear(candidate.x, candidate.y);
      const box = new DOMRect(next.x, next.y, width, height);
      const covered = avoid.reduce((sum, block) => sum + overlapArea(box, block), 0);
      const distance = Math.hypot(next.x + width / 2 - triggerRect.right, next.y + height / 2 - triggerRect.top);
      const score = covered === 0 ? 1_000_000 - distance : -covered * 10 - distance;
      if (score > bestScore) {
        bestScore = score;
        best = next;
      }
    }
    setPosition(best);
  }, [activeTopicId]);

  useEffect(() => {
    if (!topic) return;
    setTalking(false);
    const timer = window.setTimeout(() => setTalking(true), 180);
    return () => window.clearTimeout(timer);
  }, [topic, currentStep]);

  useLayoutEffect(() => {
    if (!topic) return;
    place();
  }, [topic, currentStep, place]);

  useEffect(() => {
    if (!topic) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [topic, place]);

  useEffect(() => {
    if (!topic) return;
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (dialogRef.current?.contains(target)) return;
      const trigger = document.querySelector(`[data-help-trigger="${activeTopicId}"]`);
      if (trigger?.contains(target)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      returnFocus.current?.focus();
    };
  }, [topic, activeTopicId, close]);

  if (!topic || !step) return null;

  const last = currentStep === topic.steps.length - 1;
  const blobCenter = mobile
    ? null
    : { x: position.x + 66, y: position.y + 150 };
  const triggerCenter = anchor
    ? { x: anchor.left + anchor.width / 2, y: anchor.top + anchor.height / 2 }
    : null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[80]">
      {!mobile && blobCenter && triggerCenter ? (
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          <path
            d={`M ${triggerCenter.x} ${triggerCenter.y} Q ${(triggerCenter.x + blobCenter.x) / 2} ${triggerCenter.y} ${blobCenter.x} ${blobCenter.y}`}
            fill="none"
            stroke="rgba(237,237,237,0.45)"
            strokeWidth="1.5"
          />
        </svg>
      ) : null}
      <div
        ref={panelRef}
        className={
          mobile
            ? "pointer-events-auto fixed inset-x-0 bottom-0 px-4 pb-4"
            : "pointer-events-auto fixed flex items-end gap-3"
        }
        style={mobile ? undefined : { left: position.x, top: position.y }}
      >
        <AnimatePresence>
          <motion.div
            key={mobile ? "sheet" : "float"}
            initial={mobile ? { y: 28, opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={
              mobile
                ? "flex w-full items-end gap-3 rounded-t-3xl border border-white/15 bg-[#0A0A0A]/85 p-3 backdrop-blur-xl"
                : "flex items-end gap-3"
            }
          >
            <HelpCharacter talking={talking} />
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="false"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="w-full max-w-sm rounded-t-3xl border border-white/15 bg-[#0A0A0A]/80 p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl outline-none sm:rounded-3xl sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <p id={titleId} className="text-sm font-medium">
                  {topic.title}
                </p>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close help"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
                >
                  ×
                </button>
              </div>
              <div aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                    className="mt-3 text-sm leading-relaxed text-white/80"
                  >
                    {step.text}
                  </motion.p>
                </AnimatePresence>
                {step.actionHref && step.actionLabel ? (
                  <Link
                    href={step.actionHref}
                    onClick={close}
                    className="mt-3 inline-flex text-sm text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                  >
                    {step.actionLabel}
                  </Link>
                ) : null}
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-xs text-white/50">
                  {currentStep + 1} / {topic.steps.length}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={back}
                    disabled={currentStep === 0}
                    aria-label="Back"
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs disabled:opacity-40"
                  >
                    Back
                  </button>
                  {last ? (
                    <button
                      type="button"
                      onClick={close}
                      aria-label="Got it"
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#0A0A0A]"
                    >
                      Got it
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={next}
                      aria-label="Next"
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#0A0A0A]"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
