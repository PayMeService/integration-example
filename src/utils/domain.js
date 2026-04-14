const isProdDomain = (req) => {
  const prodDomain = process.env.PROD_DOMAIN;
  if (!prodDomain) return false;
  const host = req.hostname || req.get('host')?.split(':')[0];
  return host === prodDomain;
};

module.exports = {
  isProdDomain
};
