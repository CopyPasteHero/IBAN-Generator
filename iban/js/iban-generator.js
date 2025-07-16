/**
 * @fileoverview Core IBAN generation logic
 * Handles the generation of valid IBAN numbers for supported countries
 */

import { IBAN_SPECS } from './constants.js';
import { generateRandomChars, calculateMod97Check, formatIBAN } from './utils.js';
import { IBANGenerationError, logError } from './error-handler.js';

/**
 * Generate a single IBAN for the specified country and bank
 * @param {string} country - Country code
 * @param {Object|null} bankInfo - Bank information object with code and name
 * @returns {string|null} Generated IBAN or null if generation failed
 */
export function generateIBAN(country, bankInfo = null) {
  const spec = IBAN_SPECS[country];

  if (!spec) {
    const error = new IBANGenerationError(`IBAN spec missing: ${country}`, country);
    logError(error, 'generateIBAN');
    return null;
  }

  let bankCodePart = "";
  let branchCodePart = "";
  let accountPart = "";
  let nationalCheckPart = "";
  const bbanBankCode = bankInfo ? bankInfo.code : null;

  try {
    switch (country) {
      case "NL":
        bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        break;
      case "DE":
        bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        break;
      case "BE":
        bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        nationalCheckPart = calculateMod97Check((bankCodePart + accountPart).replace(/\D/g, ""));
        break;
      case "FR":
        bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        branchCodePart = generateRandomChars(spec.branchCodeLength, spec.branchCodeType);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        nationalCheckPart = generateRandomChars(spec.nationalCheckLength, spec.nationalCheckType);
        break;
      case "ES":
        bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        branchCodePart = generateRandomChars(spec.branchCodeLength, spec.branchCodeType);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        nationalCheckPart = generateRandomChars(spec.nationalCheckLength, spec.nationalCheckType);
        break;
      case "IT":
        nationalCheckPart = generateRandomChars(spec.nationalCheckLength, spec.nationalCheckType);
        bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        branchCodePart = generateRandomChars(spec.branchCodeLength, spec.branchCodeType);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        break;
      default:
        const error = new IBANGenerationError(`Unhandled country: ${country}`, country);
        logError(error, 'generateIBAN - country switch');
        return null;
    }
  } catch (error) {
    const wrappedError = new IBANGenerationError(
      `Error generating BBAN parts for ${country}`, 
      country, 
      { originalError: error.message }
    );
    logError(wrappedError, 'generateIBAN - BBAN generation');
    return null;
  }

  let bban = "";

  // Assemble BBAN according to country-specific format
  switch (country) {
    case "IT":
      bban = nationalCheckPart + bankCodePart + branchCodePart + accountPart;
      break;
    case "FR":
      bban = bankCodePart + branchCodePart + accountPart + nationalCheckPart;
      break;
    case "ES":
      bban = bankCodePart + branchCodePart + nationalCheckPart + accountPart;
      break;
    case "BE":
      bban = bankCodePart + accountPart + nationalCheckPart;
      break;
    default:
      bban = (bankCodePart || "") + (branchCodePart || "") + (accountPart || "") + (nationalCheckPart || "");
      break;
  }

  const expectedBbanLength = spec.length - 4;

  if (bban.length !== expectedBbanLength) {
    console.warn(
      `Adjusting BBAN length for ${country}: expected ${expectedBbanLength}, got ${bban.length}.`
    );
    bban = bban.length < expectedBbanLength
      ? bban.padEnd(expectedBbanLength, "0")
      : bban.substring(0, expectedBbanLength);

    if (bban.length !== expectedBbanLength) {
      const error = new IBANGenerationError(
        `BBAN length mismatch for ${country} persists. BBAN: ${bban}`, 
        country,
        { expectedLength: expectedBbanLength, actualLength: bban.length, bban }
      );
      logError(error, 'generateIBAN - BBAN length validation');
      return null;
    }
  }

  const ibanWithoutCheck = `${country}00${bban}`;
  const checkDigits = calculateIBANCheckDigits(ibanWithoutCheck);

  if (!checkDigits) {
    const error = new IBANGenerationError(
      `Failed to calculate check digits for ${country}`,
      country,
      { bban }
    );
    logError(error, 'generateIBAN - check digit calculation');
    return null;
  }

  return `${country}${checkDigits}${bban}`;
}

/**
 * Generate multiple IBANs for bulk operations
 * @param {string} country - Country code
 * @param {Object|null} bankInfo - Bank information object
 * @param {number} quantity - Number of IBANs to generate
 * @returns {Object} Object with generated IBANs array and failure count
 */
export function generateBulkIBANs(country, bankInfo, quantity) {
  const ibans = [];
  let failures = 0;
  const useSpecificBank = !!bankInfo;

  // Use DocumentFragment for better performance if we need to manipulate DOM
  for (let i = 0; i < quantity; i++) {
    const currentBankInfo = useSpecificBank ? bankInfo : null;
    const iban = generateIBAN(country, currentBankInfo);

    if (iban) {
      ibans.push(iban);
    } else {
      failures++;
    }
  }

  return {
    ibans,
    failures,
    successCount: ibans.length
  };
}

/**
 * Calculate IBAN check digits using MOD-97 algorithm
 * Avoids BigInt for better browser compatibility
 * @param {string} iban - IBAN with placeholder check digits (00)
 * @returns {string|null} Two-digit check string or null if calculation failed
 */
export function calculateIBANCheckDigits(iban) {
  const rearranged = iban.substring(4) + iban.substring(0, 4);
  let numerical = "";

  for (let i = 0; i < rearranged.length; i++) {
    const char = rearranged.charAt(i).toUpperCase();

    if (char >= "A" && char <= "Z") {
      numerical += (char.charCodeAt(0) - 55).toString();
    } else if (char >= "0" && char <= "9") {
      numerical += char;
    } else {
      console.error(`Invalid character in IBAN: ${char}`);
      return null;
    }
  }

  try {
    // Handle large numbers safely without BigInt
    let remainder = 0;
    for (let i = 0; i < numerical.length; i++) {
      remainder = (remainder * 10 + parseInt(numerical[i])) % 97;
    }

    const checkDigitInt = 98 - remainder;
    return checkDigitInt < 10 ? `0${checkDigitInt}` : `${checkDigitInt}`;
  } catch (e) {
    console.error("Error calculating check digits:", e, numerical);
    return null;
  }
}

/**
 * Format IBAN with spaces for display
 * @param {string} iban - Raw IBAN string
 * @returns {string} Formatted IBAN with spaces every 4 characters
 */
export function formatIBANForDisplay(iban) {
  return formatIBAN(iban);
}