# OHIF bridge (v0.6)
OHIF/Viewers release v3.13.15, pinned commit d112c9e1dce2586bfa4359c06c9258e1a03c9813. MIT license retained in third_party/OHIF-LICENSE. The web studio uses MABRIG's own deterministic geometry engine; it is not embedded OHIF. No clinical validation or patient imaging.

## 1. Generate local artificial DICOM files
Python 3.12 recommended. In a local virtual environment:
```bash
python -m pip install -r imaging/dicom-requirements.txt
python -m unittest imaging.test_dicom
python -m imaging.generate_dicom
```
This creates 48 Secondary Capture files in a new synthetic-dicom folder. It never reads input scans, overwrites existing folders or creates clinical records. These are geometric fixtures, not modality-calibrated data. The Python test checks file round-trip and pixel metadata. OHIF compatibility and rendering are not yet verified.

## 2. Optional separate OHIF build
Use Node >=24 and pnpm 12.8.1 (upstream requirements), not HealthOS's Node 22 web build. Large dependencies and build resources are needed. From HealthOS root:
```bash
git submodule update --init vendor/OHIF
cp imaging/ohif-local.config.js vendor/OHIF/platform/app/public/config/healthos-local.js
cd vendor/OHIF
pnpm install --frozen-lockfile
pnpm exec cross-env APP_CONFIG=config/healthos-local.js pnpm run build
```
On Windows use Copy-Item instead of cp. Use only a loopback static SPA server (with index.html fallback for /localbasic, appropriate JS MIME types and COOP/COEP if needed). Example local server script is provided:
```bash
# return to HealthOS root
python imaging/serve_ohif.py
```
Open http://127.0.0.1:8789/localbasic and select only the generated files. The upstream /localbasic route and dicomlocal data source are present at the pinned commit. The custom config and build/route still require a real smoke test; do not claim they are verified. No production OHIF deployment, PACS, remote DICOMweb or patient data support. Local file selection in upstream OHIF is not technically restricted to generated files, so never select patient scans. No automatic transfers from HealthOS to OHIF.

## 3. Native studio
Open HealthOS index.html → Imaging studio. Orthogonal slice selection, window width/level, synthetic label overlay and voxel-volume export work offline with no dependencies. Compare with MONAI's separate 2D synthetic experiment; the two phantoms are different and must not be conflated.
