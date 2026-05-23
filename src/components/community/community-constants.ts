import type { CommunityDisclosureType } from "@/types/community";

export const communityDisclosureTypes = [
  "ordinary",
  "gifted",
  "sponsored",
  "affiliate",
  "professional",
  "brand_rep",
] as const satisfies readonly CommunityDisclosureType[];

export const disclosureOptions: Array<{
  value: CommunityDisclosureType;
  label: string;
}> = [
  { value: "ordinary", label: "I bought this" },
  { value: "gifted", label: "Gifted" },
  { value: "sponsored", label: "Sponsored" },
  { value: "affiliate", label: "Affiliate" },
  { value: "professional", label: "Professional" },
  { value: "brand_rep", label: "Brand rep" },
];
