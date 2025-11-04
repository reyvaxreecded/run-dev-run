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
let backgrounds = [];

function preload() {
    // Load player sprite sheet
    this.load.spritesheet('player', 'assets/player/Main Character - Male - Full spritesheet - No Guide.png', {
        frameWidth: 64,
        frameHeight: 64
    });
    
    // Load enemy sprite sheet (using Idle animation)
    this.load.spritesheet('bug', 'assets/enemies/Microwave/Microwave/Idle.png', {
        frameWidth: 80,
        frameHeight: 80
    });
    
    // Load weapon effect for projectiles
    this.load.image('code', 'assets/player/Main Character - Male - Weapon Effect.png');
    
    // Load background layers for parallax effect (using Day theme, background set 1)
    this.load.image('bg1', 'assets/world/background/1/Day/1.png');
    this.load.image('bg2', 'assets/world/background/1/Day/2.png');
    this.load.image('bg3', 'assets/world/background/1/Day/3.png');
    this.load.image('bg4', 'assets/world/background/1/Day/4.png');
    this.load.image('bg5', 'assets/world/background/1/Day/5.png');
    
    // Load tileset for ground
    this.load.image('tileset', 'assets/world/tileset/main_tileset.png');
    
    // Create collectible textures (since we don't have specific collectible sprites)
    createCollectibleTextures(this);
}

function createCollectibleTextures(scene) {
    // Create collectible textures during preload
    const collectibleTypes = {
        keyboard: 0x3498db,
        mouse: 0x9b59b6,
        screen: 0xe74c3c,
        laptop: 0xf39c12
    };
    
    for (const [type, color] of Object.entries(collectibleTypes)) {
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, 30, 30);
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeRect(0, 0, 30, 30);
        graphics.generateTexture(type, 30, 30);
        graphics.destroy();
    }
}


function createBackground(scene) {
    // Create parallax background with 5 layers
    const bgLayers = ['bg1', 'bg2', 'bg3', 'bg4', 'bg5'];
    const gameWidth = 800;
    const gameHeight = 600;
    
    bgLayers.forEach((key, index) => {
        // Create two copies of each background for seamless scrolling
        const bg1 = scene.add.image(0, 0, key).setOrigin(0, 0);
        const bg2 = scene.add.image(576, 0, key).setOrigin(0, 0);
        
        // Scale backgrounds to fit game height while maintaining aspect ratio
        const scale = gameHeight / 324;
        bg1.setScale(scale);
        bg2.setScale(scale);
        
        // Store with parallax speed (farther layers move slower)
        backgrounds.push({
            sprites: [bg1, bg2],
            speed: (index + 1) * 0.2 // Speed increases for closer layers
        });
    });
}

function createPlayerAnimations(scene) {
    // Player sprite sheet has 6 columns x 10 rows
    // Row 0: Idle (frames 0-5)
    // Row 1: Run (frames 6-11)
    // Row 2: Jump (frames 12-17)
    
    scene.anims.create({
        key: 'idle',
        frames: scene.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });
    
    scene.anims.create({
        key: 'run',
        frames: scene.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
        frameRate: 10,
        repeat: -1
    });
    
    scene.anims.create({
        key: 'jump',
        frames: scene.anims.generateFrameNumbers('player', { start: 12, end: 17 }),
        frameRate: 10,
        repeat: 0
    });
}

function createEnemyAnimations(scene) {
    // Enemy (microwave) idle animation
    scene.anims.create({
        key: 'bug-idle',
        frames: scene.anims.generateFrameNumbers('bug', { start: 0, end: 4 }),
        frameRate: 8,
        repeat: -1
    });
}


function create() {
    // Create parallax background layers
    createBackground(this);
    
    // Create player animations FIRST
    createPlayerAnimations(this);
    
    // Create enemy animations
    createEnemyAnimations(this);
    
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
    this.add.text(16, 50, 'SPACE: Shoot Code | UP: Jump | DOWN: Glide Down', {
        fontSize: '16px',
        fill: '#ffffff',
        fontFamily: 'Courier New'
    });
    
    // Game title
    this.add.text(400, 100, 'RUN DEV RUN!', {
        fontSize: '48px',
        fill: '#ff6b6b',
        fontFamily: 'Courier New'
    }).setOrigin(0.5);
}

function update(time, delta) {
    if (isGameOver) {
        return;
    }
    
    // Update parallax background
    updateBackground();
    
    // Player animation state management
    if (player.body.touching.down) {
        player.play('run', true);
    } else if (player.body.velocity.y < 0) {
        player.play('jump', true);
    }
    
    // Player is always running (auto-run)
    // We simulate this by moving obstacles toward the player
    
    // Jump mechanics
    if (cursors.up.isDown && player.body.touching.down) {
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

function updateBackground() {
    // Update parallax background scrolling
    backgrounds.forEach(layer => {
        layer.sprites.forEach(sprite => {
            sprite.x -= layer.speed;
            
            // Reset position for seamless scrolling
            if (sprite.x <= -576 * (600/324)) {
                sprite.x = 576 * (600/324);
            }
        });
    });
}

function createGround(scene) {
    platforms = scene.physics.add.staticGroup();
    
    // Create ground using tileset (create a repeating pattern)
    const tileWidth = 32; // Approximate tile width
    const numTiles = Math.ceil(800 / tileWidth) + 1;
    
    for (let i = 0; i < numTiles; i++) {
        const tile = scene.add.image(i * tileWidth, groundY, 'tileset');
        tile.setOrigin(0, 0);
        tile.setScale(1);
        // Use a specific region of the tileset for the ground
        tile.setCrop(0, 0, 32, 32);
        scene.physics.add.existing(tile, true);
        platforms.add(tile);
    }
}

function createPlayer(scene) {
    // Create player (developer character) using sprite sheet
    player = scene.physics.add.sprite(150, 450, 'player');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
    player.setScale(1.2); // Scale up the character a bit
    player.play('run'); // Start with running animation
}

function spawnBug(scene) {
    // Create bug enemy using sprite sheet
    const yPositions = [groundY - 50, groundY - 120, groundY - 190];
    const randomY = Phaser.Utils.Array.GetRandom(yPositions);
    
    const bug = bugs.create(850, randomY, 'bug');
    bug.setVelocity(0, 0);
    bug.body.allowGravity = false;
    bug.play('bug-idle');
    bug.setScale(0.8);
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
    
    // Create code projectile using pre-generated texture
    const code = codeProjectiles.create(player.x + 30, player.y, 'code');
    code.body.allowGravity = false;
}

function hitBug(player, bug) {
    if (isGameOver) return;
    
    this.physics.pause();
    player.setTint(0xff0000);
    isGameOver = true;
    
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
