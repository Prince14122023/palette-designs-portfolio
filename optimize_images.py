
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).parent
MANIFEST = ROOT / "image-manifest.json"
OUTPUT_DIR = ROOT / "web-images"
OUTPUT_MANIFEST = ROOT / "optimized-manifest.json"

MAX_WIDTH = 1800
MAX_HEIGHT = 1400
WEBP_QUALITY = 82

with open(MANIFEST, "r", encoding="utf-8") as file:
    images = json.load(file)

optimized = []
failed = 0

OUTPUT_DIR.mkdir(exist_ok=True)

print("PALETTE DESIGNS IMAGE OPTIMIZER")
print("-" * 40)

for index, item in enumerate(images, start=1):
    source = ROOT / item["image"]

    destination = OUTPUT_DIR / f"image_{index:04d}.webp"
    destination.parent.mkdir(parents=True, exist_ok=True)

    try:
        with Image.open(source) as img:
            img = ImageOps.exif_transpose(img)
            img.thumbnail((MAX_WIDTH, MAX_HEIGHT), Image.Resampling.LANCZOS)

            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")

            img.save(
                destination,
                "WEBP",
                quality=WEBP_QUALITY,
                method=6
            )

        new_item = item.copy()
        new_item["image"] = destination.relative_to(ROOT).as_posix()
        optimized.append(new_item)

    except Exception as error:
        failed += 1
        print(f"Failed: {source.name} | {error}")

    if index % 50 == 0:
        print(f"Processed {index}/{len(images)} images")

with open(OUTPUT_MANIFEST, "w", encoding="utf-8") as file:
    json.dump(optimized, file, indent=2, ensure_ascii=False)

print("-" * 40)
print("OPTIMIZATION COMPLETED")
print(f"Original images : {len(images)}")
print(f"Optimized      : {len(optimized)}")
print(f"Failed         : {failed}")
print(f"Output folder  : {OUTPUT_DIR.name}")
print(f"Manifest       : {OUTPUT_MANIFEST.name}")
print("-" * 40)
