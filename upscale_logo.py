from PIL import Image
import sys

img_path = r"d:\BidSentinel\frontend\public\bidsentinel-logo.png"

try:
    with Image.open(img_path) as img:
        width, height = img.size
        print(f"Original size: {width}x{height}")
        
        scale = 4
        new_width = width * scale
        new_height = height * scale
        
        upscaled_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        upscaled_img.save(img_path)
        print(f"Upscaled size: {new_width}x{new_height}. Saved successfully.")
except Exception as e:
    print(f"Error: {e}")
