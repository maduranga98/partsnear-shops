/**
 * Validation utilities for PartsNear
 */

export const validators = {
  required: (value) => {
    if (value === null || value === undefined || value === '') return 'This field is required';
    if (Array.isArray(value) && value.length === 0) return 'This field is required';
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Please enter a valid email address';
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;
    return phoneRegex.test(value) ? null : 'Please enter a valid phone number';
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    return value.length >= min ? null : `Must be at least ${min} characters`;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    return value.length <= max ? null : `Must be no more than ${max} characters`;
  },

  password: (value) => {
    if (!value) return null;
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain a number';
    return null;
  },

  confirmPassword: (password) => (value) => {
    if (!value) return null;
    return value === password ? null : 'Passwords do not match';
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  number: (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return !isNaN(Number(value)) ? null : 'Must be a valid number';
  },

  min: (minVal) => (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return Number(value) >= minVal ? null : `Must be at least ${minVal}`;
  },

  max: (maxVal) => (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return Number(value) <= maxVal ? null : `Must be no more than ${maxVal}`;
  },
};

/**
 * Run multiple validators on a value, returns the first error or null
 */
export const validate = (value, ...validatorFns) => {
  for (const fn of validatorFns) {
    const error = fn(value);
    if (error) return error;
  }
  return null;
};

/**
 * Validate an entire form object against a schema
 * schema = { fieldName: [validator1, validator2, ...] }
 * Returns { fieldName: errorMessage | null }
 */
export const validateForm = (values, schema) => {
  const errors = {};
  let isValid = true;

  for (const [field, validatorFns] of Object.entries(schema)) {
    const error = validate(values[field], ...validatorFns);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { errors, isValid };
};
