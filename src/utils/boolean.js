const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'on', 'yes'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'off', 'no'].includes(normalized)) {
      return false;
    }
  }

  return defaultValue;
};

module.exports = {
  parseBoolean
};
