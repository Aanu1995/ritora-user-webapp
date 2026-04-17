/**
 * Shelf service — v1 is a localStorage-backed mock that mirrors the shape
 * the real backend will expose. The hook signatures and return types stay
 * identical when we swap this for real HTTP calls in the backend PR.
 */

import {
  BARCODE_LOOKUP,
  CATALOGUE_SUGGESTIONS,
  SHELF_SEED,
  URL_LOOKUP,
} from './shelf.fixtures';
import {
  type CatalogueSuggestion,
  type ResolvedLookup,
  type ShelfListFilters,
  type ShelfProduct,
  type ShelfProductDraft,
  ShelfSort,
  ShelfStatFilter,
  ShelfStatus,
} from '@/types/shelf';
import { deriveShelfLife } from '@/lib/shelf-life';

const STORAGE_KEY = 'ritora.shelf.v1';
const ARTIFICIAL_DELAY_MS = 100;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function wait<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ARTIFICIAL_DELAY_MS);
  });
}

function readStorage(): ShelfProduct[] {
  if (!isBrowser()) {
    return [...SHELF_SEED];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SHELF_SEED));
    return [...SHELF_SEED];
  }

  try {
    const parsed = JSON.parse(raw) as ShelfProduct[];
    if (!Array.isArray(parsed)) {
      throw new Error('shelf storage is not an array');
    }

    return parsed;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SHELF_SEED));
    return [...SHELF_SEED];
  }
}

function writeStorage(products: ShelfProduct[]): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function newId(): string {
  if (isBrowser() && typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `shelf-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function matchesStat(product: ShelfProduct, stat: ShelfStatFilter): boolean {
  if (stat === ShelfStatFilter.All) {
    return product.status !== ShelfStatus.Archived;
  }
  if (stat === ShelfStatFilter.Archived) {
    return product.status === ShelfStatus.Archived;
  }

  if (product.status === ShelfStatus.Archived) {
    return false;
  }

  const life = deriveShelfLife(product);

  switch (stat) {
    case ShelfStatFilter.InUse:
      return Boolean(product.userFields.openedAt) && product.status === ShelfStatus.Active;
    case ShelfStatFilter.Unopened:
      return !product.userFields.openedAt && product.status === ShelfStatus.Active;
    case ShelfStatFilter.NearingExpiry:
      return life.state === 'aging' || life.state === 'expired';
    case ShelfStatFilter.Expired:
      return life.state === 'expired';
    default:
      return true;
  }
}

function sortProducts(products: ShelfProduct[], sort: ShelfSort): ShelfProduct[] {
  const copy = [...products];
  switch (sort) {
    case ShelfSort.Alphabetical:
      return copy.sort((a, b) => a.identity.name.localeCompare(b.identity.name));
    case ShelfSort.CategoryGrouped:
      return copy.sort((a, b) =>
        a.identity.category.localeCompare(b.identity.category) ||
        a.identity.name.localeCompare(b.identity.name),
      );
    case ShelfSort.ExpiringSoon:
      return copy.sort((a, b) => {
        const ea = a.userFields.expiresAt ?? '9999';
        const eb = b.userFields.expiresAt ?? '9999';
        return ea.localeCompare(eb);
      });
    case ShelfSort.RecentlyAdded:
    default:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

function applyFilters(
  products: ShelfProduct[],
  filters: ShelfListFilters,
): ShelfProduct[] {
  const q = filters.search.trim().toLowerCase();

  const filtered = products.filter((p) => {
    if (!matchesStat(p, filters.stat)) {
      return false;
    }
    if (filters.category !== 'all' && p.identity.category !== filters.category) {
      return false;
    }
    if (q.length === 0) {
      return true;
    }
    const haystack = [
      p.identity.brand,
      p.identity.name,
      p.identity.category,
      ...p.identity.inciIngredients,
      ...p.identity.benefits,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });

  return sortProducts(filtered, filters.sort);
}

export async function listProducts(
  filters: ShelfListFilters,
): Promise<ShelfProduct[]> {
  const all = readStorage();
  return wait(applyFilters(all, filters));
}

export async function countProductsByStat(): Promise<
  Record<ShelfStatFilter, number>
> {
  const all = readStorage();
  return wait({
    [ShelfStatFilter.All]: all.filter((p) => p.status !== ShelfStatus.Archived).length,
    [ShelfStatFilter.InUse]: all.filter(
      (p) => Boolean(p.userFields.openedAt) && p.status === ShelfStatus.Active,
    ).length,
    [ShelfStatFilter.Unopened]: all.filter(
      (p) => !p.userFields.openedAt && p.status === ShelfStatus.Active,
    ).length,
    [ShelfStatFilter.NearingExpiry]: all.filter((p) => {
      if (p.status !== ShelfStatus.Active) {
        return false;
      }
      const life = deriveShelfLife(p);
      return life.state === 'aging' || life.state === 'expired';
    }).length,
    [ShelfStatFilter.Expired]: all.filter((p) => {
      if (p.status !== ShelfStatus.Active) {
        return false;
      }
      const life = deriveShelfLife(p);
      return life.state === 'expired';
    }).length,
    [ShelfStatFilter.Archived]: all.filter(
      (p) => p.status === ShelfStatus.Archived,
    ).length,
  });
}

export async function getProduct(id: string): Promise<ShelfProduct> {
  const product = readStorage().find((p) => p.id === id);
  if (!product) {
    throw new Error(`Product ${id} not found`);
  }
  return wait(product);
}

export async function createProduct(
  draft: ShelfProductDraft,
): Promise<ShelfProduct> {
  const now = new Date().toISOString();
  const product: ShelfProduct = {
    ...draft,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  };
  const next = [product, ...readStorage()];
  writeStorage(next);
  return wait(product);
}

export async function updateProduct(
  id: string,
  patch: Partial<ShelfProductDraft>,
): Promise<ShelfProduct> {
  const current = readStorage();
  const index = current.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Product ${id} not found`);
  }

  const existing = current[index];
  const merged: ShelfProduct = {
    ...existing,
    identity: { ...existing.identity, ...(patch.identity ?? {}) },
    guidance: { ...existing.guidance, ...(patch.guidance ?? {}) },
    manufacturer: { ...existing.manufacturer, ...(patch.manufacturer ?? {}) },
    userFields: { ...existing.userFields, ...(patch.userFields ?? {}) },
    status: patch.status ?? existing.status,
    provenance: patch.provenance ?? existing.provenance,
    updatedAt: new Date().toISOString(),
  };

  const next = [...current];
  next[index] = merged;
  writeStorage(next);

  return wait(merged);
}

export async function removeProduct(id: string): Promise<void> {
  const next = readStorage().filter((p) => p.id !== id);
  writeStorage(next);
  return wait(undefined);
}

export async function removeProducts(ids: string[]): Promise<void> {
  const next = readStorage().filter((product) => !ids.includes(product.id));
  writeStorage(next);
  return wait(undefined);
}

export async function setProductsStatus(
  ids: string[],
  status: ShelfStatus,
): Promise<void> {
  const now = new Date().toISOString();
  const next = readStorage().map((p) =>
    ids.includes(p.id) ? { ...p, status, updatedAt: now } : p,
  );
  writeStorage(next);
  return wait(undefined);
}

export async function searchCatalogue(
  query: string,
): Promise<CatalogueSuggestion[]> {
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return wait([]);
  }
  const matches = CATALOGUE_SUGGESTIONS.filter((item) => {
    const haystack = `${item.brand} ${item.name} ${item.category}`.toLowerCase();
    return haystack.includes(q);
  }).slice(0, 8);
  return wait(matches);
}

export async function resolveBarcode(barcode: string): Promise<ResolvedLookup | null> {
  const match = BARCODE_LOOKUP[barcode.trim()];
  return wait(match ?? null);
}

export async function resolveUrl(url: string): Promise<ResolvedLookup | null> {
  const match = URL_LOOKUP[url.trim()];
  return wait(match ?? null);
}

/** Exposed for tests so we can reset between cases. */
export function __resetShelfStorage(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
