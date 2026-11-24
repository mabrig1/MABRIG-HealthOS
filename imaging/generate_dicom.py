"""Create only a generated DICOM Secondary Capture series; no input images."""
import argparse
from pathlib import Path
import numpy as np
from pydicom.dataset import FileDataset, FileMetaDataset
from pydicom.uid import ExplicitVRLittleEndian, SecondaryCaptureImageStorage, generate_uid

def generate(folder: Path):
    folder.mkdir(parents=True, exist_ok=False)
    study, series, frame = generate_uid(), generate_uid(), generate_uid()
    y,x=np.mgrid[:48,:48]
    for z in range(48):
        outer=((x-24)/17)**2+((y-24)/14)**2+((z-24)/19)**2<=1
        inner=((x-18)/6)**2+((y-24)/5)**2+((z-24)/8)**2<=1
        second=((x-30)/5)**2+((y-28)/4)**2+((z-28)/7)**2<=1
        image=np.where(inner,220,np.where(second,155,np.where(outer,90,12))).astype(np.uint8)
        sop=generate_uid()
        fm=FileMetaDataset()
        fm.MediaStorageSOPClassUID=SecondaryCaptureImageStorage
        fm.MediaStorageSOPInstanceUID=sop
        fm.TransferSyntaxUID=ExplicitVRLittleEndian
        path=folder/f"phantom-{z+1:03d}.dcm"
        ds=FileDataset(str(path),{},file_meta=fm,preamble=b"\0"*128)
        ds.SOPClassUID=SecondaryCaptureImageStorage
        ds.SOPInstanceUID=sop
        ds.StudyInstanceUID=study
        ds.SeriesInstanceUID=series
        ds.FrameOfReferenceUID=frame
        ds.PatientName="SYNTHETIC^PHANTOM"
        ds.PatientID="HEALTHOS-SYNTHETIC"
        ds.PatientBirthDate=""
        ds.PatientSex=""
        ds.StudyDate="20261124"
        ds.StudyTime="000000"
        ds.AccessionNumber=""
        ds.ReferringPhysicianName=""
        ds.StudyID="1"
        ds.SeriesNumber=1
        ds.InstanceNumber=z+1
        ds.Modality="OT"
        ds.ConversionType="WSD"
        ds.ImageType=["DERIVED","SECONDARY"]
        ds.StudyDescription="SYNTHETIC EDUCATIONAL PHANTOM"
        ds.SeriesDescription="GENERATED GEOMETRIC SLICES"
        ds.Manufacturer="MABRIG Technologies"
        ds.BurnedInAnnotation="NO"
        ds.PatientIdentityRemoved="YES"
        ds.Rows=48
        ds.Columns=48
        ds.SamplesPerPixel=1
        ds.PhotometricInterpretation="MONOCHROME2"
        ds.BitsAllocated=8
        ds.BitsStored=8
        ds.HighBit=7
        ds.PixelRepresentation=0
        ds.PixelSpacing=[1,1]
        ds.SliceThickness=1
        ds.ImagePositionPatient=[0,0,z]
        ds.ImageOrientationPatient=[1,0,0,0,1,0]
        ds.WindowCenter=128
        ds.WindowWidth=256
        ds.PixelData=image.tobytes()
        ds.save_as(path,enforce_file_format=True)
    return folder

if __name__=="__main__":
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output",type=Path,default=Path("synthetic-dicom"))
    args=parser.parse_args()
    print("Generated 48 synthetic DICOM files in",generate(args.output))
