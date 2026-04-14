const { isProdDomain } = require('./domain');
const { getTestMode } = require('./testMode');

const PROD_URL = 'https://payme.io';
const SANDBOX_URL = 'https://sandbox.payme.io';

const getServerUrl = (req, defaults = {}) => {
  if (isProdDomain(req)) {
    return getTestMode(defaults) ? SANDBOX_URL : PROD_URL;
  }
  return defaults.server;
};

const getApiUrl = (req, defaults = {}) => {
  if (isProdDomain(req)) {
    return getTestMode(defaults) ? SANDBOX_URL : null;
  }
  return defaults.server || null;
};

module.exports = {
  getServerUrl,
  getApiUrl,
  PROD_URL,
  SANDBOX_URL
};
