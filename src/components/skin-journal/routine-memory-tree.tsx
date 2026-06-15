"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  History,
  PauseCircle,
  PlusCircle,
  Repeat2,
  ShieldCheck,
} from "lucide-react";
import { ProductIllustration } from "@/components/shelf/product-illustration";
import { SmoothImage } from "@/components/ui/smooth-image";
import {
  RoutineMemoryEventSeverity,
  RoutineMemoryEventType,
  RoutineMemorySuspicionLevel,
  type RoutineMemoryProduct,
  type RoutineMemoryProductTimeline,
  type RoutineMemoryReasonCode,
  type RoutineMemoryTimelineEvent,
} from "@/types/routine-memory";
import { ProductCategory } from "@/types/shelf";

interface RoutineMemoryTreeProps {
  productTimelines: RoutineMemoryProductTimeline[];
}

const eventIcons = {
  [RoutineMemoryEventType.ProductAdded]: PlusCircle,
  [RoutineMemoryEventType.FirstLoggedUse]: CalendarClock,
  [RoutineMemoryEventType.ProductUsed]: CheckCircle2,
  [RoutineMemoryEventType.FrequencyChanged]: Repeat2,
  [RoutineMemoryEventType.ProductSkipped]: PauseCircle,
  [RoutineMemoryEventType.ReactionSignal]: AlertTriangle,
  [RoutineMemoryEventType.RecoveryStarted]: ShieldCheck,
  [RoutineMemoryEventType.RecentChangeLogged]: History,
} as const;

/** Soft, theme aware node colors so the tree reads well in light and dark. */
const severityNodeClass = {
  [RoutineMemoryEventSeverity.Info]: "bg-surface-muted text-muted",
  [RoutineMemoryEventSeverity.Watch]:
    "bg-warning-soft text-[color:var(--warning)]",
  [RoutineMemoryEventSeverity.Warning]:
    "bg-[color:var(--danger-soft)] text-danger",
  [RoutineMemoryEventSeverity.Recovery]: "bg-accent-soft text-accent-strong",
} as const;

const suspicionClass = {
  [RoutineMemorySuspicionLevel.Watch]:
    "border-border bg-surface-muted text-muted",
  [RoutineMemorySuspicionLevel.Possible]:
    "border-[color:var(--warning-border)] bg-warning-soft text-[color:var(--warning)]",
  [RoutineMemorySuspicionLevel.HigherAttention]:
    "border-[rgba(179,38,30,0.28)] bg-[color:var(--danger-soft)] text-danger",
} as const;

/** A colored left edge marks the products that deserve a closer look. */
const cardAccentClass = {
  [RoutineMemorySuspicionLevel.Watch]: "",
  [RoutineMemorySuspicionLevel.Possible]:
    "border-l-[3px] border-l-[color:var(--warning)]",
  [RoutineMemorySuspicionLevel.HigherAttention]:
    "border-l-[3px] border-l-danger",
} as const;

const PRODUCT_CATEGORY_VALUES = new Set<string>(Object.values(ProductCategory));

export function RoutineMemoryTree({ productTimelines }: RoutineMemoryTreeProps) {
  const sortedProductTimelines = productTimelines
    .slice()
    .sort(compareProductTimelines);

  return (
    <div className="mt-4 space-y-4">
      {sortedProductTimelines.map((productTimeline) => (
        <ProductTimeline
          key={
            productTimeline.product.productId ??
            productLabel(productTimeline.product, "")
          }
          productTimeline={productTimeline}
        />
      ))}
    </div>
  );
}

function ProductTimeline({
  productTimeline,
}: {
  productTimeline: RoutineMemoryProductTimeline;
}) {
  const locale = useLocale();
  const t = useTranslations("journal.routineMemory");
  const tCategory = useTranslations("shelf.category");
  const product = productLabel(productTimeline.product, t("unknownProduct"));
  const productName = productTimeline.product.name ?? product;
  const productBrand = productTimeline.product.brand;
  const productCategory = toProductCategory(productTimeline.product.category);
  const productCategoryLabel = productCategory
    ? tCategory(productCategory)
    : productTimeline.product.category;
  const events = productTimeline.timeline.slice().sort(compareEvents);
  const accent = productTimeline.suspicionLevel
    ? cardAccentClass[productTimeline.suspicionLevel]
    : "";

  return (
    <section
      className={`rounded-2xl border border-border bg-surface p-5 ${accent}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-3">
          <ProductThumbnail
            brand={productBrand ?? product}
            category={productCategory ?? ProductCategory.Other}
            imageUrl={productTimeline.product.imageUrl ?? null}
          />
          <div className="min-w-0">
            {productCategoryLabel ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                {productCategoryLabel}
              </p>
            ) : null}
            <h4 className="truncate font-display text-base font-bold leading-tight text-foreground">
              {productName}
            </h4>
            {productBrand ? (
              <p className="truncate text-xs text-muted">{productBrand}</p>
            ) : null}
            <p className="mt-1 text-xs text-muted">
              {productTimeline.firstUseDate
                ? t("firstUse", {
                    date: formatDate(productTimeline.firstUseDate, locale),
                  })
                : t("noFirstUse")}
            </p>
          </div>
        </div>
        {productTimeline.suspicionLevel ? (
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${suspicionClass[productTimeline.suspicionLevel]}`}
          >
            {t(`levels.${productTimeline.suspicionLevel}`)}
          </span>
        ) : null}
      </div>

      <ReasonList reasonCodes={productTimeline.reasonCodes} />

      {events.length > 0 ? (
        <div
          aria-label={`${product} ${t("treeProductAriaSuffix")}`}
          className="mt-5 overflow-x-auto overscroll-x-contain pb-2"
        >
          <ol className="flex min-w-max items-start">
            {events.map((event, index) => (
              <TimelineBranch
                key={event.id}
                event={event}
                index={index}
                count={events.length}
                locale={locale}
              />
            ))}
          </ol>
        </div>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-border bg-surface-muted/50 px-3 py-2.5 text-sm text-muted">
          {t("noProductEvents")}
        </p>
      )}
    </section>
  );
}

function ProductThumbnail({
  brand,
  category,
  imageUrl,
}: {
  brand: string;
  category: ProductCategory;
  imageUrl: string | null;
}) {
  const fallback = (
    <span
      aria-hidden="true"
      className="flex h-full w-full items-center justify-center"
    >
      <ProductIllustration
        category={category}
        brand={brand}
        className="h-[72%] w-auto"
      />
    </span>
  );

  return (
    <div
      aria-hidden="true"
      className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-muted"
    >
      {imageUrl ? (
        <SmoothImage
          src={imageUrl}
          alt=""
          sizes="48px"
          className="h-full w-full rounded-xl"
          fallback={fallback}
        />
      ) : (
        fallback
      )}
    </div>
  );
}

function TimelineBranch({
  event,
  index,
  count,
  locale,
}: {
  event: RoutineMemoryTimelineEvent;
  index: number;
  count: number;
  locale: string;
}) {
  const t = useTranslations("journal.routineMemory");
  const Icon = eventIcons[event.type];
  const detail = eventDetail(event, {
    recovery: t("eventDetails.recovery"),
    skinJournal: t("eventDetails.skinJournal"),
  });

  return (
    <li className="relative w-40 shrink-0 px-3 text-center">
      <span
        aria-hidden="true"
        className={`absolute top-5 h-0.5 bg-border ${horizontalLineClass(index, count)}`}
      />
      <span
        className={`relative mx-auto grid h-10 w-10 place-items-center rounded-full ring-4 ring-surface ${severityNodeClass[event.severity]}`}
      >
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <time
        className="mt-3 block text-[11px] font-bold uppercase tracking-wide text-muted"
        dateTime={event.date}
      >
        {formatDate(event.date, locale)}
      </time>
      <p className="mt-1.5 text-sm font-semibold leading-snug text-foreground">
        {t(`events.${event.type}`)}
      </p>
      {detail ? (
        <p className="mx-auto mt-1 max-w-[10rem] text-xs leading-relaxed text-muted">
          {detail}
        </p>
      ) : null}
    </li>
  );
}

function ReasonList({
  reasonCodes,
}: {
  reasonCodes: RoutineMemoryReasonCode[];
}) {
  const t = useTranslations("journal.routineMemory");
  if (reasonCodes.length === 0) return null;

  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {reasonCodes.map((reason) => (
        <li
          key={reason}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-muted"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[color:var(--warning)]"
          />
          <span>{t(`reasons.${reason}`)}</span>
        </li>
      ))}
    </ul>
  );
}

function compareEvents(
  first: RoutineMemoryTimelineEvent,
  second: RoutineMemoryTimelineEvent,
): number {
  if (first.date !== second.date) {
    return first.date > second.date ? -1 : 1;
  }
  return second.id.localeCompare(first.id);
}

function compareProductTimelines(
  first: RoutineMemoryProductTimeline,
  second: RoutineMemoryProductTimeline,
): number {
  const firstDate = latestTimelineDate(first);
  const secondDate = latestTimelineDate(second);
  if (firstDate !== secondDate) {
    return firstDate > secondDate ? -1 : 1;
  }
  return productLabel(first.product, "").localeCompare(
    productLabel(second.product, ""),
  );
}

function latestTimelineDate(
  productTimeline: RoutineMemoryProductTimeline,
): string {
  return productTimeline.timeline.reduce(
    (latest, event) => (event.date > latest ? event.date : latest),
    productTimeline.lastUseDate ?? productTimeline.firstUseDate ?? "",
  );
}

function horizontalLineClass(index: number, count: number): string {
  if (count === 1) return "left-1/2 right-1/2";
  if (index === 0) return "left-1/2 right-0";
  if (index === count - 1) return "left-0 right-1/2";
  return "left-0 right-0";
}

function eventDetail(
  event: RoutineMemoryTimelineEvent,
  labels: { recovery: string; skinJournal: string },
): string | null {
  if (event.type === RoutineMemoryEventType.ReactionSignal) {
    return labels.skinJournal;
  }
  if (event.type === RoutineMemoryEventType.RecoveryStarted) {
    return labels.recovery;
  }
  return null;
}

function productLabel(product: RoutineMemoryProduct, fallback: string): string {
  return (
    [product.brand, product.name].filter(Boolean).join(" ").trim() || fallback
  );
}

function toProductCategory(category: string | null): ProductCategory | null {
  if (!category || !PRODUCT_CATEGORY_VALUES.has(category)) return null;
  return category as ProductCategory;
}

function formatDate(date: string, locale: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(parsed);
}
