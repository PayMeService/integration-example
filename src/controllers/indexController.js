const { getPayMeSdkUrl, PAYME_SDK_URL_PRODUCTION } = require('../utils/paymeSdkUrl');
const { parseBoolean } = require('../utils/boolean');
const { getTestMode } = require('../utils/testMode');
const { isProdDomain } = require('../utils/domain');
const { getServerUrl } = require('../utils/serverUrl');

const isDefaultsComplete = (defaults) => {
  return !!(defaults?.server && defaults?.partner_key && defaults?.seller_payme_id);
};

const getIndex = (req, res) => {
  const isProd = isProdDomain(req);
  const sessionDefaults = req.session?.defaults || {};
  const defaults = {
    ...sessionDefaults,
    use_staging_sdk: isProd ? false : parseBoolean(sessionDefaults.use_staging_sdk, false),
    test_mode: getTestMode(sessionDefaults)
  };

  if (isProd) {
    defaults.server = getServerUrl(req, defaults);
  }

  res.render('index', {
    title: 'PayMe Payment Wrapper',
    defaults,
    defaultsComplete: isDefaultsComplete(defaults),
    applePayEnabled: !!defaults.apple_pay_merchant_id,
    googlePayEnabled: !!defaults.public_key,
    paymeSdkUrl: isProd ? PAYME_SDK_URL_PRODUCTION : getPayMeSdkUrl(defaults),
    isProd,
    saved: req.query.saved === 'true',
    missing: req.query.missing === 'true'
  });
};

const saveDefaults = (req, res) => {
  const isProd = isProdDomain(req);
  const {
    server,
    partner_key,
    seller_payme_id,
    apple_pay_merchant_id,
    public_key,
    use_staging_sdk,
    test_mode
  } = req.body;

  const parsedTestMode = parseBoolean(test_mode, false);

  const defaults = {
    partner_key: partner_key || '',
    seller_payme_id: seller_payme_id || '',
    apple_pay_merchant_id: apple_pay_merchant_id || '',
    public_key: public_key || '',
    use_staging_sdk: isProd ? false : parseBoolean(use_staging_sdk, false),
    test_mode: parsedTestMode
  };

  if (isProd) {
    defaults.server = parsedTestMode ? 'https://sandbox.payme.io' : 'https://payme.io';
  } else {
    defaults.server = server || '';
  }

  req.session.defaults = defaults;

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
