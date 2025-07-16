import React from 'react';
import { BANK_DATA, COUNTRY_NAMES } from '../utils/ibanCalculator';

interface BankSelectorProps {
  selectedCountry: string;
  selectedBankBic: string;
  onBankChange: (bic: string) => void;
  error?: string;
}

const BankSelector: React.FC<BankSelectorProps> = ({
  selectedCountry,
  selectedBankBic,
  onBankChange,
  error
}) => {
  const banksForCountry = BANK_DATA[selectedCountry];
  const isVisible = banksForCountry && Object.keys(banksForCountry).length > 0;

  if (!isVisible) {
    return null;
  }

  const sortedBanks = useMemo(() => 
    Object.entries(banksForCountry).sort((a, b) =>
      (a[1].name || a[0]).localeCompare(b[1].name || b[0])
    ), 
    [banksForCountry]
  );

  return (
    <div className="mb-6">
      <label htmlFor="bank" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Bank:
      </label>
      <select
        id="bank"
        name="bank"
        value={selectedBankBic}
        onChange={(e) => onBankChange(e.target.value)}
        aria-describedby="bank-help bank-error"
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
        {sortedBanks.map(([bic, bank]) => (
          <option key={bic} value={bic}>
            {bank.name || bic}
          </option>
        ))}
      </select>
      <p id="bank-help" className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Optional: Select a bank for {COUNTRY_NAMES[selectedCountry] || selectedCountry}.
      </p>
      {error && (
        <p id="bank-error" className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-800" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
    </div>
  );
};

export default BankSelector;