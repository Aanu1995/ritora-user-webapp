'use client';

import { create } from 'zustand';
import {
  type ProductCategory,
  ShelfSort,
  ShelfStatFilter,
} from '@/types/shelf';

export type ShelfViewMode = 'grid' | 'list';

type ShelfUiState = {
  selectedIds: ReadonlySet<string>;
  toggleSelected: (id: string) => void;
  clearSelection: () => void;

  sort: ShelfSort;
  setSort: (sort: ShelfSort) => void;

  view: ShelfViewMode;
  setView: (view: ShelfViewMode) => void;

  stat: ShelfStatFilter;
  setStat: (stat: ShelfStatFilter) => void;

  activeCategory: ProductCategory | 'all';
  setActiveCategory: (category: ProductCategory | 'all') => void;

  search: string;
  setSearch: (search: string) => void;
};

export const useShelfUiStore = create<ShelfUiState>((set, get) => ({
  selectedIds: new Set<string>(),
  toggleSelected: (id) => {
    const current = new Set(get().selectedIds);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    set({ selectedIds: current });
  },
  clearSelection: () => set({ selectedIds: new Set<string>() }),

  sort: ShelfSort.RecentlyAdded,
  setSort: (sort) => set({ sort }),

  view: 'grid',
  setView: (view) => set({ view }),

  stat: ShelfStatFilter.All,
  setStat: (stat) => set({ stat, selectedIds: new Set<string>() }),

  activeCategory: 'all',
  setActiveCategory: (activeCategory) =>
    set({ activeCategory, selectedIds: new Set<string>() }),

  search: '',
  setSearch: (search) => set({ search, selectedIds: new Set<string>() }),
}));
