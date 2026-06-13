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
    metadataTitle: 'Features | AI skincare app that guides your routine',
    metadataDescription:
      'See how Ritora reads your skin and tells you what to keep, pause, or stop: shelf tracking, ingredient checks, skin journal, and daily routine guidance.',
    navLabel: 'Features',
    navBlurb: 'Everything Ritora does, built on the shelf you own.',
    eyebrow: 'Ritora features',
    title: 'Everything you need to know what to use, pause, or stop.',
    description:
      'Ritora connects the products you already own with ingredient checks, skin journal signals, and daily guidance, so you always know your next move.',
    primaryKeyword:
      'AI skincare routine planner, skincare shelf tracker, skincare app, product compatibility checker',
    benefits: [
      'Track the products already on your shelf',
      'Catch ingredient conflicts before you layer',
      'Spot reactions early and pause the cause',
      'Keep sensitive skin and privacy in view',
    ],
    whyHeading:
      'Everything connects back to the products you already own.',
    sections: [
      {
        icon: 'shelf',
        title: 'Shelf-first product tracking',
        body: 'Add cleansers, serums, moisturizers, sunscreens, and actives so Ritora reasons from what you actually use, not a generic template.',
      },
      {
        icon: 'routine',
        title: 'Daily routine guidance',
        body: 'Get morning, midday, and evening guidance that reacts to your products, conflicts, recovery days, and what you applied earlier.',
      },
      {
        icon: 'checks',
        title: 'Product compatibility checks',
        body: 'See whether a product fits before you layer it with exfoliants, retinoids, vitamin C, or sunscreen.',
      },
      {
        icon: 'journal',
        title: 'Skin journal that catches reactions',
        body: 'Photo-backed notes let Ritora spot a reaction early and pause the active behind it before things get worse.',
      },
    ],
    faqs: [
      {
        question: 'Is Ritora only for people who buy lots of products?',
        answer:
          'No. Ritora is built around the products you already own, whether your routine is minimal or advanced.',
      },
      {
        question: 'Does Ritora replace medical advice?',
        answer:
          'No. Ritora supports routine decisions, but it is not medical diagnosis or treatment.',
      },
      {
        question: 'Can I use Ritora with any brand?',
        answer:
          'Yes. Ritora is brand-neutral and works from your product details, routine timing, and skin profile.',
      },
    ],
  },
  howItWorks: {
    path: AppRoute.HowItWorks,
    metadataTitle: 'How Ritora Works | Know what to use, pause, or stop',
    metadataDescription:
      'See how Ritora turns your skin profile, product shelf, and daily check-ins into clear guidance on what to use, pause, or stop, in a few simple steps.',
    navLabel: 'How it works',
    navBlurb: 'From skin profile to a daily plan in a few steps.',
    eyebrow: 'How Ritora works',
    title: 'From a shelf full of guesses to a clear answer every day.',
    description:
      'Ritora starts with your skin profile and the products you own, then tells you what to use, what to skip, and when to slow down.',
    primaryKeyword:
      'how to build skincare routine, personalized skincare routine app, skincare routine planner',
    benefits: [
      'Start with your skin profile',
      'Add the products you already own',
      'Let Ritora flag risky combinations',
      'Follow a plan that reacts as your skin does',
    ],
    whyHeading:
      'Your shelf and skin profile become a plan you can actually repeat.',
    numberedSections: true,
    sections: [
      {
        icon: 'profile',
        title: 'Create your skin profile',
        body: 'Save your skin goals, sensitivities, tolerance, and lifestyle so guidance starts with the right guardrails.',
      },
      {
        icon: 'shelf',
        title: 'Build your product shelf',
        body: 'Add products by photo or by hand. Ritora keeps brand, category, and ingredient context tied to your routine.',
      },
      {
        icon: 'checks',
        title: 'Review compatibility',
        body: 'Before a product enters your routine, Ritora checks for friction like repeated actives or irritating combinations.',
      },
      {
        icon: 'routine',
        title: 'Get guidance that reacts',
        body: 'Ritora turns your shelf and profile into daily steps, and pauses the risky one when your skin reacts.',
      },
    ],
    faqs: [
      {
        question: 'Do I need to know ingredients already?',
        answer:
          'No. Ritora is built to remove ingredient guesswork, not require you to be an expert first.',
      },
      {
        question: 'Can I skip steps?',
        answer:
          'Yes. Ritora guides the decisions, but you stay in control of what you use.',
      },
      {
        question: 'Does Ritora help if my skin is reactive?',
        answer:
          'Yes. It keeps context around sensitivities and recent reactions, and pauses strong actives when your skin needs a break.',
      },
    ],
  },
  skinJournal: {
    path: AppRoute.SkinJournalMarketing,
    metadataTitle: 'Skin Journal App | Catch reactions and track progress',
    metadataDescription:
      'Use Ritora as a private skin journal app to track photos, spot reactions early, and see whether your routine is actually working over time.',
    navLabel: 'Skin journal',
    navBlurb: 'Track skin changes with routine context, privately.',
    eyebrow: 'Skin journal app',
    title: 'See whether your routine is actually working.',
    description:
      'Ritora connects your skin photos, routine history, and visible changes, so you can tell what is helping and what is irritating your skin.',
    primaryKeyword:
      'skin journal app, skincare progress tracker, skin diary, skincare photo tracker',
    benefits: [
      'Log visible changes over time',
      'Compare any two dates to see progress',
      'Spot reactions before they get worse',
      'Keep journal data private by design',
    ],
    whyHeading:
      'See what your skin is responding to, not just how it looked today.',
    sections: [
      {
        icon: 'journal',
        title: 'Photo-backed history',
        body: 'Save entries so progress is easy to compare, instead of scattered photos lost in your camera roll.',
      },
      {
        icon: 'routine',
        title: 'Routine context',
        body: 'Pair entries with recent routine choices, so you can see what changed before redness, dryness, or calm days.',
      },
      {
        icon: 'sensitive',
        title: 'Reaction detection',
        body: 'When a photo shows a reaction, Ritora pauses the active behind it and reintroduces it gently later.',
      },
      {
        icon: 'privacy',
        title: 'Private records',
        body: 'Your skin notes stay tied to your account, encrypted, never a public feed.',
      },
    ],
    faqs: [
      {
        question: 'Can a skin journal help my routine?',
        answer:
          'Yes. A consistent journal reveals patterns between products, timing, irritation, and visible changes.',
      },
      {
        question: 'Do I need to upload photos?',
        answer:
          'Photos add context, but Ritora still helps organize products and decisions without them.',
      },
      {
        question: 'Is my skin journal public?',
        answer:
          'No. Ritora is not a public feed. Your records stay private by default.',
      },
    ],
  },
  smartRoutine: {
    path: AppRoute.SmartRoutine,
    metadataTitle: 'Smart Skincare Routine Planner',
    metadataDescription:
      'Plan morning, midday, and evening routines with Ritora using your real products, skin profile, and ingredient guardrails, with recovery days built in.',
    navLabel: 'Smart routine',
    navBlurb: 'Plan morning and evening routines around your shelf.',
    eyebrow: 'Smart routine planner',
    title: 'A routine planner that adapts when your skin reacts.',
    description:
      'Ritora plans practical routines around your real products and skin profile, then slows things down when your skin needs to recover.',
    primaryKeyword:
      'smart skincare routine planner, morning evening skincare routine, personalized skincare planner',
    benefits: [
      'Plan morning and evening routines',
      'Avoid overusing strong actives',
      'Get a calmer plan on recovery days',
      'Time sunscreen and treatments clearly',
    ],
    whyHeading:
      "Routines that respect strong actives and your skin's recovery days.",
    sections: [
      {
        icon: 'morning',
        title: 'Morning clarity',
        body: 'Ritora organizes cleanser, serum, moisturizer, and sunscreen into a morning routine that is easy to repeat.',
      },
      {
        icon: 'evening',
        title: 'Evening guardrails',
        body: 'Evenings carry the strong actives. Ritora helps you decide when stacking is too much for one night.',
      },
      {
        icon: 'recovery',
        title: 'Recovery days',
        body: 'Not every day needs an active. When your skin reacts, Ritora switches you to a calmer, barrier-first plan.',
      },
      {
        icon: 'history',
        title: 'Routine history',
        body: 'Keeping history in one place makes it clear what your skin tolerated well.',
      },
    ],
    faqs: [
      {
        question: 'Can Ritora build a routine without selling me products?',
        answer:
          'Yes. Ritora starts from your own shelf, not a shopping list.',
      },
      {
        question: 'Does Ritora support simple routines?',
        answer:
          'Yes. Even a cleanser, moisturizer, and sunscreen routine benefits from consistency and clear timing.',
      },
      {
        question: 'Can Ritora help with active ingredients?',
        answer:
          'Yes. It flags decisions around exfoliants, retinoids, vitamin C, and other active-heavy steps.',
      },
    ],
  },
  productChecker: {
    path: AppRoute.ProductCheckerMarketing,
    metadataTitle: 'Skincare Product Checker',
    metadataDescription:
      'Check any skincare product against your shelf, skin profile, and reaction history before you buy or layer it. Get a clear verdict in seconds.',
    navLabel: 'Product checker',
    navBlurb: 'Check if a product fits before you buy or layer it.',
    eyebrow: 'Skincare product checker',
    title: 'Vet any product before you buy or use it.',
    description:
      'Ritora reviews a product in context: what you already use, what your skin tolerates, and which combinations need caution.',
    primaryKeyword:
      'skincare product checker, skincare ingredient checker, product compatibility checker',
    benefits: [
      'Get a verdict in seconds',
      'Catch common ingredient conflicts',
      'Check it against your reaction history',
      'Reduce trial-and-error layering',
    ],
    whyHeading: 'Judge a product by how it fits your shelf, not by hype.',
    sections: [
      {
        icon: 'checks',
        title: 'Context-aware checks',
        body: 'A product is not good or bad in isolation. Ritora checks how it fits your shelf and routine.',
      },
      {
        icon: 'guardrails',
        title: 'Ingredient guardrails',
        body: 'Ritora flags caution areas like strong active combinations, repeated exfoliation, and irritation risk.',
      },
      {
        icon: 'shelf',
        title: 'Reaction-aware verdict',
        body: 'Ritora weighs a product against your own reaction history, not just a generic ingredient list.',
      },
      {
        icon: 'clarity',
        title: 'Less guessing',
        body: 'Instead of searching every ingredient by hand, you get a focused product-level decision in seconds.',
      },
    ],
    faqs: [
      {
        question: 'Is Ritora an ingredient database?',
        answer:
          'Ritora uses ingredient and product context, but its job is to help you decide around your own shelf.',
      },
      {
        question: 'Can Ritora tell me if a product is safe for me?',
        answer:
          'It gives decision support from your profile and reaction history, but it cannot guarantee medical safety.',
      },
      {
        question: 'Can I check products I already own?',
        answer:
          'Yes. Ritora is especially useful for products already on your shelf.',
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
