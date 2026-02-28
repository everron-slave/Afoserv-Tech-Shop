/**
 * Currency conversion utilities for FCFA (West African CFA franc)
 * Conversion rate: 1 USD = 600 FCFA (approximate)
 */

const USD_TO_FCFA_RATE = 600;

/**
 * Convert USD amount to FCFA
 * @param usdAmount Amount in USD
 * @returns Amount in FCFA (rounded to nearest whole number)
 */
export function usdToFcfa(usdAmount: number): number {
  return Math.round(usdAmount * USD_TO_FCFA_RATE);
}

/**
 * Format FCFA amount with proper formatting
 * @param fcfaAmount Amount in FCFA
 * @returns Formatted string with FCFA symbol
 */
export function formatFcfa(fcfaAmount: number): string {
  // Format with thousands separators
  const formatted = fcfaAmount.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return `${formatted} FCFA`;
}

/**
 * Convert USD to FCFA and format it
 * @param usdAmount Amount in USD
 * @returns Formatted FCFA string
 */
export function usdToFcfaFormatted(usdAmount: number): string {
  const fcfaAmount = usdToFcfa(usdAmount);
  return formatFcfa(fcfaAmount);
}

/**
 * Format USD amount as FCFA for display
 * This is a convenience function that combines conversion and formatting
 * @param usdAmount Amount in USD
 * @returns Formatted FCFA string
 */
export function formatPrice(usdAmount: number): string {
  return usdToFcfaFormatted(usdAmount);
}

/**
 * Calculate total price in FCFA for items with quantity
 * @param pricePerItemUSD Price per item in USD
 * @param quantity Number of items
 * @returns Formatted total price in FCFA
 */
export function calculateTotalPrice(pricePerItemUSD: number, quantity: number): string {
  const totalUSD = pricePerItemUSD * quantity;
  return usdToFcfaFormatted(totalUSD);
}