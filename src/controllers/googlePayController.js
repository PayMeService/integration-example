const coreService = require('../services/coreService');
const { getPayMeSdkUrl, PAYME_SDK_URL_PRODUCTION } = require('../utils/paymeSdkUrl');
const { getTestMode } = require('../utils/testMode');
const { isProdDomain } = require('../utils/domain');
const { getServerUrl } = require('../utils/serverUrl');

const getDefaults = (req) => req.session?.defaults || {};

const getGooglePaySaleById = (req, res) => {
  const { saleId } = req.params;
  const defaults = getDefaults(req);
  const isProd = isProdDomain(req);
  const serverUrl = getServerUrl(req, defaults);

  if (!serverUrl) {
    return res.status(500).send('Server URL is not configured');
  }

  if (!defaults.public_key) {
    return res.status(400).send('Public Key is not configured');
  }

  const saleUrl = `${serverUrl}/sale/generate/${saleId}`;

  console.log('Rendering Google Pay sale:', saleUrl);

  res.render('google-pay', {
    title: `Google Pay - ${saleId}`,
    payme_sale_id: saleId,
    sale_url: saleUrl,
    apiKey: defaults.public_key,
    paymeSdkUrl: isProd ? PAYME_SDK_URL_PRODUCTION : getPayMeSdkUrl(defaults),
    testMode: getTestMode(defaults),
    apiUrl: getTestMode(defaults) ? serverUrl : null,
  });
};

const generateGooglePaySale = async (req, res) => {
  const defaults = getDefaults(req);
  const isProd = isProdDomain(req);
  const {
    sale_price,
    currency,
    product_name,
    language,
    sale_type
  } = req.body;

  if (!defaults.public_key) {
    throw new Error('Public Key is required for Google Pay');
  }

  const payload = {
    seller_payme_id: defaults.seller_payme_id,
    sale_price,
    currency: currency || 'ILS',
    product_name: product_name || 'Test Product',
    language: language || 'en',
    sale_payment_method: 'google-pay',
    sale_type: sale_type || 'sale',
    installments: '1'
  };

  const serverUrl = getServerUrl(req, defaults);
  const data = await coreService.generateSale(payload, serverUrl);

  res.render('google-pay', {
    title: `Google Pay - ${data.payme_sale_id || 'Generated'}`,
    payme_sale_id: data.payme_sale_id,
    sale_url: data.sale_url,
    apiKey: defaults.public_key,
    paymeSdkUrl: isProd ? PAYME_SDK_URL_PRODUCTION : getPayMeSdkUrl(defaults),
    testMode: getTestMode(defaults),
    apiUrl: getTestMode(defaults) ? serverUrl : null,
  });
};

module.exports = {
  getGooglePaySaleById,
  generateGooglePaySale
};
