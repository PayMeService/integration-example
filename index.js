const express = require('express');
const cors = require('cors');
const path = require('path');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Handlebars
app.engine('hbs', engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'templates/layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'templates'));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/.well-known/apple-developer-merchantid-domain-association', (req, res) => {
  const appleCertificate = process.env.APPLE_PAY_CERTIFICATE;
  
  if (!appleCertificate) {
    return res.status(404).send('Apple Pay certificate not configured');
  }

  res.type('text/plain');
  res.send(appleCertificate);
});

app.get('/generate-sale-form', (req, res) => {
  res.render('form', {
    title: 'Generate PayMe Sale',
    defaultSellerId: process.env.DEFAULT_SELLER_PAYME_ID || ''
  });
});

app.get('/sale/:saleId', (req, res) => {
  const { saleId } = req.params;
  
  if (!process.env.CORE_API_URL) {
    return res.status(500).send('CORE_API_URL environment variable is not configured');
  }
  
  const saleUrl = `${process.env.CORE_API_URL}/sale/generate/${saleId}`;
  
  console.log('Rendering sale in iframe:', saleUrl);
  
  // Simply render the URL in an iframe without any API calls
  res.render('sale-view', {
    title: `Sale ${saleId}`,
    saleId: saleId,
    saleUrl: saleUrl
  });
});

app.post('/generate-sale', async (req, res) => {
  try {
    const serverUrl = process.env.CORE_API_URL + '/api/generate-sale';
    
    if (!serverUrl || !process.env.CORE_API_URL) {
      throw new Error('CORE_API_URL environment variable is not configured');
    }
    
    // Extract form data
    const {
      seller_payme_id,
      sale_price,
      currency,
      product_name,
      language,
      sale_payment_method,
      sale_type
    } = req.body;
    
    // Prepare request payload
    const payload = {
      seller_payme_id: seller_payme_id || process.env.DEFAULT_SELLER_PAYME_ID,
      sale_price: sale_price,
      currency: currency || 'ILS',
      product_name: product_name || 'Test Product',
      language: language || 'en',
      sale_payment_method: sale_payment_method || 'multi',
      sale_type: sale_type || 'sale'
    };
    
    console.log('Sending request to PayMe API:', serverUrl);
    console.log('Payload:', payload);
    
    // Make API call to PayMe
    const response = await axios.post(serverUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });
    
    console.log('PayMe API Response:', response.data);
    
    // Render the sale page with iframe
    res.render('sale', {
      title: `PayMe Sale - ${response.data.payme_sale_id || 'Generated'}`,
      ...response.data,
      success: response.data.status_code === 0,
      product_name: payload.product_name
    });
    
  } catch (error) {
    console.error('Error generating sale:', error.message);
    console.error('Error details:', error.response?.data || error);
    
    // Render error page
    res.status(500).render('sale', {
      title: 'PayMe Sale - Error',
      success: false,
      status_code: error.response?.data?.status_code || 'ERROR',
      payme_sale_id: 'N/A',
      price: req.body.sale_price || 0,
      currency: req.body.currency || 'ILS',
      product_name: req.body.product_name || 'Test Product',
      sale_payment_method: req.body.sale_payment_method || 'multi',
      error_message: error.response?.data?.message || error.message || 'Failed to generate sale'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Payment wrapper server running on port ${PORT}`);
});

module.exports = app;
