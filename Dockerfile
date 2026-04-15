FROM node:20-alpine AS builder

WORKDIR /src

COPY package*.json tsconfig.json README.md LICENSE ./
COPY scripts ./scripts
COPY src ./src

RUN npm ci
RUN npm run build
RUN npm pack

FROM n8nio/n8n:latest

USER root
WORKDIR /home/node/.n8n/custom

COPY --from=builder /src/n8n-nodes-abacus-erp-*.tgz ./

RUN npm install --omit=dev ./n8n-nodes-abacus-erp-*.tgz \
  && rm -f ./n8n-nodes-abacus-erp-*.tgz

ENV N8N_CUSTOM_EXTENSIONS=/home/node/.n8n/custom/node_modules

USER node
