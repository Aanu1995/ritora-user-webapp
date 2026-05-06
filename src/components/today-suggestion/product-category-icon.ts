export function productCategoryEmoji(
  stepLabel: string | null | undefined,
): string {
  switch (stepLabel) {
    case "cleanser":
      return "🧴";
    case "toner":
    case "essence":
      return "💧";
    case "serum":
    case "treatment":
      return "🧪";
    case "moisturizer":
      return "🧴";
    case "sun-protection":
      return "☀️";
    case "exfoliant":
      return "💎";
    case "mask":
      return "🪷";
    case "eye-care":
      return "👁";
    case "lip-care":
      return "💋";
    default:
      return "✦";
  }
}
