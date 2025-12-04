const isDefaultsComplete = (defaults) => {
  return !!(defaults?.server && defaults?.partner_key && defaults?.seller_payme_id);
};

const getIndex = (req, res) => {
  const defaults = req.session?.defaults || {};
  res.render('index', {
    title: 'PayMe Payment Wrapper',
    defaults: defaults,
    defaultsComplete: isDefaultsComplete(defaults),
    applePayEnabled: !!defaults.apple_pay_merchant_id,
    saved: req.query.saved === 'true',
    missing: req.query.missing === 'true'
  });
};

const saveDefaults = (req, res) => {
  const { server, partner_key, seller_payme_id, apple_pay_merchant_id } = req.body;

  req.session.defaults = {
    server: server || '',
    partner_key: partner_key || '',
    seller_payme_id: seller_payme_id || '',
    apple_pay_merchant_id: apple_pay_merchant_id || ''
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
