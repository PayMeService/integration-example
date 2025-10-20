# Payment Wrapper - PayMe iFrame Testing

A simple Express application for testing PayMe payment integration in iframes.

## Core endpoint call

The application makes direct API calls from the frontend to the PayMe API endpoint you configure. The request includes:

```json
{
  "seller_payme_id": "your_configured_id",
  "sale_price": "100",
  "currency": "ILS",
  "product_name": "Test Product",
  "language": "en",
  "sale_payment_method": "multi",
  "sale_type": "sale"
}
```

The PayMe API returns:
```json
{
  "status_code": 0,
  "sale_url": "https://...",
  "payme_sale_id": "SALE...",
  "payme_sale_code": 16,
  "price": 100,
  "currency": "ILS",
  "sale_payment_method": "multi",
  "session": "..."
}
```

## Endpoints

### GET /.well-known/apple-developer-merchantid-domain-association
Returns Apple Pay domain verification certificate.

### GET /generate-sale-form
Form for sale generation with two payment options:
- **Generate Sale**: Standard payment flow
- **Apple Pay**: Apple Pay payment flow

### POST /generate-sale
Calls core endpoint and renders "sale_url" from response in iframe

### POST /generate-apple-pay-sale
Creates an Apple Pay sale and renders the Apple Pay payment page with:
- Apple Pay SDK integration
- PayMe SDK integration
- Apple Pay button
- Payment flow handling

### GET /sale/:saleId
Renders `CORE_API_URL/sale/generate/{saleId}` directly in an iframe without any API calls

## Apple Pay Setup

### Prerequisites

1. **Apple Pay Merchant ID**: Contact PayMe Partners (partners@payme.io) to get your merchant ID
2. **PayMe API Key**: Get this from your PayMe dashboard Settings page
3. **Domain Verification Certificate**: Obtain the Apple Pay certificate content

### Environment Configuration

Add the following variables to your `.env` file:

```bash
# PayMe API Configuration
CORE_API_URL=https://your-payme-api-url.com
DEFAULT_SELLER_PAYME_ID=your-seller-id

# PayMe API Key (required for Apple Pay)
PAYME_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Test Mode (set to 'true' for test environment)
PAYME_TEST_MODE=true

# Apple Pay Configuration
APPLE_PAY_MERCHANT_ID=merchant.paymeproduction
APPLE_PAY_CERTIFICATE=your-apple-pay-certificate-content

# Server Configuration
PORT=3000
```

### Domain Verification

1. The application automatically serves the Apple Pay domain association file at:
   `/.well-known/apple-developer-merchantid-domain-association`

2. Contact PayMe Partners (partners@payme.io) after deploying to verify your domain was approved by Apple

### How It Works

1. User fills in the payment form at `/generate-sale-form`
2. User clicks the **Apple Pay** button
3. Backend creates a sale with `sale_payment_method: "apple-pay"`
4. User is redirected to the Apple Pay payment page
5. Page checks Apple Pay availability on the device
6. PayMe SDK initializes the Apple Pay session
7. User completes payment using Apple Pay
8. Payment status is displayed in real-time

### Testing Apple Pay

**Requirements for Testing:**
- macOS with Safari browser, or
- iOS device with Safari, or
- Any device with Apple Pay enabled

**Steps:**
1. Ensure all environment variables are configured
2. Start the server: `npm start`
3. Navigate to `/generate-sale-form`
4. Fill in the payment details
5. Click **Apple Pay** button
6. The Apple Pay payment page will check device compatibility
7. If supported, the Apple Pay button will appear
8. Click the Apple Pay button to test the payment flow

**Console Logging:**
The Apple Pay page includes a detailed console log that shows:
- Apple Pay availability checks
- SDK initialization steps
- Payment flow progression
- Any errors or issues

### Troubleshooting

**"Apple Pay is not available on this device"**
- Apple Pay requires a compatible device (Mac with Touch ID, iPhone, iPad, or Apple Watch)
- Ensure you're using Safari browser
- Check that Apple Pay is enabled in device settings

**"PayMe SDK not loaded"**
- Check your internet connection
- Verify the PayMe CDN is accessible
- Check browser console for network errors

**"Merchant ID not configured"**
- Verify `APPLE_PAY_MERCHANT_ID` is set in your `.env` file
- Contact PayMe Partners to ensure your merchant ID is active

**"Failed to initialize PayMe"**
- Verify `PAYME_API_KEY` is correct
- Check `PAYME_TEST_MODE` matches your environment
- Ensure your API key has Apple Pay permissions
