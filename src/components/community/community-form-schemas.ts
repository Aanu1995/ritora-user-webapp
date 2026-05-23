import { z } from "zod";
import { communityDisclosureTypes } from "./community-constants";

export const communityReviewFormSchema = z.object({
  body: z.string().max(1200, "Keep review text under 1,200 characters."),
  contextCategory: z.string().min(1, "Routine context is required."),
  disclosureType: z.enum(communityDisclosureTypes),
  frequency: z.string().min(1, "Usage frequency is required."),
  outcomes: z.string().min(1, "At least one outcome is required."),
  productBrand: z.string().min(1, "Brand is required.").max(255),
  productCategory: z.string().min(1, "Product category is required."),
  productName: z.string().min(1, "Product name is required.").max(255),
  repurchase: z.string().min(1, "Repurchase status is required."),
  usageDuration: z.string().min(1, "Usage duration is required."),
});

export const communityRoutineFormSchema = z.object({
  category: z.string().min(1, "First step category is required."),
  disclosureType: z.enum(communityDisclosureTypes),
  summary: z.string().max(500, "Keep routine notes under 500 characters."),
  title: z.string().min(3, "Routine title is required.").max(120),
});

export const communityEditReviewSubmissionSchema = z.object({
  text: z.string().max(1200, "Keep review text under 1,200 characters."),
  title: z.string().min(3, "Routine title is required.").max(120),
});

export const communityEditRoutineSubmissionSchema = z.object({
  text: z.string().max(500, "Keep routine notes under 500 characters."),
  title: z.string().min(3, "Routine title is required.").max(120),
});

export type CommunityReviewFormValues = z.infer<
  typeof communityReviewFormSchema
>;

export type CommunityRoutineFormValues = z.infer<
  typeof communityRoutineFormSchema
>;

export type CommunityEditSubmissionValues = z.infer<
  typeof communityEditReviewSubmissionSchema
>;

export const defaultCommunityReviewValues: CommunityReviewFormValues = {
  body: "",
  contextCategory: "cleanser",
  disclosureType: "ordinary",
  frequency: "am-pm",
  outcomes: "helped-overall",
  productBrand: "",
  productCategory: "moisturizer",
  productName: "",
  repurchase: "unsure",
  usageDuration: "4-weeks",
};

export const defaultCommunityRoutineValues: CommunityRoutineFormValues = {
  category: "cleanser",
  disclosureType: "ordinary",
  summary: "",
  title: "",
};
