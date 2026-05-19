// 1 USD = 12,000 so'm
export const USD_TO_SOM = 12000;

/**
 * Converts a dollar amount to so'm and formats it with dots as thousands separators.
 * e.g. formatSom(18) → "216.000 so'm"
 *      formatSom(103.5) → "1.242.000 so'm"
 */
export function formatSom(dollars) {
  const som = Math.round(Number(dollars) * USD_TO_SOM);
  return som.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " so'm";
}

/**
 * Formats a raw so'm value (no conversion) with dot thousands separators.
 * e.g. formatSomRaw(216000) → "216.000 so'm"
 */
export function formatSomRaw(som) {
  const rounded = Math.round(Number(som));
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " so'm";
}

/** Rate per hour in so'm (was $18/hr) */
export const RATE_PER_HOUR_SOM = 18 * USD_TO_SOM; // 216,000 so'm/hr
