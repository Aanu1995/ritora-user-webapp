import { formatPrice } from "@/components/smart-picks/smart-picks-format";

describe("smart picks formatters", () => {
  it("formats known currencies and falls back without crashing on unknown retailer currency labels", () => {
    expect(formatPrice(1299, "usd")).toMatch(/\$12\.99|US\$12\.99/);
    expect(formatPrice(null, "USD")).toBeNull();
    expect(formatPrice(1299, null)).toBeNull();
    expect(formatPrice(1299, "local")).toBe("LOCAL 12.99");
  });
});
