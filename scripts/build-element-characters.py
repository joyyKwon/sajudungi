"""
Builds the five 오행 mascots (assets/mascot/mascot_<element>.png) and the studying and analyzing
poses (assets/mascot/mascot_{studying,analyzing}.png) from the artwork in assets-incoming/.
금둥이 and 화둥이 come with a checkerboard baked into the picture, and 공부하는둥이 and
분석하는둥이 with an opaque black background, instead of real transparency, so those backgrounds
are cut out here. Requires Pillow, numpy and scipy.

    python3 scripts/build-element-characters.py
"""
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-incoming"
OUT = ROOT / "assets" / "mascot"

# element -> (source file, has the checkerboard baked in)
FILES = {
    "wood": ("목둥이.PNG", False),
    "fire": ("화둥이.PNG", True),
    "earth": ("토둥이.PNG", False),
    "metal": ("금둥이.PNG", True),
    "water": ("수둥이.PNG", False),
}
SIZE = 512
BG_LUM = 244.0  # average of the two checkerboard tones (252 / 236)


def lum(rgb: np.ndarray) -> np.ndarray:
    return 0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]


def cut_background(img: Image.Image, is_bg, bg_lum: float, small_holes: int = 0) -> Image.Image:
    """Makes the flat background around a character transparent.

    `is_bg(rgb)` marks background-looking pixels; only those connected to the image border count (the
    character's outline blocks the flood). `small_holes` also clears enclosed background pockets up to that
    many pixels (e.g. the gap between a body and a caption drawn over it). Edge pixels are a blend of outline and background, so their
    alpha and outline color are recovered from the nearest solid pixel.
    """
    rgb = np.array(img.convert("RGB")).astype(float)
    candidate = is_bg(rgb)
    labels, _ = ndimage.label(candidate)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    bg = np.isin(labels, border[border > 0])
    if small_holes:
        sizes = ndimage.sum(candidate, labels, range(1, labels.max() + 1))
        bg |= np.isin(labels, [i + 1 for i, n in enumerate(sizes) if n <= small_holes])

    dist = ndimage.distance_transform_edt(~bg)
    band = (~bg) & (dist <= 3)
    deep = (~bg) & (dist > 3)
    _, (iy, ix) = ndimage.distance_transform_edt(~deep, return_indices=True)
    fg = rgb[iy, ix]
    denom = lum(fg) - bg_lum
    denom = np.where(np.abs(denom) < 30, np.where(denom < 0, -30, 30), denom)
    alpha = np.ones(bg.shape)
    a_band = np.clip((lum(rgb) - bg_lum) / denom, 0, 1)
    alpha[band] = a_band[band]
    alpha[bg] = 0
    out = rgb.copy()
    out[band] = fg[band]
    return Image.fromarray(np.dstack([out, alpha * 255]).astype("uint8"), "RGBA")


def cut_checkerboard(img: Image.Image) -> Image.Image:
    def light_neutral(rgb: np.ndarray) -> np.ndarray:
        return (rgb.min(2) >= 225) & ((rgb.max(2) - rgb.min(2)) <= 14)

    return cut_background(img, light_neutral, BG_LUM)


def cut_black(img: Image.Image) -> Image.Image:
    return cut_background(img, lambda rgb: rgb.max(2) < 28, 0.0, small_holes=3000)


def clean_existing_alpha(img: Image.Image) -> Image.Image:
    """Drop faint halos and stray specks, keep the anti-aliased edge."""
    a = np.array(img.convert("RGBA"))
    solid = ndimage.binary_fill_holes(a[..., 3] >= 128)
    labels, n = ndimage.label(solid)
    if n > 1:
        sizes = ndimage.sum(solid, labels, range(1, n + 1))
        solid = labels == (1 + int(np.argmax(sizes)))
    allowed = ndimage.binary_dilation(solid, iterations=2)
    a[~allowed, 3] = 0
    a[a[..., 3] >= 200, 3] = 255
    return Image.fromarray(a)


def trim(img: Image.Image, longest: int) -> Image.Image:
    """Crops to the visible artwork and scales so the longest side is `longest` px."""
    box = img.getchannel("A").point(lambda v: 255 if v >= 100 else 0).getbbox()
    img = img.crop(box)
    scale = longest / max(img.size)
    return img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)


def finish(img: Image.Image) -> Image.Image:
    """Square canvas for the element mascots."""
    img = trim(img, SIZE - 12)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    canvas.alpha_composite(img, ((SIZE - img.width) // 2, (SIZE - img.height) // 2))
    return canvas


def main() -> None:
    for element, (name, baked) in FILES.items():
        src = Image.open(SRC / name)
        cut = cut_checkerboard(src) if baked else clean_existing_alpha(src)
        finish(cut).save(OUT / f"mascot_{element}.png", optimize=True)
        print("wrote", f"mascot_{element}.png")

    study = SRC / "공부하는둥이.png"
    if study.exists():
        out = trim(cut_black(Image.open(study)), 640)
        out.save(OUT / "mascot_studying.png", optimize=True)
        print("wrote mascot_studying.png", out.size)

    analyzing = SRC / "분석하는둥이.png"
    if analyzing.exists():
        # This picture has a "사주분석 중.." caption drawn over the bottom of the character, so it can't be removed cleanly.
        out = trim(cut_black(Image.open(analyzing)), 640)
        out.save(OUT / "mascot_analyzing.png", optimize=True)
        print("wrote mascot_analyzing.png", out.size)


if __name__ == "__main__":
    main()
