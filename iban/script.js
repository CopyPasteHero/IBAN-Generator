document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const ibanForm = document.getElementById('iban-form');
    const countrySelect = document.getElementById('country');
    const bankContainer = document.getElementById('bank-container');
    const bankSelect = document.getElementById('bank');
    const quantityInput = document.getElementById('quantity');

    // Result Sections
    const resultSection = document.getElementById('result-section');
    const singleResultContainer = document.getElementById('single-result-container');
    const bulkResultContainer = document.getElementById('bulk-result-container');

    // Single Result Elements
    const ibanResultSpan = document.getElementById('iban-result');
    const copyBtn = document.getElementById('copy-btn');
    const copyMessage = document.getElementById('copy-message');
    const qrContainer = document.getElementById('qr-container');
    const qrCodeDiv = document.getElementById('qr-code');
    const downloadQrBtn = document.getElementById('download-qr');

    // Bulk Result Elements
    const bulkCountSpan = document.getElementById('bulk-count');
    const bulkIbansTextarea = document.getElementById('bulk-ibans');
    const downloadBulkBtn = document.getElementById('download-bulk');
    const bulkHeading = document.getElementById('bulk-heading');

    // Error Message Elements
    const countryError = document.getElementById('country-error');
    const bankError = document.getElementById('bank-error');
    const quantityError = document.getElementById('quantity-error');

    // --- Configuration ---
    let qr = null; // QRious instance

    const IBAN_SPECS = {
        NL: { length: 18, bankCodeLength: 4, accountLength: 10 },
        DE: { length: 22, bankCodeLength: 8, accountLength: 10 },
        BE: { length: 16, bankCodeLength: 3, accountLength: 7, nationalCheckLength: 2 },
        FR: { length: 27, bankCodeLength: 5, branchCodeLength: 5, accountLength: 11, nationalCheckLength: 2 },
        ES: { length: 24, bankCodeLength: 4, branchCodeLength: 4, nationalCheckLength: 2, accountLength: 10 },
        IT: { length: 27, nationalCheckLength: 1, bankCodeLength: 5, branchCodeLength: 5, accountLength: 12 }
    };

    // English names for countries and banks
    const COUNTRY_NAMES = { NL: "Netherlands", DE: "Germany", BE: "Belgium", FR: "France", ES: "Spain", IT: "Italy" };
    const BANK_DATA = { // Now includes English name directly
        NL: {
            ABNA: { name: 'ABN AMRO', code: 'ABNA' }, INGB: { name: 'ING', code: 'INGB' }, RABO: { name: 'Rabobank', code: 'RABO' }, SNSB: { name: 'SNS Bank', code: 'SNSB' },
            ASNB: { name: 'ASN Bank', code: 'ASNB' }, RBRB: { name: 'RegioBank', code: 'RBRB' }, KNAB: { name: 'Knab', code: 'KNAB' }, BUNQ: { name: 'Bunq', code: 'BUNQ' },
            TRIO: { name: 'Triodos Bank', code: 'TRIO' }, FVLB: { name: 'Van Lanschot', code: 'FVLB' }
        },
        DE: {
            DEUTDEFF: { name: 'Deutsche Bank', code: '50070010' }, COBADEFF: { name: 'Commerzbank', code: '50040000' },
            PBNKDEFF: { name: 'Postbank', code: '50010060' }, GENODEFF: { name: 'DZ Bank', code: '50060400' }
        },
        BE: {
            GEBABEBB: { name: 'BNP Paribas Fortis', code: '001' }, BBRUBEBB: { name: 'ING Belgium', code: '310' },
            KREDBEBB: { name: 'KBC Bank', code: '734' }, GKCCBEBB: { name: 'Belfius Bank', code: '068' }
        },
        FR: {
            BNPAFRPP: { name: 'BNP Paribas', code: '30004' }, SOGEFRPP: { name: 'Société Générale', code: '30003' },
            CRLYFRPP: { name: 'Crédit Lyonnais (LCL)', code: '30002' }, CEPAFRPP: { name: 'Caisse d\'Epargne', code: '11306' }
        },
        ES: {
            BSCHESMM: { name: 'Banco Santander', code: '0049' }, BBVAESMM: { name: 'BBVA', code: '0182' },
            CAIXESBB: { name: 'CaixaBank', code: '2100' }, SABBESBB: { name: 'Banco Sabadell', code: '0081' }
        },
        IT: {
            UNCRITMM: { name: 'UniCredit', code: '02008' }, BCITITMM: { name: 'Intesa Sanpaolo', code: '03069' },
            BNLIITRR: { name: 'BNL', code: '01005' }, MPSITIT1: { name: 'Monte dei Paschi', code: '01030' }
        }
    };

    /**
     * Gets the likely default country code based on browser language.
     * @returns {string} A 2-letter country code (e.g., 'NL', 'DE') or 'NL' as fallback.
     */
    function getSuggestedCountry() {
        try {
            const lang = navigator.language.toLowerCase(); // e.g., 'nl-nl', 'de', 'en-gb'
            const baseLang = lang.split('-')[0]; // e.g., 'nl', 'de', 'en'

            if (baseLang === 'nl' && IBAN_SPECS['NL']) return 'NL';
            if (baseLang === 'de' && IBAN_SPECS['DE']) return 'DE';
            if (baseLang === 'fr') { // French can be BE or FR
                 if ((lang.includes('be') || lang.includes('bru')) && IBAN_SPECS['BE']) return 'BE'; // Prioritize Belgian French if BE supported
                 if (IBAN_SPECS['FR']) return 'FR'; // Otherwise default to France
                 if (IBAN_SPECS['BE']) return 'BE'; // Or Belgium if FR not supported but BE is
            }
            if (baseLang === 'es' && IBAN_SPECS['ES']) return 'ES';
            if (baseLang === 'it' && IBAN_SPECS['IT']) return 'IT';
            // Add more language hints if needed

        } catch (e) {
            console.warn("Could not access navigator.language:", e);
        }
        return 'NL'; // Default fallback (Netherlands)
    }

    /** Populates the country select dropdown. */
    function populateCountrySelect() {
        countrySelect.innerHTML = ''; // Clear existing
        for (const countryCode in IBAN_SPECS) {
            const option = document.createElement('option');
            option.value = countryCode;
            option.textContent = COUNTRY_NAMES[countryCode] || countryCode; // Use English name or code
            countrySelect.appendChild(option);
        }
    }

    /** Updates the bank select dropdown based on the selected country. */
    function updateBankSelector() {
        const selectedCountry = countrySelect.value;
        const banksForCountryData = BANK_DATA[selectedCountry];
        const helpTextEl = document.getElementById('bank-help');

        bankSelect.innerHTML = ''; // Clear previous options

        if (banksForCountryData && Object.keys(banksForCountryData).length > 0) {
            let isFirstBank = true;
            for (const bic in banksForCountryData) {
                const bank = banksForCountryData[bic];
                const option = document.createElement('option');
                option.value = bic; // Use BIC as value
                option.textContent = bank.name || bic; // Use English name or BIC
                bankSelect.appendChild(option);
                if (isFirstBank) {
                     option.selected = true;
                     isFirstBank = false;
                }
            }
            bankContainer.classList.remove('hidden');
            bankSelect.disabled = false;
            if(helpTextEl) helpTextEl.textContent = `Optional: Select a bank for ${COUNTRY_NAMES[selectedCountry] || selectedCountry}.`;

        } else {
            bankContainer.classList.add('hidden');
            bankSelect.disabled = true;
            if(helpTextEl) helpTextEl.textContent = `No specific banks available for ${COUNTRY_NAMES[selectedCountry] || selectedCountry}.`;
        }
        clearError(bankSelect, bankError);
    }


    // --- Event Listeners ---
    countrySelect.addEventListener('change', handleCountryChange);
    ibanForm.addEventListener('submit', handleFormSubmit);
    copyBtn.addEventListener('click', handleCopyClick);
    downloadQrBtn.addEventListener('click', handleDownloadQrClick);
    downloadBulkBtn.addEventListener('click', handleDownloadBulkClick);

    // --- Initialization ---
    populateCountrySelect(); // Populate countries first
    countrySelect.value = getSuggestedCountry(); // Set default country based on browser lang hint
    updateBankSelector(); // Update banks based on the now selected default country


    // --- Functions ---

    /** Handles country selection change. */
    function handleCountryChange() {
        updateBankSelector();
        clearResults();
        clearAllErrors();
    }

    /** Handles form submission. */
    function handleFormSubmit(event) {
        event.preventDefault();
        clearResults();
        clearAllErrors();

        const country = countrySelect.value;
        const quantity = parseInt(quantityInput.value, 10);
        const bankCodeInfo = getSelectedBankInfo();

        if (isNaN(quantity) || quantity < 1 || quantity > 100) {
             showError(quantityInput, quantityError, "Please enter a number between 1 and 100."); // Hardcoded English error
             quantityInput.focus();
             return;
        }

        resultSection.classList.remove('hidden');
        if (quantity === 1) {
            generateSingleIBAN(country, bankCodeInfo);
        } else {
            generateBulkIBANs(country, bankCodeInfo, quantity);
        }

        if (!singleResultContainer.classList.contains('hidden') || !bulkResultContainer.classList.contains('hidden')) {
             resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /** Generates and displays a single IBAN result. */
    function generateSingleIBAN(country, bankCodeInfo) {
        const iban = generateIBAN(country, bankCodeInfo);
        if (iban) {
            ibanResultSpan.textContent = formatIBAN(iban);
            bulkResultContainer.classList.add('hidden');
            singleResultContainer.classList.remove('hidden');
            requestAnimationFrame(() => generateQRCode(iban));
            copyMessage.textContent = '';
        } else {
             singleResultContainer.classList.add('hidden');
             qrContainer.classList.add('hidden');
        }
    }

    /** Generates and displays bulk IBAN results. */
    function generateBulkIBANs(country, bankCodeInfo, quantity) {
        let ibans = [];
        const useSpecificBank = !!bankSelect.value && !bankSelect.disabled;

        for (let i = 0; i < quantity; i++) {
            const currentBankInfo = useSpecificBank ? bankCodeInfo : null;
            const iban = generateIBAN(country, currentBankInfo);
            if (iban) { ibans.push(iban); }
        }

        if (ibans.length > 0) {
            bulkHeading.textContent = `Generated IBANs (${ibans.length})`; // English heading
            bulkCountSpan.textContent = ibans.length;
            bulkIbansTextarea.value = ibans.join('\n');
            singleResultContainer.classList.add('hidden');
            bulkResultContainer.classList.remove('hidden');
        } else {
             bulkResultContainer.classList.add('hidden');
        }
    }

    /** Retrieves the data object for the selected bank. */
    function getSelectedBankInfo() {
        if (bankContainer.classList.contains('hidden') || !bankSelect.value) { return null; }
        const countryBanksData = BANK_DATA[countrySelect.value];
        return countryBanksData ? countryBanksData[bankSelect.value] : null;
    }

    // --- IBAN Generation Logic --- (No changes needed from previous version)
    function generateIBAN(country, bankInfo) {
        const spec = IBAN_SPECS[country];
        if (!spec) return null;
        let bankCodePart = '', branchCodePart = '', accountPart = '', nationalCheckPart = '';
        let bbanBankCode = bankInfo ? bankInfo.code : null;
        try {
            switch (country) {
                case 'NL': bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, 'alphaUpper'); accountPart = generateRandomChars(spec.accountLength, 'numeric'); break;
                case 'DE': bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, 'numeric'); accountPart = generateRandomChars(spec.accountLength, 'numeric'); break;
                case 'BE': bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, 'numeric'); accountPart = generateRandomChars(spec.accountLength, 'numeric'); nationalCheckPart = calculateMod97Check((bankCodePart + accountPart).replace(/\D/g, '')); break;
                case 'FR': bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, 'numeric'); branchCodePart = generateRandomChars(spec.branchCodeLength, 'numeric'); accountPart = generateRandomChars(spec.accountLength, 'alphanumericUpper'); nationalCheckPart = generateRandomChars(spec.nationalCheckLength, 'numeric'); break;
                case 'ES': bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, 'numeric'); branchCodePart = generateRandomChars(spec.branchCodeLength, 'numeric'); accountPart = generateRandomChars(spec.accountLength, 'numeric'); nationalCheckPart = generateRandomChars(spec.nationalCheckLength, 'numeric'); break;
                case 'IT': nationalCheckPart = generateRandomChars(spec.nationalCheckLength, 'alphaUpper'); bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, 'numeric'); branchCodePart = generateRandomChars(spec.branchCodeLength, 'numeric'); accountPart = generateRandomChars(spec.accountLength, 'alphanumericUpper'); // <-- Aangepast naar alfanumeriek break;
                default: const fallbackBbanLength = spec.length - 4; accountPart = generateRandomChars(fallbackBbanLength, 'alphanumericUpper'); break;
            }
        } catch (error) { console.error(`Error generating BBAN for ${country}:`, error); return null; }
        let bban = '';
        if (country === 'IT') { bban = nationalCheckPart + bankCodePart + branchCodePart + accountPart; }
        else if (country === 'FR') { bban = bankCodePart + branchCodePart + accountPart + nationalCheckPart; }
        else if (country === 'ES') { bban = bankCodePart + branchCodePart + nationalCheckPart + accountPart; }
        else if (country === 'BE') { bban = bankCodePart + accountPart + nationalCheckPart; }
        else { bban = bankCodePart + accountPart; }
         const expectedBbanLength = spec.length - 4;
         if (bban.length !== expectedBbanLength) { console.warn(`Adjusting BBAN length for ${country}: expected ${expectedBbanLength}, got ${bban.length}.`); bban = bban.length < expectedBbanLength ? bban.padEnd(expectedBbanLength, '0') : bban.substring(0, expectedBbanLength); }
        const ibanWithoutCheck = `${country}00${bban}`;
        const checkDigits = calculateIBANCheckDigits(ibanWithoutCheck);
         if (!checkDigits) { console.error(`Failed check digit calculation for ${country} BBAN: ${bban}`); return null; }
        return `${country}${checkDigits}${bban}`;
    }
    function generateRandomChars(length, type = 'numeric') {
        let result = '';
        const alphaUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numeric = '0123456789';
        const alphanumericUpper = alphaUpper + numeric;
        let chars = numeric;
        if (type === 'alphaUpper') chars = alphaUpper;
        else if (type === 'alphanumericUpper') chars = alphanumericUpper;
        if (window.crypto && window.crypto.getRandomValues) { const randomValues = new Uint32Array(length); window.crypto.getRandomValues(randomValues); for (let i = 0; i < length; i++) { result += chars[randomValues[i] % chars.length]; } }
        else { console.warn("Using fallback Math.random() for character generation."); for (let i = 0; i < length; i++) { result += chars.charAt(Math.floor(Math.random() * chars.length)); } }
        return result;
    }
    function calculateIBANCheckDigits(iban) {
        const rearranged = iban.substring(4) + iban.substring(0, 4);
        let numerical = '';
        for (let i = 0; i < rearranged.length; i++) { const char = rearranged.charAt(i).toUpperCase(); if (char >= 'A' && char <= 'Z') { numerical += (char.charCodeAt(0) - 55).toString(); } else if (char >= '0' && char <= '9') { numerical += char; } }
        try { if (!/^\d+$/.test(numerical)) { throw new Error("Non-digit characters present before BigInt conversion."); } const numBigInt = BigInt(numerical); const remainder = numBigInt % 97n; const checkDigitInt = 98n - remainder; return checkDigitInt < 10n ? `0${checkDigitInt}` : `${checkDigitInt}`; }
        catch (e) { console.error("Error calculating IBAN check digits:", e, "Input:", numerical); return null; }
    }
    function calculateMod97Check(numericString) {
         if (!numericString || !/^\d+$/.test(numericString)) return '00';
        try { const numBigInt = BigInt(numericString); let remainder = numBigInt % 97n; if (remainder === 0n) remainder = 97n; return remainder < 10n ? `0${remainder}` : `${remainder}`; }
        catch(e) { console.error("Error calculating Mod97 check:", e); return '99'; }
    }
    function formatIBAN(iban) { return typeof iban === 'string' ? iban.replace(/(.{4})/g, "$1 ").trim() : ''; }

    // --- UI Interaction --- (Using English text directly)
    function handleCopyClick() {
        const ibanRaw = ibanResultSpan.textContent.replace(/\s/g, '');
        if (!navigator.clipboard) { console.warn("Clipboard API not available."); copyMessage.textContent = "Clipboard API unavailable"; copyMessage.classList.remove('hidden'); return; }
        navigator.clipboard.writeText(ibanRaw)
            .then(() => {
                copyMessage.textContent = "Copied!";
                copyMessage.classList.remove('hidden');
                 setTimeout(() => { copyMessage.setAttribute('role', 'alert'); setTimeout(() => copyMessage.removeAttribute('role'), 1000); }, 100);
                setTimeout(() => { copyMessage.textContent = ''; }, 3000);
            })
            .catch(err => { console.error('Could not copy:', err); copyMessage.textContent = "Copy failed"; copyMessage.classList.remove('hidden'); });
    }
    function generateQRCode(iban) {
         if (typeof QRious === 'undefined') { console.error("QRious library missing."); qrContainer.classList.add('hidden'); return; }
        const ibanRaw = iban.replace(/\s/g, '');
        const qrData = `BCD\n002\n1\nSCT\n\nIBAN Generator Test\n${ibanRaw}\n\n\n\n\n\n`;
        qrCodeDiv.innerHTML = '';
        try { qr = new QRious({ element: qrCodeDiv, value: qrData, size: 200, level: 'M', background: 'white', foreground: 'black', padding: 10 }); qrContainer.classList.remove('hidden'); }
        catch (e) { console.error("QRious error:", e); qrContainer.classList.add('hidden'); }
    }
    function handleDownloadQrClick() {
         const canvas = qrCodeDiv.querySelector('canvas');
         if (!canvas) { console.error("QR canvas not found."); return; }
         try { const link = document.createElement('a'); const countryCode = countrySelect.value; const ibanStart = ibanResultSpan.textContent.replace(/\s/g, '').substring(4, 8); link.download = `iban-qr-${countryCode}-${ibanStart}.png`; link.href = canvas.toDataURL('image/png'); link.click(); }
         catch (e) { console.error("Error downloading QR code:", e); }
    }
    function handleDownloadBulkClick() {
        const text = bulkIbansTextarea.value;
        if (!text) return;
        try { const blob = new Blob([text], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `iban-results-${countrySelect.value}-${bulkCountSpan.textContent}.txt`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); }
        catch (e) { console.error("Error downloading bulk results:", e); }
    }
    function clearResults() {
        singleResultContainer.classList.add('hidden');
        bulkResultContainer.classList.add('hidden');
        resultSection.classList.add('hidden');
        ibanResultSpan.textContent = '';
        copyMessage.textContent = '';
        qrCodeDiv.innerHTML = '';
        qrContainer.classList.add('hidden');
        bulkIbansTextarea.value = '';
        bulkCountSpan.textContent = '0';
        bulkHeading.textContent = `Generated IBANs (0)`;
    }

    // --- Accessibility & Error Handling ---
     function showError(inputElement, errorElement, message) {
         if (inputElement && errorElement) {
             errorElement.textContent = message;
             errorElement.classList.add('has-error'); // ** Add class **
             inputElement.setAttribute('aria-invalid', 'true');
             const describedByIds = (inputElement.getAttribute('aria-describedby') || '').split(' ').filter(id => id);
             if (!describedByIds.includes(errorElement.id)) { inputElement.setAttribute('aria-describedby', [...describedByIds, errorElement.id].join(' ')); }
         }
     }
     function clearError(inputElement, errorElement) {
         if (inputElement && errorElement) {
             errorElement.textContent = '';
             errorElement.classList.remove('has-error'); // ** Remove class **
             inputElement.removeAttribute('aria-invalid');
             const describedByIds = (inputElement.getAttribute('aria-describedby') || '').split(' ').filter(id => id);
             const index = describedByIds.indexOf(errorElement.id);
             if (index > -1) { describedByIds.splice(index, 1); const newAriaDesc = describedByIds.join(' '); if (newAriaDesc) { inputElement.setAttribute('aria-describedby', newAriaDesc); } else { inputElement.removeAttribute('aria-describedby'); } }
         }
     }
     function clearAllErrors() {
         clearError(countrySelect, countryError);
         clearError(bankSelect, bankError);
         clearError(quantityInput, quantityError);
     }

}); // End DOMContentLoaded