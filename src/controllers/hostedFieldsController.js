const { getPayMeSdkUrl, PAYME_SDK_URL_PRODUCTION } = require('../utils/paymeSdkUrl');
const { getTestMode } = require('../utils/testMode');
const { isProdDomain } = require('../utils/domain');
const { getServerUrl } = require('../utils/serverUrl');
const { parseBoolean } = require('../utils/boolean');

const getDefaults = (req) => req.session?.defaults || {};

// Catalog of fields that can be mounted as hosted (iframe) inputs.
// `key` matches the PayMe ProtectedFields value, so it can be passed straight
// to `fields.create(key, ...)` in the browser (PayMe.fields.NUMBER === 'cardNumber').
const CARD_FIELDS = [
  { key: 'cardNumber', label: 'Card Number', containerId: 'card-number-container', isCard: true },
  { key: 'cardExpiration', label: 'Expiration', containerId: 'card-expiration-container', isCard: true },
  { key: 'cvc', label: 'CVC', containerId: 'cvc-container', isCard: true },
];

const PAYER_FIELDS = [
  { key: 'payerFirstName', label: 'First Name', containerId: 'first-name-container' },
  { key: 'payerLastName', label: 'Last Name', containerId: 'last-name-container' },
  { key: 'payerEmail', label: 'Email', containerId: 'email-container' },
  { key: 'payerPhone', label: 'Phone', containerId: 'phone-container' },
  { key: 'payerSocialId', label: 'Social ID', containerId: 'social-id-container' },
  { key: 'payerZipCode', label: 'Zip Code', containerId: 'zip-code-container' },
];

// Payer detail keys accepted by tokenize() (TokenizationConfig). Values for any
// of these fields that are NOT mounted as hosted fields are passed straight to
// tokenize(), making it easy to drive a complete tokenization without mounting
// every field.
const PAYER_TOKENIZE_FIELDS = [
  { key: 'payerFirstName', label: 'First Name', sample: 'Test' },
  { key: 'payerLastName', label: 'Last Name', sample: 'Buyer' },
  { key: 'payerEmail', label: 'Email', sample: 'test.buyer@example.com' },
  { key: 'payerPhone', label: 'Phone', sample: '0501234567' },
  { key: 'payerSocialId', label: 'Social ID', sample: '000000000' },
];

const CURRENCIES = ['ILS', 'USD', 'EUR'];
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'he', label: 'Hebrew' },
];

// Serialize a config object for safe inlining inside a <script> tag. Escapes the
// characters that could either terminate the script early (`<`) or break the
// inline script as JS line terminators (U+2028 / U+2029).
const safeJson = (obj) =>
  JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/[\u2028]/g, '\\u2028')
    .replace(/[\u2029]/g, '\\u2029');

const getHostedFieldsForm = (req, res) => {
  res.render('hosted-fields-form', {
    title: 'Hosted Fields Tokenization',
    cardFields: CARD_FIELDS.map((f) => ({ ...f, checked: true })),
    payerFields: PAYER_FIELDS.map((f) => ({ ...f, checked: false })),
    payerValues: PAYER_TOKENIZE_FIELDS,
    currencies: CURRENCIES,
    languages: LANGUAGES,
  });
};

const renderHostedFields = (req, res) => {
  const defaults = getDefaults(req);
  const isProd = isProdDomain(req);
  const serverUrl = getServerUrl(req, defaults);
  const testMode = getTestMode(defaults);

  const allFields = [...CARD_FIELDS, ...PAYER_FIELDS];
  const selectedFields = allFields
    .filter((f) => parseBoolean(req.body['mount_' + f.key], false))
    .map((f) => ({ key: f.key, label: f.label, containerId: f.containerId, isCard: !!f.isCard }));

  const mountedKeys = selectedFields.map((f) => f.key);

  // Only pass payer values for fields the tester did NOT mount as hosted fields.
  const payerValues = {};
  PAYER_TOKENIZE_FIELDS.forEach(({ key }) => {
    const value = (req.body['val_' + key] || '').trim();
    if (value && !mountedKeys.includes(key)) {
      payerValues[key] = value;
    }
  });

  const total = {
    label: req.body.label || 'Test Product',
    amount: {
      currency: CURRENCIES.includes(req.body.currency) ? req.body.currency : 'ILS',
      value: String(req.body.amount || '100'),
    },
  };

  const language = LANGUAGES.some((l) => l.value === req.body.language) ? req.body.language : 'en';

  const config = {
    token: defaults.seller_payme_id,
    testMode,
    language,
    // Mirror the Apple/Google pages: only route via apiUrl in test mode.
    apiUrl: testMode && serverUrl ? serverUrl + '/api' : null,
    fields: selectedFields,
    payerValues,
    total,
  };

  res.render('hosted-fields', {
    layout: false,
    title: 'Hosted Fields Tokenization',
    paymeSdkUrl: isProd ? PAYME_SDK_URL_PRODUCTION : getPayMeSdkUrl(defaults),
    sellerPaymeId: defaults.seller_payme_id,
    testMode,
    language,
    apiUrl: config.apiUrl,
    configJson: safeJson(config),
  });
};

module.exports = {
  getHostedFieldsForm,
  renderHostedFields,
};
