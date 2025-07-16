/**
 * @fileoverview Constants and configuration data for IBAN generation
 * Contains IBAN specifications, country names, and bank data for supported countries
 */

/**
 * IBAN specifications for supported countries
 * @type {Object<string, Object>}
 */
export const IBAN_SPECS = {
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

/**
 * Human-readable country names mapped to country codes
 * @type {Object<string, string>}
 */
export const COUNTRY_NAMES = {
  NL: "Netherlands",
  DE: "Germany",
  BE: "Belgium",
  FR: "France",
  ES: "Spain",
  IT: "Italy",
};

/**
 * Bank data for each supported country
 * @type {Object<string, Object<string, {name: string, code: string}>>}
 */
export const BANK_DATA = {
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