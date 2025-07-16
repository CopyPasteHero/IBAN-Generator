/**
 * @fileoverview Accessibility utilities for the IBAN generator
 * Provides screen reader announcements and other accessibility features
 */

/**
 * Accessibility Announcer Singleton for screen reader notifications
 */
class AccessibilityAnnouncerClass {
  constructor() {
    this.element = null;
    this.timer = null;
    this.clearTimer = null;
    this.DEBOUNCE_DELAY = 100;
  }

  /**
   * Initialize the announcer element if it doesn't exist
   */
  init() {
    if (!this.element) {
      this.element = document.createElement("div");
      this.element.setAttribute("aria-live", "polite");
      this.element.setAttribute("aria-atomic", "true");
      this.element.className = "sr-only";
      document.body.appendChild(this.element);
    }
  }

  /**
   * Announce a message to screen readers with debouncing
   * @param {string} message - Message to announce
   * @param {number} [delay] - Delay before announcement (default: DEBOUNCE_DELAY)
   */
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
        this.clearTimer = setTimeout(() => {
          if (this.element) {
            this.element.textContent = "";
          }
        }, 3000);
      }
    }, delay);
  }

  /**
   * Clean up all timers and remove the announcer element
   */
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
  }
}

/**
 * Singleton instance of the AccessibilityAnnouncer
 */
export const AccessibilityAnnouncer = new AccessibilityAnnouncerClass();

/**
 * Announce successful IBAN generation
 * @param {number} count - Number of IBANs generated
 * @param {string} country - Country name
 */
export function announceIBANGeneration(count, country) {
  const message = count === 1 
    ? `Generated 1 IBAN for ${country}` 
    : `Generated ${count} IBANs for ${country}`;
  AccessibilityAnnouncer.announce(message);
}

/**
 * Announce successful copy operation
 */
export function announceCopySuccess() {
  AccessibilityAnnouncer.announce("IBAN copied to clipboard");
}

/**
 * Announce form validation errors
 * @param {string} fieldName - Name of the field with error
 * @param {string} errorMessage - Error message
 */
export function announceValidationError(fieldName, errorMessage) {
  AccessibilityAnnouncer.announce(`${fieldName} error: ${errorMessage}`);
}

/**
 * Announce country or bank selection changes
 * @param {string} type - 'country' or 'bank'
 * @param {string} selection - Selected item name
 */
export function announceSelectionChange(type, selection) {
  AccessibilityAnnouncer.announce(`${type} changed to ${selection}`);
}