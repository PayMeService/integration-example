const requireDefaults = (req, res, next) => {
  const defaults = req.session?.defaults || {};

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
