# Security Policy

## Reporting Security Issues

If you discover a security vulnerability in the IBAN Generator, please report it responsibly:

1. **Do NOT** open a public GitHub issue
2. Send details to the repository maintainer via GitHub's private vulnerability reporting feature
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Considerations

### Client-Side Only

This tool runs entirely in the browser. No data is sent to any server. All IBAN generation happens locally on your device.

### Random Number Generation

- The tool uses `window.crypto.getRandomValues()` for cryptographically secure random number generation when available
- Falls back to `Math.random()` only if crypto API is unavailable

### Content Security Policy

The application implements a strict Content Security Policy (CSP) to prevent:

- Cross-site scripting (XSS) attacks
- Unauthorized script execution
- Data injection attacks

### Input Validation

- All user inputs are validated before processing
- Country and bank selections are restricted to predefined values
- Quantity input is limited to 1-100 range

### No External Dependencies

The tool uses vanilla JavaScript with no external runtime dependencies, reducing:

- Supply chain attack surface
- Third-party vulnerability risks
- Privacy concerns from external requests

## Best Practices

### For Users

- Generated IBANs are for **testing purposes only**
- Never use generated IBANs for fraudulent activities
- Do not share generated IBANs publicly if they might be confused with real accounts

### For Developers

- Keep dependencies up to date
- Review all changes for security implications
- Follow secure coding practices
- Test thoroughly before deploying

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Known Limitations

- Generated IBANs are mathematically valid but are **not** linked to real bank accounts
- The tool does not validate whether a bank code actually exists
- No verification of account number formats beyond length and character type

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Users should always use the latest version available at [https://probeer.me/iban](https://probeer.me/iban).
