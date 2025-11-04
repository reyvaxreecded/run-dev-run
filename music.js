// Music Manager using Web Audio API
// Inspired by Strudel's pattern-based approach for ambient music

class MusicManager {
    constructor() {
        this.audioContext = null;
        this.currentPattern = null;
        this.isPlaying = false;
        this.scheduledNotes = [];
        this.nextNoteTime = 0;
        this.tempo = 120; // BPM
        this.scheduleAheadTime = 0.1; // seconds
        this.lookahead = 25.0; // milliseconds
        this.timerID = null;
        this.gainNode = null;
        this.masterVolume = 0.3;
    }

    init() {
        // Initialize Audio Context (user interaction required)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.masterVolume;
        this.gainNode.connect(this.audioContext.destination);
    }

    // Note frequencies for musical notes
    noteToFrequency(note) {
        const notes = {
            'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
        };
        return notes[note] || 440;
    }

    // Play a single note
    playNote(frequency, time, duration = 0.2, waveType = 'sine') {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();

        oscillator.type = waveType;
        oscillator.frequency.value = frequency;

        // ADSR envelope
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(0.3, time + 0.01);
        noteGain.gain.linearRampToValueAtTime(0.2, time + duration * 0.3);
        noteGain.gain.linearRampToValueAtTime(0, time + duration);

        oscillator.connect(noteGain);
        noteGain.connect(this.gainNode);

        oscillator.start(time);
        oscillator.stop(time + duration);
    }

    // Pattern definitions for different game environments
    patterns = {
        // Energetic running music - upbeat and motivating
        running: {
            notes: ['E4', 'G4', 'A4', 'B4', 'D5', 'E5', 'G4', 'A4'],
            bass: ['E3', 'E3', 'A3', 'A3', 'B3', 'B3', 'E3', 'E3'],
            duration: 0.15,
            tempo: 140,
            waveType: 'square'
        },
        // Dramatic game over music - slower and more somber
        gameOver: {
            notes: ['A3', 'F3', 'E3', 'D3', 'C3', 'D3', 'E3', 'F3'],
            bass: ['A2', 'A2', 'F2', 'F2', 'E2', 'E2', 'D2', 'D2'],
            duration: 0.4,
            tempo: 80,
            waveType: 'sine'
        },
        // Ambient background for menu/start
        ambient: {
            notes: ['C4', 'E4', 'G4', 'C5', 'G4', 'E4', 'C4', 'G3'],
            bass: ['C3', 'C3', 'C3', 'C3', 'G2', 'G2', 'G2', 'G2'],
            duration: 0.3,
            tempo: 100,
            waveType: 'triangle'
        }
    };

    // Scheduler - schedules notes ahead of time
    scheduler() {
        if (!this.currentPattern || !this.isPlaying) return;

        const pattern = this.patterns[this.currentPattern];
        const secondsPerBeat = 60.0 / pattern.tempo;

        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            const noteIndex = this.scheduledNotes.length % pattern.notes.length;
            const note = pattern.notes[noteIndex];
            const bassNote = pattern.bass[noteIndex];

            // Play melody
            const freq = this.noteToFrequency(note);
            this.playNote(freq, this.nextNoteTime, pattern.duration, pattern.waveType);

            // Play bass (lower volume)
            const bassFreq = this.noteToFrequency(bassNote);
            this.playNote(bassFreq, this.nextNoteTime, pattern.duration * 1.5, 'triangle');

            this.scheduledNotes.push(note);
            this.nextNoteTime += secondsPerBeat;
        }
    }

    // Start playing a pattern
    play(patternName) {
        if (!this.audioContext) {
            this.init();
        }

        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.currentPattern = patternName;
        this.isPlaying = true;
        this.scheduledNotes = [];
        this.nextNoteTime = this.audioContext.currentTime;

        const pattern = this.patterns[patternName];
        this.tempo = pattern.tempo;

        // Start the scheduler
        this.timerID = setInterval(() => this.scheduler(), this.lookahead);
    }

    // Stop the current pattern
    stop() {
        this.isPlaying = false;
        if (this.timerID) {
            clearInterval(this.timerID);
            this.timerID = null;
        }
    }

    // Switch to a different pattern
    switchPattern(patternName) {
        this.stop();
        setTimeout(() => {
            this.play(patternName);
        }, 100);
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
const musicManager = new MusicManager();
