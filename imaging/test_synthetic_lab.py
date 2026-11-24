import unittest
from imaging.synthetic_lab import run
class SyntheticLabTest(unittest.TestCase):
    def test_pipeline(self):
        r = run()
        self.assertTrue(r["synthetic_only"])
        self.assertFalse(r["clinical_validation"])
        self.assertEqual(r["untrained_unet_shape"], [1,2,64,64])
        self.assertEqual(len(r["reference_mask"]), 4096)
        self.assertEqual(len(r["predicted_mask"]), 4096)
        self.assertEqual(sum(r["reference_mask"]), r["reference_pixels"])
        self.assertEqual(sum(r["predicted_mask"]), r["predicted_pixels"])
        self.assertAlmostEqual(r["dice"], 2*r["intersection"]/(r["predicted_pixels"]+r["reference_pixels"]), places=6)
        self.assertGreater(r["dice"], 0.9) # Synthetic high-contrast fixture only.
if __name__ == "__main__":
    unittest.main()
