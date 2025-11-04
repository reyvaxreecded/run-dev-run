// Run Dev Run - A Phaser JS Runner Game
// A developer runs to escape bugs during compilation

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let platforms;
let bugs;
let collectibles;
let codeProjectiles;
let cursors;
let score = 0;
let scoreText;
let gameSpeed = 3;
let isGameOver = false;
let spawnTimer = 0;
let collectibleTimer = 0;
let groundY = 550;
let hasDoubleJumped = false;
let lastScoreMilestone = 0;
let isMusicPlaying = false;
let musicInitialized = false;

function preload() {
    // Create all game textures once during preload for efficiency
    createTextures(this);
}

function createTextures(scene) {
    // Create player texture
    const playerGraphic = scene.add.graphics();
    playerGraphic.fillStyle(0x00ff00, 1);
    playerGraphic.fillRect(0, 0, 40, 50);
    playerGraphic.generateTexture('player', 40, 50);
    playerGraphic.destroy();
    
    // Create bug texture
    const bugGraphic = scene.add.graphics();
    bugGraphic.fillStyle(0xff0000, 1);
    bugGraphic.fillCircle(20, 20, 20);
    bugGraphic.lineStyle(3, 0xff0000);
    bugGraphic.beginPath();
    bugGraphic.moveTo(15, 10);
    bugGraphic.lineTo(10, 0);
    bugGraphic.moveTo(25, 10);
    bugGraphic.lineTo(30, 0);
    bugGraphic.strokePath();
    bugGraphic.generateTexture('bug', 40, 40);
    bugGraphic.destroy();
    
    // Create collectible textures
    const collectibleTypes = {
        keyboard: 0x3498db,
        mouse: 0x9b59b6,
        screen: 0xe74c3c,
        laptop: 0xf39c12
    };
    
    for (const [type, color] of Object.entries(collectibleTypes)) {
        const collectGraphic = scene.add.graphics();
        collectGraphic.fillStyle(color, 1);
        collectGraphic.fillRect(0, 0, 30, 30);
        collectGraphic.lineStyle(2, 0xffffff);
        collectGraphic.strokeRect(0, 0, 30, 30);
        collectGraphic.generateTexture(type, 30, 30);
        collectGraphic.destroy();
    }
    
    // Create code projectile texture
    const codeGraphic = scene.add.graphics();
    codeGraphic.fillStyle(0x00ff00, 1);
    codeGraphic.fillRect(0, 0, 20, 5);
    codeGraphic.generateTexture('code', 20, 5);
    codeGraphic.destroy();
}

function create() {
    // Set background color
    this.cameras.main.setBackgroundColor('#2c3e50');
    
    // Create ground
    createGround(this);
    
    // Create player (developer character)
    createPlayer(this);
    
    // Create groups for game objects
    bugs = this.physics.add.group();
    collectibles = this.physics.add.group();
    codeProjectiles = this.physics.add.group();
    
    // Set up collisions
    this.physics.add.collider(player, platforms);
    this.physics.add.overlap(player, bugs, hitBug, null, this);
    this.physics.add.overlap(player, collectibles, collectItem, null, this);
    this.physics.add.overlap(codeProjectiles, bugs, killBug, null, this);
    
    // Input controls
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-SPACE', shootCode, this);
    
    // Score display
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#00ff00',
        fontFamily: 'Courier New'
    });
    
    // Instructions
    this.add.text(16, 50, 'SPACE: Shoot | UP: Jump | DOWN: Glide | M: Music', {
        fontSize: '16px',
        fill: '#ffffff',
        fontFamily: 'Courier New'
    });
    
    // Music control
    this.input.keyboard.on('keydown-M', toggleMusic, this);
    
    // Game title
    this.add.text(400, 100, 'RUN DEV RUN!', {
        fontSize: '48px',
        fill: '#ff6b6b',
        fontFamily: 'Courier New'
    }).setOrigin(0.5);
    
    // Music hint
    this.add.text(400, 550, 'Press any key to start music!', {
        fontSize: '20px',
        fill: '#ffff00',
        fontFamily: 'Courier New'
    }).setOrigin(0.5);
}

function update(time, delta) {
    if (isGameOver) {
        return;
    }
    
    // Player is always running (auto-run)
    // We simulate this by moving obstacles toward the player
    
    // Jump mechanics
    if (cursors.up.isDown && player.body.touching.down) {
        // Start music on first interaction
        if (!musicInitialized) {
            startGameMusic();
            musicInitialized = true;
        }
        player.setVelocityY(-400);
        hasDoubleJumped = false;
    } else if (cursors.up.isDown && !hasDoubleJumped && !player.body.touching.down && player.body.velocity.y > 0) {
        // Double jump when falling
        player.setVelocityY(-350);
        hasDoubleJumped = true;
    }
    
    // Glide down mechanic
    if (cursors.down.isDown && !player.body.touching.down) {
        player.setVelocityY(150); // Fast fall
    }
    
    // Spawn bugs (enemies)
    spawnTimer += delta;
    if (spawnTimer > 2000) {
        spawnBug(this);
        spawnTimer = 0;
    }
    
    // Spawn collectibles
    collectibleTimer += delta;
    if (collectibleTimer > 3000) {
        spawnCollectible(this);
        collectibleTimer = 0;
    }
    
    // Move bugs and collectibles (simulate scrolling)
    bugs.children.entries.forEach(bug => {
        bug.x -= gameSpeed;
        if (bug.x < -50) {
            bug.destroy();
        }
    });
    
    collectibles.children.entries.forEach(item => {
        item.x -= gameSpeed;
        if (item.x < -50) {
            item.destroy();
        }
    });
    
    // Move code projectiles
    codeProjectiles.children.entries.forEach(projectile => {
        projectile.x += 8;
        if (projectile.x > 850) {
            projectile.destroy();
        }
    });
    
    // Gradually increase difficulty
    const currentMilestone = Math.floor(score / 100) * 100;
    if (currentMilestone > lastScoreMilestone && currentMilestone > 0) {
        gameSpeed = Math.min(gameSpeed + 0.5, 8);
        lastScoreMilestone = currentMilestone;
    }
}

function createGround(scene) {
    platforms = scene.physics.add.staticGroup();
    
    // Create ground platform
    const ground = scene.add.rectangle(400, groundY, 800, 100, 0x34495e);
    scene.physics.add.existing(ground, true);
    platforms.add(ground);
}

function createPlayer(scene) {
    // Create player (developer character) using pre-generated texture
    player = scene.physics.add.sprite(150, 450, 'player');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
}

function spawnBug(scene) {
    // Create bug enemy using pre-generated texture
    const yPositions = [groundY - 30, groundY - 100, groundY - 170];
    const randomY = Phaser.Utils.Array.GetRandom(yPositions);
    
    const bug = bugs.create(850, randomY, 'bug');
    bug.setVelocity(0, 0);
    bug.body.allowGravity = false;
}

function spawnCollectible(scene) {
    // Create collectible items using pre-generated textures
    const types = ['keyboard', 'mouse', 'screen', 'laptop'];
    const type = Phaser.Utils.Array.GetRandom(types);
    
    const yPositions = [groundY - 50, groundY - 120, groundY - 200, groundY - 280];
    const randomY = Phaser.Utils.Array.GetRandom(yPositions);
    
    const item = collectibles.create(850, randomY, type);
    item.setData('type', type);
    item.body.allowGravity = false;
}

function shootCode() {
    if (isGameOver) return;
    
    // Start music on first interaction
    if (!musicInitialized) {
        startGameMusic();
        musicInitialized = true;
    }
    
    // Create code projectile using pre-generated texture
    const code = codeProjectiles.create(player.x + 30, player.y, 'code');
    code.body.allowGravity = false;
}

function hitBug(player, bug) {
    if (isGameOver) return;
    
    this.physics.pause();
    player.setTint(0xff0000);
    isGameOver = true;
    
    // Switch to game over music
    if (isMusicPlaying && typeof musicManager !== 'undefined') {
        musicManager.switchPattern('gameOver');
    }
    
    this.add.text(400, 300, 'GAME OVER!\nBugs caught you!\n\nScore: ' + score, {
        fontSize: '48px',
        fill: '#ff0000',
        fontFamily: 'Courier New',
        align: 'center'
    }).setOrigin(0.5);
    
    this.add.text(400, 450, 'Refresh to restart', {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: 'Courier New'
    }).setOrigin(0.5);
}

function collectItem(player, item) {
    const type = item.getData('type');
    const points = {
        keyboard: 10,
        mouse: 15,
        screen: 20,
        laptop: 30
    };
    
    score += points[type];
    scoreText.setText('Score: ' + score);
    
    // Visual feedback
    this.add.text(item.x, item.y - 20, '+' + points[type], {
        fontSize: '20px',
        fill: '#ffff00',
        fontFamily: 'Courier New'
    }).setAlpha(1).setDepth(100);
    
    item.destroy();
}

function killBug(projectile, bug) {
    projectile.destroy();
    bug.destroy();
    score += 5;
    scoreText.setText('Score: ' + score);
    
    // Visual feedback
    this.add.text(bug.x, bug.y - 20, 'FIXED!', {
        fontSize: '16px',
        fill: '#00ff00',
        fontFamily: 'Courier New'
    }).setAlpha(1).setDepth(100);
}

// Music control functions
function startGameMusic() {
    if (typeof musicManager !== 'undefined') {
        try {
            musicManager.play('running');
            isMusicPlaying = true;
        } catch (e) {
            console.log('Music initialization failed. Click to enable music.');
        }
    }
}

function toggleMusic() {
    if (typeof musicManager === 'undefined') return;
    
    if (isMusicPlaying) {
        musicManager.stop();
        isMusicPlaying = false;
    } else {
        const pattern = isGameOver ? 'gameOver' : 'running';
        musicManager.play(pattern);
        isMusicPlaying = true;
    }
}
