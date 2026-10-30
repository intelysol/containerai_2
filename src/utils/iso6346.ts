/**
 * ISO 6346 Shipping Container Number Validator & Calculator
 * Format: 4 letters (3 owner letters + 1 category letter 'U', 'J', 'Z')
 * Followed by 6 serial digits and 1 check digit (total 11 characters, or 10 + 1)
 */

// Letter values defined by ISO 6346 standard (multiples of 11: 11, 22, 33 are skipped)
const LETTER_VALUES: Record<string, number> = {
  A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20,
  K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31,
  U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
};

export interface ISO6346ParseResult {
  isValid: boolean;
  rawInput: string;
  formatted: string;
  ownerCode: string;
  category: 'U' | 'J' | 'Z' | string;
  serialNumber: string;
  providedCheckDigit: number;
  calculatedCheckDigit: number;
  errorMessage?: string;
}

export function calculateIso6346CheckDigit(tenCharPrefix: string): number {
  const clean = tenCharPrefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (clean.length < 10) return -1;

  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const char = clean[i];
    let val: number;
    if (char >= 'A' && char <= 'Z') {
      val = LETTER_VALUES[char] ?? 0;
    } else if (char >= '0' && char <= '9') {
      val = parseInt(char, 10);
    } else {
      return -1;
    }

    // Weight is 2^i
    const weight = Math.pow(2, i);
    sum += val * weight;
  }

  const remainder = sum % 11;
  // If remainder is 10, check digit is 0 according to ISO standard
  return remainder === 10 ? 0 : remainder;
}

export function validateIso6346(input: string): ISO6346ParseResult {
  const clean = (input || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (clean.length < 10) {
    return {
      isValid: false,
      rawInput: input,
      formatted: clean,
      ownerCode: clean.slice(0, 3),
      category: clean.slice(3, 4) || 'U',
      serialNumber: clean.slice(4, 10),
      providedCheckDigit: -1,
      calculatedCheckDigit: -1,
      errorMessage: 'Container number must be at least 10 characters (4 letters + 6 digits)',
    };
  }

  const ownerCode = clean.slice(0, 3);
  const category = clean.slice(3, 4);
  const serialNumber = clean.slice(4, 10);
  const tenPrefix = ownerCode + category + serialNumber;
  const calculated = calculateIso6346CheckDigit(tenPrefix);

  const providedCheckDigit = clean.length >= 11 ? parseInt(clean.charAt(10), 10) : calculated;
  const isValid = !isNaN(providedCheckDigit) && calculated === providedCheckDigit;

  const formatted = `${ownerCode}${category} ${serialNumber}-${providedCheckDigit}`;

  let errorMessage: string | undefined;
  if (!/^[A-Z]{3}$/.test(ownerCode)) {
    errorMessage = 'Owner code must be 3 capital letters (e.g. MSC, MSK, CMA)';
  } else if (!/^[UJZ]$/.test(category)) {
    errorMessage = `Equipment identifier '${category}' should typically be 'U' (freight container), 'J', or 'Z'`;
  } else if (!/^\d{6}$/.test(serialNumber)) {
    errorMessage = 'Serial number must be 6 numeric digits';
  } else if (!isValid) {
    errorMessage = `Check digit mismatch: provided ${providedCheckDigit}, expected ${calculated}`;
  }

  return {
    isValid,
    rawInput: input,
    formatted,
    ownerCode,
    category,
    serialNumber,
    providedCheckDigit,
    calculatedCheckDigit: calculated,
    errorMessage,
  };
}
