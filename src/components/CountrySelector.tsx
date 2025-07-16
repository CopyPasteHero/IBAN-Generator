import React from 'react';
import { IBAN_SPECS, COUNTRY_NAMES } from '../utils/ibanCalculator';

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  error?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onCountryChange,
  error
}) => {
  const sortedCountries = Object.keys(IBAN_SPECS).sort((a, b) =>
    (COUNTRY_NAMES[a] || a).localeCompare(COUNTRY_NAMES[b] || b)
  );

  return (
    <div className="mb-6">
      <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Country:
      </label>
      <select
        id="country"
        name="country"
        value={selectedCountry}
        onChange={(e) => onCountryChange(e.target.value)}
        required
        aria-describedby="country-help country-error"
        aria-invalid={error ? 'true' : 'false'}
        className={`
          w-full px-4 py-3 text-base border rounded-lg font-medium transition-colors duration-200
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
          focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
      >
        {sortedCountries.map((countryCode) => (
          <option key={countryCode} value={countryCode}>
            {COUNTRY_NAMES[countryCode] || countryCode}
          </option>
        ))}
      </select>
      <p id="country-help" className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Select the country for the IBAN.
      </p>
      {error && (
        <p id="country-error" className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-800" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  );
};

export default CountrySelector;