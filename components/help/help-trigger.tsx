"use client";

import { getHelpTopic } from "@/lib/help-topics";
import { useHelp } from "@/components/help/help-state";

export function HelpTrigger({ topicId }: { topicId: string }) {
  const topic = getHelpTopic(topicId);
  const { openTopic, activeTopicId } = useHelp();

  if (!topic) return null;

  const open = activeTopicId === topicId;

  return (
    <button
      type="button"
      data-help-trigger={topicId}
      aria-label={`Help: ${topic.title}`}
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={() => openTopic(topicId)}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm text-white backdrop-blur-md transition hover:border-[#1B2E7A] hover:shadow-[0_0_18px_rgba(27,46,122,0.7)] focus-visible:border-[#1B2E7A] focus-visible:shadow-[0_0_18px_rgba(27,46,122,0.7)] focus-visible:outline-none"
    >
      ?
    </button>
  );
}
