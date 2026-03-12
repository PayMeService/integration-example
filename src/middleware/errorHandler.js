const { getPayMeSdkUrl } = require('../utils/paymeSdkUrl');
const { getTestMode } = require('../utils/testMode');

const handleSaleError = (template) => {
  return (err, req, res, next) => {
    console.error(`Error generating sale:`, err.message);
    console.error('Error details:', err.response?.data || err);

    const defaults = req.session?.defaults || {};

    const baseErrorData = {
      success: false,
      status_code: err.response?.data?.status_code || 'ERROR',
      payme_sale_id: 'N/A',
      price: req.body.sale_price || 0,
      currency: req.body.currency || 'ILS',
      product_name: req.body.product_name || 'Test Product',
      error_message: err.response?.data?.message || err.message || 'Failed to generate sale'
    };

    if (template === 'apple-pay') {
      const apiKey = defaults.public_key || process.env.PAYME_API_KEY || '';
      const merchantId = defaults.apple_pay_merchant_id || process.env.APPLE_PAY_MERCHANT_ID || '';

      return res.status(500).render('apple-pay', {
        title: 'Apple Pay - Error',
        ...baseErrorData,
        apiKey,
        merchantId,
        paymeSdkUrl: getPayMeSdkUrl(defaults),
        testMode: getTestMode(defaults)
      });
    }

    if (template === 'google-pay') {
      const apiKey = defaults.public_key || process.env.PAYME_API_KEY || '';

      return res.status(500).render('google-pay', {
        title: 'Google Pay - Error',
        ...baseErrorData,
        apiKey,
        paymeSdkUrl: getPayMeSdkUrl(defaults),
        testMode: getTestMode(defaults)
      });
    }

    res.status(500).render('sale', {
      title: 'PayMe Sale - Error',
      ...baseErrorData,
      sale_payment_method: req.body.sale_payment_method || 'multi'
    });
  };
};

const handleVasError = (action) => {
  return (err, req, res, next) => {
    console.error(`Error ${action} VAS:`, err.message);
    console.error('Error details:', err.response?.data || err);

    const errorResponse = {
      status_code: err.response?.data?.status_code || 'ERROR',
      message: err.response?.data?.message || err.message || `Failed to ${action} VAS`,
      error: true
    };

    res.status(500).render('vas-result', {
      title: `VAS ${action} Result`,
      action,
      success: false,
      result: JSON.stringify(errorResponse, null, 2)
    });
  };
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  handleSaleError,
  handleVasError,
  asyncHandler
};
