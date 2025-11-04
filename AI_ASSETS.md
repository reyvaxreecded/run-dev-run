# AI Asset Generation for Run Dev Run 🎨🤖

This document explains how to use AI tools to generate graphics and sound assets for the game, accelerating content evolution and improving visual/audio quality.

## Overview

Run Dev Run now includes an AI-powered asset generation system that allows you to quickly create:
- **Sprite graphics** (player, enemies, collectibles)
- **Sound effects** (jumps, collections, impacts)

The system provides:
1. **Automated generation** via AI APIs (Stability AI, DALL-E, ElevenLabs)
2. **Manual generation guides** with optimized prompts for various AI tools
3. **Easy integration** into the game

## Quick Start

### Option 1: Automated Generation with AI APIs

Set up your preferred AI API key:

```bash
# For image generation
export STABILITY_API_KEY="your-stability-ai-key"
# OR
export OPENAI_API_KEY="your-openai-key"

# For sound generation (optional)
export ELEVENLABS_API_KEY="your-elevenlabs-key"

# Generate all assets
npm run generate-assets
```

### Option 2: Manual Generation

If you prefer to use AI tools manually or don't have API access:

```bash
# Run the script to see prompts and instructions
npm run generate-assets

# This will display optimized prompts for each asset
# Use these prompts with your preferred AI tool
```

## Asset Generation Scripts

```bash
# Generate all assets (images + sounds)
npm run generate-assets:all

# Generate specific asset types
npm run generate-assets:player        # Player sprite only
npm run generate-assets:bug           # Bug enemy sprite only
npm run generate-assets:collectibles  # All collectible items
npm run generate-assets:sounds        # All sound effects
```

## Supported AI Services

### Image Generation

#### 1. Stability AI (Stable Diffusion)
- **Website**: https://stability.ai/
- **API Docs**: https://platform.stability.ai/docs
- **Setup**: Get an API key from your account dashboard
- **Cost**: Pay-per-generation pricing

```bash
export STABILITY_API_KEY="sk-..."
npm run generate-assets:player
```

#### 2. OpenAI DALL-E
- **Website**: https://platform.openai.com/
- **API Docs**: https://platform.openai.com/docs/guides/images
- **Setup**: Create an API key in your OpenAI account
- **Cost**: Pay-per-generation pricing

```bash
export OPENAI_API_KEY="sk-..."
npm run generate-assets:collectibles
```

#### 3. Manual Tools (Free/Freemium)
- **Midjourney**: https://www.midjourney.com/ (Discord-based)
- **Leonardo AI**: https://leonardo.ai/ (Free tier available)
- **Bing Image Creator**: https://www.bing.com/images/create (Free)
- **Canva AI**: https://www.canva.com/ai-image-generator/ (Free tier)

### Sound Generation

#### 1. ElevenLabs
- **Website**: https://elevenlabs.io/
- **Best for**: High-quality sound effects and voice
- **Setup**: Get API key from dashboard
- **Cost**: Free tier available, then pay-per-use

#### 2. Manual Tools (Free)
- **jfxr**: https://jfxr.frozenfractal.com/ (Perfect for 8-bit sounds!)
- **Sfxr**: http://www.drpetter.se/project_sfxr.html
- **ChipTone**: https://sfbgames.itch.io/chiptone
- **Bfxr**: https://www.bfxr.net/

## Asset Specifications

### Sprites

| Asset | Size | Colors | Description |
|-------|------|--------|-------------|
| Player | 40x50px | Green (#00ff00) | Running programmer character |
| Bug | 40x40px | Red (#ff0000) | Enemy bug with antennae |
| Keyboard | 30x30px | Blue (#3498db) | Collectible keyboard |
| Mouse | 30x30px | Purple (#9b59b6) | Collectible mouse |
| Screen | 30x30px | Red (#e74c3c) | Collectible monitor |
| Laptop | 30x30px | Orange (#f39c12) | Collectible laptop |

### Sounds

| Sound | Duration | Type | Description |
|-------|----------|------|-------------|
| Jump | 0.3s | SFX | 8-bit bounce sound |
| Collect | 0.5s | SFX | Positive pickup sound |
| Shoot | 0.2s | SFX | Laser/code blip |
| Hit | 0.4s | SFX | Damage/impact sound |

## AI Prompts for Manual Generation

Copy these prompts into your AI tool of choice:

### Player Sprite
```
pixel art sprite of a programmer developer character, green colored, side view, 
running pose, 8-bit retro game style, transparent background, 40x50 pixels
```

### Bug Enemy
```
pixel art sprite of a red computer bug enemy, round body with antennae, 
menacing look, 8-bit retro game style, transparent background, 40x40 pixels
```

### Keyboard Collectible
```
pixel art icon of a computer keyboard, blue colored, simple design, 
8-bit retro game style, transparent background, 30x30 pixels
```

### Mouse Collectible
```
pixel art icon of a computer mouse, purple colored, simple design, 
8-bit retro game style, transparent background, 30x30 pixels
```

### Screen Collectible
```
pixel art icon of a computer monitor screen, red colored, simple design, 
8-bit retro game style, transparent background, 30x30 pixels
```

### Laptop Collectible
```
pixel art icon of a laptop computer, orange/gold colored, simple design, 
8-bit retro game style, transparent background, 30x30 pixels
```

### Sound Effects Prompts
For sound generation tools, use these descriptions:
- **Jump**: "8-bit retro jump sound effect, short bounce sound, video game style"
- **Collect**: "8-bit retro collect item sound effect, positive pickup sound, video game style"
- **Shoot**: "8-bit retro shoot code sound effect, laser blip sound, video game style"
- **Hit**: "8-bit retro hit/damage sound effect, negative impact sound, video game style"

## Directory Structure

```
run-dev-run/
├── assets/
│   ├── sprites/
│   │   ├── player.png
│   │   ├── bug.png
│   │   ├── keyboard.png
│   │   ├── mouse.png
│   │   ├── screen.png
│   │   └── laptop.png
│   └── sounds/
│       ├── jump.mp3
│       ├── collect.mp3
│       ├── shoot.mp3
│       └── hit.mp3
├── generate-assets.js    # AI generation script
└── game.js               # Main game file (auto-detects assets)
```

## Using Generated Assets in the Game

The game will automatically detect and load assets from the `assets/` directory:

1. **If assets exist**: They will be loaded and used instead of procedural graphics
2. **If assets don't exist**: The game falls back to programmatically generated textures

This means the game works perfectly with or without AI-generated assets!

## Tips for Best Results

### For Image Generation
1. **Style consistency**: Use "8-bit retro game style" in all prompts
2. **Transparent backgrounds**: Always specify "transparent background"
3. **Size matters**: Mention pixel dimensions to help AI understand scale
4. **Iteration**: Generate multiple versions and pick the best
5. **Post-processing**: Use image editors to refine and ensure correct size

### For Sound Generation
1. **Use jfxr.frozenfractal.com**: It's free and perfect for retro game sounds
2. **Keep it short**: 8-bit sounds should be punchy (0.2-0.5s)
3. **Match the vibe**: Retro game sounds should be simple and chiptune-like
4. **Export as MP3**: Ensures compatibility across browsers

## Workflow Example

Here's a complete workflow for generating all assets:

### Using Free Tools

1. **Generate sprites using Bing Image Creator**:
   - Go to https://www.bing.com/images/create
   - Paste each sprite prompt (one at a time)
   - Download generated images
   - Resize to correct dimensions using an image editor
   - Save with transparent backgrounds to `assets/sprites/`

2. **Generate sounds using jfxr**:
   - Go to https://jfxr.frozenfractal.com/
   - Tweak presets for each sound type
   - Export as WAV, then convert to MP3
   - Save to `assets/sounds/`

3. **Test in the game**:
   ```bash
   npm start
   # Open http://localhost:8080
   ```

### Using Paid APIs

```bash
# Set up API keys
export STABILITY_API_KEY="your-key"

# Generate all image assets
npm run generate-assets:player
npm run generate-assets:bug
npm run generate-assets:collectibles

# Manually create sounds (or use jfxr)
# ...

# Test
npm start
```

## Troubleshooting

### Assets not showing in game
- Check file names match exactly: `player.png`, `bug.png`, etc.
- Ensure files are in correct directories: `assets/sprites/` and `assets/sounds/`
- Verify file formats: PNG for images, MP3 for sounds
- Check browser console for loading errors

### AI generation fails
- Verify API keys are set correctly
- Check API quota/credits
- Try different prompts if results aren't good
- Fall back to manual generation with the provided prompts

### Image quality issues
- Generate at higher resolution then downscale
- Use image editing tools to clean up artifacts
- Try different AI services for better results
- Ensure transparent backgrounds are preserved

## Cost Considerations

| Service | Free Tier | Cost After Free |
|---------|-----------|-----------------|
| Bing Image Creator | Unlimited with slow speed | Free |
| Leonardo AI | 150 credits/day | $10-30/month |
| Stability AI | No free tier | ~$0.002-0.02/image |
| OpenAI DALL-E | No free tier | ~$0.04/image |
| jfxr (sounds) | Completely free | Free forever |

**Recommendation**: Start with free tools (Bing + jfxr) for testing, then upgrade to paid APIs for batch generation if needed.

## Contributing

Feel free to:
- Share your generated assets in the community
- Improve the generation prompts
- Add support for new AI services
- Create asset packs for others to use

## License

All generated assets follow the project's MIT license. Ensure your AI service's terms allow commercial use if distributing the game.

---

Happy asset creating! 🎨🎮✨
