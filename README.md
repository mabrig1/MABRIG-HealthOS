# MABRIG HealthOS v0.11
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

## Clinical Research OS
Synthetic cohorts, FHIR R4-style collection exports, StatLab CSV, internal reference checks and manual geometry marks. Six new source submodules; no upstream runtimes enabled. [Guide](clinical/README.md).

## Protected SwarmLab research council
Optional server-to-server fixed-mission gateway. Eight deterministic planning roles, no inference or clinical results. See [operator setup](docs/SWARMLAB-COUNCIL.md). Disabled until both Workers are configured.

## Scientific computing
Actual local synthetic MONAI training and holdout benchmark, arithmetic-checked report import, and separate HAPI FHIR base validation harness. [Guide](clinical/COMPUTE.md). No production deployment or medical accuracy claims.

## Workers AI owner research pilot
See [activation guide](docs/WORKERS-AI.md). Disabled by default; fixed-topic, owner-authorized, quota-bounded drafts. No medical use or automatic paid fallback.

## FreeLLMAPI owner pilot
Optional private router provider with shared durable quota and fixed topics. Disabled by default. [Setup](docs/FREELLMAPI.md). No live runtime or cost guarantee.

## Facial wellness studio (v0.12)
On-device guided camera quality check and evidence-linked habits, no age estimation or image storage. [Documentation](docs/FACIAL-WELLNESS.md).

## Healthy-aging program v0.13
Manual region explorer, AM/PM routine education, 30-day session habit journal with local export/import, and professional treatment safety education. [Details](docs/LONGEVITY-PROGRAM.md). No diagnosis or rejuvenation claims.

## Experimental face landmark adapter (v0.14)
Optional same-origin reviewed MediaPipe assets, two-frame framing consistency and region image-quality feedback. Disabled by absent assets; no face scoring. [Setup](docs/FACE-LANDMARKER.md).

## Private facial diary v0.15
Single-owner encrypted R2 pilot with daily records, optional photos, side-by-side comparison and descriptive associations. Disabled by default. [Setup and limitations](docs/PRIVATE-DIARY.md).
