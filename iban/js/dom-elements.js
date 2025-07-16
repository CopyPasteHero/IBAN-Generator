/**
 * @fileoverview DOM element references for the IBAN generator
 * Centralizes all DOM queries for better performance and maintainability
 */

/**
 * Cache of DOM elements to avoid repeated queries
 * @type {Object}
 */
const domCache = {};

/**
 * Get a DOM element by ID with caching
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} The DOM element
 */
function getElementById(id) {
  if (!domCache[id]) {
    domCache[id] = document.getElementById(id);
  }
  return domCache[id];
}

/**
 * Form and input elements
 */
export const formElements = {
  get ibanForm() { return getElementById("iban-form"); },
  get countrySelect() { return getElementById("country"); },
  get bankContainer() { return getElementById("bank-container"); },
  get bankSelect() { return getElementById("bank"); },
  get quantityInput() { return getElementById("quantity"); },
};

/**
 * Result display elements
 */
export const resultElements = {
  get resultSection() { return getElementById("result-section"); },
  get singleResultContainer() { return getElementById("single-result-container"); },
  get bulkResultContainer() { return getElementById("bulk-result-container"); },
};

/**
 * Single result elements
 */
export const singleResultElements = {
  get ibanResultSpan() { return getElementById("iban-result"); },
  get copyBtn() { return getElementById("copy-btn"); },
  get copyMessage() { return getElementById("copy-message"); },
};

/**
 * Bulk result elements
 */
export const bulkResultElements = {
  get bulkCountSpan() { return getElementById("bulk-count"); },
  get bulkIbansTextarea() { return getElementById("bulk-ibans"); },
  get downloadBulkBtn() { return getElementById("download-bulk"); },
  get bulkHeading() { return getElementById("bulk-heading"); },
};

/**
 * Error message elements
 */
export const errorElements = {
  get countryError() { return getElementById("country-error"); },
  get bankError() { return getElementById("bank-error"); },
  get quantityError() { return getElementById("quantity-error"); },
};

/**
 * Get all DOM elements in a single object for compatibility with existing code
 * @returns {Object} Object containing all DOM element references
 */
export function getAllElements() {
  return {
    ...formElements,
    ...resultElements,
    ...singleResultElements,
    ...bulkResultElements,
    ...errorElements,
  };
}

/**
 * Clear the DOM cache (useful for testing or if DOM structure changes)
 */
export function clearDOMCache() {
  Object.keys(domCache).forEach(key => delete domCache[key]);
}