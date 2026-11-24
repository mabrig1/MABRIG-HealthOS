import tempfile
import unittest
from pathlib import Path
import pydicom
from imaging.generate_dicom import generate

class DicomFixtureTest(unittest.TestCase):
    def test_generated_series(self):
        with tempfile.TemporaryDirectory() as d:
            files=sorted(generate(Path(d)/"series").glob("*.dcm"))
            self.assertEqual(len(files),48)
            rows=[pydicom.dcmread(p) for p in files]
            self.assertEqual(len({str(r.SOPInstanceUID) for r in rows}),48)
            self.assertEqual(len({str(r.SeriesInstanceUID) for r in rows}),1)
            self.assertTrue(all(r.PatientID=="HEALTHOS-SYNTHETIC" and r.pixel_array.shape==(48,48) for r in rows))
            self.assertEqual(int(rows[24].pixel_array[24,18]),220)
            self.assertEqual(int(rows[24].pixel_array[0,0]),12)
            self.assertEqual([int(r.InstanceNumber) for r in rows],list(range(1,49)))
            with self.assertRaises(FileExistsError):
                generate(Path(d)/"series")
