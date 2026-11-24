import unittest
from imaging.train_synthetic import run
class TrainingTest(unittest.TestCase):
    def test_actual_training_and_holdout(self):
        r=run()
        self.assertEqual(len(r["losses"]),12)
        self.assertNotEqual(r["train_seed"],r["holdout_seed"])
        self.assertEqual(r["holdout_count"],16)
        self.assertLess(r["losses"][-1],r["losses"][0])
        for key in ("model","threshold"):
            self.assertEqual(len(r[key]["cases"]),16)
            self.assertTrue(0<=r[key]["mean_dice"]<=1)
        self.assertFalse(r["clinical_validation"])
if __name__=="__main__": unittest.main()
