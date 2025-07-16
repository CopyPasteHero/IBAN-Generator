/**
 * @fileoverview UI controller for the IBAN generator
 * Manages UI updates, form population, and user interactions
 */

import { IBAN_SPECS, COUNTRY_NAMES, BANK_DATA } from './constants.js';
import { clearError } from './error-handler.js';
import { AccessibilityAnnouncer, announceSelectionChange } from './accessibility.js';

/**
 * Populate the country select dropdown with sorted options
 * @param {HTMLSelectElement} countrySelect - Country select element
 */
export function populateCountrySelect(countrySelect) {
  if (!countrySelect) {
    console.error('Country select element not found');
    return;
  }

  countrySelect.innerHTML = "";
  const sortedCountries = Object.keys(IBAN_SPECS).sort((a, b) =>
    (COUNTRY_NAMES[a] || a).localeCompare(COUNTRY_NAMES[b] || b)
  );
  
  const fragment = document.createDocumentFragment();
  
  sortedCountries.forEach((countryCode) => {
    const option = document.createElement("option");
    option.value = countryCode;
    option.textContent = COUNTRY_NAMES[countryCode] || countryCode;
    fragment.appendChild(option);
  });
  
  countrySelect.appendChild(fragment);
}

/**
 * Update bank selector based on selected country
 * @param {Object} elements - DOM elements object
 */
export function updateBankSelector(elements) {
  const { 
    countrySelect, bankContainer, bankSelect, bankError 
  } = elements;
  
  if (!countrySelect || !bankContainer || !bankSelect) {
    console.error('Required elements not found for bank selector update');
    return;
  }

  const selectedCountry = countrySelect.value;
  const banksForCountryData = BANK_DATA[selectedCountry];
  const helpTextEl = document.getElementById("bank-help");
  const wasHidden = bankContainer.classList.contains("hidden");
  
  bankSelect.innerHTML = "";

  if (banksForCountryData && Object.keys(banksForCountryData).length > 0) {
    const sortedBanks = Object.entries(banksForCountryData).sort((a, b) =>
      (a[1].name || a[0]).localeCompare(b[1].name || b[0])
    );
    
    const fragment = document.createDocumentFragment();
    let isFirstBank = true;

    for (const [bic, bank] of sortedBanks) {
      const option = document.createElement("option");
      option.value = bic;
      option.textContent = bank.name || bic;
      if (isFirstBank) {
        option.selected = true;
        isFirstBank = false;
      }
      fragment.appendChild(option);
    }
    
    bankSelect.appendChild(fragment);
    bankContainer.classList.remove("hidden");
    bankSelect.disabled = false;
    
    if (helpTextEl) {
      helpTextEl.textContent = `Optional: Select a bank for ${COUNTRY_NAMES[selectedCountry] || selectedCountry}.`;
    }

    // Announce to screen readers when bank selector becomes available
    if (wasHidden) {
      const countryName = COUNTRY_NAMES[selectedCountry] || selectedCountry;
      AccessibilityAnnouncer.announce(
        `Bank selection is now available for ${countryName}.`
      );
    }
  } else {
    bankContainer.classList.add("hidden");
    bankSelect.disabled = true;
    
    if (helpTextEl) {
      helpTextEl.textContent = `No specific banks available for ${COUNTRY_NAMES[selectedCountry] || selectedCountry}. A random valid bank code will be used.`;
    }

    // Announce to screen readers when bank selector becomes unavailable
    if (!wasHidden) {
      const countryName = COUNTRY_NAMES[selectedCountry] || selectedCountry;
      AccessibilityAnnouncer.announce(
        `Bank selection is not needed for ${countryName}. A random valid bank code will be used.`
      );
    }
  }

  clearError(bankSelect, bankError);
}

/**
 * Clear all result displays
 * @param {Object} elements - DOM elements object
 */
export function clearResults(elements) {
  const {
    singleResultContainer, bulkResultContainer, resultSection,
    ibanResultSpan, copyMessage, bulkIbansTextarea, bulkCountSpan, bulkHeading
  } = elements;

  if (singleResultContainer) singleResultContainer.classList.add("hidden");
  if (bulkResultContainer) bulkResultContainer.classList.add("hidden");
  if (resultSection) resultSection.classList.add("hidden");
  if (ibanResultSpan) ibanResultSpan.textContent = "";
  if (copyMessage) copyMessage.textContent = "";
  if (bulkIbansTextarea) bulkIbansTextarea.value = "";
  if (bulkCountSpan) bulkCountSpan.textContent = "0";
  if (bulkHeading) bulkHeading.textContent = "Generated IBANs (0)";
}

/**
 * Display a single generated IBAN
 * @param {string} iban - The generated IBAN
 * @param {Object} elements - DOM elements object
 */
export function displaySingleIBAN(iban, elements) {
  const { 
    resultSection, singleResultContainer, bulkResultContainer, 
    ibanResultSpan 
  } = elements;

  if (!iban || !ibanResultSpan) {
    console.error('Invalid IBAN or missing result element');
    return;
  }

  ibanResultSpan.textContent = iban;
  
  if (singleResultContainer) singleResultContainer.classList.remove("hidden");
  if (bulkResultContainer) bulkResultContainer.classList.add("hidden");
  if (resultSection) resultSection.classList.remove("hidden");
}

/**
 * Display bulk generated IBANs
 * @param {Array<string>} ibans - Array of generated IBANs
 * @param {number} failureCount - Number of failed generations
 * @param {Object} elements - DOM elements object
 */
export function displayBulkIBANs(ibans, failureCount, elements) {
  const {
    resultSection, singleResultContainer, bulkResultContainer,
    bulkHeading, bulkCountSpan, bulkIbansTextarea
  } = elements;

  if (!Array.isArray(ibans) || ibans.length === 0) {
    console.error('No valid IBANs to display');
    return;
  }

  if (bulkHeading) bulkHeading.textContent = `Generated IBANs (${ibans.length})`;
  if (bulkCountSpan) bulkCountSpan.textContent = ibans.length.toString();
  if (bulkIbansTextarea) bulkIbansTextarea.value = ibans.join("\n");
  
  if (singleResultContainer) singleResultContainer.classList.add("hidden");
  if (bulkResultContainer) bulkResultContainer.classList.remove("hidden");
  if (resultSection) resultSection.classList.remove("hidden");
}

/**
 * Get information about the selected bank
 * @param {Object} elements - DOM elements object
 * @returns {Object|null} Bank information or null
 */
export function getSelectedBankInfo(elements) {
  const { bankContainer, bankSelect, countrySelect } = elements;
  
  if (!bankContainer || !bankSelect || !countrySelect) {
    return null;
  }

  if (bankContainer.classList.contains("hidden") || !bankSelect.value) {
    return null;
  }

  const countryBanksData = BANK_DATA[countrySelect.value];
  return countryBanksData && countryBanksData[bankSelect.value]
    ? countryBanksData[bankSelect.value]
    : null;
}

/**
 * Scroll to results section smoothly
 * @param {Object} elements - DOM elements object
 */
export function scrollToResults(elements) {
  const { resultSection, singleResultContainer, bulkResultContainer } = elements;
  
  if (!resultSection) return;
  
  const hasResults = (singleResultContainer && !singleResultContainer.classList.contains("hidden")) ||
                    (bulkResultContainer && !bulkResultContainer.classList.contains("hidden"));
  
  if (hasResults) {
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Handle copy to clipboard with fallback for older browsers
 * @param {string} text - Text to copy
 * @param {HTMLElement} messageElement - Element to show copy status
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text, messageElement) {
  if (!text) {
    console.error('No text provided for copying');
    return false;
  }

  // Modern clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      showCopyMessage(messageElement, "Copied!");
      return true;
    } catch (err) {
      console.warn("Clipboard API failed, trying fallback:", err);
    }
  }

  // Fallback for older browsers
  try {
    const tempInput = document.createElement("textarea");
    tempInput.value = text;
    tempInput.style.position = "fixed";
    tempInput.style.left = "-9999px";
    tempInput.setAttribute("readonly", "");
    document.body.appendChild(tempInput);
    
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // For mobile devices
    
    const successful = document.execCommand("copy");
    document.body.removeChild(tempInput);
    
    if (successful) {
      showCopyMessage(messageElement, "Copied!");
      return true;
    } else {
      showCopyMessage(messageElement, "Copy failed. Please copy manually.");
      return false;
    }
  } catch (err) {
    console.error("Fallback copy failed:", err);
    showCopyMessage(messageElement, "Copy not supported. Please copy manually.");
    return false;
  }
}

/**
 * Show copy status message
 * @param {HTMLElement} messageElement - Element to show message in
 * @param {string} message - Message to display
 * @private
 */
function showCopyMessage(messageElement, message) {
  if (!messageElement) return;
  
  messageElement.textContent = message;
  messageElement.classList.remove("hidden");
  messageElement.setAttribute("role", "status");

  setTimeout(() => {
    messageElement.textContent = "";
    messageElement.classList.add("hidden");
    messageElement.removeAttribute("role");
  }, 3000);
}

/**
 * Create and trigger download of text file
 * @param {string} content - File content
 * @param {string} filename - Filename for download
 */
export function downloadTextFile(content, filename) {
  if (!content) {
    console.error('No content provided for download');
    return;
  }

  try {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'ibans.txt';
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Download failed:', error);
  }
}