# Facial wellness & healthy aging (v0.12)
Adult education, not medical assessment. Start the camera explicitly with consent; camera stream stays on-device and audio is disabled. Two downsampled whole-frame quality checks over eight seconds, no face recognition, image upload, recording, persistent journal, age score, skin diagnosis, wrinkle quantification or inference. Pixels are discarded immediately; stop on completion, leaving the section, page hiding or consent withdrawal. Advice depends only on selected habits; no health inference from image. The camera is optional. Browser permission, HTTPS, actual mobile/desktop tests, and dermatology review remain necessary.
## Evidence sources
- AAD: https://www.aad.org/public/everyday-care/skin-care-secrets/anti-aging/reduce-premature-aging-skin
- WHO diet: https://www.who.int/news-room/fact-sheets/detail/healthy-diet
- WHO activity: https://www.who.int/initiatives/behealthy/physical-activity
- Facial exercise systematic review: https://pubmed.ncbi.nlm.nih.gov/41322034/ (small heterogeneous studies, limited evidence).
Local meal examples illustrate a balanced diet, not proven skin treatments. No facial exercise regimen presented as proven.
## Upstream research
Awesome Face Restoration is a bibliography with no license file located. Reference its original pinned source; do not copy its contents into HealthOS or assume permission to reuse listed datasets/weights. MediaPipe Apache-2.0 source is pinned for possible future local landmark work, not executed. CodeFormer/GFPGAN are photo enhancement only; generated pixels may hallucinate features, never use for skin assessment. No model download or biometric template storage. An existing private skin wellness project's capture/QC design was reviewed; private source is not copied into this public repository. Any code-level integration should be developed in a private checkout with explicit licensing and security review.
## Verification
Node tests cover image quality, plan selection and camera lifecycle source checks. Real camera permissions, front-facing camera selection, capture duration and track cleanup must be verified on Android/iOS/desktop before broad use. No backend or quota changes.
