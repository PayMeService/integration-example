const coreService = require('../services/coreService');

const getDefaults = (req) => req.session?.defaults || {};

const getVasEnableForm = (req, res) => {
  const defaults = getDefaults(req);
  res.render('vas-enable-form', {
    title: 'Enable VAS',
    defaults: defaults
  });
};

const getVasUpdateForm = (req, res) => {
  const defaults = getDefaults(req);
  res.render('vas-update-form', {
    title: 'Update VAS',
    defaults: defaults
  });
};

const enableVas = async (req, res) => {
  const defaults = getDefaults(req);
  const {
    payme_client_key,
    seller_payme_id,
    vas_payme_id,
    websites,
    language
  } = req.body;

  const payload = {
    payme_client_key: payme_client_key || defaults.partner_key,
    seller_payme_id: seller_payme_id || defaults.seller_payme_id,
    vas_payme_id,
    vas_data: {
      websites: websites.split(',').map(w => w.trim()).filter(w => w)
    },
    language: language || 'en'
  };

  const serverUrl = defaults.server || null;
  const data = await coreService.enableVas(payload, serverUrl);

  res.render('vas-result', {
    title: 'VAS Enable Result',
    action: 'Enable',
    success: data.status_code === 0,
    result: JSON.stringify(data, null, 2)
  });
};

const updateVas = async (req, res) => {
  const defaults = getDefaults(req);
  const {
    payme_client_key,
    seller_payme_id,
    vas_payme_id,
    websites,
    language
  } = req.body;

  const payload = {
    payme_client_key: payme_client_key || defaults.partner_key,
    seller_payme_id: seller_payme_id || defaults.seller_payme_id,
    vas_payme_id,
    vas_data: {
      websites: websites.split(',').map(w => w.trim()).filter(w => w)
    },
    language: language || 'en'
  };

  const serverUrl = defaults.server || null;
  const data = await coreService.updateVas(payload, serverUrl);

  res.render('vas-result', {
    title: 'VAS Update Result',
    action: 'Update',
    success: data.status_code === 0,
    result: JSON.stringify(data, null, 2)
  });
};

module.exports = {
  getVasEnableForm,
  getVasUpdateForm,
  enableVas,
  updateVas
};
