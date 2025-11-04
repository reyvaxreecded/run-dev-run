# Assets Directory

This directory contains AI-generated game assets.

## Structure

```
assets/
├── sprites/     # Image assets (PNG format)
│   ├── player.png
│   ├── bug.png
│   ├── keyboard.png
│   ├── mouse.png
│   ├── screen.png
│   └── laptop.png
└── sounds/      # Audio assets (MP3 format)
    ├── jump.mp3
    ├── collect.mp3
    ├── shoot.mp3
    └── hit.mp3
```

## Generating Assets

Use the AI asset generation system to create these assets:

```bash
# Generate all assets
npm run generate-assets

# Or generate specific types
npm run generate-assets:player
npm run generate-assets:collectibles
npm run generate-assets:sounds
```

See [AI_ASSETS.md](../AI_ASSETS.md) in the root directory for complete documentation.

## Manual Asset Creation

If you prefer to create assets manually:

1. Use the prompts provided by `npm run generate-assets`
2. Generate assets using your preferred AI tool (Midjourney, DALL-E, Stable Diffusion, etc.)
3. Save images as PNG with transparent backgrounds
4. Save sounds as MP3 format
5. Place files in the appropriate subdirectory with exact names listed above

The game will automatically detect and use these assets!
