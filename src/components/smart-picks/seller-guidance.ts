const MAX_SELLER_NAMES = 3;

export function sellerDisplayNames(sellerNames: readonly string[]): string[] {
  const names = new Set<string>();

  for (const sellerName of sellerNames) {
    const name = sellerName.trim();
    if (!name) continue;
    names.add(name);
    if (names.size >= MAX_SELLER_NAMES) break;
  }

  return [...names];
}
