# Run Dev Run 🏃‍♂️💻

An exciting Phaser JS runner game where you play as a developer trying to escape from bugs during compilation!

## Game Concept

You are a developer running to escape from bugs that appear during compilation. Your goal is to:
- **Avoid bugs** (red enemies) that spawn on the screen
- **Collect items** to gain points:
  - Keyboard (+10 points)
  - Mouse (+15 points)
  - Screen (+20 points)
  - Laptop (+30 points)
- **Shoot lines of code** (with SPACE) to fix bugs (+5 points per bug fixed)
- Survive as long as possible and get the highest score!

## Controls

- **UP Arrow**: Jump (press again in air for double jump)
- **DOWN Arrow**: Glide down faster (useful for quick descents)
- **SPACE**: Shoot lines of code to fix bugs

## Features

✅ Auto-running character (horizontal scrolling)
✅ Jump and glide mechanics
✅ Collectible items (keyboard, mouse, screen, laptop)
✅ Bug enemies that spawn dynamically
✅ Shooting mechanic to destroy bugs
✅ Score system with increasing difficulty
✅ Physics-based gameplay
✨ **NEW: AI-powered asset generation** - Generate custom sprites and sounds using AI tools!

## How to Run

### Option 1: Direct Browser (Simplest)
Simply open `index.html` in a modern web browser. The game loads Phaser from CDN.

### Option 2: Local Server (Recommended)
```bash
npm install
npm start
```

Then open http://localhost:8080 in your browser.

## AI Asset Generation 🎨🤖

**NEW!** You can now generate custom game assets using AI tools to enhance graphics and sounds!

### Quick Start
```bash
# See all available options and prompts
npm run generate-assets

# Generate specific assets
npm run generate-assets:player
npm run generate-assets:collectibles
npm run generate-assets:sounds
```

The game automatically detects and uses AI-generated assets if they exist in the `assets/` directory, otherwise falls back to procedural generation.

**📖 Full Guide**: See [AI_ASSETS.md](./AI_ASSETS.md) for detailed instructions on:
- Using AI APIs (Stability AI, DALL-E, ElevenLabs)
- Manual asset generation with free tools
- Optimized prompts for each asset
- Integration workflow

## Technologies

- **Phaser 3.70.0**: Game framework
- HTML5 Canvas
- Arcade Physics

## Game Mechanics

The game features:
- Automatic horizontal scrolling (runner style)
- Dynamic enemy spawning
- Multiple collectible types with different point values
- Code shooting system to eliminate bugs
- Progressive difficulty (speed increases with score)
- Jump and fast-fall mechanics for precise movement

Enjoy escaping those compilation bugs! 🐛🔫