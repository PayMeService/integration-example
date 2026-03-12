const PAYME_SDK_URL_PRODUCTION = 'https://cdn.paymeservice.com/hf/v1/hostedfields.js';
const PAYME_SDK_URL_STAGING = 'https://cdn.payme.io/hf/v1/hostedfields-staging.js';

const getPayMeSdkUrl = (defaults = {}) => {
  return defaults.use_staging_sdk ? PAYME_SDK_URL_STAGING : PAYME_SDK_URL_PRODUCTION;
};

module.exports = {
  getPayMeSdkUrl,
  PAYME_SDK_URL_PRODUCTION,
  PAYME_SDK_URL_STAGING
};
