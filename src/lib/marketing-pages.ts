import type { Metadata } from 'next';
import { AppRoute } from '@/constants/app-routes';
import type { MarketingPageProps } from '@/components/seo/marketing-page';

export interface MarketingPageData extends MarketingPageProps {
  path: AppRoute;
  metadataTitle: string;
  metadataDescription: string;
  /** Short label used when this page is cross-linked from another page. */
  navLabel: string;
  /** One-line description used on the "Explore more" cards. */
  navBlurb: string;
}

export const marketingPages = {
  features: {
    path: AppRoute.Features,
    metadataTitle: 'Features | AI skincare routine planner',
    metadataDescription:
      'Explore Ritora features for skincare shelf tracking, product checks, skin journaling, smart routine planning, and privacy-first AI suggestions.',
    navLabel: 'Features',
    navBlurb: 'Everything Ritora does, in one shelf-first view.',
    eyebrow: 'Ritora features',
    title: 'One place to understand your shelf, your routine, and your skin.',
    description:
      'Ritora connects the products you already own with ingredient guardrails, skin journal signals, and daily routine suggestions, so skincare feels calmer and easier to repeat.',
    primaryKeyword:
      'AI skincare routine planner, skincare shelf tracker, skincare app, product compatibility checker',
    benefits: [
      'Track the products already on your shelf',
      'Catch ingredient conflicts before you layer',
      'Turn skin journal signals into routine changes',
      'Keep sensitive skin and privacy in view',
    ],
    whyHeading:
      'Everything connects back to the products you already own.',
    sections: [
      {
        icon: 'shelf',
        title: 'Shelf-first product tracking',
        body: 'Add cleansers, serums, moisturizers, sunscreens, treatments, and actives so Ritora reasons from what you actually use, not a generic template.',
      },
      {
        icon: 'routine',
        title: 'Routine suggestions',
        body: 'Get morning, midday, and evening suggestions that account for product type, conflicts, recovery days, and your saved preferences.',
      },
      {
        icon: 'checks',
        title: 'Product compatibility checks',
        body: 'See whether a product fits your routine before you layer it with exfoliants, retinoids, vitamin C, sunscreen, or calming steps.',
      },
      {
        icon: 'journal',
        title: 'Skin journal context',
        body: 'Use photo-backed skin notes to understand changes over time and stop repeating routines that leave your skin irritated.',
      },
    ],
    faqs: [
      {
        question: 'Is Ritora only for people who buy many skincare products?',
        answer:
          'No. Ritora is designed around the products you already own, whether your routine is minimal or more advanced.',
      },
      {
        question: 'Does Ritora replace medical advice?',
        answer:
          'No. Ritora helps organize routine decisions and product context, but it is not a medical diagnosis or treatment service.',
      },
      {
        question: 'Can I use Ritora with any brand?',
        answer:
          'Yes. Ritora is brand-neutral and focuses on your product details, routine timing, and skin profile.',
      },
    ],
  },
  howItWorks: {
    path: AppRoute.HowItWorks,
    metadataTitle: 'How Ritora Works | Build a safer skincare routine',
    metadataDescription:
      'Learn how Ritora turns your skincare shelf, skin profile, and journal signals into practical routine suggestions in a few simple steps.',
    navLabel: 'How it works',
    navBlurb: 'From skin profile to a daily plan in a few steps.',
    eyebrow: 'How Ritora works',
    title: 'From product shelf to daily skincare plan in a few focused steps.',
    description:
      'Ritora starts with your skin profile and product shelf, then uses those details to suggest what to use, what to skip, and when to slow down.',
    primaryKeyword:
      'how to build skincare routine, personalized skincare routine app, skincare routine planner',
    benefits: [
      'Start with your skin profile',
      'Add the products you already own',
      'Let Ritora flag risky combinations',
      'Follow a clearer daily routine',
    ],
    whyHeading:
      'Your shelf and skin profile become a routine you can actually repeat.',
    numberedSections: true,
    sections: [
      {
        icon: 'profile',
        title: 'Create your skin profile',
        body: 'Save your skin goals, sensitivities, tolerance, lifestyle context, and routine preferences so suggestions begin with the right guardrails.',
      },
      {
        icon: 'shelf',
        title: 'Build your product shelf',
        body: 'Add products manually or with images. Ritora keeps brand, category, description, and ingredient context connected to your routine.',
      },
      {
        icon: 'checks',
        title: 'Review compatibility',
        body: 'Before a product enters a routine, Ritora checks for common friction points such as repeated actives or irritating combinations.',
      },
      {
        icon: 'routine',
        title: 'Use daily suggestions',
        body: 'Ritora turns the shelf and profile into practical morning, midday, and evening steps that are easier to follow.',
      },
    ],
    faqs: [
      {
        question: 'Do I need to know ingredients already?',
        answer:
          'No. Ritora is built to reduce ingredient guesswork, not require you to become an ingredient expert first.',
      },
      {
        question: 'Can I skip steps?',
        answer:
          'Yes. Ritora is meant to guide routine decisions, while you remain in control of what you use.',
      },
      {
        question: 'Does Ritora help if my skin is reactive?',
        answer:
          'It can help you keep better context around sensitivities, recent reactions, and cautious product layering.',
      },
    ],
  },
  skinJournal: {
    path: AppRoute.SkinJournalMarketing,
    metadataTitle: 'Skin Journal App | Track skin changes with Ritora',
    metadataDescription:
      'Use Ritora as a private skin journal app to track photos, routine changes, reactions, and progress over time.',
    navLabel: 'Skin journal',
    navBlurb: 'Track skin changes with routine context, privately.',
    eyebrow: 'Skin journal app',
    title: 'Track skin changes with more context than a camera roll.',
    description:
      'Ritora connects skin photos, routine history, product use, and visible changes, so you can see what may be helping or irritating your skin.',
    primaryKeyword:
      'skin journal app, skincare progress tracker, skin diary, skincare photo tracker',
    benefits: [
      'Log visible changes over time',
      'Connect photos with routine history',
      'Notice irritation and recovery patterns',
      'Keep journal data private by design',
    ],
    whyHeading:
      'See what your skin is responding to, not just how it looked today.',
    sections: [
      {
        icon: 'journal',
        title: 'Photo-backed history',
        body: 'Save skin journal entries so progress is easier to compare than scattered photos buried in your camera roll.',
      },
      {
        icon: 'routine',
        title: 'Routine context',
        body: 'Pair entries with recent routine choices, so you can understand what changed before redness, dryness, texture, or calm days.',
      },
      {
        icon: 'sensitive',
        title: 'Sensitive-skin awareness',
        body: 'Use journal signals to support slower reintroductions and more cautious active ingredient timing.',
      },
      {
        icon: 'privacy',
        title: 'Private records',
        body: 'Skin journaling is personal. Ritora keeps your routine and skin notes tied to your account, not a public feed.',
      },
    ],
    faqs: [
      {
        question: 'Can a skin journal help my routine?',
        answer:
          'Yes. A consistent journal can reveal patterns between products, timing, irritation, recovery, and visible skin changes.',
      },
      {
        question: 'Do I need to upload photos?',
        answer:
          'Photos add useful context, but Ritora can still help organize products and routine decisions without them.',
      },
      {
        question: 'Is my skin journal public?',
        answer:
          'No. Ritora is not built as a public social feed for your private skin records.',
      },
    ],
  },
  smartRoutine: {
    path: AppRoute.SmartRoutine,
    metadataTitle: 'Smart Skincare Routine Planner',
    metadataDescription:
      'Plan morning, midday, and evening skincare routines with Ritora using your actual products, skin profile, and ingredient guardrails.',
    navLabel: 'Smart routine',
    navBlurb: 'Plan morning and evening routines around your shelf.',
    eyebrow: 'Smart routine planner',
    title: 'A skincare routine planner that knows what is already on your shelf.',
    description:
      'Ritora plans practical routines around your real products, skin profile, active ingredient tolerance, and recovery needs.',
    primaryKeyword:
      'smart skincare routine planner, morning evening skincare routine, personalized skincare planner',
    benefits: [
      'Plan morning and evening routines',
      'Avoid overusing strong actives',
      'Adjust around recovery days',
      'Time sunscreen and treatments clearly',
    ],
    whyHeading:
      "Routines that respect strong actives and your skin's recovery days.",
    sections: [
      {
        icon: 'morning',
        title: 'Morning clarity',
        body: 'Ritora organizes cleanser, serum, moisturizer, and sunscreen choices into a morning routine that is easy to repeat.',
      },
      {
        icon: 'evening',
        title: 'Evening guardrails',
        body: 'Evening routines often include stronger actives. Ritora helps you decide when to avoid stacking too much at once.',
      },
      {
        icon: 'recovery',
        title: 'Recovery days',
        body: 'Not every day needs an active. Ritora supports gentler routines when your skin needs a pause.',
      },
      {
        icon: 'history',
        title: 'Routine history',
        body: 'Keeping routine history in one place makes it easier to understand what your skin tolerated well.',
      },
    ],
    faqs: [
      {
        question: 'Can Ritora build a routine without selling products?',
        answer:
          'Yes. Ritora is inventory-first, so the starting point is your own shelf rather than a shopping list.',
      },
      {
        question: 'Does Ritora support simple routines?',
        answer:
          'Yes. A simple cleanser, moisturizer, and sunscreen routine can still benefit from reminders and consistency.',
      },
      {
        question: 'Can Ritora help with active ingredients?',
        answer:
          'Ritora can help flag routine decisions around exfoliants, retinoids, vitamin C, and other active-heavy steps.',
      },
    ],
  },
  productChecker: {
    path: AppRoute.ProductCheckerMarketing,
    metadataTitle: 'Skincare Product Checker',
    metadataDescription:
      'Check skincare products against your shelf, skin profile, and routine context before adding them to your routine.',
    navLabel: 'Product checker',
    navBlurb: 'Check if a product fits before you layer it.',
    eyebrow: 'Skincare product checker',
    title: 'Check whether a skincare product makes sense for your routine.',
    description:
      'Ritora reviews products in context: what you already use, what your skin tolerates, and which combinations may need caution.',
    primaryKeyword:
      'skincare product checker, skincare ingredient checker, product compatibility checker',
    benefits: [
      'Review products before routine changes',
      'Catch common ingredient conflicts',
      'Understand product fit by skin profile',
      'Reduce trial-and-error layering',
    ],
    whyHeading: 'Judge a product by how it fits your shelf, not by hype.',
    sections: [
      {
        icon: 'checks',
        title: 'Context-aware checks',
        body: 'A product is not good or bad in isolation. Ritora checks how it fits with your existing shelf and routine.',
      },
      {
        icon: 'guardrails',
        title: 'Ingredient guardrails',
        body: 'Ritora highlights common caution areas such as strong active combinations, repeated exfoliation, and irritation risk.',
      },
      {
        icon: 'shelf',
        title: 'Shelf decisions',
        body: 'Run a product check before adding something new to your shelf or deciding where it belongs in your routine.',
      },
      {
        icon: 'clarity',
        title: 'Less guessing',
        body: 'Instead of searching every ingredient manually, Ritora gives you a focused product-level decision layer.',
      },
    ],
    faqs: [
      {
        question: 'Is Ritora an ingredient database?',
        answer:
          'Ritora uses ingredient and product context, but its main job is to help you make routine decisions around your own shelf.',
      },
      {
        question: 'Can Ritora tell me if a product is safe for me?',
        answer:
          'Ritora can provide decision support based on your profile and routine context, but it cannot guarantee medical safety.',
      },
      {
        question: 'Can I check products I already own?',
        answer:
          'Yes. Ritora is especially useful for understanding products already sitting on your shelf.',
      },
    ],
  },
} satisfies Record<string, MarketingPageData>;

/** Lightweight list used for cross-linking between marketing pages. */
export const marketingNav = Object.values(marketingPages).map((page) => ({
  path: page.path,
  label: page.navLabel,
  blurb: page.navBlurb,
}));

/** Builds Next.js metadata for a marketing page, including keywords. */
export function buildMarketingMetadata(page: MarketingPageData): Metadata {
  return {
    title: page.metadataTitle,
    description: page.metadataDescription,
    keywords: page.primaryKeyword.split(',').map((keyword) => keyword.trim()),
    alternates: { canonical: page.path },
    openGraph: {
      title: page.metadataTitle,
      description: page.metadataDescription,
      url: page.path,
      type: 'website',
    },
  };
}
