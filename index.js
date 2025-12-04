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

// Index Routes
app.get('/', indexController.getIndex);
app.post('/defaults', indexController.saveDefaults);
app.get('/sale', indexController.showSale);

// Sale Routes
app.get('/.well-known/apple-developer-merchantid-domain-association', saleController.getAppleCertificate);
app.get('/generate-sale-form', saleController.getGenerateSaleForm);
app.get('/sale/:saleId', saleController.getSaleById);
app.post('/generate-sale', asyncHandler(saleController.generateSale), handleSaleError('sale'));
app.post('/generate-apple-pay-sale', asyncHandler(applePayController.generateApplePaySale), handleSaleError('apple-pay'));

// VAS Routes
app.get('/vas-enable-form', vasController.getVasEnableForm);
app.get('/vas-update-form', vasController.getVasUpdateForm);
app.post('/vas-enable', asyncHandler(vasController.enableVas), handleVasError('Enable'));
app.post('/vas-update', asyncHandler(vasController.updateVas), handleVasError('Update'));

app.listen(PORT, () => {
  console.log(`Payment wrapper server running on port ${PORT}`);
});

module.exports = app;
