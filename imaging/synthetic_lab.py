"""MABRIG HealthOS: CPU-only synthetic imaging experiment, not clinical software."""
import argparse
import json
import math
from pathlib import Path

import monai
import numpy as np
import torch
from monai.metrics import DiceMetric
from monai.networks.nets import UNet
from monai.transforms import Compose, EnsureType, ScaleIntensity

UPSTREAM_COMMIT = "a85d75e11cdd9c6d6d13500dc7f3960dd07dd7d3"
EXPECTED_VERSION = "1.6.2"

def run():
    if monai.__version__ != EXPECTED_VERSION:
        raise RuntimeError("Expected MONAI " + EXPECTED_VERSION)
    torch.set_num_threads(1)
    torch.manual_seed(42)
    rng = np.random.default_rng(42)
    y, x = np.mgrid[:64, :64]
    truth = ((x - 32)**2 + (y - 32)**2 <= 16**2).astype(np.float32)
    image = (0.15 + 0.65 * truth + rng.normal(0, 0.06, truth.shape)).astype(np.float32)
    # A simple threshold baseline, not a trained neural-network prediction.
    transform = Compose([EnsureType(dtype=torch.float32), ScaleIntensity(minv=0.0, maxv=1.0)])
    normalized = transform(image[None, ...]).as_tensor()
    prediction = (normalized > 0.55).float()
    target = torch.from_numpy(truth[None, None, ...])
    metric = DiceMetric(include_background=True, reduction="mean", ignore_empty=False)
    metric(y_pred=prediction.unsqueeze(0), y=target)
    dice = float(metric.aggregate().item())
    metric.reset()
    intersection = int((prediction[0].bool() & target[0, 0].bool()).sum().item())
    pred_count = int(prediction.sum().item())
    truth_count = int(truth.sum())
    expected = 2 * intersection / (pred_count + truth_count)
    if not math.isfinite(dice) or abs(dice - expected) > 1e-6:
        raise RuntimeError("Dice cross-check failed")
    # Untrained architecture smoke check; output is never used for segmentation.
    model = UNet(spatial_dims=2, in_channels=1, out_channels=2,
                 channels=(8, 16, 32), strides=(2, 2), num_res_units=1).cpu().eval()
    with torch.inference_mode():
        output = model(normalized.unsqueeze(0))
    if list(output.shape) != [1, 2, 64, 64] or not torch.isfinite(output).all():
        raise RuntimeError("U-Net architecture smoke check failed")
    return {
        "schema": "healthos-monai-synthetic-v1", "synthetic_only": True,
        "clinical_validation": False, "monai_version": EXPECTED_VERSION,
        "upstream_commit": UPSTREAM_COMMIT, "seed": 42, "size": 64,
        "method": "threshold_baseline", "dice": dice, "intersection": intersection,
        "predicted_pixels": pred_count, "reference_pixels": truth_count,
        "untrained_unet_shape": list(output.shape), "untrained_unet_finite": True,
        "reference_mask": truth.astype(np.uint8).flatten().tolist(),
        "predicted_mask": prediction[0].to(torch.uint8).flatten().tolist()
    }

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("monai-synthetic-report.json"))
    args = parser.parse_args()
    report = run()
    args.output.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("Synthetic threshold Dice:", report["dice"])
    print("Untrained U-Net shape:", report["untrained_unet_shape"])
    print("Research-only report:", args.output)

if __name__ == "__main__":
    main()
