const getIndex = (req, res) => {
  res.render('index', {
    title: 'PayMe Payment Wrapper',
    defaults: req.session.defaults || {},
    saved: req.query.saved === 'true'
  });
};

const saveDefaults = (req, res) => {
  const { server, partner_key, seller_payme_id } = req.body;

  req.session.defaults = {
    server: server || '',
    partner_key: partner_key || '',
    seller_payme_id: seller_payme_id || ''
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
