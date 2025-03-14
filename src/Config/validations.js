/**
 * Centralized validation configuration
 * Contains regex patterns, validation rules, and other validation-related constants
 */

// Regex patterns
export const patterns = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    phone: /^[0-9]{10}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

// Validation rules
export const rules = {
    required: (value) => !!value || "This field is required",
    email: (value) => patterns.email.test(value) || "Invalid email format",
    url: (value) => patterns.url.test(value) || "Invalid URL format",
    phone: (value) => patterns.phone.test(value) || "Invalid phone number",
    minLength: (value, min) => (value && value.length >= min) || `Minimum ${min} characters required`,
    maxLength: (value, max) => (value && value.length <= max) || `Maximum ${max} characters allowed`,
};

// Validation messages
export const messages = {
    required: "This field is required",
    email: "Please enter a valid email address",
    url: "Please enter a valid URL",
    phone: "Please enter a valid phone number",
    select: "Please select an option",
    minLength: (min) => `Please enter at least ${min} characters`,
    maxLength: (max) => `Please enter no more than ${max} characters`,
}; 