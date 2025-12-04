const coreService = require('../services/coreService');

const getDefaults = (req) => req.session?.defaults || {};

const getAppleCertificate = (req, res) => {
  const appleCertificate = process.env.APPLE_PAY_CERTIFICATE;

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
    defaultSellerId: defaults.seller_payme_id || process.env.DEFAULT_SELLER_PAYME_ID || ''
  });
};

const getSaleById = (req, res) => {
  const { saleId } = req.params;
  const defaults = getDefaults(req);
  const serverUrl = defaults.server || process.env.CORE_API_URL;

  if (!serverUrl) {
    return res.status(500).send('Server URL is not configured');
  }

  const saleUrl = `${serverUrl}/sale/generate/${saleId}`;

  console.log('Rendering sale in iframe:', saleUrl);

  res.render('sale-view', {
    title: `Sale ${saleId}`,
    saleId: saleId,
    saleUrl: saleUrl
  });
};

const generateSale = async (req, res) => {
  const defaults = getDefaults(req);
  const {
    seller_payme_id,
    sale_price,
    currency,
    product_name,
    language,
    sale_payment_method,
    sale_type
  } = req.body;

  const payload = {
    seller_payme_id: seller_payme_id || defaults.seller_payme_id || process.env.DEFAULT_SELLER_PAYME_ID,
    sale_price: sale_price,
    currency: currency || 'ILS',
    product_name: product_name || 'Test Product',
    language: language || 'en',
    sale_payment_method: sale_payment_method || 'multi',
    sale_type: sale_type || 'sale'
  };

  const serverUrl = defaults.server || null;
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
