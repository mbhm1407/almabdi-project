#!/usr/bin/env python3
"""Generate the Teams app icons (no external image libraries required).

- color.png  : 192x192 full-color app icon (brand background with a glyph).
- outline.png: 32x32 transparent icon with a white monochrome glyph.

Run: python3 scripts/make-icons.py
"""
import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "teams-app" / "appPackage"

# Ministry of Justice green (matches the app's Fluent brand ramp, shade 80).
BRAND = (33, 124, 70, 255)  # #217C46
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)


def write_png(path: Path, width: int, height: int, pixels: list[list[tuple[int, int, int, int]]]) -> None:
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type 0 (None)
        for x in range(width):
            raw.extend(pixels[y][x])
    compressor = zlib.compressobj(9)
    data = compressor.compress(bytes(raw)) + compressor.flush()

    def chunk(tag: bytes, payload: bytes) -> bytes:
        return (
            struct.pack(">I", len(payload))
            + tag
            + payload
            + struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", data) + chunk(b"IEND", b"")
    path.write_bytes(png)


def rounded(x: int, y: int, w: int, h: int, r: int) -> bool:
    """True if (x,y) is inside a rounded rectangle covering the whole canvas."""
    for cx, cy in ((r, r), (w - r - 1, r), (r, h - r - 1), (w - r - 1, h - r - 1)):
        if (x < r or x > w - r - 1) and (y < r or y > h - r - 1):
            if (x - cx) ** 2 + (y - cy) ** 2 > r * r:
                return False
    return True


def make_color() -> None:
    w = h = 192
    pad = 40
    line_positions = [70, 92, 114, 136]
    grid = [[BRAND if rounded(x, y, w, h, 28) else CLEAR for x in range(w)] for y in range(h)]
    # Draw a white "document" with transcript lines.
    for y in range(pad, h - pad):
        for x in range(pad, w - pad):
            grid[y][x] = WHITE
    for ly in line_positions:
        for y in range(ly, ly + 8):
            for x in range(pad + 16, w - pad - 16):
                grid[y][x] = BRAND
    write_png(OUT / "color.png", w, h, grid)


def make_outline() -> None:
    w = h = 32
    grid = [[CLEAR for _ in range(w)] for _ in range(h)]
    # White document outline.
    for y in range(4, 28):
        for x in range(7, 25):
            border = x in (7, 24) or y in (4, 27)
            if border:
                grid[y][x] = WHITE
    for ly in (11, 16, 21):
        for x in range(11, 21):
            grid[ly][x] = WHITE
    write_png(OUT / "outline.png", w, h, grid)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    make_color()
    make_outline()
    print(f"Wrote color.png and outline.png to {OUT}")
