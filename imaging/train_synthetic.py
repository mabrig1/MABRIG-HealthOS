"""CPU-only synthetic segmentation training; never accepts external images."""
import json
import math
import argparse
from pathlib import Path
import numpy as np
import torch
import monai
from monai.networks.nets import UNet
from monai.losses import DiceLoss
from monai.metrics import DiceMetric

def dataset(seed, n):
    rng = np.random.default_rng(seed)
    y, x = np.mgrid[:32, :32]
    images, masks = [], []
    for _ in range(n):
        cx, cy = rng.integers(10, 22, size=2)
        radius = int(rng.integers(5, 9))
        mask = ((x-cx)**2+(y-cy)**2 <= radius**2).astype(np.float32)
        im = np.clip(.18+.65*mask+rng.normal(0,.11,mask.shape),0,1).astype(np.float32)
        images.append(im); masks.append(mask)
    return torch.from_numpy(np.stack(images)[:,None]), torch.from_numpy(np.stack(masks)[:,None])

def evaluate(pred, truth):
    metric = DiceMetric(include_background=True, reduction="none", ignore_empty=False)
    metric(y_pred=pred, y=truth)
    dice = metric.aggregate().flatten().tolist()
    metric.reset()
    rows=[]
    for i in range(len(truth)):
        a,b=pred[i].bool(),truth[i].bool()
        p,t,inter=int(a.sum()),int(b.sum()),int((a&b).sum())
        direct=2*inter/(p+t)
        if not math.isfinite(dice[i]) or abs(dice[i]-direct)>1e-6:
            raise RuntimeError("Dice discrepancy")
        rows.append({"case":i+1,"predicted":p,"reference":t,"intersection":inter,"dice":direct})
    return {"mean_dice":sum(r["dice"] for r in rows)/len(rows),"cases":rows}

def run():
    if monai.__version__ != "1.6.2":
        raise RuntimeError("Pinned MONAI release required")
    torch.set_num_threads(1)
    torch.manual_seed(42)
    torch.use_deterministic_algorithms(True)
    x,y=dataset(42,48)
    vx,vy=dataset(31415,16)
    model=UNet(spatial_dims=2,in_channels=1,out_channels=1,channels=(8,16),strides=(2,),num_res_units=1).cpu()
    opt=torch.optim.Adam(model.parameters(),lr=.005)
    loss_fn=DiceLoss(sigmoid=True)
    bce=torch.nn.BCEWithLogitsLoss()
    losses=[]
    model.train()
    for epoch in range(12):
        total=0.0
        for ids in torch.randperm(len(x)).split(8):
            opt.zero_grad()
            logits=model(x[ids])
            loss=loss_fn(logits,y[ids])+bce(logits,y[ids])
            if not torch.isfinite(loss): raise RuntimeError("Nonfinite training loss")
            loss.backward(); opt.step(); total+=float(loss.detach())*len(ids)
        losses.append(total/len(x))
    model.eval()
    with torch.inference_mode():
        pred=(torch.sigmoid(model(vx))>=.5).float()
        baseline=(vx>=.5).float()
    return {"schema":"healthos-monai-training-v1","synthetic_only":True,"clinical_validation":False,
            "monai_version":monai.__version__,"torch_version":str(torch.__version__),
            "train_seed":42,"holdout_seed":31415,"train_count":48,"holdout_count":16,"epochs":12,
            "losses":losses,"model":evaluate(pred,vy),"threshold":evaluate(baseline,vy)}

if __name__=="__main__":
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--output",type=Path,default=Path("monai-training-report.json"))
    args=p.parse_args()
    report=run()
    args.output.write_text(json.dumps(report,indent=2,allow_nan=False),encoding="utf-8")
    print("Held-out synthetic model Dice:",report["model"]["mean_dice"])
    print("Held-out synthetic threshold Dice:",report["threshold"]["mean_dice"])
