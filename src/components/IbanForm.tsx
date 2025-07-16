import React, { useState, useEffect } from 'react';
import CountrySelector from './CountrySelector';
import BankSelector from './BankSelector';
import IbanResult from './IbanResult';
import { 
  getSuggestedCountry, 
  BANK_DATA, 
  generateIBAN, 
  generateMultipleIBANs,
  Bank 
} from '../utils/ibanCalculator';

interface FormErrors {
  country?: string;
  bank?: string;
  quantity?: string;
}

const IbanForm: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedBankBic, setSelectedBankBic] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [errors, setErrors] = useState<FormErrors>({});
  const [result, setResult] = useState<{iban?: string; ibans?: string[]}>({});
  const [isResultVisible, setIsResultVisible] = useState<boolean>(false);

  // Initialize with suggested country
  useEffect(() => {
    const suggestedCountry = getSuggestedCountry();
    setSelectedCountry(suggestedCountry);
    updateBankSelection(suggestedCountry);
  }, []);

  const updateBankSelection = (country: string) => {
    const banksForCountry = BANK_DATA[country];
    if (banksForCountry && Object.keys(banksForCountry).length > 0) {
      const firstBankBic = Object.keys(banksForCountry)[0];
      setSelectedBankBic(firstBankBic);
    } else {
      setSelectedBankBic('');
    }
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    updateBankSelection(country);
    clearResults();
    clearAllErrors();
  };

  const handleBankChange = (bic: string) => {
    setSelectedBankBic(bic);
    clearResults();
    clearErrors(['bank']);
  };

  const handleQuantityChange = (value: number) => {
    setQuantity(value);
    clearResults();
    clearErrors(['quantity']);
  };

  const clearResults = () => {
    setResult({});
    setIsResultVisible(false);
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const clearErrors = (errorKeys: (keyof FormErrors)[]) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      errorKeys.forEach(key => delete newErrors[key]);
      return newErrors;
    });
  };

  const showError = (key: keyof FormErrors, message: string) => {
    setErrors(prev => ({ ...prev, [key]: message }));
  };

  const getSelectedBankInfo = (): Bank | null => {
    if (!selectedBankBic) return null;
    const countryBanks = BANK_DATA[selectedCountry];
    return countryBanks?.[selectedBankBic] || null;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    clearResults();
    clearAllErrors();

    // Validation
    if (!selectedCountry) {
      showError('country', 'Please select a valid country.');
      return;
    }

    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
      showError('quantity', 'Please enter a number between 1 and 100.');
      return;
    }

    const bankInfo = getSelectedBankInfo();

    if (quantity === 1) {
      const iban = generateIBAN(selectedCountry, bankInfo);
      if (iban) {
        setResult({ iban });
        setIsResultVisible(true);
      } else {
        showError('country', `Failed to generate IBAN for ${selectedCountry}.`);
      }
    } else {
      const ibans = generateMultipleIBANs(selectedCountry, bankInfo, quantity);
      if (ibans.length > 0) {
        setResult({ ibans });
        setIsResultVisible(true);
        
        if (ibans.length < quantity) {
          showError('quantity', `Note: ${quantity - ibans.length} out of ${quantity} IBANs could not be generated.`);
        }
      } else {
        showError('country', `Failed to generate any IBANs for ${selectedCountry}.`);
      }
    }

    // Scroll to results
    useEffect(() => {
      if (isResultVisible) {
        const timeoutId = setTimeout(() => {
          const resultSection = document.querySelector('[data-result-section]');
          if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);

        return () => clearTimeout(timeoutId);
      }
    }, [isResultVisible]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-200 p-8 border border-gray-200 dark:border-gray-700">
      {/* NoScript Warning */}
      <noscript>
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 px-4 py-3 rounded-md">
          JavaScript is required for this tool to function. Please enable JavaScript in your browser.
        </div>
      </noscript>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 w-full">
            Generator Settings
          </legend>

          <CountrySelector 
            selectedCountry={selectedCountry}
            onCountryChange={handleCountryChange}
            error={errors.country}
          />

          <BankSelector 
            selectedCountry={selectedCountry}
            selectedBankBic={selectedBankBic}
            onBankChange={handleBankChange}
            error={errors.bank}
          />

          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of IBANs to generate:
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              min="1"
              max="100"
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              required
              autoComplete="off"
              aria-describedby="quantity-help quantity-error"
              aria-invalid={errors.quantity ? 'true' : 'false'}
              className={`
                w-full px-4 py-3 text-base border rounded-lg font-medium transition-colors duration-200
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500
                ${errors.quantity 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }
              `}
            />
            <p id="quantity-help" className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter a number between 1 and 100.
            </p>
            {errors.quantity && (
              <p id="quantity-error" className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-800" role="alert" aria-live="assertive">
                {errors.quantity}
              </p>
            )}
          </div>

          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg border border-transparent transition-colors duration-200 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Generate IBAN{quantity > 1 ? 's' : ''}
            </button>
          </div>
        </fieldset>
      </form>

      {/* Results Section */}
      <div data-result-section>
        <IbanResult 
          iban={result.iban}
          ibans={result.ibans}
          quantity={quantity}
          isVisible={isResultVisible}
        />
      </div>
    </div>
  );
};

export default IbanForm;