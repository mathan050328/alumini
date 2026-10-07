export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validatePhone = (phone) => {
  const regex = /^[+]?[\d\s-]{10,15}$/;
  return !phone || regex.test(phone);
};

export const validateUrl = (url) => {
  try {
    if (!url) return true;
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
