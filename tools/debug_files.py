import os
tabs_dir = '/Users/vladkozjaevgmail.com/Desktop/AI/Project/site/src/sections/guide/tabs/'
print(f"Scanning {tabs_dir}")
files = [f for f in os.listdir(tabs_dir) if f.endswith('.html')]
print(f"Found {len(files)} files: {files}")
