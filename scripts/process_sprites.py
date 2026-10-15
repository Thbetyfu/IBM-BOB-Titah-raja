import sys
import os
from PIL import Image
import numpy as np
from collections import deque

def remove_white_background(input_path, output_path, target_size=(512, 512)):
    """
    Removes solid/near-white background using corner flood-fill with soft alpha feathering.
    Preserves white highlights inside the subject.
    """
    img = Image.open(input_path).convert("RGBA")
    w, h = img.size
    pixels = np.array(img, dtype=np.uint8)

    # 1. Corner flood-fill mask
    # Background starts at (0,0), (w-1,0), (0,h-1), (w-1,h-1)
    visited = np.zeros((h, w), dtype=bool)
    queue = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])

    for x, y in list(queue):
        visited[y, x] = True

    # Threshold: anything with R,G,B all > 232 or brightness > 235 is considered background candidate
    r = pixels[:, :, 0].astype(np.int32)
    g = pixels[:, :, 1].astype(np.int32)
    b = pixels[:, :, 2].astype(np.int32)
    brightness = (r + g + b) // 3

    # Is near white
    is_near_white = (brightness > 230) & (np.maximum(np.maximum(r, g), b) - np.minimum(np.minimum(r, g), b) < 25)

    while queue:
        cx, cy = queue.popleft()
        for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny, nx]:
                if is_near_white[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((nx, ny))

    # 2. Compute alpha channel
    # visited pixels become transparent, with smooth feathering for soft shadows
    alpha = np.ones((h, w), dtype=np.uint8) * 255
    alpha[visited] = 0

    # Soft shadow transition along the boundary of visited
    # For visited pixels that have non-pure-white values (subtle shadow), retain shadow alpha
    shadow_mask = visited & (brightness < 248)
    shadow_intensity = 255 - brightness[shadow_mask]
    alpha[shadow_mask] = np.clip(shadow_intensity * 2, 0, 180).astype(np.uint8)

    # In shadow areas, set RGB to neutral dark tone to eliminate white fringing
    pixels[shadow_mask, 0] = 15
    pixels[shadow_mask, 1] = 15
    pixels[shadow_mask, 2] = 15

    pixels[:, :, 3] = alpha
    result = Image.fromarray(pixels, "RGBA")

    # 3. Crop to content bounding box
    bbox = result.getbbox()
    if bbox:
        cropped = result.crop(bbox)
        # Pad slightly and resize
        pad = 20
        cw, ch = cropped.size
        side = max(cw, ch) + pad * 2
        square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
        square.paste(cropped, (pad + (side - pad*2 - cw) // 2, pad + (side - pad*2 - ch) // 2))
        final_img = square.resize(target_size, Image.Resampling.LANCZOS)
    else:
        final_img = result.resize(target_size, Image.Resampling.LANCZOS)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final_img.save(output_path, "PNG")
    print(f"Processed: {input_path} -> {output_path} ({final_img.size})")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        remove_white_background(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python process_sprites.py <input> <output>")
