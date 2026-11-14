"""Turn emulator captures into the phone screens used by the landing page.

    python tools/landing-shots.py CAPTURE.png NAME [CAPTURE2.png NAME2 ...]

Each capture should be a 1080x2400 emulator screenshot (adb exec-out screencap -p),
ideally taken in SystemUI demo mode (see Marketing/Stores/_source/capture.sh demo-on).
Writes two files per screen into public/landing/screens/:

  NAME.android.webp  for the Pixel frame.
  NAME.ios.webp      for the iPhone frame.

Both blank the emulator's own status bar (its clock sits in the corner, where a real
frame's rounded screen hides it) and pad the top so the content clears the camera
hole / Dynamic Island. The page draws a matching status bar over each one.

A capture without a status bar (any height other than 2400) gets padded instead.
Then point the matching entry in src/app/features/landing/landing.component.cms.ts at NAME.
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / 'public' / 'landing' / 'screens'
WIDTH = 720          # served width; phones render at most ~300 CSS px wide
BAR = 58             # Android status bar content height at 1080 wide
ANDROID_TOP = 128    # blank band on the Pixel variant (clears the camera hole)
IOS_TOP = 142        # blank band on the iOS variant (clears the Dynamic Island)


def save(im, path):
    im = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
    im.save(path, 'WEBP', quality=84, method=6)
    print(f'{path.name}: {im.width}x{im.height}, {path.stat().st_size // 1024} KB')


def run(src, name):
    im = Image.open(src).convert('RGB')
    if im.width != 1080:
        im = im.resize((1080, round(im.height * 1080 / im.width)), Image.LANCZOS)
    bg = im.getpixel((600, 6))
    has_bar = im.height == 2400

    clean = im.copy()
    if has_bar:
        ImageDraw.Draw(clean).rectangle((0, 0, 1080, BAR), fill=bg)
    bar = BAR if has_bar else 0

    OUT.mkdir(parents=True, exist_ok=True)
    save(pad(clean, ANDROID_TOP - bar, bg), OUT / f'{name}.android.webp')
    save(pad(clean, IOS_TOP - bar, bg), OUT / f'{name}.ios.webp')


def pad(im, top, bg):
    out = Image.new('RGB', (im.width, im.height + top), bg)
    out.paste(im, (0, top))
    return out


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or len(args) % 2:
        sys.exit(__doc__)
    for i in range(0, len(args), 2):
        run(args[i], args[i + 1])
