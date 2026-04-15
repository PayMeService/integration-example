const { isProdDomain } = require('../utils/domain');
const { getServerUrl } = require('../utils/serverUrl');
const { getTestMode } = require('../utils/testMode');

const requireDefaults = (req, res, next) => {
  const defaults = req.session?.defaults || {};

  // On prod domain, auto-populate server URL if not set
  if (isProdDomain(req) && !defaults.server) {
    defaults.server = getServerUrl(req, defaults);
    req.session.defaults = defaults;
  }

  const hasServer = !!defaults.server;
  const hasSellerPaymeId = !!defaults.seller_payme_id;

  if (!hasServer || !hasSellerPaymeId) {
    return res.redirect('/?missing=true');
  }

  next();
};

const requireVasDefaults = (req, res, next) => {
  const defaults = req.session?.defaults || {};

  if (isProdDomain(req) && !defaults.server) {
    defaults.server = getServerUrl(req, defaults);
    req.session.defaults = defaults;
  }

  if (!defaults.server || !defaults.seller_payme_id || !defaults.partner_key) {
    return res.redirect('/?missing=true');
  }

  next();
};

module.exports = {
  requireDefaults,
  requireVasDefaults
};
