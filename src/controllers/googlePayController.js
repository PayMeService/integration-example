const coreService = require('../services/coreService');
const { getPayMeSdkUrl } = require('../utils/paymeSdkUrl');

const getDefaults = (req) => req.session?.defaults || {};

const getGooglePaySaleById = (req, res) => {
  const { saleId } = req.params;
  const defaults = getDefaults(req);
  const serverUrl = defaults.server;

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
    paymeSdkUrl: getPayMeSdkUrl(defaults),
    testMode: process.env.PAYME_TEST_MODE === 'true'
  });
};

const generateGooglePaySale = async (req, res) => {
  const defaults = getDefaults(req);
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

  const serverUrl = defaults.server;
  const data = await coreService.generateSale(payload, serverUrl);

  res.render('google-pay', {
    title: `Google Pay - ${data.payme_sale_id || 'Generated'}`,
    payme_sale_id: data.payme_sale_id,
    sale_url: data.sale_url,
    apiKey: defaults.public_key,
    paymeSdkUrl: getPayMeSdkUrl(defaults),
    testMode: process.env.PAYME_TEST_MODE === 'true'
  });
};

module.exports = {
  getGooglePaySaleById,
  generateGooglePaySale
};
