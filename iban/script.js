document.addEventListener("DOMContentLoaded", function () {
  // --- Utility Functions ---
  /**
   * Debounce function to limit rapid function calls
   * @param {Function} func - Function to debounce  
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  function debounce(func, wait) {
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
  function sanitizeInput(input) {
    if (typeof input !== 'string') {
      return '';
    }
    let sanitized = input;
    let previous;
    do {
      previous = sanitized;
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    } while (sanitized !== previous);
    return sanitized.replace(/[<>&"']/g, (char) => {
      const entities = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;' };
      return entities[char] || char;
    });
  }

  /**
   * Log error with additional context for debugging
   * @param {Error} error - The error to log
   * @param {string} context - Additional context
   */
  function logError(error, context = '') {
    const errorDetails = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context
    };
    console.error('IBAN Generator Error:', errorDetails);
  }

  // --- Accessibility Announcer Singleton (Fixed Memory Management) ---
  const AccessibilityAnnouncer = {
    element: null,
    timer: null,
    clearTimer: null,
    DEBOUNCE_DELAY: 100,

    init() {
      if (!this.element) {
        this.element = document.createElement("div");
        this.element.setAttribute("aria-live", "polite");
        this.element.setAttribute("aria-atomic", "true");
        this.element.className = "sr-only";
        document.body.appendChild(this.element);
      }
    },

    announce(message, delay = this.DEBOUNCE_DELAY) {
      this.init();

      // Debounce rapid announcements
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        if (this.element) {
          this.element.textContent = message;

          // Clear after screen readers process it
          if (this.clearTimer) {
            clearTimeout(this.clearTimer);
          }
          this.clearTimer = setTimeout(() => {
            if (this.element) {
              this.element.textContent = "";
            }
          }, 3000);
        }
      }, delay);
    },

    cleanup() {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this.clearTimer) {
        clearTimeout(this.clearTimer);
        this.clearTimer = null;
      }
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
        this.element = null;
      }
    },
  };

  // --- DOM Elements Cache (Performance Optimization) ---
  const domCache = {};
  function getElementById(id) {
    if (!domCache[id]) {
      domCache[id] = document.getElementById(id);
    }
    return domCache[id];
  }

  // --- DOM Elements (With Caching) ---
  const ibanForm = getElementById("iban-form");
  const countrySelect = getElementById("country");
  const bankContainer = getElementById("bank-container");
  const bankSelect = getElementById("bank");
  const quantityInput = getElementById("quantity");

  // Result Sections
  const resultSection = getElementById("result-section");
  const singleResultContainer = getElementById("single-result-container");
  const bulkResultContainer = getElementById("bulk-result-container");

  // Single Result Elements
  const ibanResultSpan = getElementById("iban-result");
  const copyBtn = getElementById("copy-btn");
  const copyMessage = getElementById("copy-message");

  // Bulk Result Elements
  const bulkCountSpan = getElementById("bulk-count");
  const bulkIbansTextarea = getElementById("bulk-ibans");
  const downloadBulkBtn = getElementById("download-bulk");
  const bulkHeading = getElementById("bulk-heading");

  // Error Message Elements
  const countryError = getElementById("country-error");
  const bankError = getElementById("bank-error");
  const quantityError = getElementById("quantity-error");

  // --- Configuration ---
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
  const COUNTRY_NAMES = {
    NL: "Netherlands",
    DE: "Germany",
    BE: "Belgium",
    FR: "France",
    ES: "Spain",
    IT: "Italy",
  };
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

  // --- Helper Functions ---
  function getSuggestedCountry() {
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

  function populateCountrySelect() {
    countrySelect.innerHTML = "";
    const sortedCountries = Object.keys(IBAN_SPECS).sort((a, b) =>
      (COUNTRY_NAMES[a] || a).localeCompare(COUNTRY_NAMES[b] || b)
    );
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    sortedCountries.forEach((countryCode) => {
      const option = document.createElement("option");
      option.value = countryCode;
      option.textContent = COUNTRY_NAMES[countryCode] || countryCode;
      fragment.appendChild(option);
    });
    countrySelect.appendChild(fragment);
  }

  function updateBankSelector() {
    const selectedCountry = countrySelect.value;
    const banksForCountryData = BANK_DATA[selectedCountry];
    const helpTextEl = document.getElementById("bank-help");
    const wasHidden = bankContainer.classList.contains("hidden");
    bankSelect.innerHTML = "";

    if (banksForCountryData && Object.keys(banksForCountryData).length > 0) {
      const sortedBanks = Object.entries(banksForCountryData).sort((a, b) =>
        (a[1].name || a[0]).localeCompare(b[1].name || b[0])
      );
      
      // Use DocumentFragment for better performance
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
      if (helpTextEl)
        helpTextEl.textContent = `Optional: Select a bank for ${COUNTRY_NAMES[selectedCountry] || selectedCountry}.`;

      // Announce to screen readers when bank selector becomes available
      if (wasHidden) {
        AccessibilityAnnouncer.announce(
          `Bank selection is now available for ${COUNTRY_NAMES[selectedCountry] || selectedCountry}.`
        );
      }
    } else {
      bankContainer.classList.add("hidden");
      bankSelect.disabled = true;
      if (helpTextEl)
        helpTextEl.textContent = `No specific banks available for ${COUNTRY_NAMES[selectedCountry] || selectedCountry}. A random valid bank code will be used.`;

      // Announce to screen readers when bank selector becomes unavailable
      if (!wasHidden) {
        AccessibilityAnnouncer.announce(
          `Bank selection is not needed for ${COUNTRY_NAMES[selectedCountry] || selectedCountry}. A random valid bank code will be used.`
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

    // Sanitize inputs
    const country = sanitizeInput(countrySelect.value);
    const quantityValue = sanitizeInput(quantityInput.value);
    const quantity = parseInt(quantityValue, 10);
    const bankCodeInfo = getSelectedBankInfo();

    // Enhanced validation with better error messages
    if (!country || !IBAN_SPECS[country]) {
      const errorMsg = "Please select a valid country.";
      showError(countrySelect, countryError, errorMsg);
      AccessibilityAnnouncer.announce(`Validation error: ${errorMsg}`);
      countrySelect.focus();
      return;
    }

    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
      const errorMsg = "Please enter a number between 1 and 100.";
      showError(quantityInput, quantityError, errorMsg);
      AccessibilityAnnouncer.announce(`Validation error: ${errorMsg}`);
      quantityInput.focus();
      return;
    }

    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Generating...';
    }

    try {
      resultSection.classList.remove("hidden");

      if (quantity === 1) {
        generateSingleIBAN(country, bankCodeInfo);
      } else {
        generateBulkIBANs(country, bankCodeInfo, quantity);
      }

      // Announce success
      const countryName = COUNTRY_NAMES[country] || country;
      const message = quantity === 1 
        ? `Generated 1 IBAN for ${countryName}` 
        : `Generated ${quantity} IBANs for ${countryName}`;
      AccessibilityAnnouncer.announce(message);

    } catch (error) {
      logError(error, 'Form submission');
      const errorMsg = `Failed to generate IBAN for ${COUNTRY_NAMES[country] || country}. Please try again.`;
      showError(ibanForm, countryError, errorMsg);
    } finally {
      // Restore submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText || 'Generate IBAN(s)';
      }
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

    if (!ibanRaw) {
      console.warn("No IBAN to copy");
      return;
    }

    // Modern clipboard API with fallback
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(ibanRaw)
        .then(() => {
          showCopyMessage("Copied!");
          AccessibilityAnnouncer.announce("IBAN copied to clipboard");
        })
        .catch((err) => {
          console.error("Clipboard API failed:", err);
          fallbackCopy(ibanRaw);
        });
    } else {
      fallbackCopy(ibanRaw);
    }
  }

  function fallbackCopy(text) {
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
        showCopyMessage("Copied!");
        AccessibilityAnnouncer.announce("IBAN copied to clipboard");
      } else {
        showCopyMessage("Copy failed. Please copy manually.");
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
      showCopyMessage("Copy not supported. Please copy manually.");
    }
  }

  function showCopyMessage(message) {
    if (!copyMessage) return;
    
    copyMessage.textContent = message;
    copyMessage.classList.remove("hidden");
    copyMessage.setAttribute("role", "status");

    setTimeout(() => {
      copyMessage.textContent = "";
      copyMessage.classList.add("hidden");
      copyMessage.removeAttribute("role");
    }, 3000);
  }

  function handleDownloadBulkClick() {
    const text = bulkIbansTextarea.value;
    if (!text || !downloadBulkBtn) return;

    try {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `iban-results-${countrySelect.value}-${bulkCountSpan.textContent}.txt`;
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
        `Failed to generate IBAN for ${COUNTRY_NAMES[country] || country}.`
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
          `Note: ${failures} out of ${quantity} IBANs could not be generated.`
        );
      } else {
        clearError(ibanForm, quantityError);
      }
    } else {
      bulkResultContainer.classList.add("hidden");
      showError(
        ibanForm,
        countryError,
        `Failed to generate any IBANs for ${COUNTRY_NAMES[country] || country}.`
      );
    }
  }

  function getSelectedBankInfo() {
    if (bankContainer.classList.contains("hidden") || !bankSelect.value) {
      return null;
    }

    const countryBanksData = BANK_DATA[countrySelect.value];
    return countryBanksData && countryBanksData[bankSelect.value]
      ? countryBanksData[bankSelect.value]
      : null;
  }

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
        `Adjusting BBAN length for ${country}: expected ${expectedBbanLength}, got ${bban.length}.`
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

  function generateRandomChars(length, type = "numeric") {
    if (length <= 0) return "";

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

  // Modified to avoid BigInt
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

  // Modified to avoid BigInt
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

      if (remainder === 0) remainder = 97;
      return remainder < 10 ? `0${remainder}` : `${remainder}`;
    } catch (e) {
      console.error("Error Mod97 check:", e);
      return "99";
    }
  }

  function formatIBAN(iban) {
    return typeof iban === "string" ? iban.replace(/(.{4})/g, "$1 ").trim() : "";
  }

  // --- UI Functions ---
  function clearResults() {
    singleResultContainer.classList.add("hidden");
    bulkResultContainer.classList.add("hidden");
    resultSection.classList.add("hidden");
    ibanResultSpan.textContent = "";
    copyMessage.textContent = "";
    bulkIbansTextarea.value = "";
    bulkCountSpan.textContent = "0";
    bulkHeading.textContent = `Generated IBANs (0)`;
  }

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

  function clearAllErrors() {
    clearError(countrySelect, countryError);
    clearError(bankSelect, bankError);
    clearError(quantityInput, quantityError);
    clearError(ibanForm, countryError);
    clearError(ibanForm, quantityError);
  }

  // --- Event Listeners with Cleanup Tracking ---
  const eventListeners = [];
  
  function addEventListenerWithCleanup(element, event, handler) {
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
  }

  // --- Debounced Input Validation ---
  const debouncedQuantityValidation = debounce(function(value) {
    const quantity = parseInt(value, 10);
    clearError(quantityInput, quantityError);
    
    if (value && (isNaN(quantity) || quantity < 1 || quantity > 100)) {
      const errorMsg = 'Please enter a number between 1 and 100';
      showError(quantityInput, quantityError, errorMsg);
      AccessibilityAnnouncer.announce(`Validation error: ${errorMsg}`);
    }
  }, 300);

  // --- Event Listeners ---
  addEventListenerWithCleanup(countrySelect, "change", handleCountryChange);
  addEventListenerWithCleanup(quantityInput, "input", function(event) {
    debouncedQuantityValidation(event.target.value);
  });
  addEventListenerWithCleanup(ibanForm, "submit", handleFormSubmit);
  addEventListenerWithCleanup(copyBtn, "click", handleCopyClick);
  if (downloadBulkBtn) addEventListenerWithCleanup(downloadBulkBtn, "click", handleDownloadBulkClick);

  // --- Initialization ---
  populateCountrySelect();
  try {
    countrySelect.value = getSuggestedCountry();
  } catch (e) {
    if (countrySelect.options.length > 0) countrySelect.selectedIndex = 0;
  }
  updateBankSelector();

  // --- Cleanup Function ---
  function cleanup() {
    // Clean up accessibility announcer
    AccessibilityAnnouncer.cleanup();
    
    // Remove all tracked event listeners
    eventListeners.forEach(({ element, event, handler }) => {
      try {
        element.removeEventListener(event, handler);
      } catch (e) {
        console.warn('Failed to remove event listener:', e);
      }
    });
    
    // Clear DOM cache
    Object.keys(domCache).forEach(key => delete domCache[key]);
    
    console.log('IBAN Generator cleaned up');
  }

  // --- Cleanup on page unload ---
  addEventListenerWithCleanup(window, "beforeunload", cleanup);
  
  // Make cleanup available globally for manual cleanup if needed
  window.ibanGeneratorCleanup = cleanup;
});
