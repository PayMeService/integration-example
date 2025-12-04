const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
require('dotenv').config();

const indexController = require('./src/controllers/indexController');
const saleController = require('./src/controllers/saleController');
const applePayController = require('./src/controllers/applePayController');
const vasController = require('./src/controllers/vasController');
const { handleSaleError, handleVasError, asyncHandler } = require('./src/middleware/errorHandler');
const { requireDefaults } = require('./src/middleware/requireDefaults');

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
app.use(session({
  secret: process.env.SESSION_SECRET || 'payme-wrapper-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Index Routes (no auth required)
app.get('/', indexController.getIndex);
app.post('/defaults', indexController.saveDefaults);

// Apple Pay Certificate (no auth required)
app.get('/.well-known/apple-developer-merchantid-domain-association', saleController.getAppleCertificate);

// Protected Routes (require defaults)
app.get('/sale', requireDefaults, indexController.showSale);
app.get('/sale/:saleId', requireDefaults, saleController.getSaleById);
app.get('/apple-pay-sale/:saleId', requireDefaults, applePayController.getApplePaySaleById);
app.get('/generate-sale-form', requireDefaults, saleController.getGenerateSaleForm);
app.post('/generate-sale', requireDefaults, asyncHandler(saleController.generateSale), handleSaleError('sale'));
app.post('/generate-apple-pay-sale', requireDefaults, asyncHandler(applePayController.generateApplePaySale), handleSaleError('apple-pay'));

// VAS Routes (require defaults)
app.get('/vas-enable-form', requireDefaults, vasController.getVasEnableForm);
app.get('/vas-update-form', requireDefaults, vasController.getVasUpdateForm);
app.post('/vas-enable', requireDefaults, asyncHandler(vasController.enableVas), handleVasError('Enable'));
app.post('/vas-update', requireDefaults, asyncHandler(vasController.updateVas), handleVasError('Update'));

app.listen(PORT, () => {
  console.log(`Payment wrapper server running on port ${PORT}`);
});

module.exports = app;
