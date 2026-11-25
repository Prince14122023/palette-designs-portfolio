
import json
from pathlib import Path

ROOT = Path(__file__).parent
RENDERS_DIR = ROOT / "renders"
OUTPUT_FILE = ROOT / "image-manifest.json"

# Folder-to-portfolio-category mapping
CATEGORY_MAP = {
    "Balcony": "residential",
    "Bedroom": "residential",
    "Crockery": "residential",
    "Dresser Area": "residential",
    "Exterior": "exterior",
    "Hospital": "healthcare",
    "Kitchen": "residential",
    "Lift Lobby Area": "common-areas",
    "Living Area": "residential",
    "Mandir": "residential",
    "Office Area": "commercial",
    "Restaurants": "hospitality",
    "Shops": "commercial",
    "Stilt": "common-areas",
    "Study Room": "residential",
    "Terrace": "residential",
    "Washroom": "residential",
}

SUPPORTED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".avif"
}

images = []

for folder in RENDERS_DIR.iterdir():
    if not folder.is_dir():
        continue

    category = CATEGORY_MAP.get(folder.name)

    if not category:
        print(f"Skipped unknown folder: {folder.name}")
        continue

    for file in folder.rglob("*"):
        if file.is_file() and file.suffix.lower() in SUPPORTED_EXTENSIONS:
            images.append({
                "name": file.stem,
                "folder": folder.name,
                "category": category,
                "image": file.relative_to(ROOT).as_posix()
            })

images.sort(key=lambda item: (item["category"], item["folder"], item["name"]))

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(images, f, indent=2, ensure_ascii=False)

print("=" * 45)
print("PALETTE DESIGNS - IMAGE INVENTORY")
print("=" * 45)
print(f"Folders scanned : {len(CATEGORY_MAP)}")
print(f"Images found   : {len(images)}")
print(f"Manifest saved : {OUTPUT_FILE.name}")
print("=" * 45)
