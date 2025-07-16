/**
 * @fileoverview Error handling utilities for the IBAN generator
 * Provides consistent error display and accessibility features
 */

/**
 * Custom error types for better error handling
 */
export class IBANGenerationError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} country - Country code where error occurred
   * @param {Object} [details] - Additional error details
   */
  constructor(message, country, details = {}) {
    super(message);
    this.name = 'IBANGenerationError';
    this.country = country;
    this.details = details;
  }
}

export class ValidationError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} field - Field name where validation failed
   * @param {*} value - The invalid value
   */
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Display an error message with proper accessibility attributes
 * @param {HTMLElement} inputElement - The input element associated with the error
 * @param {HTMLElement} errorElement - The error display element
 * @param {string} message - The error message to display
 */
export function showError(inputElement, errorElement, message) {
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
 * Clear an error message and remove accessibility attributes
 * @param {HTMLElement} inputElement - The input element associated with the error
 * @param {HTMLElement} errorElement - The error display element
 */
export function clearError(inputElement, errorElement) {
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
 * Clear all errors from form elements
 * @param {Object} elements - Object containing DOM element references
 */
export function clearAllErrors(elements) {
  const { 
    countrySelect, bankSelect, quantityInput, ibanForm,
    countryError, bankError, quantityError 
  } = elements;
  
  clearError(countrySelect, countryError);
  clearError(bankSelect, bankError);
  clearError(quantityInput, quantityError);
  clearError(ibanForm, countryError);
  clearError(ibanForm, quantityError);
}

/**
 * Create a user-friendly error message based on error type
 * @param {Error} error - The error object
 * @param {string} [context] - Additional context for the error
 * @returns {string} User-friendly error message
 */
export function createUserFriendlyMessage(error, context = '') {
  if (error instanceof IBANGenerationError) {
    return `Failed to generate IBAN for ${error.country}. ${context}`;
  }
  
  if (error instanceof ValidationError) {
    return `Invalid ${error.field}: ${error.message}`;
  }
  
  // Generic error handling
  const baseMessage = context || 'An error occurred';
  return `${baseMessage}. Please try again.`;
}

/**
 * Log error with additional context for debugging
 * @param {Error} error - The error to log
 * @param {string} [context] - Additional context
 */
export function logError(error, context = '') {
  const errorDetails = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    context
  };
  
  if (error instanceof IBANGenerationError) {
    errorDetails.country = error.country;
    errorDetails.details = error.details;
  } else if (error instanceof ValidationError) {
    errorDetails.field = error.field;
    errorDetails.value = error.value;
  }
  
  console.error('IBAN Generator Error:', errorDetails);
}