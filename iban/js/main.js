/**
 * @fileoverview Main entry point for the IBAN generator application
 * Orchestrates all modules and handles initialization and cleanup
 */

import { getAllElements } from './dom-elements.js';
import { getSuggestedCountry } from './utils.js';
import { populateCountrySelect, copyToClipboard, downloadTextFile } from './ui-controller.js';
import { createFormHandler } from './form-handler.js';
import { AccessibilityAnnouncer, announceCopySuccess } from './accessibility.js';

/**
 * Main application class that manages the IBAN generator
 */
class IBANGeneratorApp {
  constructor() {
    this.elements = null;
    this.formHandler = null;
    this.eventListeners = [];
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      // Get all DOM elements
      this.elements = getAllElements();
      
      // Validate required elements exist
      if (!this.validateRequiredElements()) {
        console.error('Required DOM elements are missing');
        return false;
      }

      // Create form handler
      this.formHandler = createFormHandler(this.elements);

      // Set up UI
      this.setupUI();
      
      // Attach event listeners
      this.attachEventListeners();
      
      // Set up cleanup handlers
      this.setupCleanupHandlers();
      
      console.log('IBAN Generator initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize IBAN Generator:', error);
      return false;
    }
  }

  /**
   * Validate that all required DOM elements exist
   * @returns {boolean} Whether all required elements are present
   * @private
   */
  validateRequiredElements() {
    const required = [
      'ibanForm', 'countrySelect', 'quantityInput',
      'resultSection', 'countryError', 'quantityError'
    ];
    
    return required.every(elementName => {
      const element = this.elements[elementName];
      if (!element) {
        console.error(`Required element missing: ${elementName}`);
        return false;
      }
      return true;
    });
  }

  /**
   * Set up the initial UI state
   * @private
   */
  setupUI() {
    // Populate country dropdown
    populateCountrySelect(this.elements.countrySelect);
    
    // Set suggested country
    try {
      this.elements.countrySelect.value = getSuggestedCountry();
    } catch (e) {
      console.warn('Failed to set suggested country:', e);
      if (this.elements.countrySelect.options.length > 0) {
        this.elements.countrySelect.selectedIndex = 0;
      }
    }
    
    // Update bank selector for initial country
    this.formHandler.handleCountryChange({ target: this.elements.countrySelect });
  }

  /**
   * Attach all event listeners
   * @private
   */
  attachEventListeners() {
    const { 
      countrySelect, bankSelect, quantityInput, ibanForm, 
      copyBtn, downloadBulkBtn 
    } = this.elements;

    // Form events
    if (countrySelect) {
      this.addEventListenerWithCleanup(
        countrySelect, 
        'change', 
        this.formHandler.handleCountryChange.bind(this.formHandler)
      );
    }

    if (bankSelect) {
      this.addEventListenerWithCleanup(
        bankSelect,
        'change',
        this.formHandler.handleBankChange.bind(this.formHandler)
      );
    }

    if (quantityInput) {
      this.addEventListenerWithCleanup(
        quantityInput,
        'input',
        this.formHandler.handleQuantityInput.bind(this.formHandler)
      );
    }

    if (ibanForm) {
      this.addEventListenerWithCleanup(
        ibanForm,
        'submit',
        this.formHandler.handleFormSubmit.bind(this.formHandler)
      );
    }

    // Action buttons
    if (copyBtn) {
      this.addEventListenerWithCleanup(copyBtn, 'click', this.handleCopyClick.bind(this));
    }

    if (downloadBulkBtn) {
      this.addEventListenerWithCleanup(downloadBulkBtn, 'click', this.handleDownloadClick.bind(this));
    }
  }

  /**
   * Add event listener with automatic cleanup tracking
   * @param {HTMLElement} element - Element to attach listener to
   * @param {string} event - Event type
   * @param {Function} handler - Event handler function
   * @private
   */
  addEventListenerWithCleanup(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }

  /**
   * Handle copy button click
   * @param {Event} event - Click event
   * @private
   */
  async handleCopyClick(event) {
    event.preventDefault();
    
    const { ibanResultSpan, copyMessage } = this.elements;
    if (!ibanResultSpan) return;
    
    const ibanRaw = ibanResultSpan.textContent.replace(/\s/g, "");
    if (!ibanRaw) return;
    
    const success = await copyToClipboard(ibanRaw, copyMessage);
    if (success) {
      announceCopySuccess();
    }
  }

  /**
   * Handle download button click
   * @param {Event} event - Click event
   * @private
   */
  handleDownloadClick(event) {
    event.preventDefault();
    
    const { bulkIbansTextarea } = this.elements;
    if (!bulkIbansTextarea || !bulkIbansTextarea.value) return;
    
    const content = bulkIbansTextarea.value;
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `ibans-${timestamp}.txt`;
    
    downloadTextFile(content, filename);
  }

  /**
   * Set up cleanup handlers for page unload
   * @private
   */
  setupCleanupHandlers() {
    this.addEventListenerWithCleanup(window, 'beforeunload', this.cleanup.bind(this));
  }

  /**
   * Clean up resources and event listeners
   */
  cleanup() {
    // Clean up accessibility announcer
    AccessibilityAnnouncer.cleanup();
    
    // Remove all event listeners
    this.eventListeners.forEach(({ element, event, handler }) => {
      try {
        element.removeEventListener(event, handler);
      } catch (e) {
        console.warn('Failed to remove event listener:', e);
      }
    });
    this.eventListeners = [];
    
    console.log('IBAN Generator cleaned up');
  }
}

/**
 * Initialize the IBAN generator when DOM is ready
 */
export function initializeIBANGenerator() {
  const app = new IBANGeneratorApp();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
  } else {
    app.init();
  }
  
  // Make cleanup available globally for manual cleanup if needed
  window.ibanGeneratorCleanup = () => app.cleanup();
  
  return app;
}

// Auto-initialize if this module is loaded directly
if (typeof window !== 'undefined') {
  initializeIBANGenerator();
}