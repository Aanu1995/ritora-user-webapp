import { AppRoute } from "@/constants/app-routes";
import {
  NAV_ITEMS,
  NavGroup,
  NavItemStatus,
  getNavItemsByGroup,
} from "@/constants/nav-config";

describe("NAV_ITEMS", () => {
  it("has no duplicate routes", () => {
    const routes = NAV_ITEMS.map((item) => item.route);
    const unique = new Set(routes);
    expect(unique.size).toBe(routes.length);
  });

  it("only references valid AppRoute values", () => {
    const validRoutes = new Set(Object.values(AppRoute));
    for (const item of NAV_ITEMS) {
      expect(validRoutes.has(item.route)).toBe(true);
    }
  });

  it("has a non-empty labelKey for every item", () => {
    for (const item of NAV_ITEMS) {
      expect(item.labelKey.length).toBeGreaterThan(0);
    }
  });

  it("has a non-empty descriptionKey for every item", () => {
    for (const item of NAV_ITEMS) {
      expect(item.descriptionKey.length).toBeGreaterThan(0);
    }
  });

  it("has a valid icon component for every item", () => {
    for (const item of NAV_ITEMS) {
      expect(item.icon).toBeDefined();
      expect(item.icon.$$typeof).toBeDefined();
    }
  });

  it("uses only valid NavGroup values", () => {
    const validGroups = new Set(Object.values(NavGroup));
    for (const item of NAV_ITEMS) {
      expect(validGroups.has(item.group)).toBe(true);
    }
  });

  it("uses only valid NavItemStatus values", () => {
    const validStatuses = new Set(Object.values(NavItemStatus));
    for (const item of NAV_ITEMS) {
      expect(validStatuses.has(item.status)).toBe(true);
    }
  });

  it("contains all three nav groups", () => {
    const groups = new Set(NAV_ITEMS.map((item) => item.group));
    expect(groups.has(NavGroup.Main)).toBe(true);
    expect(groups.has(NavGroup.More)).toBe(true);
    expect(groups.has(NavGroup.Account)).toBe(true);
  });

  it("has exactly 10 navigation items", () => {
    expect(NAV_ITEMS).toHaveLength(10);
  });
});

describe("getNavItemsByGroup", () => {
  it("returns only items belonging to the requested group", () => {
    const mainItems = getNavItemsByGroup(NavGroup.Main);
    for (const item of mainItems) {
      expect(item.group).toBe(NavGroup.Main);
    }
  });

  it("returns 6 items for the Main group", () => {
    expect(getNavItemsByGroup(NavGroup.Main)).toHaveLength(6);
  });

  it("returns 2 items for the More group", () => {
    expect(getNavItemsByGroup(NavGroup.More)).toHaveLength(2);
  });

  it("returns 2 items for the Account group", () => {
    expect(getNavItemsByGroup(NavGroup.Account)).toHaveLength(2);
  });
});
