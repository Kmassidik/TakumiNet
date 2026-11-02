import unittest
from PIL import Image
import slice_sheets as s


class SliceTests(unittest.TestCase):
    def sheet(self, filled):
        im = Image.new("RGBA", (300, 200))
        for c, r in filled:
            im.paste((255, 0, 0, 255), (c * 100 + 20, r * 100 + 30, c * 100 + 60, r * 100 + 50))
        return im

    def test_names_map_in_reading_order(self):
        icons = s.slice_sheet(self.sheet([(0, 0), (2, 1)]), ["a", "b", "c", "d", "e", "f"])
        self.assertEqual(sorted(icons), ["a", "f"])

    def test_empty_cells_and_skips_are_dropped(self):
        icons = s.slice_sheet(self.sheet([(0, 0), (1, 0)]), ["a", "-", "c", "d", "e", "f"])
        self.assertEqual(list(icons), ["a"])

    def test_icon_is_centred_square(self):
        icon = s.slice_sheet(self.sheet([(0, 0)]), ["a"] + ["-"] * 5)["a"]
        self.assertEqual(icon.size, (s.SIZE, s.SIZE))
        box = icon.getchannel("A").getbbox()
        self.assertAlmostEqual((box[0] + box[2]) / 2, s.SIZE / 2, delta=1)


if __name__ == "__main__":
    unittest.main()
