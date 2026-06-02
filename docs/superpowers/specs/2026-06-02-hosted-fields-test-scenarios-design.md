# Hosted Fields Tokenization Test Harness — Design

**Date:** 2026-06-02
**Repo:** payment-wrapper
**Goal:** Add a configurable test page to `payment-wrapper` that exercises the
`payme-js-api` **Hosted Fields tokenization** flow and its **validation / error**
behavior, so the recent staging SDK update can be validated end-to-end.

## Background

`payment-wrapper` currently tests: hosted sale pages (`generate-sale`, show sale
by id), Apple Pay (`appleSale().letsRock()`), Google Pay (`googleSale().letsRock()`),
and VAS. It does **not** test the SDK's core feature — Hosted Fields
tokenization (`PayMe.create → instance.hostedFields().create()/mount() → instance.tokenize()`).

The recent SDK update added Google Pay, a color-scheme API, multi-env `apiUrl`
routing (PMNT-3794), and rewritten card validators (custom number/expiration +
isracard 10-digit). The tokenization flow is the highest-value untested path.

## Scope

**In scope**
- Hosted Fields tokenization happy path: mount card fields (+ optional payer
  fields), call `tokenize()`, display the returned token result.
- Validation & error scenarios: per-field validity events, invalid/required
  handling, and display of `tokenize()` rejection (field-keyed error messages).
- Full integration: controller, routes, index nav button, defaults wiring, and a
  smoke-run confirming pages render.

**Out of scope (deliberately, per scoping)**
- Color-scheme builder / styling editor / language switcher UI. (The page will
  still default to sensible styling; `colorScheme` is not a configurable toggle.)
- A dedicated `apiUrl` toggle. The page passes `apiUrl`/`testMode` to `create()`
  exactly like the existing Apple/Google pages, so PMNT-3794 routing is still
  exercised against the configured staging server.
- Backend "pay with token" completion. Showing the tokenize result is sufficient
  proof the hosted-fields → gateway → staging-core path works. (Possible future
  extension; would require verifying the core "pay with buyer token" contract.)

## Auth token decision

The SDK's canonical example (`payme-js-api/views/tests/fully-featured.hbs`) calls
`PayMe.create(mpl, …)` using the **MPL (`seller_payme_id`)** as the auth token —
not the public key the Apple/Google pages use. The hosted-fields page therefore
uses `defaults.seller_payme_id` as the `create()` token. (If staging expects the
public key instead, this is a one-line switch.)

## Architecture

Mirrors the existing Sale/Apple/Google structure.

- **`src/controllers/hostedFieldsController.js`**
  - `getHostedFieldsForm(req, res)` — renders the config form.
  - `renderHostedFields(req, res)` — parses the posted config into a view model
    and renders the live tokenization page with token/MPL/testMode/apiUrl/sdkUrl
    baked in.
- **Routes (`index.js`, behind `requireDefaults`)**
  - `GET  /hosted-fields-form` → `getHostedFieldsForm`
  - `POST /hosted-fields`      → `renderHostedFields`
- **Templates**
  - `templates/hosted-fields-form.hbs` — config form.
  - `templates/hosted-fields.hbs` — live SDK page.
- **`templates/index.hbs`** — add a "Hosted Fields" action button (enabled when
  `defaultsComplete`).

## Config form (`/hosted-fields-form`)

Lets the tester choose what to render and what to tokenize:

- **Fields to mount** (checkboxes):
  - Card fields: `cardNumber`, `cardExpiration`, `cvc` (default: all checked;
    these are what tokenization needs).
  - Payer fields: `payerFirstName`, `payerLastName`, `payerEmail`, `payerPhone`,
    `payerSocialId`, `payerZipCode` (default: unchecked).
- **Tokenize total**: `amount` (default 100), `currency` (ILS/USD/EUR), `label`
  (product name). Reuses the look of the existing `form.hbs`.
- **Language**: `en` / `he` (passed to `create()` / field settings; low-cost,
  already part of every other form).
- **Payer detail values** (text inputs): values for payer fields that are *not*
  mounted as hosted fields are passed directly to `tokenize()` (e.g. type an
  email here if the email field is not mounted). This makes it easy to drive a
  complete tokenize without mounting every field.

The form POSTs to `/hosted-fields`.

## Live page (`/hosted-fields`) behavior

1. Load the SDK from the resolved `paymeSdkUrl` (respects `use_staging_sdk`).
2. `PayMe.create(seller_payme_id, { testMode, language, apiUrl?: '<server>/api' })`
   — `apiUrl` included only when `testMode` (same rule as Apple/Google pages).
3. `const fields = instance.hostedFields();`
4. For each selected field: `fields.create(type, { placeholder, messages })`,
   `field.mount('#<container>')`, and wire events:
   - `card-type-changed` → show detected brand (for cardNumber).
   - `validity-changed` / `keyup` → per-field validation message + valid/invalid
     styling (drives the **validation scenario**).
5. Enable the **Tokenize** button once all mounted fields report ready
   (`Promise.all` of `mount()`).
6. On Tokenize: build `tokenize()` options from the total + any payer-detail
   text inputs, call `instance.tokenize(opts)`:
   - **Success** → render the full token result JSON (and key fields) in a result
     panel.
   - **Error** → render the rejection, including field-keyed messages, in an
     error panel (drives the **error scenario**).
7. A live **event/console log** panel (same pattern as `apple-pay.hbs` /
   `google-pay.hbs`) records each step, event, and result.
8. A **Teardown** button calls `instance.teardown()` to test cleanup.

## Data flow

```
/hosted-fields-form  (GET)
   └─ tester picks fields + total + payer values + language
/hosted-fields       (POST)
   └─ controller builds view model { token(MPL), testMode, apiUrl, sdkUrl,
        selectedFields[], total, payerValues, language }
   └─ hosted-fields.hbs runs in browser:
        PayMe.create → hostedFields().create()/mount() → tokenize()
        → gateway /service/create-payment-token → staging core (test11.payme.io)
        → token result shown on page
```

## Validation / error coverage achieved

- Empty submit → `tokenize()` rejects with `required`-keyed messages (validators
  for non-mounted payer fields run too via the SDK's validation groups).
- Invalid card number / expiration / cvc → `validity-changed` shows inline
  errors; submitting still surfaces `tokenize()` errors. Exercises the rewritten
  custom validators (including isracard 10-digit).
- Network/declined → `tokenize()` rejection JSON shown in the error panel.

## Testing strategy

- **Controller unit-testable logic**: parsing posted config into the view model
  (which fields selected, building `tokenize` payload shape) is plain JS and can
  be unit-tested if a test runner is added; otherwise covered by the smoke-run.
- **Smoke-run**: start the server (`npm start`), load `/`, save defaults, open
  `/hosted-fields-form`, submit, and confirm `/hosted-fields` renders, the SDK
  loads, and field iframes mount. Actual card entry + tokenize is a manual human
  step (PCI input cannot be automated headlessly here).

## Out-of-scope / future

- Backend buyer-token sale completion.
- Color-scheme / styling / per-field message editor UI.
- Apple/Google `manual()` mode and `PayMe.clientData()` test pages.
