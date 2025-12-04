const coreService = require('../services/coreService');

const getDefaults = (req) => req.session?.defaults || {};

const getApplePaySaleById = (req, res) => {
  const { saleId } = req.params;
  const defaults = getDefaults(req);
  const serverUrl = defaults.server;

  if (!serverUrl) {
    return res.status(500).send('Server URL is not configured');
  }

  if (!defaults.apple_pay_merchant_id) {
    return res.status(400).send('Apple Pay Merchant ID is not configured');
  }

  const saleUrl = `${serverUrl}/sale/generate/${saleId}`;

  console.log('Rendering Apple Pay sale:', saleUrl);

  res.render('apple-pay', {
    title: `Apple Pay - ${saleId}`,
    payme_sale_id: saleId,
    sale_url: saleUrl,
    apiKey: defaults.partner_key,
    merchantId: defaults.apple_pay_merchant_id,
    testMode: process.env.PAYME_TEST_MODE === 'true'
  });
};

const generateApplePaySale = async (req, res) => {
  const defaults = getDefaults(req);
  const {
    sale_price,
    currency,
    product_name,
    language,
    sale_type
  } = req.body;

  const apiKey = defaults.partner_key;
  const merchantId = defaults.apple_pay_merchant_id;

  if (!apiKey) {
    throw new Error('PayMe API Key is required for Apple Pay');
  }

  if (!merchantId) {
    throw new Error('Apple Pay Merchant ID is required for Apple Pay');
  }

  const payload = {
    seller_payme_id: defaults.seller_payme_id,
    sale_price: sale_price,
    currency: currency || 'ILS',
    product_name: product_name || 'Test Product',
    language: language || 'en',
    sale_payment_method: 'apple-pay',
    sale_type: sale_type || 'sale',
    installments: '1'
  };

  const serverUrl = defaults.server;
  const data = await coreService.generateSale(payload, serverUrl);

  res.render('apple-pay', {
    title: `Apple Pay - ${data.payme_sale_id || 'Generated'}`,
    payme_sale_id: data.payme_sale_id,
    sale_url: data.sale_url,
    apiKey: apiKey,
    merchantId: merchantId,
    testMode: process.env.PAYME_TEST_MODE === 'true'
  });
};

module.exports = {
  getApplePaySaleById,
  generateApplePaySale
};
