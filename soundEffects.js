// Sound Effects Manager for Run Dev Run
// Handles all game sound effects using Web Audio API

class SoundEffectsManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.gainNode = null;
    }

    init() {
        // Initialize Audio Context if not already done
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.masterVolume;
            this.gainNode.connect(this.audioContext.destination);
        }

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Get audio context, initializing if needed
    getContext() {
        if (!this.audioContext) {
            this.init();
        }
        return this.audioContext;
    }

    // Jump sound - upward pitch sweep
    playJumpSound() {
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);
            
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
            
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {
            console.error('Jump sound failed:', e);
        }
    }

    // Double jump sound - downward pitch sweep
    playDoubleJumpSound() {
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
            
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
            
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.15);
        } catch (e) {
            console.error('Double jump sound failed:', e);
        }
    }

    // Shoot sound - laser effect
    playShootSound() {
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.18);
            
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.18);
            
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.18);
        } catch (e) {
            console.error('Shoot sound failed:', e);
        }
    }

    // Collectible pickup sounds - different pitch for each item type
    playCollectSound(itemType) {
        try {
            const ctx = this.getContext();
            
            // Different frequencies and durations for different items
            const itemSounds = {
                keyboard: { freq: 440, duration: 0.15, waveType: 'sine' },      // A4
                mouse: { freq: 554.37, duration: 0.18, waveType: 'sine' },     // C#5
                screen: { freq: 659.25, duration: 0.20, waveType: 'triangle' }, // E5
                laptop: { freq: 880, duration: 0.25, waveType: 'triangle' }     // A5 (highest value)
            };

            const soundConfig = itemSounds[itemType] || itemSounds.keyboard;
            
            // Create a pleasant "ding" sound with harmonics
            for (let i = 0; i < 2; i++) {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = soundConfig.waveType;
                osc.frequency.value = soundConfig.freq * (i + 1);
                
                const volume = i === 0 ? 0.6 : 0.3;
                gain.gain.setValueAtTime(volume, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + soundConfig.duration);
                
                osc.connect(gain);
                gain.connect(this.gainNode);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + soundConfig.duration);
            }
        } catch (e) {
            console.error('Collect sound failed:', e);
        }
    }

    // Bug destruction sound - explosion effect
    playBugDestroySound() {
        try {
            const ctx = this.getContext();
            
            // Create explosion-like sound with noise and pitch drop
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.2);
            
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
            
            // Add a second layer for richness
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(150, ctx.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
            
            gain2.gain.setValueAtTime(0.3, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            
            osc2.connect(gain2);
            gain2.connect(this.gainNode);
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.15);
        } catch (e) {
            console.error('Bug destroy sound failed:', e);
        }
    }

    // Enemy spawn sound - ominous warning
    playEnemySpawnSound() {
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.1);
            
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
            
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.error('Enemy spawn sound failed:', e);
        }
    }

    // Score milestone sound - achievement chime
    playMilestoneSound() {
        try {
            const ctx = this.getContext();
            
            // Play a pleasant chord progression
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 - major chord
            
            notes.forEach((freq, index) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                const startTime = ctx.currentTime + (index * 0.05);
                gain.gain.setValueAtTime(0.4, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
                
                osc.connect(gain);
                gain.connect(this.gainNode);
                osc.start(startTime);
                osc.stop(startTime + 0.4);
            });
        } catch (e) {
            console.error('Milestone sound failed:', e);
        }
    }

    // Game over sound - dramatic death sound
    playGameOverSound() {
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.value = 440;
            
            // Proper envelope for cleaner audio
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            
            osc.connect(gain);
            gain.connect(this.gainNode);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        } catch (e) {
            console.error('Game over sound failed:', e);
        }
    }

    // Set master volume (0-1)
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.value = this.masterVolume;
        }
    }
}

// Export for use in game
const soundEffects = new SoundEffectsManager();
