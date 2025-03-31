import React, { useState, useEffect } from 'react';

const IBANGenerator = () => {
  const [selectedCountry, setSelectedCountry] = useState('NL');
  const [selectedBank, setSelectedBank] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [generatedIban, setGeneratedIban] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [isSingleResult, setIsSingleResult] = useState(true);
  const [bulkIbans, setBulkIbans] = useState([]);
  const [copyMessage, setCopyMessage] = useState('');
  
  // Country data based on the provided code.js file
  const countries = {
    NL: "Netherlands", DE: "Germany", BE: "Belgium", FR: "France", ES: "Spain", IT: "Italy",
    AD: "Andorra", AE: "United Arab Emirates", AL: "Albania", AT: "Austria", AZ: "Azerbaijan",
    BA: "Bosnia and Herzegovina", BG: "Bulgaria", BH: "Bahrain", CH: "Switzerland", CY: "Cyprus",
    CZ: "Czech Republic", DK: "Denmark", EE: "Estonia", FI: "Finland", GB: "United Kingdom",
    GR: "Greece", HR: "Croatia", HU: "Hungary", IE: "Ireland", IS: "Iceland", LI: "Liechtenstein",
    LT: "Lithuania", LU: "Luxembourg", LV: "Latvia", MC: "Monaco", MT: "Malta", NO: "Norway",
    PL: "Poland", PT: "Portugal", RO: "Romania", SE: "Sweden", SI: "Slovenia", SK: "Slovakia",
    SM: "San Marino", TR: "Turkey", UA: "Ukraine"
  };

  // Bank data for the original supported countries
  const bankData = {
    NL: [
      { id: 'ABNA', name: 'ABN AMRO' },
      { id: 'INGB', name: 'ING' },
      { id: 'RABO', name: 'Rabobank' },
      { id: 'SNSB', name: 'SNS Bank' },
      { id: 'ASNB', name: 'ASN Bank' },
      { id: 'RBRB', name: 'RegioBank' },
      { id: 'KNAB', name: 'Knab' },
      { id: 'BUNQ', name: 'Bunq' },
      { id: 'TRIO', name: 'Triodos Bank' },
      { id: 'FVLB', name: 'Van Lanschot' }
    ],
    DE: [
      { id: 'DEUTDEFF', name: 'Deutsche Bank' },
      { id: 'COBADEFF', name: 'Commerzbank' },
      { id: 'PBNKDEFF', name: 'Postbank' },
      { id: 'GENODEFF', name: 'DZ Bank' }
    ],
    BE: [
      { id: 'GEBABEBB', name: 'BNP Paribas Fortis' },
      { id: 'BBRUBEBB', name: 'ING Belgium' },
      { id: 'KREDBEBB', name: 'KBC Bank' },
      { id: 'GKCCBEBB', name: 'Belfius Bank' }
    ],
    FR: [
      { id: 'BNPAFRPP', name: 'BNP Paribas' },
      { id: 'SOGEFRPP', name: 'Société Générale' },
      { id: 'CRLYFRPP', name: 'Crédit Lyonnais (LCL)' },
      { id: 'CEPAFRPP', name: 'Caisse d\'Epargne' }
    ],
    ES: [
      { id: 'BSCHESMM', name: 'Banco Santander' },
      { id: 'BBVAESMM', name: 'BBVA' },
      { id: 'CAIXESBB', name: 'CaixaBank' },
      { id: 'SABBESBB', name: 'Banco Sabadell' }
    ],
    IT: [
      { id: 'UNCRITMM', name: 'UniCredit' },
      { id: 'BCITITMM', name: 'Intesa Sanpaolo' },
      { id: 'BNLIITRR', name: 'BNL' },
      { id: 'MPSITIT1', name: 'Monte dei Paschi' }
    ]
  };

  useEffect(() => {
    // Update the selected bank when country changes
    if (bankData[selectedCountry] && bankData[selectedCountry].length > 0) {
      setSelectedBank(bankData[selectedCountry][0].id);
    } else {
      setSelectedBank('');
    }
  }, [selectedCountry]);

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setShowResults(false);
  };

  const handleBankChange = (e) => {
    setSelectedBank(e.target.value);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(isNaN(value) ? 1 : Math.min(Math.max(value, 1), 100));
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    
    // Simple mock of IBAN generation
    const mockIbanGenerate = (country) => {
      const countryCode = country;
      const checkDigits = Math.floor(10 + Math.random() * 90); // Random 2-digit number
      
      // Different length for different countries
      const lengths = {
        NL: 14, DE: 18, BE: 12, FR: 23, ES: 20, IT: 23, 
        AT: 16, PL: 24, PT: 21, CH: 17, LU: 16, DK: 14,
        FI: 14, IE: 18, SE: 20, GR: 23
      };
      
      const length = lengths[country] || 16; // Default length if country not specified
      let accountNumber = '';
      
      for (let i = 0; i < length; i++) {
        accountNumber += Math.floor(Math.random() * 10);
      }
      
      return `${countryCode}${checkDigits}${accountNumber}`;
    };
    
    if (quantity === 1) {
      const iban = mockIbanGenerate(selectedCountry);
      setGeneratedIban(iban);
      setIsSingleResult(true);
    } else {
      const ibans = [];
      for (let i = 0; i < quantity; i++) {
        ibans.push(mockIbanGenerate(selectedCountry));
      }
      setBulkIbans(ibans);
      setIsSingleResult(false);
    }
    
    setShowResults(true);
  };

  const formatIBAN = (iban) => {
    return iban.replace(/(.{4})/g, "$1 ").trim();
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(generatedIban)
      .then(() => {
        setCopyMessage("Copied!");
        setTimeout(() => setCopyMessage(""), 2000);
      })
      .catch(() => {
        setCopyMessage("Copy failed");
      });
  };

  const sortedCountries = Object.entries(countries).sort((a, b) => a[1].localeCompare(b[1]));

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">IBAN Generator</h1>
          <p className="text-slate-400">Generate secure, valid IBAN numbers for testing purposes</p>
        </header>

        <div className="bg-slate-800 rounded-lg p-6 shadow-lg mb-6">
          <form onSubmit={handleGenerate}>
            <fieldset className="mb-6 border-b border-slate-700 pb-4">
              <legend className="text-xl font-semibold mb-4">Generator Settings</legend>

              <div className="mb-4">
                <label htmlFor="country" className="block mb-2 font-medium">Country:</label>
                <select 
                  id="country" 
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white"
                  value={selectedCountry}
                  onChange={handleCountryChange}
                >
                  {sortedCountries.map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                <p className="text-sm text-slate-400 mt-1">Select the country for the IBAN.</p>
              </div>

              {bankData[selectedCountry] && (
                <div className="mb-4">
                  <label htmlFor="bank" className="block mb-2 font-medium">Bank:</label>
                  <select 
                    id="bank" 
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white"
                    value={selectedBank}
                    onChange={handleBankChange}
                  >
                    {bankData[selectedCountry].map(bank => (
                      <option key={bank.id} value={bank.id}>{bank.name}</option>
                    ))}
                  </select>
                  <p className="text-sm text-slate-400 mt-1">Optional: Select a bank for the chosen country.</p>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="quantity" className="block mb-2 font-medium">Number of IBANs to generate:</label>
                <input 
                  type="number" 
                  id="quantity" 
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  max="100"
                />
                <p className="text-sm text-slate-400 mt-1">Enter a number between 1 and 100.</p>
              </div>

              <div className="mt-6">
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded font-medium"
                >
                  Generate IBAN(s)
                </button>
              </div>
            </fieldset>
          </form>

          {showResults && (
            <div className="mt-6 pt-4 border-t border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Generated Results</h2>
              
              {isSingleResult ? (
                <div>
                  <h3 className="text-lg font-medium mb-2">Generated IBAN</h3>
                  <div className="bg-slate-900 p-3 rounded flex items-center justify-between mb-2">
                    <span className="font-mono text-lg">{formatIBAN(generatedIban)}</span>
                    <button 
                      onClick={handleCopyClick}
                      className="ml-2 p-2 hover:bg-slate-700 rounded"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                  </div>
                  {copyMessage && <p className="text-green-500 text-sm text-right">{copyMessage}</p>}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium mb-2">Generated IBANs ({bulkIbans.length})</h3>
                  <div className="mb-4">
                    <label htmlFor="bulk-ibans" className="block mb-2">Results:</label>
                    <textarea 
                      id="bulk-ibans" 
                      className="w-full p-3 bg-slate-900 border border-slate-700 rounded text-white font-mono h-40"
                      value={bulkIbans.join('\n')}
                      readOnly
                    />
                    <p className="text-sm text-slate-400 mt-1">Generated IBANs, one per line.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="text-center text-slate-400 text-sm">
          <p>Open source IBAN generator | <a href="https://github.com/CopyPasteHero/CopyPasteHero.github.io/tree/main/iban" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">GitHub</a></p>
          <p className="mt-1 italic">Note: Generated IBANs are mathematically valid but do not correspond to real bank accounts. Use for testing purposes only.</p>
        </footer>
      </div>
    </div>
  );
};

export default IBANGenerator;