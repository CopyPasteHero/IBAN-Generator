# IBAN Generator

An open-source IBAN generator for testing purposes. Designed with accessibility in mind (striving for EAA/WCAG 2.1 AA compliance). Interface is in English.

**Disclaimer:** Generated IBANs are mathematically valid according to the MOD-97 algorithm but **do not correspond to real bank accounts**. Use for testing purposes only.

## Features

*   **Valid IBAN Generation:** Creates IBANs for multiple European countries (NL, DE, BE, FR, ES, IT).
*   **Default Country Suggestion:** Attempts to pre-select the country based on browser language settings (falls back to NL).
*   **Default Bank Selection:** Automatically selects the first available bank for the chosen country.
*   **Correct Structure:** Follows country-specific lengths and attempts to use realistic BBAN structures.
    *   _Note: National check digit calculations are complex and currently implemented in a simplified manner or as placeholders. The main IBAN check digits are correctly calculated._
*   **Bank Selection:** Allows manual selection of specific banks for supported countries.
*   **Bulk Generation:** Generate up to 100 IBANs at once.
*   **SEPA QR Code:** Generates a scannable SEPA QR code (EPC069-12 v2 compliant structure) for single IBANs.
*   **Download Options:** Download QR code as a PNG image or bulk-generated IBANs as a TXT file.
*   **Copy to Clipboard:** Easily copy the generated IBAN with feedback.
*   **Accessible Design:** Strives to meet WCAG 2.1 Level AA guidelines (semantic HTML, ARIA attributes, keyboard navigation, focus management, error handling). Includes `prefers-reduced-motion` support.
*   **Responsive:** Adapts to different screen sizes.
*   **Print-Friendly:** Basic print stylesheet included to hide unnecessary elements.

## Live Demo

Try it out at: [https://your-username.github.io/your-repo-name/](https://your-username.github.io/your-repo-name/) <!-- ## UPDATE THIS LINK ## -->

## Project Structure

This project uses separate files for structure, styling, and logic:

*   `index.html` - Main HTML structure (with ARIA, fieldset/legend). English UI text.
*   `style.css` - CSS styling (responsive, focus styles, CSS variables, print styles).
*   `script.js` - JavaScript logic (IBAN generation, UI interaction, QR code generation, error handling, default country detection).
*   `README.md` - This documentation file.
*   `LICENSE` - The MIT License details.

## Getting Started

This is a client-side only application. No build process is required.

### Using the Live Demo

Simply visit the [Live Demo URL](https://your-username.github.io/your-repo-name/) <!-- ## UPDATE THIS LINK ## --> in your browser.

### Local Development

1.  **Clone the repository:**
    ```bash
    # Replace with your actual repository URL
    git clone https://github.com/your-username/your-repo-name.git
    ```
    (Or download the files manually into a folder).
2.  Navigate into the project directory:
    ```bash
    cd your-repo-name
    ```
3.  Open the `index.html` file directly in your web browser. You need an internet connection for the external QRious library and Google Fonts to load.

## Contributing

Contributions are welcome! If you find bugs, have suggestions for improvement, or want to add features, please feel free to:

1.  **Open an Issue:** Discuss the change or report the bug first.
2.  **Fork the Repository:** Create your own copy.
3.  **Create a Branch:** (`git checkout -b feature/your-feature-name`)
4.  **Make Changes:** Implement your feature or bug fix.
5.  **Commit Changes:** (`git commit -m 'Add some amazing feature'`)
6.  **Push to Branch:** (`git push origin feature/your-feature-name`)
7.  **Open a Pull Request:** Submit your changes for review.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgements

*   [IBAN Registry](https://www.swift.com/standards/data-standards/iban) (SWIFT) for IBAN structure specifications.
*   [SEPA QR Code Guidelines](https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/sepa-qr-code-guidelines) (EPC) for QR code structure.
*   [QRious](https://github.com/neocotic/qrious) library for QR code generation.
*   [Google Fonts](https://fonts.google.com/) for the Inter font.