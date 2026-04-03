# msravionics.com
Main Website for MSR Avionics

## Form Delivery

Contact and RFQ forms post to `/api/enquiry`, which should be routed by App Platform to the functions component that sends mail through Postmark. The form type is sent in the POST body, so the route does not need to preserve query parameters.

## DigitalOcean App Platform

This repo includes a Functions project in `do-functions/`.

Deploy it as a separate `Functions` component in the same App Platform app:

1. Add a new `Functions` component from this repository.
2. Set the component source directory to `do-functions`.
3. Add these runtime environment variables on the functions component:

- `POSTMARK_SERVER_TOKEN`
- `POSTMARK_FROM_EMAIL`
- `POSTMARK_TO_EMAIL`

Optional variables:

- `POSTMARK_MESSAGE_STREAM` defaults to `outbound`
- `POSTMARK_BCC_EMAIL`

4. In App Platform, add a component routing rule on the static site:

- Route path: `/api/`
- Path handling: `Rewrite Path`
- Rewrite path: the internal path for the function component route that serves the enquiry function
- Target component: the functions component

Rewrites work within the same app and keep the browser on the same origin, which avoids cross-origin browser fetch issues.

`POSTMARK_FROM_EMAIL` must be a sender signature/domain that is authorised in Postmark.

Relevant docs:

- https://docs.digitalocean.com/products/functions/how-to/structure-projects/
- https://docs.digitalocean.com/products/functions/reference/project-configuration/
- https://docs.digitalocean.com/products/app-platform/how-to/manage-functions/
- https://docs.digitalocean.com/products/app-platform/how-to/url-rewrites/
