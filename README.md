# probeer.me – A playful place for practical tools

[![CI](https://github.com/CopyPasteHero/IBAN-Generator/actions/workflows/ci.yml/badge.svg)](https://github.com/CopyPasteHero/IBAN-Generator/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

This repository powers [https://probeer.me](https://probeer.me),  
a personal playground by CopyPasteHero for building tiny tools.

---

## 🛠️ Current Tool

### **IBAN Generator**

A simple and accessible client-side tool to generate valid IBANs.

- **Live demo**: [https://probeer.me/iban](https://probeer.me/iban)
- **Source code**: [`/iban`](./iban/)
- **README**: [`/iban/README.md`](./iban/README.md)

---

## 📦 Repo Structure

- **/iban/** → IBAN Generator tool (self-contained)
- **/index.html** → Redirects to /iban
- **/CNAME** → Custom domain config (probeer.me)
- **/404.html** → Fallback page
- **/robots.txt** → SEO basics
- **/.github/workflows/** → CI/CD configuration
- **/CONTRIBUTING.md** → Contribution guidelines
- **/SECURITY.md** → Security policies

---

## 🌍 Live Access

- https://probeer.me
- https://probeer.me/iban

---

## 🧪 Local Development

```bash
git clone https://github.com/CopyPasteHero/IBAN-Generator.git
cd IBAN-Generator

# Install dependencies (for linting/formatting)
npm install

# Run linting
npm run lint

# Format code
npm run format

# Start local server
npm run serve
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 🔒 Security

Please see [SECURITY.md](./SECURITY.md) for information about reporting security vulnerabilities.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
