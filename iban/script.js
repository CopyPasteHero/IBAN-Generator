/**
 * IBAN Generator - Main Script
 * Generates mathematically valid IBANs for multiple European countries
 * @author CopyPasteHero
 * @license MIT
 */

document.addEventListener("DOMContentLoaded", function () {
  /**
   * Accessibility Announcer Singleton
   * Provides screen reader announcements with debouncing
   * @type {Object}
   */
  const AccessibilityAnnouncer = {
    element: null,
    timer: null,
    clearTimer: null, // ensure this is initialized
    DEBOUNCE_DELAY: 400, // (1) Add a default debounce delay

    /**
     * Initialize the accessibility announcer element
     */
    init() {
      if (!this.element) {
        this.element = document.createElement("div");
        this.element.setAttribute("aria-live", "polite");
        this.element.setAttribute("aria-atomic", "true");
        this.element.className = "sr-only";
        document.body.appendChild(this.element);
      }
    },

    /**
     * Announce a message to screen readers
     * @param {string} message - The message to announce
     * @param {number} [delay=400] - Delay before announcing in milliseconds
     */
    announce(message, delay = this.DEBOUNCE_DELAY) {
      this.init();

      // Debounce rapid announcements
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (this.clearTimer) {
        clearTimeout(this.clearTimer); // (2) Always clear previous clearTimer
      }

      this.timer = setTimeout(() => {
        this.element.textContent = message;

        // Clear after screen readers process it
        this.clearTimer = setTimeout(() => {
          this.element.textContent = "";
        }, 3000);
      }, delay);
    },

    /**
     * Clean up timers and remove announcer element
     */
    cleanup() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (this.clearTimer) {
        clearTimeout(this.clearTimer);
      } // (2) Clear clearTimer on cleanup
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    },
  };

  // --- DOM Elements ---
  const ibanForm = document.getElementById("iban-form");
  const countrySelect = document.getElementById("country");
  const bankContainer = document.getElementById("bank-container");
  const bankSelect = document.getElementById("bank");
  const quantityInput = document.getElementById("quantity");

  // Result Sections
  const resultSection = document.getElementById("result-section");
  const singleResultContainer = document.getElementById("single-result-container");
  const bulkResultContainer = document.getElementById("bulk-result-container");

  // Single Result Elements
  const ibanResultSpan = document.getElementById("iban-result");
  const copyBtn = document.getElementById("copy-btn");
  const copyMessage = document.getElementById("copy-message");

  // Bulk Result Elements
  const bulkCountSpan = document.getElementById("bulk-count");
  const bulkIbansTextarea = document.getElementById("bulk-ibans");
  const downloadBulkBtn = document.getElementById("download-bulk");
  const bulkHeading = document.getElementById("bulk-heading");

  // Error Message Elements
  const countryError = document.getElementById("country-error");
  const bankError = document.getElementById("bank-error");
  const quantityError = document.getElementById("quantity-error");

  /**
   * IBAN specifications for each supported country
   * Defines the structure and validation rules for each country's IBAN format
   * @type {Object.<string, Object>}
   */
  const IBAN_SPECS = {
    NL: {
      length: 18,
      bankCodeLength: 4,
      accountLength: 10,
      bankCodeType: "alphaUpper",
      accountType: "numeric",
    },
    DE: {
      length: 22,
      bankCodeLength: 8,
      accountLength: 10,
      bankCodeType: "numeric",
      accountType: "numeric",
    },
    BE: {
      length: 16,
      bankCodeLength: 3,
      accountLength: 7,
      nationalCheckLength: 2,
      bankCodeType: "numeric",
      accountType: "numeric",
      nationalCheckType: "numeric",
    },
    FR: {
      length: 27,
      bankCodeLength: 5,
      branchCodeLength: 5,
      accountLength: 11,
      nationalCheckLength: 2,
      bankCodeType: "numeric",
      branchCodeType: "numeric",
      accountType: "alphanumericUpper",
      nationalCheckType: "numeric",
    },
    ES: {
      length: 24,
      bankCodeLength: 4,
      branchCodeLength: 4,
      nationalCheckLength: 2,
      accountLength: 10,
      bankCodeType: "numeric",
      branchCodeType: "numeric",
      nationalCheckType: "numeric",
      accountType: "numeric",
    },
    IT: {
      length: 27,
      nationalCheckLength: 1,
      bankCodeLength: 5,
      branchCodeLength: 5,
      accountLength: 12,
      nationalCheckType: "alphaUpper",
      bankCodeType: "numeric",
      branchCodeType: "numeric",
      accountType: "alphanumericUpper",
    },
  };

  /**
   * Human-readable country names mapped to country codes
   * @type {Object.<string, string>}
   */
  const COUNTRY_NAMES = {
    NL: "Netherlands",
    DE: "Germany",
    BE: "Belgium",
    FR: "France",
    ES: "Spain",
    IT: "Italy",
  };

  /**
   * Bank data for each country including bank names and codes
   * @type {Object.<string, Object>}
   */
  const BANK_DATA = {
    NL: {
      ABNA: { name: "ABN AMRO", code: "ABNA" },
      INGB: { name: "ING", code: "INGB" },
      RABO: { name: "Rabobank", code: "RABO" },
      SNSB: { name: "SNS Bank", code: "SNSB" },
      ASNB: { name: "ASN Bank", code: "ASNB" },
      RBRB: { name: "RegioBank", code: "RBRB" },
      KNAB: { name: "Knab", code: "KNAB" },
      BUNQ: { name: "Bunq", code: "BUNQ" },
      TRIO: { name: "Triodos Bank", code: "TRIO" },
      FVLB: { name: "Van Lanschot", code: "FVLB" },
    },
    DE: {
      DEUTDEFF: { name: "Deutsche Bank", code: "50070010" },
      COBADEFF: { name: "Commerzbank", code: "50040000" },
      PBNKDEFF: { name: "Postbank", code: "50010060" },
      GENODEFF: { name: "DZ Bank", code: "50060400" },
    },
    BE: {
      GEBABEBB: { name: "BNP Paribas Fortis", code: "001" },
      BBRUBEBB: { name: "ING Belgium", code: "310" },
      KREDBEBB: { name: "KBC Bank", code: "734" },
      GKCCBEBB: { name: "Belfius Bank", code: "068" },
    },
    FR: {
      BNPAFRPP: { name: "BNP Paribas", code: "30004" },
      SOGEFRPP: { name: "Société Générale", code: "30003" },
      CRLYFRPP: { name: "Crédit Lyonnais (LCL)", code: "30002" },
      CEPAFRPP: { name: "Caisse d'Epargne", code: "11306" },
    },
    ES: {
      BSCHESMM: { name: "Banco Santander", code: "0049" },
      BBVAESMM: { name: "BBVA", code: "0182" },
      CAIXESBB: { name: "CaixaBank", code: "2100" },
      SABBESBB: { name: "Banco Sabadell", code: "0081" },
    },
    IT: {
      UNCRITMM: { name: "UniCredit", code: "02008" },
      BCITITMM: { name: "Intesa Sanpaolo", code: "03069" },
      BNLIITRR: { name: "BNL", code: "01005" },
      MPSITIT1: { name: "Monte dei Paschi", code: "01030" },
    },
  };

  /**
   * Get suggested country based on user's browser language
   * @returns {string} Suggested country code (defaults to "NL" if no match)
   */
  function getSuggestedCountry() {
    try {
      const lang = navigator.language.toLowerCase();
      const baseLang = lang.split("-")[0];
      if (baseLang === "nl" && IBAN_SPECS["NL"]) {
        return "NL";
      }
      if (baseLang === "de" && IBAN_SPECS["DE"]) {
        return "DE";
      }
      if (baseLang === "fr") {
        if ((lang.includes("be") || lang.includes("bru")) && IBAN_SPECS["BE"]) {
          return "BE";
        }
        if (IBAN_SPECS["FR"]) {
          return "FR";
        }
        if (IBAN_SPECS["BE"]) {
          return "BE";
        }
      }
      if (baseLang === "es" && IBAN_SPECS["ES"]) {
        return "ES";
      }
      if (baseLang === "it" && IBAN_SPECS["IT"]) {
        return "IT";
      }
    } catch (e) {
      console.warn("Could not access navigator.language:", e);
    }
    return "NL";
  }

  /**
   * Populate the country select dropdown with sorted country options
   */
  function populateCountrySelect() {
    // countrySelect.innerHTML = "";
    while (countrySelect.firstChild) {
      countrySelect.removeChild(countrySelect.firstChild);
    } // (3) Safer clearing
    const sortedCountries = Object.keys(IBAN_SPECS).sort((a, b) =>
      (COUNTRY_NAMES[a] || a).localeCompare(COUNTRY_NAMES[b] || b),
    );
    sortedCountries.forEach((countryCode) => {
      const option = document.createElement("option");
      option.value = countryCode;
      option.textContent = COUNTRY_NAMES[countryCode] || countryCode;
      countrySelect.appendChild(option);
    });
  }

  /**
   * Update the bank selector based on the selected country
   * Shows/hides bank selector and populates it with banks for the selected country
   */
  function updateBankSelector() {
    const selectedCountry = countrySelect.value;
    const banksForCountryData = BANK_DATA[selectedCountry];
    const helpTextEl = document.getElementById("bank-help");
    const wasHidden = bankContainer.classList.contains("hidden");
    // bankSelect.innerHTML = "";
    while (bankSelect.firstChild) {
      bankSelect.removeChild(bankSelect.firstChild);
    } // (3) Safer clearing

    if (banksForCountryData && Object.keys(banksForCountryData).length > 0) {
      const sortedBanks = Object.entries(banksForCountryData).sort((a, b) =>
        (a[1].name || a[0]).localeCompare(b[1].name || b[0]),
      );
      let isFirstBank = true;

      for (const [bic, bank] of sortedBanks) {
        const option = document.createElement("option");
        option.value = bic;
        option.textContent = bank.name || bic;
        bankSelect.appendChild(option);
        if (isFirstBank) {
          option.selected = true;
          isFirstBank = false;
        }
      }

      bankContainer.classList.remove("hidden");
      bankSelect.disabled = false;
      if (helpTextEl) {
        const countryName = COUNTRY_NAMES[selectedCountry] || selectedCountry;
        helpTextEl.textContent = `Optional: Select a bank for ${countryName}.`;
      }

      // Announce to screen readers when bank selector becomes available
      if (wasHidden) {
        const countryName = COUNTRY_NAMES[selectedCountry] || selectedCountry;
        AccessibilityAnnouncer.announce(`Bank selection is now available for ${countryName}.`);
      }
    } else {
      bankContainer.classList.add("hidden");
      bankSelect.disabled = true;
      if (helpTextEl) {
        const countryName = COUNTRY_NAMES[selectedCountry] || selectedCountry;
        helpTextEl.textContent =
          `No specific banks available for ${countryName}. ` +
          "A random valid bank code will be used.";
      }

      // Announce to screen readers when bank selector becomes unavailable
      if (!wasHidden) {
        const countryName = COUNTRY_NAMES[selectedCountry] || selectedCountry;
        AccessibilityAnnouncer.announce(
          `Bank selection is not needed for ${countryName}. ` +
            "A random valid bank code will be used.",
        );
      }
    }

    clearError(bankSelect, bankError);
  }

  // --- Event Handlers ---
  function handleCountryChange() {
    updateBankSelector();
    clearResults();
    clearAllErrors();
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    clearResults();
    clearAllErrors();

    const country = countrySelect.value;
    const quantity = parseInt(quantityInput.value, 10);
    const bankCodeInfo = getSelectedBankInfo();

    if (!country || !IBAN_SPECS[country]) {
      showError(countrySelect, countryError, "Please select a valid country.");
      countrySelect.focus();
      return;
    }

    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
      showError(quantityInput, quantityError, "Please enter a number between 1 and 100.");
      quantityInput.focus();
      return;
    }

    resultSection.classList.remove("hidden");

    if (quantity === 1) {
      generateSingleIBAN(country, bankCodeInfo);
    } else {
      generateBulkIBANs(country, bankCodeInfo, quantity);
    }

    if (
      !singleResultContainer.classList.contains("hidden") ||
      !bulkResultContainer.classList.contains("hidden")
    ) {
      resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function handleCopyClick() {
    const ibanRaw = ibanResultSpan.textContent.replace(/\s/g, "");

    if (!navigator.clipboard) {
      console.warn("Clipboard API unavailable.");
      // Fallback approach
      try {
        const tempInput = document.createElement("textarea");
        tempInput.value = ibanRaw;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);

        copyMessage.textContent = "Copied!";
        copyMessage.classList.remove("hidden");
        copyMessage.setAttribute("role", "status");

        setTimeout(() => {
          copyMessage.textContent = "";
          copyMessage.classList.add("hidden");
          copyMessage.removeAttribute("role");
        }, 3000);
        return;
      } catch (err) {
        copyMessage.textContent = "Clipboard API unavailable";
        copyMessage.classList.remove("hidden");
        return;
      }
    }

    navigator.clipboard
      .writeText(ibanRaw)
      .then(() => {
        copyMessage.textContent = "Copied!";
        copyMessage.classList.remove("hidden");
        copyMessage.setAttribute("role", "status");

        setTimeout(() => {
          copyMessage.textContent = "";
          copyMessage.classList.add("hidden");
          copyMessage.removeAttribute("role");
        }, 3000);
      })
      .catch((err) => {
        console.error("Copy failed:", err);
        copyMessage.textContent = "Copy failed";
        copyMessage.classList.remove("hidden");

        setTimeout(() => {
          copyMessage.textContent = "";
          copyMessage.classList.add("hidden");
        }, 3000);
      });
  }

  function handleDownloadBulkClick() {
    const text = bulkIbansTextarea.value;
    if (!text || !downloadBulkBtn) {
      return;
    }

    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      // Sanitize filename: only allow letters, numbers, hyphens, and underscores
      const country = countrySelect.value.replace(/[^a-zA-Z0-9_-]/g, "_");
      const count = bulkCountSpan.textContent.replace(/[^a-zA-Z0-9_-]/g, "_");
      link.href = url;
      link.download = `iban-results-${country}-${count}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error downloading bulk:", e);
    }
  }

  // --- Generator Functions ---
  function generateSingleIBAN(country, bankCodeInfo) {
    const iban = generateIBAN(country, bankCodeInfo);

    if (iban) {
      ibanResultSpan.textContent = formatIBAN(iban);
      bulkResultContainer.classList.add("hidden");
      singleResultContainer.classList.remove("hidden");
      copyMessage.textContent = "";
      clearError(ibanForm, countryError);
    } else {
      singleResultContainer.classList.add("hidden");
      showError(
        ibanForm,
        countryError,
        `Failed to generate IBAN for ${COUNTRY_NAMES[country] || country}.`,
      );
    }
  }

  function generateBulkIBANs(country, bankCodeInfo, quantity) {
    let ibans = [];
    let failures = 0;
    const useSpecificBank = !!bankCodeInfo;

    for (let i = 0; i < quantity; i++) {
      const currentBankInfo = useSpecificBank ? bankCodeInfo : null;
      const iban = generateIBAN(country, currentBankInfo);

      if (iban) {
        ibans.push(iban);
      } else {
        failures++;
      }
    }

    if (ibans.length > 0) {
      bulkHeading.textContent = `Generated IBANs (${ibans.length})`;
      bulkCountSpan.textContent = ibans.length;
      bulkIbansTextarea.value = ibans.join("\n");
      singleResultContainer.classList.add("hidden");
      bulkResultContainer.classList.remove("hidden");
      clearError(ibanForm, countryError);

      if (failures > 0) {
        showError(
          ibanForm,
          quantityError,
          `Note: ${failures} out of ${quantity} IBANs could not be generated.`,
        );
      } else {
        clearError(ibanForm, quantityError);
      }
    } else {
      bulkResultContainer.classList.add("hidden");
      showError(
        ibanForm,
        countryError,
        `Failed to generate any IBANs for ${COUNTRY_NAMES[country] || country}.`,
      );
    }
  }

  /**
   * Get the selected bank information from the bank selector
   * @returns {Object|null} Bank information object or null if not selected
   */
  function getSelectedBankInfo() {
    if (bankContainer.classList.contains("hidden") || !bankSelect.value) {
      return null;
    }

    const countryBanksData = BANK_DATA[countrySelect.value];
    return countryBanksData && countryBanksData[bankSelect.value]
      ? countryBanksData[bankSelect.value]
      : null;
  }

  /**
   * Generate a single valid IBAN for the specified country
   * @param {string} country - Country code (e.g., "NL", "DE", "BE")
   * @param {Object|null} bankInfo - Optional bank information object
   * @returns {string|null} Generated IBAN string or null if generation fails
   */
  function generateIBAN(country, bankInfo) {
    const spec = IBAN_SPECS[country];

    if (!spec) {
      console.error(`IBAN spec missing: ${country}`);
      return null;
    }

    let bankCodePart = "",
      branchCodePart = "",
      accountPart = "",
      nationalCheckPart = "";
    const bbanBankCode = bankInfo ? bankInfo.code : null;

    try {
      switch (country) {
        case "NL":
          bankCodePart =
            bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
          accountPart = generateRandomChars(spec.accountLength, spec.accountType);
          break;
        case "DE":
          bankCodePart =
            bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
          accountPart = generateRandomChars(spec.accountLength, spec.accountType);
          break;
        case "BE":
          bankCodePart =
            bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
          accountPart = generateRandomChars(spec.accountLength, spec.accountType);
          nationalCheckPart = calculateMod97Check((bankCodePart + accountPart).replace(/\D/g, ""));
          break;
        case "FR":
          bankCodePart =
            bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
          branchCodePart = generateRandomChars(spec.branchCodeLength, spec.branchCodeType);
          accountPart = generateRandomChars(spec.accountLength, spec.accountType);
          nationalCheckPart = generateRandomChars(spec.nationalCheckLength, spec.nationalCheckType);
          break;
        case "ES":
          bankCodePart =
            bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
          branchCodePart = generateRandomChars(spec.branchCodeLength, spec.branchCodeType);
          accountPart = generateRandomChars(spec.accountLength, spec.accountType);
          nationalCheckPart = generateRandomChars(spec.nationalCheckLength, spec.nationalCheckType);
          break;
        case "IT":
          nationalCheckPart = generateRandomChars(spec.nationalCheckLength, spec.nationalCheckType);
          bankCodePart =
            bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
          branchCodePart = generateRandomChars(spec.branchCodeLength, spec.branchCodeType);
          accountPart = generateRandomChars(spec.accountLength, spec.accountType);
          break;
        default:
          console.error(`Unhandled country: ${country}`);
          return null;
      }
    } catch (error) {
      console.error(`Error BBAN parts ${country}:`, error);
      return null;
    }

    let bban = "";

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
        bban =
          (bankCodePart || "") +
          (branchCodePart || "") +
          (accountPart || "") +
          (nationalCheckPart || "");
        break;
    }

    const expectedBbanLength = spec.length - 4;

    if (bban.length !== expectedBbanLength) {
      console.warn(
        `Adjusting BBAN length for ${country}: expected ${expectedBbanLength}, got ${bban.length}.`,
      );
      bban =
        bban.length < expectedBbanLength
          ? bban.padEnd(expectedBbanLength, "0")
          : bban.substring(0, expectedBbanLength);

      if (bban.length !== expectedBbanLength) {
        console.error(`BBAN length mismatch ${country} persists. BBAN: ${bban}`);
        return null;
      }
    }

    const ibanWithoutCheck = `${country}00${bban}`;
    const checkDigits = calculateIBANCheckDigits(ibanWithoutCheck);

    if (!checkDigits) {
      console.error(`Failed check digit calc ${country} BBAN: ${bban}`);
      return null;
    }

    return `${country}${checkDigits}${bban}`;
  }

  /**
   * Generate random characters of specified length and type
   * Uses cryptographically secure random number generation when available
   * @param {number} length - Number of characters to generate
   * @param {string} [type="numeric"] - Type of characters
   *   ("numeric", "alphaUpper", "alphanumericUpper")
   * @returns {string} Generated random string
   */
  function generateRandomChars(length, type = "numeric") {
    if (length <= 0) {
      return "";
    }

    let result = "";
    const alphaUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numeric = "0123456789";
    const alphanumericUpper = alphaUpper + numeric;
    let chars;
    const lowerType = type?.toLowerCase();

    switch (lowerType) {
      case "alphaupper":
      case "alpha":
        chars = alphaUpper;
        break;
      case "alphanumericupper":
      case "alphanumeric":
      case "c":
        chars = alphanumericUpper;
        break;
      case "numeric":
      case "n":
        chars = numeric;
        break;
      default:
        console.warn(`Unknown type '${type}', using numeric.`);
        chars = numeric;
        break;
    }

    if (window.crypto && window.crypto.getRandomValues) {
      const randomValues = new Uint32Array(length);
      window.crypto.getRandomValues(randomValues);

      for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
      }
    } else {
      console.warn("Using fallback Math.random().");

      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    return result;
  }

  /**
   * Calculate IBAN check digits using the mod-97 algorithm
   * Does not use BigInt for better browser compatibility
   * @param {string} iban - IBAN string with temporary check digits (e.g., "NL00...")
   * @returns {string|null} Two-digit check code or null if calculation fails
   */
  function calculateIBANCheckDigits(iban) {
    const rearranged = iban.substring(4) + iban.substring(0, 4);
    let numerical = "";

    for (let i = 0; i < rearranged.length; i++) {
      const char = rearranged.charAt(i).toUpperCase();

      if (char >= "A" && char <= "Z") {
        numerical += (char.charCodeAt(0) - 55).toString();
      } else if (char >= "0" && char <= "9") {
        numerical += char;
      } else {
        console.error(`Invalid char: ${char}`);
        return null;
      }
    }

    try {
      if (!/^\d+$/.test(numerical)) {
        throw new Error("Non-digit chars.");
      }

      // Handle large numbers safely without BigInt
      let remainder = 0;
      for (let i = 0; i < numerical.length; i++) {
        remainder = (remainder * 10 + parseInt(numerical[i])) % 97;
      }

      const checkDigitInt = 98 - remainder;
      return checkDigitInt < 10 ? `0${checkDigitInt}` : `${checkDigitInt}`;
    } catch (e) {
      console.error("Error calc check digits:", e, numerical);
      return null;
    }
  }

  /**
   * Calculate mod-97 check for national check digits (used in BE IBANs)
   * Does not use BigInt for better browser compatibility
   * @param {string} numericString - Numeric string to calculate check for
   * @returns {string} Two-digit check code (defaults to "00" or "99" on error)
   */
  function calculateMod97Check(numericString) {
    if (!numericString || !/^\d+$/.test(numericString)) {
      console.warn(`Invalid Mod97 input: ${numericString}`);
      return "00";
    }

    try {
      // Handle large numbers safely without BigInt
      let remainder = 0;
      for (let i = 0; i < numericString.length; i++) {
        remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
      }

      if (remainder === 0) {
        remainder = 97;
      }
      return remainder < 10 ? `0${remainder}` : `${remainder}`;
    } catch (e) {
      console.error("Error Mod97 check:", e);
      return "99";
    }
  }

  /**
   * Format an IBAN string with spaces every 4 characters for readability
   * @param {string} iban - Unformatted IBAN string
   * @returns {string} Formatted IBAN with spaces
   */
  function formatIBAN(iban) {
    return typeof iban === "string" ? iban.replace(/(.{4})/g, "$1 ").trim() : "";
  }

  /**
   * Clear all result displays and reset UI
   */
  function clearResults() {
    singleResultContainer.classList.add("hidden");
    bulkResultContainer.classList.add("hidden");
    resultSection.classList.add("hidden");
    ibanResultSpan.textContent = "";
    copyMessage.textContent = "";
    bulkIbansTextarea.value = "";
    bulkCountSpan.textContent = "0";
    bulkHeading.textContent = "Generated IBANs (0)";
  }

  /**
   * Show an error message for a form input
   * @param {HTMLElement} inputElement - The input element with the error
   * @param {HTMLElement} errorElement - The error message element
   * @param {string} message - The error message to display
   */
  function showError(inputElement, errorElement, message) {
    if (errorElement && message) {
      errorElement.textContent = message;
      errorElement.classList.add("has-error");

      if (inputElement) {
        inputElement.setAttribute("aria-invalid", "true");
        const describedByIds = (inputElement.getAttribute("aria-describedby") || "")
          .split(" ")
          .filter((id) => id && id !== errorElement.id);
        describedByIds.push(errorElement.id);
        inputElement.setAttribute("aria-describedby", describedByIds.join(" "));
      }
    }
  }

  /**
   * Clear an error message for a form input
   * @param {HTMLElement} inputElement - The input element to clear error from
   * @param {HTMLElement} errorElement - The error message element to clear
   */
  function clearError(inputElement, errorElement) {
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("has-error");
    }

    if (inputElement) {
      inputElement.removeAttribute("aria-invalid");

      if (errorElement?.id) {
        const describedByIds = (inputElement.getAttribute("aria-describedby") || "")
          .split(" ")
          .filter((id) => id && id !== errorElement.id);
        const newAriaDesc = describedByIds.join(" ");

        if (newAriaDesc) {
          inputElement.setAttribute("aria-describedby", newAriaDesc);
        } else {
          inputElement.removeAttribute("aria-describedby");
        }
      }
    }
  }

  /**
   * Clear all error messages from the form
   */
  function clearAllErrors() {
    clearError(countrySelect, countryError);
    clearError(bankSelect, bankError);
    clearError(quantityInput, quantityError);
    clearError(ibanForm, countryError);
    clearError(ibanForm, quantityError);
  }

  // --- Event Listeners ---
  countrySelect.addEventListener("change", handleCountryChange);
  ibanForm.addEventListener("submit", handleFormSubmit);
  copyBtn.addEventListener("click", handleCopyClick);
  if (downloadBulkBtn) {
    downloadBulkBtn.addEventListener("click", handleDownloadBulkClick);
  }

  // --- Initialization ---
  populateCountrySelect();
  try {
    countrySelect.value = getSuggestedCountry();
  } catch (e) {
    if (countrySelect.options.length > 0) {
      countrySelect.selectedIndex = 0;
    }
  }
  updateBankSelector();

  // --- Cleanup on page unload ---
  window.addEventListener("beforeunload", function () {
    AccessibilityAnnouncer.cleanup();
  });
});
