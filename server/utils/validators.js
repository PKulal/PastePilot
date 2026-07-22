// Lightweight input validation helpers (no external deps).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

/**
 * Strong password: min 8 chars, at least one letter and one number.
 * Returns null when valid, otherwise an error message.
 */
function passwordError(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  return null;
}

function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

module.exports = { isValidEmail, passwordError, required };
