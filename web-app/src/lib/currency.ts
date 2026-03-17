// src/lib/currency.ts

export interface CurrencyInfo {
    currencyCode: string;
    symbol: string;
    locale: string;
    decimals: number;
}

export const CountryCurrencyMap: Record<string, CurrencyInfo> = {
    USA: { currencyCode: "USD", symbol: "$", locale: "en-US", decimals: 2 },
    GBR: { currencyCode: "GBP", symbol: "£", locale: "en-GB", decimals: 2 },
    CAN: { currencyCode: "CAD", symbol: "$", locale: "en-CA", decimals: 2 },
    AUS: { currencyCode: "AUD", symbol: "$", locale: "en-AU", decimals: 2 },
    JPN: { currencyCode: "JPY", symbol: "¥", locale: "ja-JP", decimals: 0 },
    KEN: { currencyCode: "KES", symbol: "KSh", locale: "en-KE", decimals: 2 },
    ZAF: { currencyCode: "ZAR", symbol: "R", locale: "en-ZA", decimals: 2 },
    IND: { currencyCode: "INR", symbol: "₹", locale: "hi-IN", decimals: 2 },
    EU: { currencyCode: "EUR", symbol: "€", locale: "de-DE", decimals: 2 }, // Using Germany as default EU locale
};

export const DEFAULT_CURRENCY_LOCALE = CountryCurrencyMap["USA"];

/**
 * Formats a given number into a localized currency string.
 * Uses the Intl.NumberFormat API to automatically handle thousand separators and symbol placement.
 */
export function formatCurrency(amount: number, locale: string = "en-US", currencyCode: string = "USD"): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        // Depending on requirements, we might want to strictly enforce decimal places
        // The API defaults are usually correct (e.g., 0 for JPY, 2 for USD)
    }).format(amount);
}

/**
 * Returns the correct number of decimals for a given currency code.
 */
export function getCurrencyDecimals(currencyCode: string): number {
    const info = Object.values(CountryCurrencyMap).find(c => c.currencyCode === currencyCode);
    return info ? info.decimals : 2; // Default to 2
}
