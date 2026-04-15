import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LocationStepFieldsProps {
  ethnicityLabel: string;
  ethnicityValue: string;
  ethnicityOptions: string[];
  countryLabel: string;
  countryHelp: string;
  countryPlaceholder: string;
  countryValue: string;
  countryError?: string;
  cityLabel: string;
  cityPlaceholder: string;
  cityValue: string;
  locationConsentLabel: string;
  locationConsentValue: boolean;
  showLocationConsent: boolean;
  onEthnicityBlur: () => void;
  onEthnicityChange: (value: string) => void;
  onCountryBlur: () => void;
  onCountryChange: (value: string) => void;
  onCityBlur: () => void;
  onCityChange: (value: string) => void;
  onLocationConsentChange: (value: boolean) => void;
  translateOption: (value: string) => string;
  selectPlaceholder: string;
}

export function LocationStepFields({
  ethnicityLabel,
  ethnicityValue,
  ethnicityOptions,
  countryLabel,
  countryHelp,
  countryPlaceholder,
  countryValue,
  countryError,
  cityLabel,
  cityPlaceholder,
  cityValue,
  locationConsentLabel,
  locationConsentValue,
  showLocationConsent,
  onEthnicityBlur,
  onEthnicityChange,
  onCountryBlur,
  onCountryChange,
  onCityBlur,
  onCityChange,
  onLocationConsentChange,
  translateOption,
  selectPlaceholder,
}: LocationStepFieldsProps) {
  return (
    <>
      <div>
        <Label className="block text-sm font-medium" htmlFor="ethnicity">
          {ethnicityLabel}
        </Label>
        <Select
          value={ethnicityValue || undefined}
          onValueChange={(nextValue) =>
            onEthnicityChange(nextValue === '__empty__' ? '' : nextValue)
          }
        >
          <SelectTrigger id="ethnicity" name="ethnicity" onBlur={onEthnicityBlur} className="mt-2">
            <SelectValue placeholder={selectPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__empty__">{selectPlaceholder}</SelectItem>
            {ethnicityOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {translateOption(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="block text-sm font-medium" htmlFor="countryCode">
          {countryLabel}
        </Label>
        <p className="mt-1 text-xs text-muted">{countryHelp}</p>
        <Input
          id="countryCode"
          name="countryCode"
          type="text"
          value={countryValue}
          onBlur={onCountryBlur}
          onChange={(event) => onCountryChange(event.target.value)}
          placeholder={countryPlaceholder}
          className="mt-2"
          aria-invalid={Boolean(countryError)}
          aria-describedby={countryError ? 'countryCode-error' : undefined}
        />
        {countryError ? (
          <p id="countryCode-error" className="mt-1 text-xs text-danger" role="alert">
            {countryError}
          </p>
        ) : null}
      </div>

      <div>
        <Label className="block text-sm font-medium" htmlFor="city">
          {cityLabel}
        </Label>
        <Input
          id="city"
          name="city"
          type="text"
          value={cityValue}
          onBlur={onCityBlur}
          onChange={(event) => onCityChange(event.target.value)}
          placeholder={cityPlaceholder}
          className="mt-2"
        />
      </div>

      {showLocationConsent ? (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface/80 p-4">
          <Checkbox
            id="locationConsent"
            checked={locationConsentValue}
            onCheckedChange={(nextValue) =>
              onLocationConsentChange(Boolean(nextValue))
            }
            className="mt-1"
          />
          <Label
            htmlFor="locationConsent"
            className="text-sm leading-6 font-normal text-muted"
          >
            {locationConsentLabel}
          </Label>
        </div>
      ) : null}
    </>
  );
}
