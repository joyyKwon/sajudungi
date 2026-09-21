"""
Builds the app icon, splash and in-app mascot images from the artwork in
assets-incoming/ (not committed). Requires Pillow and numpy.

    python3 scripts/build-brand-assets.py

Inputs : assets-incoming/main-character.png  (transparent PNG of the character)
         assets-incoming/splash.png          (start-screen artwork, optional)
Outputs: assets/icon.png, assets/splash-icon.png, assets/favicon.png,
         assets/android-icon-{foreground,background,monochrome}.png,
         assets/mascot/mascot_front.png, assets/mascot/welcome_art.jpg, assets/brand/character.png
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-incoming" / "main-character.png"
ASSETS = ROOT / "assets"

CREAM = (251, 243, 231)  # theme colors.bg
SIZE = 1024


def load_clean_character() -> Image.Image:
    """Opaque body, no stray specks, cropped to the visible artwork."""
    a = np.array(Image.open(SRC).convert("RGBA"))
    alpha = a[..., 3]
    alpha[alpha < 10] = 0
    alpha[alpha >= 200] = 255
    ys, xs = np.nonzero(alpha >= 100)
    pad = 6
    box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad + 1, a.shape[1]), min(ys.max() + pad + 1, a.shape[0]))
    img = Image.fromarray(a).crop(box)
    # Anything outside the padded box (faint halos) is already gone; drop leftover faint pixels inside it too.
    arr = np.array(img)
    arr[arr[..., 3] < 10] = 0
    return Image.fromarray(arr)


def fit_height(char: Image.Image, height: int) -> Image.Image:
    w = round(char.width * height / char.height)
    return char.resize((w, height), Image.LANCZOS)


def on_canvas(char: Image.Image, size: int, height: int, background=None, dy: int = 0) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), background if background else (0, 0, 0, 0))
    c = fit_height(char, height)
    canvas.alpha_composite(c, ((size - c.width) // 2, (size - c.height) // 2 + dy))
    return canvas


def silhouette(fg: Image.Image) -> Image.Image:
    """Single-color layer for Android themed icons; eyes stay as holes so the face reads."""
    arr = np.array(fg).astype(int)
    alpha = arr[..., 3].copy()
    lum = 0.299 * arr[..., 0] + 0.587 * arr[..., 1] + 0.114 * arr[..., 2]
    eyes = (lum < 38) & (alpha > 200)
    alpha[eyes] = 0
    out = np.zeros_like(arr, dtype="uint8")
    out[..., 3] = alpha.astype("uint8")
    return Image.fromarray(out)


# Background color of assets-incoming/splash.png; the start screen uses the same color so the picture has no edge.
WELCOME_BG = (253, 246, 228)  # #FDF6E4


def build_welcome_art() -> Image.Image:
    """Top of the start screen: the wordmark, tagline and character cropped out of assets-incoming/splash.png."""
    art = Image.open(ROOT / "assets-incoming" / "splash.png").convert("RGB")
    return art.crop((0, 455, art.width, 1136))


def main() -> None:
    char = load_clean_character()
    char.save(ASSETS / "brand" / "character.png", optimize=True)

    # iOS icon: full-bleed square, no transparency, no rounded corners (the OS masks it).
    icon = on_canvas(char, SIZE, 760, background=CREAM + (255,), dy=6).convert("RGB")
    icon.save(ASSETS / "icon.png", optimize=True)

    # Android adaptive icon: keep the character inside the ~66% safe zone.
    fg = on_canvas(char, SIZE, 620)
    fg.save(ASSETS / "android-icon-foreground.png", optimize=True)
    Image.new("RGB", (SIZE, SIZE), CREAM).save(ASSETS / "android-icon-background.png", optimize=True)
    silhouette(fg).save(ASSETS / "android-icon-monochrome.png", optimize=True)

    # Splash: character only, centered (Android 12+ shows just a centered icon on the background color).
    on_canvas(char, SIZE, 640).save(ASSETS / "splash-icon.png", optimize=True)

    on_canvas(char, 96, 92).resize((48, 48), Image.LANCZOS).save(ASSETS / "favicon.png", optimize=True)

    # In-app mascot (front pose): square, large enough for 3x on the biggest usage.
    on_canvas(char, 512, 500).save(ASSETS / "mascot" / "mascot_front.png", optimize=True)
    if (ROOT / "assets-incoming" / "splash.png").exists():
        build_welcome_art().save(ASSETS / "mascot" / "welcome_art.jpg", quality=92, optimize=True)
    print("done")


if __name__ == "__main__":
    main()
