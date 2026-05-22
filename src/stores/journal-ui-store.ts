"use client";

import { create } from "zustand";
import type { InsightWindow } from "@/types/skin-journal";

export type JournalTab = "calendar" | "photos" | "insights" | "wrapped";

interface JournalUiState {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  currentTab: JournalTab;
  setCurrentTab: (tab: JournalTab) => void;
  guidanceCollapsed: boolean;
  setGuidanceCollapsed: (collapsed: boolean) => void;
  compareFrom: string | null;
  compareTo: string | null;
  setCompareDates: (from: string | null, to: string | null) => void;
  insightsWindow: InsightWindow;
  setInsightsWindow: (window: InsightWindow) => void;
}

export const useJournalUiStore = create<JournalUiState>((set) => ({
  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  currentTab: "calendar",
  setCurrentTab: (tab) => set({ currentTab: tab }),
  guidanceCollapsed: false,
  setGuidanceCollapsed: (collapsed) => set({ guidanceCollapsed: collapsed }),
  compareFrom: null,
  compareTo: null,
  setCompareDates: (from, to) => set({ compareFrom: from, compareTo: to }),
  insightsWindow: "all",
  setInsightsWindow: (window) => set({ insightsWindow: window }),
}));
