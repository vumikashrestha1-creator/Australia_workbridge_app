// =============================================================
// utils/validators.js
// PURPOSE: Reusable validation functions used across forms
//
// Currently includes:
//   isValidABN — validates Australian Business Number using
//                the official ATO checksum algorithm
//   isValidEmail
//   isStrongPassword
// =============================================================

/**
 * Validate an Australian Business Number (ABN).
 *
 * The official ATO algorithm:
 *   1. Remove all spaces from the input
 *   2. Check it's exactly 11 digits
 *   3. Subtract 1 from the first (leftmost) digit
 *   4. Multiply each digit by its weight: [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]
 *   5. Sum the results
 *   6. ABN is valid if the sum is divisible by 89
 *
 * Reference: https://abr.business.gov.au/Help/AbnFormat
 *
 * @param   {string} abn — the ABN to validate (with or without spaces)
 * @returns {boolean}
 */
export const isValidABN = (abn) => {
  // Strip spaces and convert to string
  const clean = String(abn).replace(/\s/g, '')

  // Must be exactly 11 digits
  if (!/^\d{11}$/.test(clean)) {
    return false
  }

  // ATO weighting factors
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19]

  // Convert to array of numbers
  const digits = clean.split('').map(Number)

  // Subtract 1 from the first digit
  digits[0] -= 1

  // Calculate weighted sum
  const sum = digits.reduce(
    (total, digit, i) => total + digit * weights[i],
    0
  )

  // Valid if divisible by 89
  return sum % 89 === 0
}


/**
 * Format an ABN with spaces for display: "12 345 678 901"
 *
 * @param   {string} abn — the ABN to format
 * @returns {string}
 */
export const formatABN = (abn) => {
  const clean = String(abn).replace(/\s/g, '')
  if (clean.length !== 11) return clean
  // Format: XX XXX XXX XXX
  return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8, 11)}`
}


/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}


/**
 * Check password strength.
 * Requires: 8+ chars, 1 letter, 1 number
 */
export const isStrongPassword = (password) => {
  if (password.length < 8) return false
  if (!/[a-zA-Z]/.test(password)) return false
  if (!/\d/.test(password)) return false
  return true
}