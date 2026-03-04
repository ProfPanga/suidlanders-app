# App Assets (Logo & Splash)

Place your source images here and run the generation scripts.

Recommended sources:

- Icon: `icon.png` — square 1024×1024 PNG with transparent background.
- Splash (optional): `splash.png` — 2732×2732 PNG, keep key artwork within the center 1200×1200 safe zone.

Commands (from project root):

```
npm install
npm run assets:generate        # Android + Web icons
# or
npm run assets:generate:all    # Android + iOS + Web (if iOS added later)
```

After generation, rebuild Android:

```
npm run buildAndroid
```
