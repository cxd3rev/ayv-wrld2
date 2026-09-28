"use client";

import { getHelpTopic } from "@/lib/help-topics";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type HelpState = {
  activeTopicId: string | null;
  currentStep: number;
  openTopic: (topicId: string) => void;
  close: () => void;
  next: () => void;
  back: () => void;
};

const HelpContext = createContext<HelpState | null>(null);

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const openTopic = useCallback((topicId: string) => {
    if (!getHelpTopic(topicId)) return;
    setActiveTopicId(topicId);
    setCurrentStep(0);
  }, []);

  const close = useCallback(() => {
    setActiveTopicId(null);
    setCurrentStep(0);
  }, []);

  const next = useCallback(() => {
    setCurrentStep((step) => {
      const topic = activeTopicId ? getHelpTopic(activeTopicId) : undefined;
      if (!topic) return 0;
      return Math.min(step + 1, topic.steps.length - 1);
    });
  }, [activeTopicId]);

  const back = useCallback(() => {
    setCurrentStep((step) => Math.max(0, step - 1));
  }, []);

  const value = useMemo(
    () => ({ activeTopicId, currentStep, openTopic, close, next, back }),
    [activeTopicId, currentStep, openTopic, close, next, back],
  );

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

export function useHelp() {
  const value = useContext(HelpContext);
  if (!value) throw new Error("Help controls must render inside HelpProvider.");
  return value;
}
