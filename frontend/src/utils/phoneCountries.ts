import { getCountries, getCountryCallingCode } from "libphonenumber-js";

export interface PhoneCountryOption {
  iso: string;
  dialCode: string;
  name: string;
}

const regionNames =
  typeof Intl !== "undefined" && typeof Intl.DisplayNames !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function resolveName(iso: string): string {
  if (regionNames) {
    const label = regionNames.of(iso.toUpperCase());
    if (label) return label;
  }
  return iso.toUpperCase();
}

const options: PhoneCountryOption[] = getCountries()
  .map((iso) => ({
    iso,
    dialCode: `+${getCountryCallingCode(iso)}`,
    name: resolveName(iso),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const optionMap = new Map<string, PhoneCountryOption>();
for (const option of options) {
  optionMap.set(option.iso.toUpperCase(), option);
}

export function getPhoneCountries(): PhoneCountryOption[] {
  return options;
}

export function getCountryOption(
  iso?: string | null,
): PhoneCountryOption | undefined {
  if (!iso) return undefined;
  return optionMap.get(iso.toUpperCase());
}
