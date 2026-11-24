# HealthOS ↔ SwarmLab protected research council

SwarmLab PR #13 must be reviewed and deployed before the bridge is enabled. The endpoint accepts four allowlisted research mission IDs only and returns eight deterministic task roles. It does not execute research, clinical analysis, imaging, model inference or upstream runtimes. No patient data or user-entered text is transmitted. No automatic provider fallback or paid AI.

## Operator setup (not performed by CI)
1. Review and merge SwarmLab PR #13, deploy the Worker named mabrig-swarmlab, then set HEALTH_COUNCIL_ENABLED=true and a distinct random HEALTHOS_BRIDGE_TOKEN secret (at least 32 characters). Never reuse an administrator token.
2. In HealthOS Worker, add service binding SWARMLAB pointing to mabrig-swarmlab; equivalent Wrangler config: services: [{binding: "SWARMLAB", service: "mabrig-swarmlab"}]. Keep this out of default config until the destination Worker exists. Set the same HEALTHOS_BRIDGE_TOKEN as a Worker secret, never in source or browser.
3. Set SWARM_COUNCIL_ENABLED=true in HealthOS config/runtime. Preserve runtime settings across deploys. Apply appropriate request rate limits on public HealthOS; same-origin checks are not authentication or quota enforcement.
4. Test /api/health, then Research council → select mission → Request research council. Disable both flags if unexpected output. The public HealthOS endpoint returns only fixed public research plans. No SSO, accounts, real patient records, clinical validation or live LLM agents.

Both sides default disabled and no service binding is added to the production config automatically. Tests use in-memory mock service calls; live cross-Worker verification is pending.
