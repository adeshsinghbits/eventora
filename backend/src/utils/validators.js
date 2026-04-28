import validator from "validator";

export const validateEmail = (email) => {
  return validator.isEmail(email);
};

export const validatePassword = (password) => {
  // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;
  return passwordRegex.test(password);
};

export const validateUsername = (username) => {
  // 3-30 characters, alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

export const validateFullName = (name) => {
  return validator.isLength(name, { min: 2, max: 80 }) && validator.trim(name) !== "";
};

export const validatePhone = (phone) => {
  return validator.isMobilePhone(phone);
};

export const validateURL = (url) => {
  return validator.isURL(url);
};

export const sanitizeInput = (input) => {
  return validator.trim(validator.escape(input));
};

export const validateCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }
  const [lng, lat] = coordinates;
  return (
    validator.isFloat(lng.toString(), { min: -180, max: 180 }) &&
    validator.isFloat(lat.toString(), { min: -90, max: 90 })
  );
};