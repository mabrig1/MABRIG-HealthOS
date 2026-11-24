# Clinical Research OS v0.7

Open HealthOS index.html → Clinical research OS. Generate 5, 10, 20 or 50 artificial subjects with Patient, Encounter and administrative Task resources. Internal fixture/reference checks are not formal HL7 FHIR validation. Export JSON or StatLab CSV. No real patient input. Geometry marks are manual, not MONAI Label output.

## Pinned upstream source
- [PyHealth v2.1.0](https://github.com/sunlabuiuc/PyHealth/tree/e5394d5ca1aa39b4ba70ad81bc708343ba37b092) — Longitudinal health research. Source only.
- [OpenMRS 2.8.10](https://github.com/openmrs/openmrs-core/tree/a7f6314dd430cbc393313dcfcdc6dd2edecea377) — Electronic records. Source only.
- [Synthea master snapshot](https://github.com/synthetichealth/synthea/tree/5441eef7de9867babcde1551640b78f3e0119594) — Synthetic datasets. Source only.
- [MONAILabel 0.8.6](https://github.com/Project-MONAI/MONAILabel/tree/f824cd267f32429f518d1d0c7f699909b2dbe559) — Image annotation. Source only.
- [MONAIModelZoo dev snapshot](https://github.com/Project-MONAI/model-zoo/tree/c1f50fb80be8a6274fa7de956bb742faab1a833d) — Model bundle review. Source only.
- [HAPIFHIR v9.0.0](https://github.com/hapifhir/hapi-fhir/tree/28e4e97ccf2035af9be7c00612a01d82d366f18c) — Interoperability. Source only.

All upstream licenses and notices remain in their submodules. Model bundles have separate licenses. Clone individually with `git submodule update --init vendor/<name>`; avoid recursive cloning all large repositories unless required. No upstream runtimes or model weights are executed or deployed.

## Separate Synthea local experiment
`git submodule update --init vendor/Synthea`, then in vendor/Synthea use the pinned README's Java/Gradle setup, `./gradlew build check test` and `./run_synthea -s 42 -p 5 Massachusetts`. Generated data are modeled US synthetic data, not empirical findings or HealthOS native fixtures.

## Integration gates
HAPI FHIR formal R4 validation locally; OpenMRS isolated Java/database; PyHealth isolated Python experiments; MONAI Label separate synthetic-image runtime; Model Zoo per-bundle license and security review. No automatic downloads or service connections. No production deployment or clinical validation.
