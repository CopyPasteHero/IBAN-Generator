import React, { useState } from 'react';
import { formatIBAN } from '../utils/ibanCalculator';

interface IbanResultProps {
  iban?: string;
  ibans?: string[];
  quantity: number;
  isVisible: boolean;
}

const IbanResult: React.FC<IbanResultProps> = ({ iban, ibans, quantity, isVisible }) => {
  const [copyMessage, setCopyMessage] = useState<string>('');
  const [copyMessageTimeout, setCopyMessageTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  if (!isVisible) {
    return null;
  }

  const handleCopy = async (textToCopy: string) => {
    const ibanRaw = textToCopy.replace(/\s/g, "");

    try {
      if (!navigator.clipboard) {
        // Fallback approach
        const tempInput = document.createElement("textarea");
        tempInput.value = ibanRaw;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
        
        showCopyMessage("Copied!");
        return;
      }

      await navigator.clipboard.writeText(ibanRaw);
      showCopyMessage("Copied!");
    } catch (err) {
      console.error("Copy failed:", err);
      showCopyMessage("Copy failed");
    }
  };

  const showCopyMessage = (message: string) => {
    if (copyMessageTimeout) {
      clearTimeout(copyMessageTimeout);
    }
    
    setCopyMessage(message);
    const timeout = setTimeout(() => {
      setCopyMessage('');
    }, 3000);
    setCopyMessageTimeout(timeout);
  };

  const handleDownloadBulk = () => {
    if (!ibans || ibans.length === 0) return;

    try {
      const text = ibans.join('\n');
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `iban-results-${ibans.length}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error downloading bulk:", e);
    }
  };

  return (
    <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
        Generated Results
      </h2>

      {/* Single IBAN Result */}
      {quantity === 1 && iban && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Generated IBAN
          </h3>
          <div className="mb-6">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-2 flex-wrap">
              <span 
                className="font-mono text-lg tracking-wider text-gray-900 dark:text-gray-100 break-all mr-4 flex-grow"
                aria-live="polite"
              >
                {formatIBAN(iban)}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(formatIBAN(iban))}
                title="Copy to clipboard"
                aria-label="Copy IBAN to clipboard"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 p-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded flex-shrink-0"
              >
                <svg
                  aria-hidden="true"
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            {copyMessage && (
              <p className="text-sm text-green-600 dark:text-green-400 text-right font-medium min-h-[1.2em]" role="status" aria-live="polite">
                {copyMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bulk IBAN Results */}
      {quantity > 1 && ibans && ibans.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Generated IBANs ({ibans.length})
          </h3>
          <div className="mb-6">
            <label htmlFor="bulk-ibans" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Results:
            </label>
            <textarea
              id="bulk-ibans"
              value={ibans.join('\n')}
              readOnly
              rows={10}
              aria-describedby="bulk-ibans-help"
              aria-label="Generated IBANs"
              className="w-full px-4 py-3 text-sm font-mono bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-y-auto text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 focus:border-blue-500"
            />
            <p id="bulk-ibans-help" className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Generated IBANs, one per line.
            </p>
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleDownloadBulk}
              className="max-w-xs w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
            >
              Download Results (.txt)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IbanResult;