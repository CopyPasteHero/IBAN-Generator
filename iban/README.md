# IBAN Generator

An open-source IBAN generator designed for testing purposes, focusing on usability and a clean interface.

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
*   **Accessible Design:** Includes semantic HTML, ARIA attributes for screen readers, keyboard navigation, focus management, and clear error handling. Supports `prefers-reduced-motion`.
*   **Responsive:** Adapts to different screen sizes.
*   **Print-Friendly:** Basic print stylesheet included to hide unnecessary elements.

## Live Demo

Try it out at: **[https://probeer.me/iban/](https://probeer.me/iban/)**

*(Note: It might take a few minutes for changes to become live after a commit due to GitHub Pages deployment time. Please ensure your repository’s Pages settings are configured correctly to serve from the branch containing the `iban-generator` folder.)*

## Project Structure

This project resides within the `iban-generator` folder of this repository and uses separate files for structure, styling, and logic:

*   `iban/index.html` - Main HTML structure (English UI text).
*   `iban/style.css` - CSS styling.
*   `iban/script.js` - JavaScript logic.
*   `iban/README.md` - This documentation file.
*   `iban/LICENSE` - The MIT License details.

## Getting Started (Local Development)

This is a client-side only application. No build process is required.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/CopyPasteHero/CopyPasteHero.github.io.git
    ```
2.  Navigate into the project directory:
    ```bash
    cd CopyPasteHero.github.io/iban
    ```
3.  Open the `index.html` file directly in your web browser. You need an internet connection for the external QRious library and Google Fonts to load.

## Deployment (GitHub Pages)

This project is intended to be hosted using GitHub Pages.

1.  Ensure the `iban` folder (containing `index.html`, `style.css`, `script.js`, etc.) is present in the branch you configure for GitHub Pages (e.g., `main`).
2.  In your repository settings under “Pages”, select the source branch (e.g., `main`) and the folder (`/(root)` since `iban-generator` is directly in the root of the `CopyPasteHero.github.io` repository).
3.  Ensure your custom domain (`probeer.me`) is correctly configured in the Pages settings and via DNS.
4.  The generator should become available at `https://probeer.me/iban.

## Contributing

Contributions are welcome! If you find bugs, have suggestions for improvement, or want to add features, please feel free to:

1.  **Open an Issue:** Discuss the change or report the bug first.
2.  **Fork the Repository:** Create your own copy.
3.  **Create a Branch:** (`git checkout -b feature/your-feature-name`)
4.  **Make Changes:** Implement your feature or bug fix.
5.  **Commit Changes:** (`git commit -m ‘Add some amazing feature’`)
6.  **Push to Branch:** (`git push origin feature/your-feature-name`)
7.  **Open a Pull Request:** Submit your changes for review.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Acknowledgements

*   [IBAN Registry](https://www.swift.com/standards/data-standards/iban) (SWIFT) for IBAN structure specifications.
*   [SEPA QR Code Guidelines](https://www.europeanpaymentscouncil.eu/document-library/guidance-documents/sepa-qr-code-guidelines) (EPC) for QR code structure.
*   [QRious](https://github.com/neocotic/qrious) library for QR code generation.
*   [Google Fonts](https://fonts.google.com/) for the Inter font.