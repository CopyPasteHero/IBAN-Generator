# probeer.me – A playful place for practical tools

This repository powers [https://probeer.me](https://probeer.me),  
a personal playground by CopyPasteHero for building tiny tools.

---

## 🛠️ Current Tool

### **IBAN Generator**
A modern, accessible React application to generate valid IBANs built with TypeScript and Tailwind CSS.

- **Live demo**: [https://probeer.me/iban](https://probeer.me/iban)
- **Technology Stack**: React.js, TypeScript, Tailwind CSS
- **Features**: 
  - Support for 6 countries (NL, DE, BE, FR, ES, IT)
  - Bank-specific IBAN generation
  - Single and bulk IBAN generation (up to 100)
  - Copy to clipboard functionality
  - Download bulk results as .txt
  - Full accessibility support
  - Responsive design with dark mode support

---

## 📦 Repo Structure

- **/src/** → React TypeScript source code  
  - **/src/components/** → React components (CountrySelector, BankSelector, IbanForm, IbanResult, App)
  - **/src/utils/** → IBAN calculation utilities (ibanCalculator.ts)
- **/iban/** → Built React application (deployed)  
- **/public/** → Public assets and HTML template
- **/index.html** → Redirects to /iban  
- **/package.json** → Dependencies and build scripts
- **/tsconfig.json** → TypeScript configuration
- **/tailwind.config.js** → Tailwind CSS configuration

---

## 🌍 Live Access

- https://probeer.me  
- https://probeer.me/iban  

---

## 🧪 Local Development

### Prerequisites
- Node.js (v16 or higher)
- npm

### Setup
```bash
git clone https://github.com/CopyPasteHero/IBAN-Generator.git
cd IBAN-Generator
npm install
```

### Development
```bash
# Start development server
npm start

# Build for production
npm run build

# Build and deploy to /iban directory
npm run build:deploy
```

### Technology Stack
- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Create React App
- **Linting**: ESLint
- **Package Manager**: npm

### Features
- 🌍 **Multi-country support**: Netherlands, Germany, Belgium, France, Spain, Italy
- 🏦 **Bank selection**: Choose from predefined banks for each country
- 📊 **Bulk generation**: Generate up to 100 IBANs at once
- 📋 **Copy functionality**: One-click copy to clipboard
- 💾 **Export**: Download bulk results as text file
- ♿ **Accessibility**: Full WCAG compliance with screen reader support
- 🎨 **Modern UI**: Clean, responsive design with dark mode
- 🔒 **Client-side**: All generation happens locally, no data sent to servers
