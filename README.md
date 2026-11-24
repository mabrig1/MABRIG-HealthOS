# MABRIG HealthOS v0.6
Independent fictional health-evidence research application by MABRIG Technologies.

## Run
Open index.html directly for the offline version, or install Node 22+ and run npm test then npm start (requires Python 3 for local serving). The build has no npm dependencies. Source is in src/; npm run build creates dist/index.html. After editing source, copy dist/index.html to root index.html and run npm test.

## Features
Three fictional cases, provenance ledger, evidence graph, care action tracker, visit preparation questions, reference directory, twelve scripted specialist roles and JSON export. No real patient data input, storage, network inference, diagnosis, triage or clinical validation. External reference links require an explicit click.

## Cloudflare
Review CI first. Create or connect a Worker to this repository; use npm run build and npx wrangler deploy. Wrangler serves dist/ static assets plus a bounded public evidence API. No database, secrets or paid model services required. Attach a custom domain only after reviewing the published prototype. No deployment is performed by CI.

## SwarmLab
The current roles are deterministic simulations (zero live calls). A protected, synthetic-only healthcare gateway is a future integration. Never route actual patient data into the engineering gateway. Do not enable clinical use before independent clinical, security, privacy and regulatory review. This public repository must never contain real health records, credentials or private provider code.

## Connected workspace
Manual review/download/copy handoffs to SwarmLab, Scholar, NigerFlora, StatLab, AI University, BuildRx and AfrigrantPipeline. All briefs are generic and the StatLab CSV contains only built-in fictional documentation action rows (not patients). No automatic API requests, live inference, SSO or data synchronization. StatLab opens via the public project directory; destination availability and manual imports require separate smoke testing. Run npm test before deployment.

## Public research radar (v0.4)
Europe PMC metadata retrieval with four fixed topics, ten records per request, ten-second upstream timeout, bounded body size, and best-effort one-hour edge cache. No AI calls, free-text queries, patient data or clinical claims. The gateway is disabled by default: after deploying and reviewing usage limits, set EVIDENCE_ENABLED=true in the Worker configuration and deploy again (or configure the runtime variable consistently). Test /api/health and then use Research radar. Direct file and Python static server modes keep offline functions but do not provide the API. Source packets can be downloaded for manual Scholar/NigerFlora review. Cache is per edge location and is not a global rate limit; enable appropriate Cloudflare rate limits before public use. No production deployment, external live test, or account changes in this commit. See https://dev.europepmc.org/RestfulWebService.

## MONAI imaging lab
Pinned upstream source submodule and separate local CPU synthetic imaging runtime. See [setup and limitations](imaging/README.md). Browser imports a bounded synthetic report and independently checks mask overlap. No patient images, trained diagnostic model, hosted Python runtime or clinical validation.

## Imaging studio and OHIF
Native offline geometric volume viewer with three planes, window controls, overlays and synthetic volume export. OHIF source pinned separately; local synthetic DICOM generation and optional local viewer build instructions in [imaging/OHIF.md](imaging/OHIF.md). No embedded OHIF or real patient scan support. No production or clinical deployment.
