const { getPayMeSdkUrl } = require('../utils/paymeSdkUrl');
const { parseBoolean } = require('../utils/boolean');
const { getTestMode } = require('../utils/testMode');

const isDefaultsComplete = (defaults) => {
  return !!(defaults?.server && defaults?.partner_key && defaults?.seller_payme_id);
};

const getIndex = (req, res) => {
  const sessionDefaults = req.session?.defaults || {};
  const defaults = {
    ...sessionDefaults,
    use_staging_sdk: parseBoolean(sessionDefaults.use_staging_sdk, false),
    test_mode: getTestMode(sessionDefaults)
  };

  res.render('index', {
    title: 'PayMe Payment Wrapper',
    defaults,
    defaultsComplete: isDefaultsComplete(defaults),
    applePayEnabled: !!defaults.apple_pay_merchant_id,
    googlePayEnabled: !!defaults.public_key,
    paymeSdkUrl: getPayMeSdkUrl(defaults),
    saved: req.query.saved === 'true',
    missing: req.query.missing === 'true'
  });
};

const saveDefaults = (req, res) => {
  const {
    server,
    partner_key,
    seller_payme_id,
    apple_pay_merchant_id,
    public_key,
    use_staging_sdk,
    test_mode
  } = req.body;

  req.session.defaults = {
    server: server || '',
    partner_key: partner_key || '',
    seller_payme_id: seller_payme_id || '',
    apple_pay_merchant_id: apple_pay_merchant_id || '',
    public_key: public_key || '',
    use_staging_sdk: parseBoolean(use_staging_sdk, false),
    test_mode: parseBoolean(test_mode, false)
  };

  res.redirect('/?saved=true');
};

const showSale = (req, res) => {
  const { saleId } = req.query;

  if (!saleId) {
    return res.redirect('/');
  }

  res.redirect(`/sale/${saleId}`);
};

module.exports = {
  getIndex,
  saveDefaults,
  showSale
};
