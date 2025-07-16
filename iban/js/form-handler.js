/**
 * @fileoverview Form validation and submission handling for IBAN generator
 * Handles form events, validation, and orchestrates IBAN generation
 */

import { IBAN_SPECS, COUNTRY_NAMES } from './constants.js';
import { generateIBAN, generateBulkIBANs, formatIBANForDisplay } from './iban-generator.js';
import { 
  showError, clearError, clearAllErrors, ValidationError, 
  IBANGenerationError, createUserFriendlyMessage, logError 
} from './error-handler.js';
import { 
  clearResults, displaySingleIBAN, displayBulkIBANs, 
  getSelectedBankInfo, scrollToResults, updateBankSelector 
} from './ui-controller.js';
import { 
  announceIBANGeneration, announceValidationError, announceSelectionChange 
} from './accessibility.js';
import { debounce, sanitizeInput } from './utils.js';

/**
 * Form handler class to manage form events and validation
 */
export class FormHandler {
  constructor(elements) {
    this.elements = elements;
    this.debouncedValidateQuantity = debounce(this.validateQuantity.bind(this), 300);
  }

  /**
   * Handle country selection change
   * @param {Event} event - Change event
   */
  handleCountryChange(event) {
    const selectedCountry = event.target.value;
    const countryName = COUNTRY_NAMES[selectedCountry] || selectedCountry;
    
    updateBankSelector(this.elements);
    clearResults(this.elements);
    clearAllErrors(this.elements);
    
    announceSelectionChange('country', countryName);
  }

  /**
   * Handle bank selection change
   * @param {Event} event - Change event
   */
  handleBankChange(event) {
    const selectedBank = event.target.options[event.target.selectedIndex]?.text || 'Random bank';
    announceSelectionChange('bank', selectedBank);
  }

  /**
   * Handle quantity input changes with debouncing
   * @param {Event} event - Input event
   */
  handleQuantityInput(event) {
    this.debouncedValidateQuantity(event.target.value);
  }

  /**
   * Validate quantity input
   * @param {string} value - Input value
   * @private
   */
  validateQuantity(value) {
    const { quantityInput, quantityError } = this.elements;
    const quantity = parseInt(value, 10);
    
    clearError(quantityInput, quantityError);
    
    if (value && (isNaN(quantity) || quantity < 1 || quantity > 100)) {
      const error = new ValidationError(
        'Please enter a number between 1 and 100',
        'quantity',
        value
      );
      showError(quantityInput, quantityError, error.message);
      announceValidationError('Quantity', error.message);
    }
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    
    const { countrySelect, quantityInput, countryError, quantityError } = this.elements;
    
    clearResults(this.elements);
    clearAllErrors(this.elements);

    // Validate inputs
    const country = sanitizeInput(countrySelect.value);
    const quantityValue = sanitizeInput(quantityInput.value);
    const quantity = parseInt(quantityValue, 10);
    const bankCodeInfo = getSelectedBankInfo(this.elements);

    // Country validation
    if (!country || !IBAN_SPECS[country]) {
      const error = new ValidationError('Please select a valid country', 'country', country);
      showError(countrySelect, countryError, error.message);
      announceValidationError('Country', error.message);
      countrySelect.focus();
      return;
    }

    // Quantity validation
    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
      const error = new ValidationError('Please enter a number between 1 and 100', 'quantity', quantityValue);
      showError(quantityInput, quantityError, error.message);
      announceValidationError('Quantity', error.message);
      quantityInput.focus();
      return;
    }

    // Show loading state (could be enhanced with spinner)
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton?.textContent;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Generating...';
    }

    try {
      const { resultSection } = this.elements;
      if (resultSection) resultSection.classList.remove("hidden");

      if (quantity === 1) {
        await this.generateSingleIBAN(country, bankCodeInfo);
      } else {
        await this.generateBulkIBANs(country, bankCodeInfo, quantity);
      }

      scrollToResults(this.elements);
      
      // Announce success
      const countryName = COUNTRY_NAMES[country] || country;
      announceIBANGeneration(quantity, countryName);
      
    } catch (error) {
      logError(error, 'Form submission');
      const userMessage = createUserFriendlyMessage(error, 'Failed to generate IBAN');
      showError(this.elements.ibanForm, countryError, userMessage);
    } finally {
      // Restore submit button
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText || 'Generate IBAN(s)';
      }
    }
  }

  /**
   * Generate a single IBAN
   * @param {string} country - Country code
   * @param {Object|null} bankCodeInfo - Bank information
   * @private
   */
  async generateSingleIBAN(country, bankCodeInfo) {
    try {
      const iban = generateIBAN(country, bankCodeInfo);
      
      if (iban) {
        const formattedIban = formatIBANForDisplay(iban);
        displaySingleIBAN(formattedIban, this.elements);
        clearError(this.elements.ibanForm, this.elements.countryError);
        return iban;
      } else {
        throw new IBANGenerationError(
          `Failed to generate IBAN for ${COUNTRY_NAMES[country] || country}`,
          country
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate multiple IBANs
   * @param {string} country - Country code
   * @param {Object|null} bankCodeInfo - Bank information
   * @param {number} quantity - Number of IBANs to generate
   * @private
   */
  async generateBulkIBANs(country, bankCodeInfo, quantity) {
    try {
      const { ibans, failures } = generateBulkIBANs(country, bankCodeInfo, quantity);
      
      if (ibans.length > 0) {
        const formattedIbans = ibans.map(iban => formatIBANForDisplay(iban));
        displayBulkIBANs(formattedIbans, failures, this.elements);
        clearError(this.elements.ibanForm, this.elements.countryError);

        if (failures > 0) {
          const warningMessage = `Note: ${failures} out of ${quantity} IBANs could not be generated.`;
          showError(this.elements.ibanForm, this.elements.quantityError, warningMessage);
        } else {
          clearError(this.elements.ibanForm, this.elements.quantityError);
        }
        
        return { ibans: formattedIbans, failures };
      } else {
        throw new IBANGenerationError(
          `Failed to generate any IBANs for ${COUNTRY_NAMES[country] || country}`,
          country,
          { requestedQuantity: quantity }
        );
      }
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Create a form handler instance with the provided DOM elements
 * @param {Object} elements - DOM elements object
 * @returns {FormHandler} Configured form handler instance
 */
export function createFormHandler(elements) {
  return new FormHandler(elements);
}