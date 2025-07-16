import React from 'react';
import IbanForm from './components/IbanForm';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans antialiased p-4">
      {/* Skip Navigation Link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only absolute top-2 left-2 bg-blue-600 text-white px-3 py-2 rounded-md font-semibold z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Skip to main content
      </a>

      <main id="main-content">
        <div className="max-w-3xl mx-auto py-8 px-4">
          {/* Header */}
          <header className="text-center mb-10" role="banner">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              IBAN Generator
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400">
              Generate valid IBAN numbers for testing purposes
            </p>
          </header>

          {/* Main Form */}
          <IbanForm />

          {/* Footer */}
          <footer className="text-center text-gray-600 dark:text-gray-400 text-sm mt-12 pt-4 border-t border-gray-200 dark:border-gray-700" role="contentinfo">
            <p className="mb-2">Open source IBAN generator</p>
            <p className="italic text-xs text-gray-500 dark:text-gray-500">
              Note: Generated IBANs are mathematically valid but do not correspond to real bank
              accounts. Use for testing purposes only.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;