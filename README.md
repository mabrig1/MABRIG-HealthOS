# MABRIG HealthOS v0.3
Independent fictional health-evidence research application by MABRIG Technologies.

## Run
Open index.html directly for the offline version, or install Node 22+ and run npm test then npm start (requires Python 3 for local serving). The build has no npm dependencies. Source is in src/; npm run build creates dist/index.html. After editing source, copy dist/index.html to root index.html and run npm test.

## Features
Three fictional cases, provenance ledger, evidence graph, care action tracker, visit preparation questions, reference directory, twelve scripted specialist roles and JSON export. No real patient data input, storage, network inference, diagnosis, triage or clinical validation. External reference links require an explicit click.

## Cloudflare
Review CI first. Create or connect a Worker to this repository; use npm run build and npx wrangler deploy. Wrangler serves only dist/ static assets. No database, secrets or paid model services required. Attach a custom domain only after reviewing the published prototype. No deployment is performed by CI.

## SwarmLab
The current roles are deterministic simulations (zero live calls). A protected, synthetic-only healthcare gateway is a future integration. Never route actual patient data into the engineering gateway. Do not enable clinical use before independent clinical, security, privacy and regulatory review. This public repository must never contain real health records, credentials or private provider code.

## Connected workspace
Manual review/download/copy handoffs to SwarmLab, Scholar, NigerFlora, StatLab, AI University, BuildRx and AfrigrantPipeline. All briefs are generic and the StatLab CSV contains only built-in fictional documentation action rows (not patients). No automatic API requests, live inference, SSO or data synchronization. StatLab opens via the public project directory; destination availability and manual imports require separate smoke testing. Run npm test before deployment.
