# Run Dev Run 🏃‍♂️💻

An exciting Phaser JS runner game where you play as a developer trying to escape from bugs during compilation!

## Game Concept

You are a developer running to escape from bugs that appear during compilation. Your goal is to:
- **Avoid bugs** (red enemies) that spawn on the screen
- **Collect items** to gain points and XP:
  - Keyboard (+10 points, +5 XP)
  - Mouse (+15 points, +8 XP)
  - Screen (+20 points, +12 XP)
  - Laptop (+30 points, +20 XP)
- **Shoot lines of code** (with SPACE) to fix bugs (+5 points, +3 XP per bug fixed)
- **Level up** by gaining experience points
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
✅ **Progression and level system with XP rewards**
✅ Physics-based gameplay

## How to Run

### Option 1: Direct Browser (Simplest)
Simply open `index.html` in a modern web browser. The game loads Phaser from CDN.

### Option 2: Local Server (Recommended)
```bash
npm install
npm start
```

Then open http://localhost:8080 in your browser.

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
- **Level and XP progression system:**
  - Gain XP by collecting items and destroying bugs
  - Level up when reaching XP thresholds
  - XP requirements increase exponentially with each level
  - Visual level-up notifications
  - Game speed increases with each level gained

Enjoy escaping those compilation bugs! 🐛🔫