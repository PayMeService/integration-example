const coreService = require('../services/coreService');

const getDefaults = (req) => req.session?.defaults || {};

const generateApplePaySale = async (req, res) => {
  const defaults = getDefaults(req);
  const {
    seller_payme_id,
    sale_price,
    currency,
    product_name,
    language,
    sale_type,
    payme_api_key,
    apple_pay_merchant_id
  } = req.body;

  const apiKey = payme_api_key || process.env.PAYME_API_KEY;
  const merchantId = apple_pay_merchant_id || process.env.APPLE_PAY_MERCHANT_ID;

  if (!apiKey) {
    throw new Error('PAYME_API_KEY is required for Apple Pay (provide in form or environment variable)');
  }

  if (!merchantId) {
    throw new Error('APPLE_PAY_MERCHANT_ID is required for Apple Pay (provide in form or environment variable)');
  }

  const payload = {
    seller_payme_id: seller_payme_id || defaults.seller_payme_id || process.env.DEFAULT_SELLER_PAYME_ID,
    sale_price: sale_price,
    currency: currency || 'ILS',
    product_name: product_name || 'Test Product',
    language: language || 'en',
    sale_payment_method: 'apple-pay',
    sale_type: sale_type || 'sale',
    installments: '1'
  };

  const serverUrl = defaults.server || null;
  const data = await coreService.generateSale(payload, serverUrl);

  res.render('apple-pay', {
    title: `Apple Pay - ${data.payme_sale_id || 'Generated'}`,
    ...data,
    success: data.status_code === 0,
    product_name: payload.product_name,
    apiKey: apiKey,
    merchantId: merchantId,
    testMode: process.env.PAYME_TEST_MODE === 'true'
  });
};

module.exports = {
  generateApplePaySale
};
