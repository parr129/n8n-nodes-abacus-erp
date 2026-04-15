# n8n-nodes-abacus-erp

Production-ready n8n community node for Abacus ERP APIs. It provides OAuth2 authentication, customer retrieval, invoice creation, and order retrieval with pagination, retries, and structured error handling.

## Features

- OAuth2 credentials tailored for multi-tenant Abacus ERP deployments
- `Get Customers` operation with search, status, updated-since filters, and pagination
- `Create Invoice` operation with structured invoice line items
- `Get Orders` operation with customer, status, created-since filters, and pagination
- Exponential backoff retries for transient API failures
- Sample n8n workflows and mock payloads for quick testing
- GitHub- and npm-ready package layout

## Folder Structure

```text
n8n-nodes-abacus-erp/
|-- .env.example
|-- .gitignore
|-- LICENSE
|-- README.md
|-- examples/
|   |-- abacus-create-invoice-workflow.json
|   |-- abacus-get-customers-workflow.json
|   `-- mock-api-responses.json
|-- package.json
|-- src/
|   |-- credentials/
|   |   `-- AbacusOAuth2Api.credentials.ts
|   |-- index.ts
|   `-- nodes/
|       `-- AbacusErp/
|           |-- AbacusErp.node.ts
|           |-- AbacusTypes.ts
|           |-- GenericFunctions.ts
|           |-- abacus.svg
|           `-- descriptions.ts
|-- test/
|   `-- helpers.test.js
`-- tsconfig.json
```

## Installation

### Local development

```bash
git clone https://github.com/your-org/n8n-nodes-abacus-erp.git
cd n8n-nodes-abacus-erp
npm install
npm run build
npm test
```

### Install into self-hosted n8n

```bash
npm install n8n-nodes-abacus-erp
```

If you run n8n with Docker, mount a custom extensions directory and set:

```bash
N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom
```

Then install the package inside that directory or bake it into your image.

## Credentials Setup

Create a new credential of type `Abacus ERP OAuth2 API` and fill in:

- `Authorization URL`: Your Abacus tenant authorization endpoint
- `Access Token URL`: Your Abacus tenant token endpoint
- `Base API URL`: Your Abacus REST API base URL
- `Client ID` and `Client Secret`: Issued by Abacus ERP
- `Scope`: Example `customers.read orders.read invoices.write offline_access`

Recommended callback URL pattern in n8n:

```text
https://your-n8n-domain/rest/oauth2-credential/callback
```

## Usage Examples

### Get Customers

- Operation: `Get Customers`
- Optional filters: `Search`, `Status`, `Updated Since`
- Pagination: Set `Return All` or pass `Page` + `Page Size`

### Create Invoice

- Operation: `Create Invoice`
- Required fields: `Customer ID`, `Invoice Date`, `Invoice Lines`
- Optional fields: `Due Date`, `Currency`, `Reference`, `Notes`

### Get Orders

- Operation: `Get Orders`
- Optional filters: `Order Status`, `Customer ID`, `Created Since`
- Pagination: Set `Return All` or pass `Page` + `Page Size`

## Error Handling

The node retries transient failures automatically for common retryable statuses:

- `408`
- `409`
- `425`
- `429`
- `500`
- `502`
- `503`
- `504`

Non-retryable failures throw a normalized `NodeApiError` so workflows fail with actionable details.

## Screenshots

- Placeholder: OAuth2 credential configuration screenshot
- Placeholder: Abacus ERP node configuration screenshot
- Placeholder: Successful customer sync workflow screenshot

## Commands

### Local development

```bash
npm install
npm run build
npm run lint
npm test
```

### Publish to npm

```bash
npm login
npm version patch
npm publish --access public
```

## GitHub Publishing

```bash
git init
git checkout -b main
git add .
git commit -m "feat: initial Abacus ERP n8n community node"
git remote add origin https://github.com/your-org/n8n-nodes-abacus-erp.git
git push -u origin main
```

## Deploy n8n on Railway

1. Create a new Railway project.
2. Deploy the official `n8nio/n8n` image or a custom Dockerfile.
3. Set environment variables:
   - `N8N_HOST`
   - `N8N_PROTOCOL=https`
   - `WEBHOOK_URL=https://your-app.up.railway.app/`
   - `N8N_EDITOR_BASE_URL=https://your-app.up.railway.app/`
   - `N8N_ENCRYPTION_KEY=<strong-random-value>`
   - `N8N_CUSTOM_EXTENSIONS=/data/custom`
4. Add a startup step to install the package into `/data/custom` or prebuild an image that includes this package.
5. Restart the deployment and verify the node appears in the editor.

### Railway Dockerfile pattern

```dockerfile
FROM n8nio/n8n:latest
USER root
RUN mkdir -p /data/custom && cd /data/custom && npm install n8n-nodes-abacus-erp
ENV N8N_CUSTOM_EXTENSIONS=/data/custom/node_modules
USER node
```

## Deploy n8n on Render

1. Create a new Web Service on Render.
2. Use the `n8nio/n8n` image or a custom Docker repository.
3. Set persistent disk storage for `/home/node/.n8n`.
4. Add environment variables:
   - `N8N_HOST`
   - `N8N_PROTOCOL=https`
   - `WEBHOOK_URL=https://your-service.onrender.com/`
   - `N8N_EDITOR_BASE_URL=https://your-service.onrender.com/`
   - `N8N_ENCRYPTION_KEY=<strong-random-value>`
   - `N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom`
5. Install the package during image build or container startup.

## Install This Node In Deployed n8n

### Option 1: Install from npm in a custom image

```bash
npm install n8n-nodes-abacus-erp
```

### Option 2: Link local package during development

```bash
npm run build
npm link
cd /path/to/n8n/custom
npm link n8n-nodes-abacus-erp
```

Restart n8n after installation.

## Final Deployed Link Format

- GitHub repository: `https://github.com/<your-org>/n8n-nodes-abacus-erp`
- npm package: `https://www.npmjs.com/package/n8n-nodes-abacus-erp`
- Railway n8n instance: `https://<your-railway-app>.up.railway.app`
- Render n8n instance: `https://<your-render-service>.onrender.com`

## Production Notes

- Replace the placeholder Abacus endpoints with your tenant-specific URLs before publishing.
- Confirm Abacus API field names and endpoint paths against your ERP tenant documentation.
- Consider pinning `n8n-workflow` peer dependency to match your target n8n release train.

## Suggested Improvements

- Add response caching for high-volume customer and order sync workflows
- Emit structured logs to Datadog, OpenTelemetry, or Sentry for operational visibility
- Add circuit-breaker behavior around upstream outages
- Extend invoice support for attachments, taxes, discounts, and payment status
- Introduce AI-assisted workflow templates that suggest common Abacus sync automations based on business objects and historical usage
