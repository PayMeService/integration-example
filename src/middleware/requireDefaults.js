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
  const hasPartnerKey = !!defaults.partner_key;
  const hasSellerPaymeId = !!defaults.seller_payme_id;

  if (!hasServer || !hasPartnerKey || !hasSellerPaymeId) {
    return res.redirect('/?missing=true');
  }

  next();
};

module.exports = {
  requireDefaults
};
