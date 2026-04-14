const coreService = require('../services/coreService');
const { isProdDomain } = require('../utils/domain');
const { getServerUrl } = require('../utils/serverUrl');

const getDefaults = (req) => {
  if (!req.session?.defaults) {
    throw new Error("Defaults are required here!")
  }

  return req.session?.defaults;
}

const getAppleCertificate = (req, res) => {
  const isProd = isProdDomain(req);
  const appleCertificate = isProd
    ? process.env.APPLE_PAY_CERTIFICATE_PROD
    : process.env.APPLE_PAY_CERTIFICATE;

  if (!appleCertificate) {
    return res.status(404).send('Apple Pay certificate not configured');
  }

  res.type('text/plain');
  res.send(appleCertificate);
};

const getGenerateSaleForm = (req, res) => {
  const defaults = getDefaults(req);
  res.render('form', {
    title: 'Generate PayMe Sale',
    applePayEnabled: !!defaults.apple_pay_merchant_id,
    googlePayEnabled: !!defaults.public_key
  });
};

const getSaleById = (req, res) => {
  const { saleId } = req.params;
  const defaults = getDefaults(req);
  const serverUrl = getServerUrl(req, defaults);

  if (!serverUrl) {
    return res.status(500).send('Server URL is not configured');
  }

  const saleUrl = `${serverUrl}/sale/generate/${saleId}`;

  console.log('Rendering sale in iframe:', saleUrl);

  res.render('sale-view', {
    title: `Sale ${saleId}`,
    saleId,
    saleUrl
  });
};

const generateSale = async (req, res) => {
  const defaults = getDefaults(req);
  const {
    sale_price,
    currency,
    product_name,
    language,
    sale_payment_method,
    sale_type
  } = req.body;

  const payload = {
    seller_payme_id: defaults.seller_payme_id,
    sale_price,
    currency: currency || 'ILS',
    product_name: product_name || 'Test Product',
    language: language || 'en',
    sale_payment_method: sale_payment_method || 'multi',
    sale_type: sale_type || 'sale'
  };

  const serverUrl = getServerUrl(req, defaults);
  const data = await coreService.generateSale(payload, serverUrl);

  res.render('sale', {
    title: `PayMe Sale - ${data.payme_sale_id || 'Generated'}`,
    ...data,
    success: data.status_code === 0,
    product_name: payload.product_name
  });
};

module.exports = {
  getAppleCertificate,
  getGenerateSaleForm,
  getSaleById,
  generateSale
};
