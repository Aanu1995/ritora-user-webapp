"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { ConsentCard } from "@/components/settings/privacy-consent-card";
import { GrantLocationDialog } from "@/components/settings/privacy-location-dialog";
import {
  buildHealthStoredItems,
  buildHormonalStoredItems,
  buildLocationStoredItems,
} from "@/components/settings/privacy-stored-items";
import { SettingsRow } from "@/components/settings/settings-row";
import { SettingsSection } from "@/components/settings/settings-section";
import {
  ConfirmDialog,
  ConfirmDialogTone,
} from "@/components/ui/confirm-dialog";
import { AppRoute } from "@/constants/app-routes";
import {
  useDeleteSkinProfileHealthContext,
  useDeleteSkinProfileHormonalContext,
  useSkinProfile,
  useSkinProfileAccessLogs,
  useUpdateSkinProfile,
} from "@/hooks/use-skin-profile";
import {
  SkinProfileAccessEventType,
  SkinProfileConsentType,
  type SkinProfileAccessLog,
} from "@/types/skin-profile";

const LOG_PREVIEW_LIMIT = 12;

const LEGAL_LINKS = [
  { labelKey: "privacyPolicy", route: AppRoute.Privacy },
  { labelKey: "termsOfService", route: AppRoute.Terms },
  { labelKey: "cookieNotice", route: AppRoute.Cookies },
] as const;

const SKIN_PROFILE_SECTION_ROUTES = {
  MedicalSafety: `${AppRoute.SkinProfile}/medical-safety`,
  Hormonal: `${AppRoute.SkinProfile}/hormonal`,
} as const;

function getLogsForConsent(
  logs: SkinProfileAccessLog[],
  consentType: SkinProfileConsentType,
): SkinProfileAccessLog[] {
  return logs
    .filter((log) => log.consentType === consentType)
    .slice(0, LOG_PREVIEW_LIMIT);
}

function getLatestEventDate(
  logs: SkinProfileAccessLog[],
  eventType: SkinProfileAccessEventType,
): string | null {
  return logs.find((log) => log.eventType === eventType)?.createdAt ?? null;
}

export function PrivacyTab() {
  const t = useTranslations("settings");
  const tConsent = useTranslations("skinProfile.consentCenter");
  const tMedical = useTranslations("skinProfile.medicalSafety");
  const tHormonal = useTranslations("skinProfile.hormonal");
  const tOptions = useTranslations("skinProfile.options");
  const router = useRouter();

  const profile = useSkinProfile();
  const accessLogs = useSkinProfileAccessLogs({
    enabled: Boolean(profile.data),
  });
  const updateMutation = useUpdateSkinProfile();
  const deleteHealthMutation = useDeleteSkinProfileHealthContext();
  const deleteHormonalMutation = useDeleteSkinProfileHormonalContext();
  const [healthRevokeOpen, setHealthRevokeOpen] = useState(false);
  const [hormonalRevokeOpen, setHormonalRevokeOpen] = useState(false);
  const [locationRevokeOpen, setLocationRevokeOpen] = useState(false);
  const [grantLocationOpen, setGrantLocationOpen] = useState(false);

  const consentLogs = useMemo(() => {
    const logs = accessLogs.data ?? [];

    return {
      health: getLogsForConsent(
        logs,
        SkinProfileConsentType.HealthContextProcessing,
      ),
      location: getLogsForConsent(
        logs,
        SkinProfileConsentType.LocationProcessing,
      ),
      hormonal: getLogsForConsent(
        logs,
        SkinProfileConsentType.HormonalContextProcessing,
      ),
    };
  }, [accessLogs.data]);

  const hasHealth = Boolean(profile.data?.hasHealthContextConsent);
  const hasHormonal = Boolean(profile.data?.hasHormonalContextConsent);
  const hasLocation = Boolean(
    profile.data && (profile.data.countryCode || profile.data.city),
  );
  const activeCount =
    (hasHealth ? 1 : 0) + (hasLocation ? 1 : 0) + (hasHormonal ? 1 : 0);

  const handleRevokeHealth = () => {
    deleteHealthMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(tMedical("deleted"));
        setHealthRevokeOpen(false);
      },
    });
  };

  const handleGrantLocation = (countryCode: string, city: string) => {
    updateMutation.mutate(
      {
        countryCode,
        city: city || null,
        locationConsent: true,
      },
      {
        onSuccess: () => {
          toast.success(tConsent("grantSuccess"));
          setGrantLocationOpen(false);
        },
      },
    );
  };

  const handleRevokeLocation = () => {
    updateMutation.mutate(
      {
        countryCode: null,
        city: null,
        locationConsent: false,
      },
      {
        onSuccess: () => {
          toast.success(tConsent("revokeSuccess"));
          setLocationRevokeOpen(false);
        },
      },
    );
  };

  const handleGrantHealth = () => {
    router.push(SKIN_PROFILE_SECTION_ROUTES.MedicalSafety);
  };

  const handleGrantHormonal = () => {
    router.push(SKIN_PROFILE_SECTION_ROUTES.Hormonal);
  };

  const handleRevokeHormonal = () => {
    deleteHormonalMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(tHormonal("deleted"));
        setHormonalRevokeOpen(false);
      },
    });
  };

  return (
    <div className="space-y-8">
      <SettingsSection
        title={tConsent("title")}
        description={tConsent("description")}
      >
        <div className="space-y-3 px-5 py-4">
          <div className="flex justify-end">
            <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-muted">
              {tConsent("activeCount", { count: activeCount })}
            </span>
          </div>

          <ConsentCard
            title={tConsent("healthLabel")}
            description={tConsent("healthDesc")}
            active={hasHealth}
            encrypted
            grantedAt={
              getLatestEventDate(
                consentLogs.health,
                SkinProfileAccessEventType.ConsentGranted,
              ) ?? (hasHealth ? profile.data?.updatedAt : null)
            }
            lastAccessedAt={getLatestEventDate(
              consentLogs.health,
              SkinProfileAccessEventType.DataAccessed,
            )}
            storedDataItems={
              hasHealth && profile.data
                ? buildHealthStoredItems(
                    profile.data,
                    (key) => tOptions(key),
                    (key) => tConsent(key),
                  )
                : undefined
            }
            accessLogs={consentLogs.health}
            accessLogsLoading={accessLogs.isLoading}
            onGrant={handleGrantHealth}
            onRevoke={() => setHealthRevokeOpen(true)}
            pending={deleteHealthMutation.isPending}
          />

          <ConsentCard
            title={tConsent("locationLabel")}
            description={tConsent("locationDesc")}
            active={hasLocation}
            grantedAt={
              getLatestEventDate(
                consentLogs.location,
                SkinProfileAccessEventType.ConsentGranted,
              ) ?? (hasLocation ? profile.data?.updatedAt : null)
            }
            lastAccessedAt={getLatestEventDate(
              consentLogs.location,
              SkinProfileAccessEventType.DataAccessed,
            )}
            storedDataItems={
              hasLocation && profile.data
                ? buildLocationStoredItems(profile.data, (key) => tConsent(key))
                : undefined
            }
            accessLogs={consentLogs.location}
            accessLogsLoading={accessLogs.isLoading}
            onGrant={() => setGrantLocationOpen(true)}
            onRevoke={() => setLocationRevokeOpen(true)}
            pending={updateMutation.isPending}
          />

          <ConsentCard
            title={tConsent("hormonalLabel")}
            description={tConsent("hormonalDesc")}
            active={hasHormonal}
            encrypted
            grantedAt={
              getLatestEventDate(
                consentLogs.hormonal,
                SkinProfileAccessEventType.ConsentGranted,
              ) ?? (hasHormonal ? profile.data?.updatedAt : null)
            }
            lastAccessedAt={getLatestEventDate(
              consentLogs.hormonal,
              SkinProfileAccessEventType.DataAccessed,
            )}
            storedDataItems={
              hasHormonal && profile.data
                ? buildHormonalStoredItems(
                    profile.data,
                    (key) => tOptions(key),
                    (key) => tConsent(key),
                  )
                : undefined
            }
            accessLogs={consentLogs.hormonal}
            accessLogsLoading={accessLogs.isLoading}
            onGrant={handleGrantHormonal}
            onRevoke={() => setHormonalRevokeOpen(true)}
            pending={deleteHormonalMutation.isPending}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title={t("privacy.legalTitle")}
        description={t("privacy.legalDescription")}
      >
        {LEGAL_LINKS.map((link) => (
          <SettingsRow key={link.route} label={t(`privacy.${link.labelKey}`)}>
            <Link
              href={link.route}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent-strong hover:underline"
            >
              {t("privacy.view")}
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </SettingsRow>
        ))}
      </SettingsSection>

      <ConfirmDialog
        open={healthRevokeOpen}
        onOpenChange={setHealthRevokeOpen}
        title={tMedical("deleteConfirmTitle")}
        description={tMedical("deleteConfirmBody")}
        confirmLabel={tMedical("deleteConfirmAction")}
        cancelLabel={tMedical("deleteCancel")}
        tone={ConfirmDialogTone.Danger}
        onConfirm={handleRevokeHealth}
        isPending={deleteHealthMutation.isPending}
      />

      <ConfirmDialog
        open={locationRevokeOpen}
        onOpenChange={setLocationRevokeOpen}
        title={tConsent("revokeLocationTitle")}
        description={tConsent("revokeLocationBody")}
        confirmLabel={tConsent("revoke")}
        cancelLabel={tMedical("deleteCancel")}
        tone={ConfirmDialogTone.Danger}
        onConfirm={handleRevokeLocation}
        isPending={updateMutation.isPending}
      />

      <ConfirmDialog
        open={hormonalRevokeOpen}
        onOpenChange={setHormonalRevokeOpen}
        title={tHormonal("deleteConfirmTitle")}
        description={tHormonal("deleteConfirmBody")}
        confirmLabel={tMedical("deleteConfirmAction")}
        cancelLabel={tMedical("deleteCancel")}
        tone={ConfirmDialogTone.Danger}
        onConfirm={handleRevokeHormonal}
        isPending={deleteHormonalMutation.isPending}
      />

      <GrantLocationDialog
        open={grantLocationOpen}
        onOpenChange={setGrantLocationOpen}
        onGrant={handleGrantLocation}
        pending={updateMutation.isPending}
      />
    </div>
  );
}
