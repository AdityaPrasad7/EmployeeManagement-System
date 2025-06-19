export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const validatePhone = (phone) => {
  const re = /^\+?[\d\s-]{10,}$/;
  return re.test(phone);
};

export const validateRequired = (value) => {
  return value !== undefined && value !== null && value.trim() !== '';
};

export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const value = values[field];
    const fieldRules = rules[field];

    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = 'This field is required';
    } else if (value) {
      if (fieldRules.email && !validateEmail(value)) {
        errors[field] = 'Invalid email address';
      }
      if (fieldRules.password && !validatePassword(value)) {
        errors[field] = 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number';
      }
      if (fieldRules.phone && !validatePhone(value)) {
        errors[field] = 'Invalid phone number';
      }
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `Minimum length is ${fieldRules.minLength} characters`;
      }
      if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `Maximum length is ${fieldRules.maxLength} characters`;
      }
    }
  });

  return errors;
}; 