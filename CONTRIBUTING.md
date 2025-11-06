# Contributing to IBAN Generator

Thank you for considering contributing to the IBAN Generator! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

This project aims to be welcoming and inclusive. Please be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:

- A clear description of the bug
- Steps to reproduce it
- Expected vs actual behavior
- Browser and version (if applicable)

### Suggesting Enhancements

Enhancement suggestions are welcome! Please open an issue with:

- A clear description of the enhancement
- Why this enhancement would be useful
- Any potential implementation ideas

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and formatting: `npm run validate`
5. Commit your changes with a clear message
6. Push to your branch
7. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 14 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/CopyPasteHero/IBAN-Generator.git
cd IBAN-Generator

# Install dependencies
npm install
```

### Development Workflow

```bash
# Lint the code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format the code
npm run format

# Check formatting
npm run format:check

# Run all validations
npm run validate

# Start a local server
npm run serve
```

## Code Style

This project uses:

- **ESLint** for JavaScript linting
- **Prettier** for code formatting
- **EditorConfig** for consistent editor settings

### JavaScript Guidelines

- Use double quotes for strings
- Use 2 spaces for indentation
- Always use semicolons
- Use trailing commas in multiline objects/arrays
- Add JSDoc comments for functions
- Follow existing code patterns

### HTML Guidelines

- Use semantic HTML5 elements
- Include proper ARIA attributes for accessibility
- Keep markup clean and well-indented

### CSS Guidelines

- Use CSS custom properties (variables)
- Follow BEM-like naming conventions where appropriate
- Support dark mode using `prefers-color-scheme`
- Ensure responsive design

## Adding Support for New Countries

To add a new country:

1. Add the country specification to `IBAN_SPECS` in `script.js`:

```javascript
XX: {
  length: 24,
  bankCodeLength: 4,
  accountLength: 16,
  bankCodeType: "numeric",
  accountType: "numeric"
}
```

2. Add the country name to `COUNTRY_NAMES`:

```javascript
XX: "Country Name";
```

3. (Optional) Add bank data to `BANK_DATA`:

```javascript
XX: {
  BANKCODE: { name: "Bank Name", code: "1234" }
}
```

4. Update the `generateIBAN` function with country-specific logic if needed

## Testing

While there's no automated test suite currently, please:

- Test your changes in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile devices if possible
- Verify accessibility features work correctly
- Generate IBANs and verify they are valid

## Questions?

Feel free to open an issue for any questions about contributing!
