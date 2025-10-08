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
Form for sale generation

### POST /generate-sale
Calls core endpoint and renders "sale_url" from response in iframe

### GET /sale/:saleId
Renders `CORE_API_URL/sale/generate/{saleId}` directly in an iframe without any API calls

## Apple Pay Setup

1. Set file content in `APPLE_PAY_CERTIFICATE` environment variable
2. Ensure your domain serves the file at `/.well-known/apple-developer-merchantid-domain-association`
