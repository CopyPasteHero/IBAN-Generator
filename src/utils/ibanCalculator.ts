// TypeScript types for IBAN generation
export interface IbanSpec {
  length: number;
  bankCodeLength: number;
  accountLength: number;
  bankCodeType: string;
  accountType: string;
  branchCodeLength?: number;
  branchCodeType?: string;
  nationalCheckLength?: number;
  nationalCheckType?: string;
}

export interface Bank {
  name: string;
  code: string;
}

export interface CountryData {
  [countryCode: string]: IbanSpec;
}

export interface BankData {
  [countryCode: string]: {
    [bic: string]: Bank;
  };
}

// IBAN specifications for each country
export const IBAN_SPECS: CountryData = {
  NL: {
    length: 18,
    bankCodeLength: 4,
    accountLength: 10,
    bankCodeType: "alphaUpper",
    accountType: "numeric",
  },
  DE: {
    length: 22,
    bankCodeLength: 8,
    accountLength: 10,
    bankCodeType: "numeric",
    accountType: "numeric",
  },
  BE: {
    length: 16,
    bankCodeLength: 3,
    accountLength: 7,
    nationalCheckLength: 2,
    bankCodeType: "numeric",
    accountType: "numeric",
    nationalCheckType: "numeric",
  },
  FR: {
    length: 27,
    bankCodeLength: 5,
    branchCodeLength: 5,
    accountLength: 11,
    nationalCheckLength: 2,
    bankCodeType: "numeric",
    branchCodeType: "numeric",
    accountType: "alphanumericUpper",
    nationalCheckType: "numeric",
  },
  ES: {
    length: 24,
    bankCodeLength: 4,
    branchCodeLength: 4,
    nationalCheckLength: 2,
    accountLength: 10,
    bankCodeType: "numeric",
    branchCodeType: "numeric",
    nationalCheckType: "numeric",
    accountType: "numeric",
  },
  IT: {
    length: 27,
    nationalCheckLength: 1,
    bankCodeLength: 5,
    branchCodeLength: 5,
    accountLength: 12,
    nationalCheckType: "alphaUpper",
    bankCodeType: "numeric",
    branchCodeType: "numeric",
    accountType: "alphanumericUpper",
  },
};

// Country names for display
export const COUNTRY_NAMES: { [countryCode: string]: string } = {
  NL: "Netherlands",
  DE: "Germany",
  BE: "Belgium",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
};

// Bank data for each country
export const BANK_DATA: BankData = {
  NL: {
    ABNA: { name: "ABN AMRO", code: "ABNA" },
    INGB: { name: "ING", code: "INGB" },
    RABO: { name: "Rabobank", code: "RABO" },
    SNSB: { name: "SNS Bank", code: "SNSB" },
    ASNB: { name: "ASN Bank", code: "ASNB" },
    RBRB: { name: "RegioBank", code: "RBRB" },
    KNAB: { name: "Knab", code: "KNAB" },
    BUNQ: { name: "Bunq", code: "BUNQ" },
    TRIO: { name: "Triodos Bank", code: "TRIO" },
    FVLB: { name: "Van Lanschot", code: "FVLB" },
  },
  DE: {
    DEUTDEFF: { name: "Deutsche Bank", code: "50070010" },
    COBADEFF: { name: "Commerzbank", code: "50040000" },
    PBNKDEFF: { name: "Postbank", code: "50010060" },
    GENODEFF: { name: "DZ Bank", code: "50060400" },
  },
  BE: {
    GEBABEBB: { name: "BNP Paribas Fortis", code: "001" },
    BBRUBEBB: { name: "ING Belgium", code: "310" },
    KREDBEBB: { name: "KBC Bank", code: "734" },
    GKCCBEBB: { name: "Belfius Bank", code: "068" },
  },
  FR: {
    BNPAFRPP: { name: "BNP Paribas", code: "30004" },
    SOGEFRPP: { name: "Société Générale", code: "30003" },
    CRLYFRPP: { name: "Crédit Lyonnais (LCL)", code: "30002" },
    CEPAFRPP: { name: "Caisse d'Epargne", code: "11306" },
  },
  ES: {
    BSCHESMM: { name: "Banco Santander", code: "0049" },
    BBVAESMM: { name: "BBVA", code: "0182" },
    CAIXESBB: { name: "CaixaBank", code: "2100" },
    SABBESBB: { name: "Banco Sabadell", code: "0081" },
  },
  IT: {
    UNCRITMM: { name: "UniCredit", code: "02008" },
    BCITITMM: { name: "Intesa Sanpaolo", code: "03069" },
    BNLIITRR: { name: "BNL", code: "01005" },
    MPSITIT1: { name: "Monte dei Paschi", code: "01030" },
  },
};

// Helper function to get suggested country based on browser language
export function getSuggestedCountry(): string {
  try {
    const lang = navigator.language.toLowerCase();
    const baseLang = lang.split("-")[0];
    if (baseLang === "nl" && IBAN_SPECS["NL"]) return "NL";
    if (baseLang === "de" && IBAN_SPECS["DE"]) return "DE";
    if (baseLang === "fr") {
      if ((lang.includes("be") || lang.includes("bru")) && IBAN_SPECS["BE"]) return "BE";
      if (IBAN_SPECS["FR"]) return "FR";
      if (IBAN_SPECS["BE"]) return "BE";
    }
    if (baseLang === "es" && IBAN_SPECS["ES"]) return "ES";
    if (baseLang === "it" && IBAN_SPECS["IT"]) return "IT";
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Could not access navigator.language:", e);
    }
  }
  return "NL";
}

// Generate random characters based on type
export function generateRandomChars(length: number, type: string = "numeric"): string {
  if (length <= 0) return "";

  let result = "";
  const alphaUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeric = "0123456789";
  const alphanumericUpper = alphaUpper + numeric;
  let chars: string;
  const lowerType = type?.toLowerCase();

  switch (lowerType) {
    case "alphaupper":
    case "alpha":
      chars = alphaUpper;
      break;
    case "alphanumericupper":
    case "alphanumeric":
      chars = alphanumericUpper;
      break;
    case "numeric":
    case "n":
      chars = numeric;
      break;
    default:
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Unknown type '${type}', using numeric.`);
      }
      chars = numeric;
      break;
  }

  if (window.crypto && window.crypto.getRandomValues) {
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      result += chars[randomValues[i] % chars.length];
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.warn("Using fallback Math.random().");
    }
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return result;
}

// Calculate IBAN check digits (without BigInt)
export function calculateIBANCheckDigits(iban: string): string | null {
  const rearranged = iban.substring(4) + iban.substring(0, 4);
  let numerical = "";

  for (let i = 0; i < rearranged.length; i++) {
    const char = rearranged.charAt(i).toUpperCase();

    if (char >= "A" && char <= "Z") {
      numerical += (char.charCodeAt(0) - 55).toString();
    } else if (char >= "0" && char <= "9") {
      numerical += char;
    } else {
      console.error(`Invalid char: ${char}`);
      return null;
    }
  }

  try {
    if (!/^\d+$/.test(numerical)) {
      throw new Error("Non-digit chars.");
    }

    // Handle large numbers safely without BigInt
    let remainder = 0;
    for (let i = 0; i < numerical.length; i++) {
      remainder = (remainder * 10 + parseInt(numerical[i])) % 97;
    }

    const checkDigitInt = 98 - remainder;
    return checkDigitInt < 10 ? `0${checkDigitInt}` : `${checkDigitInt}`;
  } catch (e) {
    console.error("Error calc check digits:", e, numerical);
    return null;
  }
}

// Calculate Mod97 check (without BigInt)
export function calculateMod97Check(numericString: string): string {
  if (!numericString || !/^\d+$/.test(numericString)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Invalid Mod97 input: ${numericString}`);
    }
    return "00";
  }

  try {
    // Handle large numbers safely without BigInt
    let remainder = 0;
    for (let i = 0; i < numericString.length; i++) {
      remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
    }

    if (remainder === 0) remainder = 97;
    return remainder < 10 ? `0${remainder}` : `${remainder}`;
  } catch (e) {
    console.error("Error Mod97 check:", e);
    return "99";
  }
}

// Main IBAN generation function
export function generateIBAN(country: string, bankInfo?: Bank | null): string | null {
  const spec = IBAN_SPECS[country];

  if (!spec) {
    console.error(`IBAN spec missing: ${country}`);
    return null;
  }

  let bankCodePart = "",
    branchCodePart = "",
    accountPart = "",
    nationalCheckPart = "";
  const bbanBankCode = bankInfo ? bankInfo.code : null;

  try {
    switch (country) {
      case "NL":
        bankCodePart =
          bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        break;
      case "DE":
        bankCodePart =
          bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        break;
      case "BE":
        bankCodePart =
          bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        nationalCheckPart = calculateMod97Check((bankCodePart + accountPart).replace(/\D/g, ""));
        break;
      case "FR":
        bankCodePart =
          bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        branchCodePart = generateRandomChars(spec.branchCodeLength!, spec.branchCodeType!);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        nationalCheckPart = generateRandomChars(spec.nationalCheckLength!, spec.nationalCheckType!);
        break;
      case "ES":
        bankCodePart =
          bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        branchCodePart = generateRandomChars(spec.branchCodeLength!, spec.branchCodeType!);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        nationalCheckPart = generateRandomChars(spec.nationalCheckLength!, spec.nationalCheckType!);
        break;
      case "IT":
        nationalCheckPart = generateRandomChars(spec.nationalCheckLength!, spec.nationalCheckType!);
        bankCodePart =
          bbanBankCode || generateRandomChars(spec.bankCodeLength, spec.bankCodeType);
        branchCodePart = generateRandomChars(spec.branchCodeLength!, spec.branchCodeType!);
        accountPart = generateRandomChars(spec.accountLength, spec.accountType);
        break;
      default:
        console.error(`Unhandled country: ${country}`);
        return null;
    }
  } catch (error) {
    console.error(`Error BBAN parts ${country}:`, error);
    return null;
  }

  let bban = "";

  switch (country) {
    case "IT":
      bban = nationalCheckPart + bankCodePart + branchCodePart + accountPart;
      break;
    case "FR":
      bban = bankCodePart + branchCodePart + accountPart + nationalCheckPart;
      break;
    case "ES":
      bban = bankCodePart + branchCodePart + nationalCheckPart + accountPart;
      break;
    case "BE":
      bban = bankCodePart + accountPart + nationalCheckPart;
      break;
    default:
      bban =
        (bankCodePart || "") +
        (branchCodePart || "") +
        (accountPart || "") +
        (nationalCheckPart || "");
      break;
  }

  const expectedBbanLength = spec.length - 4;

  if (bban.length !== expectedBbanLength) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Adjusting BBAN length for ${country}: expected ${expectedBbanLength}, got ${bban.length}.`
      );
    }
    bban =
      bban.length < expectedBbanLength
        ? bban.padEnd(expectedBbanLength, "0")
        : bban.substring(0, expectedBbanLength);

    if (bban.length !== expectedBbanLength) {
      console.error(`BBAN length mismatch ${country} persists. BBAN: ${bban}`);
      return null;
    }
  }

  const ibanWithoutCheck = `${country}00${bban}`;
  const checkDigits = calculateIBANCheckDigits(ibanWithoutCheck);

  if (!checkDigits) {
    console.error(`Failed check digit calc ${country} BBAN: ${bban}`);
    return null;
  }

  return `${country}${checkDigits}${bban}`;
}

// Format IBAN with spaces every 4 characters
export function formatIBAN(iban: string): string {
  return typeof iban === "string" ? iban.replace(/(.{4})/g, "$1 ").trim() : "";
}

// Generate multiple IBANs
export function generateMultipleIBANs(country: string, bankInfo: Bank | null, quantity: number): string[] {
  const ibans: string[] = [];
  const useSpecificBank = !!bankInfo;

  for (let i = 0; i < quantity; i++) {
    const currentBankInfo = useSpecificBank ? bankInfo : null;
    const iban = generateIBAN(country, currentBankInfo);

    if (iban) {
      ibans.push(iban);
    }
  }

  return ibans;
}