// src/lib/currency.ts
import { COUNTRIES, getCountryByCode, type CountryInfo } from "./countries";

// Re-export for backward compatibility
export { COUNTRIES, getCountryByCode, type CountryInfo };

// Legacy map (kept for existing components that reference it)
export const CountryCurrencyMap: Record<string, { currencyCode: string; symbol: string; locale: string; decimals: number }> = {};
for (const c of COUNTRIES) {
    CountryCurrencyMap[c.code] = {
        currencyCode: c.currencyCode,
        symbol: c.symbol,
        locale: c.locale,
        decimals: ["JPY", "KRW", "VND", "KPW", "BIF", "CLP", "GNF", "ISK", "KMF", "PYG", "RWF", "UGX", "VUV", "XOF", "XAF", "DJF"].includes(c.currencyCode) ? 0 : 2,
    };
}

export const DEFAULT_CURRENCY_LOCALE = CountryCurrencyMap["US"] || { currencyCode: "USD", symbol: "$", locale: "en-US", decimals: 2 };

/**
 * Formats a given number into a localized currency string.
 * Uses the Intl.NumberFormat API to automatically handle thousand separators and symbol placement.
 */
export function formatCurrency(amount: number, locale: string = "en-US", currencyCode: string = "USD"): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
    }).format(amount);
}

/**
 * Returns the correct number of decimals for a given currency code.
 */
export function getCurrencyDecimals(currencyCode: string): number {
    const info = Object.values(CountryCurrencyMap).find(c => c.currencyCode === currencyCode);
    return info ? info.decimals : 2;
}
