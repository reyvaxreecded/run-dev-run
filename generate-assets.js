#!/usr/bin/env node

/**
 * AI Asset Generator for Run Dev Run
 * 
 * This script generates game assets using AI-powered techniques.
 * 
 * Usage:
 *   node generate-assets.js [asset-type]
 * 
 * Asset types:
 *   all - Generate all assets (default)
 *   player - Generate player sprite
 *   bug - Generate bug enemy sprite
 *   collectibles - Generate collectible item sprites
 *   sounds - Generate sound effects
 * 
 * AI Integration Options:
 * 
 * 1. Image Generation APIs:
 *    - Stability AI (Stable Diffusion)
 *    - OpenAI DALL-E
 *    - Midjourney API
 *    - Replicate
 * 
 * 2. Sound Generation APIs:
 *    - ElevenLabs
 *    - Mubert
 *    - Soundraw
 * 
 * For this implementation, we provide a framework that can be extended
 * with your preferred AI service. Set environment variables:
 * 
 * - STABILITY_API_KEY for Stability AI
 * - OPENAI_API_KEY for DALL-E
 * - ELEVENLABS_API_KEY for sound generation
 */

const fs = require('fs');
const path = require('path');

// Asset specifications for AI generation
const ASSET_SPECS = {
    player: {
        prompt: "pixel art sprite of a programmer developer character, green colored, side view, running pose, 8-bit retro game style, transparent background, 40x50 pixels",
        width: 40,
        height: 50,
        filename: "player.png"
    },
    bug: {
        prompt: "pixel art sprite of a red computer bug enemy, round body with antennae, menacing look, 8-bit retro game style, transparent background, 40x40 pixels",
        width: 40,
        height: 40,
        filename: "bug.png"
    },
    keyboard: {
        prompt: "pixel art icon of a computer keyboard, blue colored, simple design, 8-bit retro game style, transparent background, 30x30 pixels",
        width: 30,
        height: 30,
        filename: "keyboard.png"
    },
    mouse: {
        prompt: "pixel art icon of a computer mouse, purple colored, simple design, 8-bit retro game style, transparent background, 30x30 pixels",
        width: 30,
        height: 30,
        filename: "mouse.png"
    },
    screen: {
        prompt: "pixel art icon of a computer monitor screen, red colored, simple design, 8-bit retro game style, transparent background, 30x30 pixels",
        width: 30,
        height: 30,
        filename: "screen.png"
    },
    laptop: {
        prompt: "pixel art icon of a laptop computer, orange/gold colored, simple design, 8-bit retro game style, transparent background, 30x30 pixels",
        width: 30,
        height: 30,
        filename: "laptop.png"
    }
};

const SOUND_SPECS = {
    jump: {
        prompt: "8-bit retro jump sound effect, short bounce sound, video game style",
        duration: 0.3,
        filename: "jump.mp3"
    },
    collect: {
        prompt: "8-bit retro collect item sound effect, positive pickup sound, video game style",
        duration: 0.5,
        filename: "collect.mp3"
    },
    shoot: {
        prompt: "8-bit retro shoot code sound effect, laser blip sound, video game style",
        duration: 0.2,
        filename: "shoot.mp3"
    },
    hit: {
        prompt: "8-bit retro hit/damage sound effect, negative impact sound, video game style",
        duration: 0.4,
        filename: "hit.mp3"
    }
};

/**
 * Generate image assets using AI APIs
 */
async function generateImageAsset(assetName, spec) {
    console.log(`\n🎨 Generating ${assetName}...`);
    console.log(`   Prompt: "${spec.prompt}"`);
    console.log(`   Size: ${spec.width}x${spec.height}px`);
    
    // Check for AI API keys
    const stabilityKey = process.env.STABILITY_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (stabilityKey) {
        return await generateWithStabilityAI(spec, assetName);
    } else if (openaiKey) {
        return await generateWithDALLE(spec, assetName);
    } else {
        console.log(`   ⚠️  No AI API key found. Please set STABILITY_API_KEY or OPENAI_API_KEY`);
        console.log(`   💡 Generate this asset manually using:`);
        console.log(`      - https://stability.ai/`);
        console.log(`      - https://platform.openai.com/`);
        console.log(`      - https://www.midjourney.com/`);
        console.log(`      - Any other AI image generator`);
        console.log(`   📝 Save as: assets/sprites/${spec.filename}`);
        return false;
    }
}

/**
 * Generate image using Stability AI API
 */
async function generateWithStabilityAI(spec, assetName) {
    try {
        console.log(`   🚀 Using Stability AI...`);
        
        // Note: This requires the 'node-fetch' package for Node.js < 18
        // Install with: npm install node-fetch
        const fetch = globalThis.fetch || require('node-fetch');
        
        const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`
            },
            body: JSON.stringify({
                text_prompts: [{ text: spec.prompt }],
                cfg_scale: 7,
                height: spec.height * 16, // Upscale for better quality, then downscale
                width: spec.width * 16,
                steps: 30,
                samples: 1
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        const image = data.artifacts[0].base64;
        
        // Save the image
        const buffer = Buffer.from(image, 'base64');
        fs.writeFileSync(path.join(__dirname, 'assets', 'sprites', spec.filename), buffer);
        
        console.log(`   ✅ Generated successfully!`);
        return true;
    } catch (error) {
        console.error(`   ❌ Error generating with Stability AI: ${error.message}`);
        return false;
    }
}

/**
 * Generate image using OpenAI DALL-E API
 */
async function generateWithDALLE(spec, assetName) {
    try {
        console.log(`   🚀 Using OpenAI DALL-E...`);
        
        const fetch = globalThis.fetch || require('node-fetch');
        
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: spec.prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard"
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        const imageUrl = data.data[0].url;
        
        // Download the image
        const imageResponse = await fetch(imageUrl);
        const buffer = await imageResponse.buffer();
        
        fs.writeFileSync(path.join(__dirname, 'assets', 'sprites', spec.filename), buffer);
        
        console.log(`   ✅ Generated successfully!`);
        return true;
    } catch (error) {
        console.error(`   ❌ Error generating with DALL-E: ${error.message}`);
        return false;
    }
}

/**
 * Generate sound assets using AI APIs
 */
async function generateSoundAsset(soundName, spec) {
    console.log(`\n🔊 Generating ${soundName} sound...`);
    console.log(`   Prompt: "${spec.prompt}"`);
    console.log(`   Duration: ${spec.duration}s`);
    
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
    
    if (elevenlabsKey) {
        return await generateWithElevenLabs(spec, soundName);
    } else {
        console.log(`   ⚠️  No sound AI API key found. Please set ELEVENLABS_API_KEY`);
        console.log(`   💡 Generate this sound manually using:`);
        console.log(`      - https://elevenlabs.io/`);
        console.log(`      - https://www.soundraw.io/`);
        console.log(`      - https://mubert.com/`);
        console.log(`      - https://jfxr.frozenfractal.com/ (free 8-bit sound generator)`);
        console.log(`   📝 Save as: assets/sounds/${spec.filename}`);
        return false;
    }
}

/**
 * Generate sound using ElevenLabs or similar API
 */
async function generateWithElevenLabs(spec, soundName) {
    console.log(`   ⚠️  Sound generation requires manual integration with audio AI services`);
    console.log(`   💡 For now, use online tools like jfxr.frozenfractal.com for 8-bit sounds`);
    return false;
}

/**
 * Main generation function
 */
async function generateAssets(assetType = 'all') {
    console.log('🎮 Run Dev Run - AI Asset Generator\n');
    console.log('====================================\n');
    
    // Ensure directories exist
    const spritesDir = path.join(__dirname, 'assets', 'sprites');
    const soundsDir = path.join(__dirname, 'assets', 'sounds');
    
    if (!fs.existsSync(spritesDir)) {
        fs.mkdirSync(spritesDir, { recursive: true });
    }
    if (!fs.existsSync(soundsDir)) {
        fs.mkdirSync(soundsDir, { recursive: true });
    }
    
    let generated = 0;
    let total = 0;
    
    // Generate sprites
    if (assetType === 'all' || assetType === 'player' || assetType === 'bug' || assetType === 'collectibles') {
        console.log('📦 Image Assets:\n');
        
        for (const [name, spec] of Object.entries(ASSET_SPECS)) {
            if (assetType === 'all' || 
                assetType === name || 
                (assetType === 'collectibles' && ['keyboard', 'mouse', 'screen', 'laptop'].includes(name))) {
                total++;
                const success = await generateImageAsset(name, spec);
                if (success) generated++;
            }
        }
    }
    
    // Generate sounds
    if (assetType === 'all' || assetType === 'sounds') {
        console.log('\n\n🔊 Sound Assets:\n');
        
        for (const [name, spec] of Object.entries(SOUND_SPECS)) {
            total++;
            const success = await generateSoundAsset(name, spec);
            if (success) generated++;
        }
    }
    
    // Summary
    console.log('\n\n====================================');
    console.log(`\n✨ Generation Summary:`);
    console.log(`   Assets generated via API: ${generated}/${total}`);
    console.log(`   Assets pending manual creation: ${total - generated}/${total}`);
    
    if (generated === 0) {
        console.log('\n📖 Getting Started:\n');
        console.log('   1. Set up an AI API key:');
        console.log('      export STABILITY_API_KEY="your-key"');
        console.log('      export OPENAI_API_KEY="your-key"');
        console.log('      export ELEVENLABS_API_KEY="your-key"\n');
        console.log('   2. Or manually generate assets using the prompts above\n');
        console.log('   3. Save assets to:');
        console.log('      - assets/sprites/ (for images)');
        console.log('      - assets/sounds/ (for audio)\n');
    }
    
    console.log('\n💡 Next Steps:');
    console.log('   - Review generated assets in the assets/ directory');
    console.log('   - Run the game to see the new assets in action');
    console.log('   - Regenerate individual assets if needed\n');
}

// CLI handling
const args = process.argv.slice(2);
const assetType = args[0] || 'all';

const validTypes = ['all', 'player', 'bug', 'collectibles', 'sounds'];
if (!validTypes.includes(assetType)) {
    console.error(`Invalid asset type: ${assetType}`);
    console.error(`Valid types: ${validTypes.join(', ')}`);
    process.exit(1);
}

generateAssets(assetType).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
