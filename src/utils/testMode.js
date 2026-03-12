const { parseBoolean } = require('./boolean');

const getTestMode = (defaults = {}) => {
  if (Object.prototype.hasOwnProperty.call(defaults, 'test_mode')) {
    return parseBoolean(defaults.test_mode, true);
  }

  return true;
};

module.exports = {
  getTestMode
};
