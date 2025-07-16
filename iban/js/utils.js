/**
 * @fileoverview Utility functions for the IBAN generator
 * Provides helper functions for country detection, character generation, and validation
 */

import { IBAN_SPECS } from './constants.js';

/**
 * Get suggested country based on user's browser language
 * @returns {string} Country code (defaults to 'NL')
 */
export function getSuggestedCountry() {
  try {
    const lang = navigator.language.toLowerCase();
    const baseLang = lang.split("-")[0];
    
    if (baseLang === "nl" && IBAN_SPECS["NL"]) return "NL";
    if (baseLang === "de" && IBAN_SPECS["DE"]) return "DE";
    if (baseLang === "fr") {
      if ((lang.includes("be") || lang.includes("bru")) && IBAN_SPECS["BE"]) return "BE";
      if (IBAN_SPECS["FR"]) return "FR";
      if (IBAN_SPECS["BE"]) return "BE";
    }
    if (baseLang === "es" && IBAN_SPECS["ES"]) return "ES";
    if (baseLang === "it" && IBAN_SPECS["IT"]) return "IT";
  } catch (e) {
    console.warn("Could not access navigator.language:", e);
  }
  return "NL";
}

/**
 * Generate random characters based on type
 * @param {number} length - Number of characters to generate
 * @param {string} type - Type of characters ('numeric', 'alphaUpper', 'alphanumericUpper')
 * @returns {string} Generated characters
 */
export function generateRandomChars(length, type) {
  let charset = "";
  
  switch (type) {
    case "numeric":
      charset = "0123456789";
      break;
    case "alphaUpper":
      charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      break;
    case "alphanumericUpper":
      charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      break;
    default:
      throw new Error(`Unknown character type: ${type}`);
  }

  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * Calculate MOD-97 check digits for IBAN validation
 * @param {string} digits - Numeric string to calculate check for
 * @returns {string} Two-digit check string (padded with zero if needed)
 */
export function calculateMod97Check(digits) {
  if (!digits || !/^\d+$/.test(digits)) {
    console.warn(`Invalid Mod97 input: ${digits}`);
    return "00";
  }

  try {
    // Handle large numbers safely without BigInt
    let remainder = 0;
    for (let i = 0; i < digits.length; i++) {
      remainder = (remainder * 10 + parseInt(digits[i])) % 97;
    }

    if (remainder === 0) remainder = 97;
    return remainder < 10 ? `0${remainder}` : `${remainder}`;
  } catch (e) {
    console.error("Error Mod97 check:", e);
    return "99";
  }
}

/**
 * Format IBAN with spaces for better readability
 * @param {string} iban - Raw IBAN string
 * @returns {string} Formatted IBAN with spaces
 */
export function formatIBAN(iban) {
  if (!iban || typeof iban !== 'string') {
    return '';
  }
  
  // Remove any existing spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // Add spaces every 4 characters
  return cleanIban.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Validate IBAN format and checksum
 * @param {string} iban - IBAN to validate
 * @returns {boolean} Whether IBAN is valid
 */
export function validateIBAN(iban) {
  if (!iban || typeof iban !== 'string') {
    return false;
  }
  
  // Remove spaces and convert to uppercase
  const cleanIban = iban.replace(/\s/g, '').toUpperCase();
  
  // Check basic format (2 letters + 2 digits + up to 30 alphanumeric)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleanIban)) {
    return false;
  }
  
  // Check length against known specs
  const countryCode = cleanIban.substring(0, 2);
  const spec = IBAN_SPECS[countryCode];
  if (spec && cleanIban.length !== spec.length) {
    return false;
  }
  
  // Validate MOD-97 checksum
  try {
    const rearranged = cleanIban.substring(4) + cleanIban.substring(0, 4);
    const numericString = rearranged.replace(/[A-Z]/g, (char) => 
      (char.charCodeAt(0) - 55).toString()
    );
    
    // Handle large numbers safely without BigInt
    let remainder = 0;
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
    }
    
    return remainder === 1;
  } catch (e) {
    return false;
  }
}

/**
 * Debounce function to limit rapid function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sanitize user input to prevent XSS and other issues
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove HTML tags iteratively and encode special characters
  let sanitizedInput = input;
  let previousInput;
  do {
    previousInput = sanitizedInput;
    sanitizedInput = sanitizedInput.replace(/<[^>]*>/g, ''); // Remove HTML tags
  } while (sanitizedInput !== previousInput);
  
  return sanitizedInput.replace(/[<>&"']/g, (char) => {
    const entities = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return entities[char] || char;
  });
}