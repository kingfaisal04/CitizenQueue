/**
 * CitizenQueue - Input & Document Validation Utilities
 * 
 * Provides pure validation functions for Ghanaian BECE index numbers,
 * phone numbers, email addresses, and uploaded files.
 */

import { FILE_LIMITS } from './constants';

/**
 * Validates a Ghanaian BECE 10-digit index number (or 9-11 characters format)
 * e.g. "1012450890" or "101245089"
 */
export function validateBeceIndex(indexNumber) {
  if (!indexNumber || typeof indexNumber !== 'string') {
    return { isValid: false, error: 'BECE Index Number is required.' };
  }
  const cleaned = indexNumber.trim().replace(/\s+/g, '');
  const indexPattern = /^\d{9,11}$/;
  if (!indexPattern.test(cleaned)) {
    return {
      isValid: false,
      error: 'BECE Index Number must be 9 to 11 digits (e.g., 1012450890).'
    };
  }
  return { isValid: true, error: null, value: cleaned };
}

/**
 * Validates Ghanaian phone numbers:
 * Accepts:
 * - 0244112233 (10 digits starting with 0)
 * - +233244112233
 * - 233244112233
 */
export function validateGhanaPhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required.' };
  }
  const cleaned = phone.trim().replace(/[\s\-()]/g, '');
  const ghanaPattern = /^(\+?233|0)[235][0-9]{8}$/;
  if (!ghanaPattern.test(cleaned)) {
    return {
      isValid: false,
      error: 'Enter a valid Ghanaian telephone number (e.g., 024 411 2233 or +233 24 411 2233).'
    };
  }
  return { isValid: true, error: null, value: cleaned };
}

/**
 * Validates standard email address format
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }
  const trimmed = email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }
  return { isValid: true, error: null, value: trimmed };
}

/**
 * Validates file uploads against size limits and MIME types
 */
export function validateUploadedFile(file, options = {}) {
  const maxSize = options.maxSizeBytes || FILE_LIMITS.MAX_SIZE_BYTES;
  const allowedTypes = options.allowedTypes || FILE_LIMITS.ACCEPTED_DOCUMENT_TYPES;

  if (!file) {
    return { isValid: false, error: 'No file provided.' };
  }

  if (file.size > maxSize) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      isValid: false,
      error: `File size (${sizeInMb} MB) exceeds maximum allowed size of ${maxMb} MB.`
    };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type "${file.type || 'unknown'}" is not supported. Supported: ${allowedTypes.map(t => t.split('/')[1]?.toUpperCase()).join(', ')}.`
    };
  }

  return { isValid: true, error: null };
}

/**
 * Checks a collection of required keys in an object
 */
export function validateRequiredFields(obj, requiredFields) {
  const missing = [];
  requiredFields.forEach((field) => {
    const val = obj[field];
    if (val === undefined || val === null || (typeof val === 'string' && val.trim() === '')) {
      missing.push(field);
    }
  });
  return {
    isValid: missing.length === 0,
    missingFields: missing,
    error: missing.length > 0 ? `Required fields missing: ${missing.join(', ')}` : null
  };
}

