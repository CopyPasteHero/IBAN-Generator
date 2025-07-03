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
    const IBAN_SPECS = {
        NL: { length: 18, bankCodeLength: 4, accountLength: 10, bankCodeType: 'alphaUpper', accountType: 'numeric' },
        DE: { length: 22, bankCodeLength: 8, accountLength: 10, bankCodeType: 'numeric', accountType: 'numeric' },
        BE: { length: 16, bankCodeLength: 3, accountLength: 7, nationalCheckLength: 2, bankCodeType: 'numeric', accountType: 'numeric', nationalCheckType: 'numeric' },
        FR: { length: 27, bankCodeLength: 5, branchCodeLength: 5, accountLength: 11, nationalCheckLength: 2, bankCodeType: 'numeric', branchCodeType: 'numeric', accountType: 'alphanumericUpper', nationalCheckType: 'numeric' },
        ES: { length: 24, bankCodeLength: 4, branchCodeLength: 4, nationalCheckLength: 2, accountLength: 10, bankCodeType: 'numeric', branchCodeType: 'numeric', nationalCheckType: 'numeric', accountType: 'numeric' },
        IT: { length: 27, nationalCheckLength: 1, bankCodeLength: 5, branchCodeLength: 5, accountLength: 12, nationalCheckType: 'alphaUpper', bankCodeType: 'numeric', branchCodeType: 'numeric', accountType: 'alphanumericUpper' }
    };
    const COUNTRY_NAMES = { NL: "Netherlands", DE: "Germany", BE: "Belgium", FR: "France", ES: "Spain", IT: "Italy" };
    const BANK_DATA = {
        NL: { ABNA: { name: 'ABN AMRO', code: 'ABNA' }, INGB: { name: 'ING', code: 'INGB' }, RABO: { name: 'Rabobank', code: 'RABO' }, SNSB: { name: 'SNS Bank', code: 'SNSB' }, ASNB: { name: 'ASN Bank', code: 'ASNB' }, RBRB: { name: 'RegioBank', code: 'RBRB' }, KNAB: { name: 'Knab', code: 'KNAB' }, BUNQ: { name: 'Bunq', code: 'BUNQ' }, TRIO: { name: 'Triodos Bank', code: 'TRIO' }, FVLB: { name: 'Van Lanschot', code: 'FVLB' }},
        DE: { DEUTDEFF: { name: 'Deutsche Bank', code: '50070010' }, COBADEFF: { name: 'Commerzbank', code: '50040000' }, PBNKDEFF: { name: 'Postbank', code: '50010060' }, GENODEFF: { name: 'DZ Bank', code: '50060400' }},
        BE: { GEBABEBB: { name: 'BNP Paribas Fortis', code: '001' }, BBRUBEBB: { name: 'ING Belgium', code: '310' }, KREDBEBB: { name: 'KBC Bank', code: '734' }, GKCCBEBB: { name: 'Belfius Bank', code: '068' }},
        FR: { BNPAFRPP: { name: 'BNP Paribas', code: '30004' }, SOGEFRPP: { name: 'Société Générale', code: '30003' }, CRLYFRPP: { name: 'Crédit Lyonnais (LCL)', code: '30002' }, CEPAFRPP: { name: 'Caisse d\'Epargne', code: '11306' }},
        ES: { BSCHESMM: { name: 'Banco Santander', code: '0049' }, BBVAESMM: { name: 'BBVA', code: '0182' }, CAIXESBB: { name: 'CaixaBank', code: '2100' }, SABBESBB: { name: 'Banco Sabadell', code: '0081' }},
        IT: { UNCRITMM: { name: 'UniCredit', code: '02008' }, BCITITMM: { name: 'Intesa Sanpaolo', code: '03069' }, BNLIITRR: { name: 'BNL', code: '01005' }, MPSITIT1: { name: 'Monte dei Paschi', code: '01030' }}
    };

    // --- Helper Functions ---
    function getSuggestedCountry() { 
        try { 
            const lang = navigator.language.toLowerCase(); 
            const baseLang = lang.split('-')[0]; 
            if (baseLang === 'nl' && IBAN_SPECS['NL']) return 'NL'; 
            if (baseLang === 'de' && IBAN_SPECS['DE']) return 'DE'; 
            if (baseLang === 'fr') { 
                if ((lang.includes('be') || lang.includes('bru')) && IBAN_SPECS['BE']) return 'BE'; 
                if (IBAN_SPECS['FR']) return 'FR'; 
                if (IBAN_SPECS['BE']) return 'BE'; 
            } 
            if (baseLang === 'es' && IBAN_SPECS['ES']) return 'ES'; 
            if (baseLang === 'it' && IBAN_SPECS['IT']) return 'IT'; 
        } catch (e) { 
            console.warn("Could not access navigator.language:", e); 
        } 
        return 'NL'; 
    }
    
    function populateCountrySelect() { 
        countrySelect.innerHTML = ''; 
        const sortedCountries = Object.keys(IBAN_SPECS).sort((a, b) => 
            (COUNTRY_NAMES[a] || a).localeCompare(COUNTRY_NAMES[b] || b)
        ); 
        sortedCountries.forEach(countryCode => { 
            const option = document.createElement('option'); 
            option.value = countryCode; 
            option.textContent = COUNTRY_NAMES[countryCode] || countryCode; 
            countrySelect.appendChild(option); 
        }); 
    }
    
    function updateBankSelector() { 
        const selectedCountry = countrySelect.value; 
        const banksForCountryData = BANK_DATA[selectedCountry]; 
        const helpTextEl = document.getElementById('bank-help'); 
        bankSelect.innerHTML = ''; 
        
        if (banksForCountryData && Object.keys(banksForCountryData).length > 0) { 
            const sortedBanks = Object.entries(banksForCountryData).sort((a, b) => 
                (a[1].name || a[0]).localeCompare(b[1].name || b[0])
            ); 
            let isFirstBank = true; 
            
            for (const [bic, bank] of sortedBanks) { 
                const option = document.createElement('option'); 
                option.value = bic; 
                option.textContent = bank.name || bic; 
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
            if(helpTextEl) helpTextEl.textContent = `No specific banks available for ${COUNTRY_NAMES[selectedCountry] || selectedCountry}. A random valid bank code will be used.`; 
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
    
    function handleCopyClick() { 
        const ibanRaw = ibanResultSpan.textContent.replace(/\s/g, ''); 
        
        if (!navigator.clipboard) { 
            console.warn("Clipboard API unavailable."); 
            // Fallback approach
            try {
                const tempInput = document.createElement('textarea');
                tempInput.value = ibanRaw;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                copyMessage.textContent = "Copied!"; 
                copyMessage.classList.remove('hidden'); 
                copyMessage.setAttribute('role', 'status');
                
                setTimeout(() => { 
                    copyMessage.textContent = ''; 
                    copyMessage.classList.add('hidden'); 
                    copyMessage.removeAttribute('role'); 
                }, 3000);
                return;
            } catch (err) {
                copyMessage.textContent = "Clipboard API unavailable"; 
                copyMessage.classList.remove('hidden');
                return;
            }
        } 
        
        navigator.clipboard.writeText(ibanRaw).then(() => { 
            copyMessage.textContent = "Copied!"; 
            copyMessage.classList.remove('hidden'); 
            copyMessage.setAttribute('role', 'status'); 
            
            setTimeout(() => { 
                copyMessage.textContent = ''; 
                copyMessage.classList.add('hidden'); 
                copyMessage.removeAttribute('role'); 
            }, 3000); 
        }).catch(err => { 
            console.error('Copy failed:', err); 
            copyMessage.textContent = "Copy failed"; 
            copyMessage.classList.remove('hidden'); 
            
            setTimeout(() => { 
                copyMessage.textContent = ''; 
                copyMessage.classList.add('hidden'); 
            }, 3000); 
        }); 
    }
    
    function handleDownloadBulkClick() { 
        const text = bulkIbansTextarea.value; 
        if (!text || !downloadBulkBtn) return; 
        
        try { 
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' }); 
            const url = URL.createObjectURL(blob); 
            const link = document.createElement('a'); 
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
            bulkResultContainer.classList.add('hidden'); 
            singleResultContainer.classList.remove('hidden'); 
            copyMessage.textContent = ''; 
            clearError(ibanForm, countryError); 
        } else { 
            singleResultContainer.classList.add('hidden'); 
            showError(ibanForm, countryError, `Failed to generate IBAN for ${COUNTRY_NAMES[country] || country}.`); 
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
            bulkIbansTextarea.value = ibans.join('\n'); 
            singleResultContainer.classList.add('hidden'); 
            bulkResultContainer.classList.remove('hidden'); 
            clearError(ibanForm, countryError); 
            
            if (failures > 0) { 
                showError(ibanForm, quantityError, `Note: ${failures} out of ${quantity} IBANs could not be generated.`); 
            } else { 
                clearError(ibanForm, quantityError); 
            } 
        } else { 
            bulkResultContainer.classList.add('hidden'); 
            showError(ibanForm, countryError, `Failed to generate any IBANs for ${COUNTRY_NAMES[country] || country}.`); 
        } 
    }
    
    function getSelectedBankInfo() { 
        if (bankContainer.classList.contains('hidden') || !bankSelect.value) { 
            return null; 
        } 
        
        const countryBanksData = BANK_DATA[countrySelect.value]; 
        return (countryBanksData && countryBanksData[bankSelect.value]) ? countryBanksData[bankSelect.value] : null; 
    }

    function generateIBAN(country, bankInfo) { 
        const spec = IBAN_SPECS[country]; 
        
        if (!spec) { 
            console.error(`IBAN spec missing: ${country}`); 
            return null; 
        } 
        
        let bankCodePart = '', branchCodePart = '', accountPart = '', nationalCheckPart = ''; 
        const bbanBankCode = bankInfo ? bankInfo.code : null; 
        
        try { 
            switch (country) { 
                case 'NL': 
                    bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType); 
                    accountPart = generateRandomChars(spec.accountLength, spec.accountType); 
                    break; 
                case 'DE': 
                    bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType); 
                    accountPart = generateRandomChars(spec.accountLength, spec.accountType); 
                    break; 
                case 'BE': 
                    bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType); 
                    accountPart = generateRandomChars(spec.accountLength, spec.accountType); 
                    nationalCheckPart = calculateMod97Check((bankCodePart + accountPart).replace(/\D/g, '')); 
                    break; 
                case 'FR': 
                    bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType); 
                    branchCodePart = generateRandomChars(spec.branchCodeLength, spec.branchCodeType); 
                    accountPart = generateRandomChars(spec.accountLength, spec.accountType); 
                    nationalCheckPart = generateRandomChars(spec.nationalCheckLength, spec.nationalCheckType); 
                    break; 
                case 'ES': 
                    bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType); 
                    branchCodePart = generateRandomChars(spec.branchCodeLength, spec.branchCodeType); 
                    accountPart = generateRandomChars(spec.accountLength, spec.accountType); 
                    nationalCheckPart = generateRandomChars(spec.nationalCheckLength, spec.nationalCheckType); 
                    break; 
                case 'IT': 
                    nationalCheckPart = generateRandomChars(spec.nationalCheckLength, spec.nationalCheckType); 
                    bankCodePart = bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType); 
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
        
        let bban = ''; 
        
        switch (country) { 
            case 'IT': 
                bban = nationalCheckPart + bankCodePart + branchCodePart + accountPart; 
                break; 
            case 'FR': 
                bban = bankCodePart + branchCodePart + accountPart + nationalCheckPart; 
                break; 
            case 'ES': 
                bban = bankCodePart + branchCodePart + nationalCheckPart + accountPart; 
                break; 
            case 'BE': 
                bban = bankCodePart + accountPart + nationalCheckPart; 
                break; 
            default: 
                bban = (bankCodePart || '') + (branchCodePart || '') + (accountPart || '') + (nationalCheckPart || ''); 
                break; 
        } 
        
        const expectedBbanLength = spec.length - 4; 
        
        if (bban.length !== expectedBbanLength) { 
            console.warn(`Adjusting BBAN length for ${country}: expected ${expectedBbanLength}, got ${bban.length}.`); 
            bban = bban.length < expectedBbanLength ? bban.padEnd(expectedBbanLength, '0') : bban.substring(0, expectedBbanLength); 
            
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
    
    function generateRandomChars(length, type = 'numeric') { 
        if (length <= 0) return ''; 
        
        let result = ''; 
        const alphaUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
        const numeric = '0123456789'; 
        const alphanumericUpper = alphaUpper + numeric; 
        let chars = numeric; 
        
        switch(type?.toLowerCase()){ 
            case 'alphaupper': 
            case 'alpha': 
                chars = alphaUpper; 
                break; 
            case 'alphanumericupper': 
            case 'alphanumeric': 
            case 'c': 
                chars = alphanumericUpper; 
                break; 
            case 'numeric': 
            case 'n': 
                chars = numeric; 
                break; 
            default: 
                console.warn(`Unknown type '${type}', using numeric.`); 
                chars = numeric; 
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
        let numerical = ''; 
        
        for (let i = 0; i < rearranged.length; i++) { 
            const char = rearranged.charAt(i).toUpperCase(); 
            
            if (char >= 'A' && char <= 'Z') {
                numerical += (char.charCodeAt(0) - 55).toString(); 
            } else if (char >= '0' && char <= '9') { 
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
            return '00'; 
        } 
        
        try { 
            // Handle large numbers safely without BigInt
            let remainder = 0;
            for (let i = 0; i < numericString.length; i++) {
                remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
            }
            
            if (remainder === 0) remainder = 97; 
            return remainder < 10 ? `0${remainder}` : `${remainder}`; 
        } catch(e) { 
            console.error("Error Mod97 check:", e); 
            return '99'; 
        } 
    }
    
    function formatIBAN(iban) { 
        return typeof iban === 'string' ? iban.replace(/(.{4})/g, "$1 ").trim() : ''; 
    }

    // --- UI Functions ---
    function clearResults() { 
        singleResultContainer.classList.add('hidden'); 
        bulkResultContainer.classList.add('hidden'); 
        resultSection.classList.add('hidden'); 
        ibanResultSpan.textContent = ''; 
        copyMessage.textContent = ''; 
        bulkIbansTextarea.value = ''; 
        bulkCountSpan.textContent = '0'; 
        bulkHeading.textContent = `Generated IBANs (0)`; 
    }
    
    function showError(inputElement, errorElement, message) { 
        if (errorElement && message) { 
            errorElement.textContent = message; 
            errorElement.classList.add('has-error'); 
            
            if (inputElement) { 
                inputElement.setAttribute('aria-invalid', 'true'); 
                const describedByIds = (inputElement.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== errorElement.id); 
                describedByIds.push(errorElement.id); 
                inputElement.setAttribute('aria-describedby', describedByIds.join(' ')); 
            } 
        } 
    }
    
    function clearError(inputElement, errorElement) { 
        if (errorElement) { 
            errorElement.textContent = ''; 
            errorElement.classList.remove('has-error'); 
        } 
        
        if (inputElement) { 
            inputElement.removeAttribute('aria-invalid'); 
            
            if (errorElement?.id) { 
                const describedByIds = (inputElement.getAttribute('aria-describedby') || '').split(' ').filter(id => id && id !== errorElement.id); 
                const newAriaDesc = describedByIds.join(' '); 
                
                if (newAriaDesc) { 
                    inputElement.setAttribute('aria-describedby', newAriaDesc); 
                } else { 
                    inputElement.removeAttribute('aria-describedby'); 
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

    // --- Event Listeners ---
    countrySelect.addEventListener('change', handleCountryChange);
    ibanForm.addEventListener('submit', handleFormSubmit);
    copyBtn.addEventListener('click', handleCopyClick);
    if (downloadBulkBtn) downloadBulkBtn.addEventListener('click', handleDownloadBulkClick);

    // --- Initialization ---
    populateCountrySelect();
    try { 
        countrySelect.value = getSuggestedCountry(); 
    } catch(e) { 
        if(countrySelect.options.length > 0) countrySelect.selectedIndex = 0; 
    }
    updateBankSelector();
});