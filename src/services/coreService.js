const axios = require('axios');

const getBaseUrl = (overrideUrl) => {
  const baseUrl = overrideUrl || process.env.CORE_API_URL;
  if (!baseUrl) {
    throw new Error('Server URL is not configured');
  }
  return baseUrl;
};

const generateSale = async (payload, overrideUrl = null) => {
  const baseUrl = getBaseUrl(overrideUrl);
  const serverUrl = baseUrl + '/api/generate-sale';

  console.log('Sending request to PayMe API:', serverUrl);
  console.log('Payload:', payload);

  const response = await axios.post(serverUrl, payload, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });

  console.log('PayMe API Response:', response.data);

  return response.data;
};

const enableVas = async (payload, overrideUrl = null) => {
  const baseUrl = getBaseUrl(overrideUrl);
  const serverUrl = baseUrl + '/api/vas-enable';

  console.log('Sending VAS enable request to PayMe API:', serverUrl);
  console.log('Payload:', payload);

  const response = await axios.post(serverUrl, payload, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });

  console.log('PayMe API Response:', response.data);

  return response.data;
};

const updateVas = async (payload, overrideUrl = null) => {
  const baseUrl = getBaseUrl(overrideUrl);
  const serverUrl = baseUrl + '/api/vas-update';

  console.log('Sending VAS update request to PayMe API:', serverUrl);
  console.log('Payload:', payload);

  const response = await axios.post(serverUrl, payload, {
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 30000
  });

  console.log('PayMe API Response:', response.data);

  return response.data;
};

module.exports = {
  generateSale,
  enableVas,
  updateVas
};
