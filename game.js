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
// Progression system variables
let playerLevel = 1;
let playerXP = 0;
let levelText;
let xpBarBg;
let xpBarFill;
let xpBarBorder;
let xpText;
let levelPanel;
let levelPanelGlow;
let scorePanel;

// Progression system constants
const BASE_XP_REQUIREMENT = 50;
const XP_GROWTH_MULTIPLIER = 1.5;
const XP_BAR_WIDTH = 160;
const XP_BAR_HEIGHT = 24;
const LEVEL_UP_SPEED_INCREMENT = 0.3;
const MAX_GAME_SPEED = 10;
const LEVEL_UI_X = 620;
const LEVEL_UI_Y = 10;
const XP_BAR_Y = 48;

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
    
    // Score panel background
    scorePanel = this.add.graphics();
    scorePanel.fillStyle(0x1a1a1a, 0.85);
    scorePanel.fillRoundedRect(10, 10, 240, 50, 8);
    scorePanel.lineStyle(3, 0x00ff00, 1);
    scorePanel.strokeRoundedRect(10, 10, 240, 50, 8);
    
    // Score display with enhanced styling
    scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#00ff00',
        fontFamily: 'Courier New',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 4,
            stroke: true,
            fill: true
        }
    });
    
    // Level display panel glow effect (outer layer)
    levelPanelGlow = this.add.graphics();
    levelPanelGlow.fillStyle(0xffd700, 0.15);
    levelPanelGlow.fillRoundedRect(LEVEL_UI_X - 15, LEVEL_UI_Y - 10, 190, 80, 10);
    
    // Level display panel background
    levelPanel = this.add.graphics();
    levelPanel.fillStyle(0x1a1a1a, 0.9);
    levelPanel.fillRoundedRect(LEVEL_UI_X - 10, LEVEL_UI_Y - 5, 180, 70, 8);
    
    // Add inner shadow effect
    levelPanel.fillStyle(0x000000, 0.3);
    levelPanel.fillRoundedRect(LEVEL_UI_X - 8, LEVEL_UI_Y - 3, 176, 3, 8);
    
    // Gold border with double line effect
    levelPanel.lineStyle(3, 0xffd700, 1);
    levelPanel.strokeRoundedRect(LEVEL_UI_X - 10, LEVEL_UI_Y - 5, 180, 70, 8);
    levelPanel.lineStyle(1, 0xffff00, 0.5);
    levelPanel.strokeRoundedRect(LEVEL_UI_X - 8, LEVEL_UI_Y - 3, 176, 66, 7);
    
    // Level display with enhanced styling
    levelText = this.add.text(LEVEL_UI_X, LEVEL_UI_Y, 'Level: 1', {
        fontSize: '32px',
        fill: '#ffd700',
        fontFamily: 'Courier New',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 4,
            stroke: true,
            fill: true
        }
    });
    
    // XP Bar outer glow
    xpBarBorder = this.add.graphics();
    xpBarBorder.fillStyle(0xffd700, 0.2);
    xpBarBorder.fillRoundedRect(LEVEL_UI_X - 4, XP_BAR_Y - 4, XP_BAR_WIDTH + 8, XP_BAR_HEIGHT + 8, 6);
    xpBarBorder.lineStyle(3, 0xffd700, 1);
    xpBarBorder.strokeRoundedRect(LEVEL_UI_X - 2, XP_BAR_Y - 2, XP_BAR_WIDTH + 4, XP_BAR_HEIGHT + 4, 4);
    
    // XP Bar background with gradient effect
    xpBarBg = this.add.graphics();
    xpBarBg.fillStyle(0x1a1a1a, 1);
    xpBarBg.fillRoundedRect(LEVEL_UI_X, XP_BAR_Y, XP_BAR_WIDTH, XP_BAR_HEIGHT, 3);
    xpBarBg.fillStyle(0x000000, 0.4);
    xpBarBg.fillRoundedRect(LEVEL_UI_X, XP_BAR_Y, XP_BAR_WIDTH, XP_BAR_HEIGHT / 2, 3);
    
    // XP Bar fill
    xpBarFill = this.add.graphics();
    
    // XP text label with enhanced styling
    xpText = this.add.text(LEVEL_UI_X + XP_BAR_WIDTH / 2, XP_BAR_Y + XP_BAR_HEIGHT / 2, '0 / 50 XP', {
        fontSize: '14px',
        fill: '#ffffff',
        fontFamily: 'Courier New',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3,
        shadow: {
            offsetX: 1,
            offsetY: 1,
            color: '#000000',
            blur: 2,
            stroke: true,
            fill: true
        }
    }).setOrigin(0.5, 0.5).setDepth(100);
    
    // Add pulsing animation to level panel glow
    this.tweens.add({
        targets: levelPanelGlow,
        alpha: 0.25,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
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
    
    // Create code projectile using pre-generated texture
    const code = codeProjectiles.create(player.x + 30, player.y, 'code');
    code.body.allowGravity = false;
}

function hitBug(player, bug) {
    if (isGameOver) return;
    
    this.physics.pause();
    player.setTint(0xff0000);
    isGameOver = true;
    
    this.add.text(400, 300, 'GAME OVER!\nBugs caught you!\n\nScore: ' + score + '\nLevel: ' + playerLevel, {
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

// Calculate XP needed for next level (exponential growth)
function getXPForLevel(level) {
    return Math.floor(BASE_XP_REQUIREMENT * Math.pow(XP_GROWTH_MULTIPLIER, level - 1));
}

// Add XP and check for level up
function addXP(scene, amount) {
    playerXP += amount;
    
    // Check for level up (handle multiple level-ups)
    while (playerXP >= getXPForLevel(playerLevel)) {
        const xpNeeded = getXPForLevel(playerLevel);
        playerXP -= xpNeeded;
        playerLevel++;
        
        // Create particle effect for level up
        const particles = scene.add.particles('bug');
        const emitter = particles.createEmitter({
            speed: { min: -200, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 1000,
            gravityY: 200,
            tint: 0xffd700,
            frequency: 10,
            maxParticles: 30,
            x: 400,
            y: 250
        });
        
        // Stop emitter after burst
        scene.time.delayedCall(300, () => {
            emitter.stop();
            scene.time.delayedCall(1500, () => particles.destroy());
        });
        
        // Level up notification background
        const levelUpBg = scene.add.graphics();
        levelUpBg.fillStyle(0x000000, 0.7);
        levelUpBg.fillRoundedRect(250, 200, 300, 120, 10);
        levelUpBg.lineStyle(4, 0xffd700, 1);
        levelUpBg.strokeRoundedRect(250, 200, 300, 120, 10);
        levelUpBg.setDepth(999);
        
        // Level up notification text
        const levelUpText = scene.add.text(400, 250, 'LEVEL UP!\nLevel ' + playerLevel, {
            fontSize: '48px',
            fill: '#ffd700',
            fontFamily: 'Courier New',
            align: 'center',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 6,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5).setDepth(1000);
        
        // Scale up animation for text
        scene.tweens.add({
            targets: levelUpText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            yoyo: true,
            ease: 'Back.easeOut'
        });
        
        // Fade out the level up notification
        scene.tweens.add({
            targets: [levelUpText, levelUpBg],
            alpha: 0,
            y: '-=50',
            duration: 2000,
            delay: 500,
            ease: 'Power2',
            onComplete: () => {
                levelUpText.destroy();
                levelUpBg.destroy();
            }
        });
        
        // Flash effect on level panel
        scene.tweens.add({
            targets: levelPanelGlow,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3,
            ease: 'Linear'
        });
        
        // Increase game speed slightly on level up
        gameSpeed = Math.min(gameSpeed + LEVEL_UP_SPEED_INCREMENT, MAX_GAME_SPEED);
    }
    
    // Update level text and XP bar with animation
    levelText.setText('Level: ' + playerLevel);
    updateXPBar();
}

// Update the XP progress bar
function updateXPBar() {
    const xpNeeded = getXPForLevel(playerLevel);
    const xpProgress = playerXP / xpNeeded;
    const fillWidth = XP_BAR_WIDTH * Math.min(xpProgress, 1);
    
    // Clear and redraw the XP bar fill
    xpBarFill.clear();
    if (fillWidth > 0) {
        // Main XP bar fill with gradient
        xpBarFill.fillStyle(0xffd700, 1);
        xpBarFill.fillRoundedRect(LEVEL_UI_X, XP_BAR_Y, fillWidth, XP_BAR_HEIGHT, 3);
        
        // Top highlight for 3D effect
        xpBarFill.fillStyle(0xffff00, 0.4);
        xpBarFill.fillRoundedRect(LEVEL_UI_X, XP_BAR_Y, fillWidth, XP_BAR_HEIGHT / 3, 3);
        
        // Bottom shadow for depth
        xpBarFill.fillStyle(0xcc9900, 0.3);
        xpBarFill.fillRoundedRect(LEVEL_UI_X, XP_BAR_Y + (XP_BAR_HEIGHT * 2/3), fillWidth, XP_BAR_HEIGHT / 3, 3);
        
        // Animated shine effect
        xpBarFill.fillStyle(0xffffff, 0.2);
        xpBarFill.fillRoundedRect(LEVEL_UI_X + 2, XP_BAR_Y + 2, Math.max(fillWidth - 4, 0), 4, 2);
    }
    
    // Update XP text with color based on progress
    const textColor = xpProgress > 0.75 ? '#ffff00' : '#ffffff';
    xpText.setFill(textColor);
    xpText.setText(playerXP + ' / ' + xpNeeded + ' XP');
}

function collectItem(player, item) {
    const type = item.getData('type');
    const points = {
        keyboard: 10,
        mouse: 15,
        screen: 20,
        laptop: 30
    };
    
    const xpReward = {
        keyboard: 5,
        mouse: 8,
        screen: 12,
        laptop: 20
    };
    
    score += points[type];
    scoreText.setText('Score: ' + score);
    
    // Add XP for collecting item
    addXP(this, xpReward[type]);
    
    // Enhanced visual feedback with multiple elements
    const feedbackBg = this.add.graphics();
    feedbackBg.fillStyle(0x000000, 0.7);
    feedbackBg.fillCircle(item.x, item.y - 20, 25);
    feedbackBg.setDepth(99);
    
    const pointsText = this.add.text(item.x, item.y - 25, '+' + points[type], {
        fontSize: '24px',
        fill: '#ffff00',
        fontFamily: 'Courier New',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 4,
            stroke: true,
            fill: true
        }
    }).setOrigin(0.5).setDepth(100);
    
    const xpText = this.add.text(item.x, item.y - 5, '+' + xpReward[type] + ' XP', {
        fontSize: '16px',
        fill: '#00ff00',
        fontFamily: 'Courier New',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5).setDepth(100);
    
    // Animate feedback
    this.tweens.add({
        targets: [pointsText, xpText, feedbackBg],
        y: '-=40',
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
            pointsText.destroy();
            xpText.destroy();
            feedbackBg.destroy();
        }
    });
    
    // Scale animation
    this.tweens.add({
        targets: [pointsText, xpText],
        scale: 1.3,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
    });
    
    item.destroy();
}

function killBug(projectile, bug) {
    projectile.destroy();
    bug.destroy();
    score += 5;
    scoreText.setText('Score: ' + score);
    
    // Add XP for killing bug
    addXP(this, 3);
    
    // Enhanced visual feedback
    const feedbackBg = this.add.graphics();
    feedbackBg.fillStyle(0x000000, 0.7);
    feedbackBg.fillCircle(bug.x, bug.y - 20, 30);
    feedbackBg.setDepth(99);
    
    const fixedText = this.add.text(bug.x, bug.y - 20, 'FIXED!', {
        fontSize: '20px',
        fill: '#00ff00',
        fontFamily: 'Courier New',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: {
            offsetX: 2,
            offsetY: 2,
            color: '#000000',
            blur: 4,
            stroke: true,
            fill: true
        }
    }).setOrigin(0.5).setDepth(100);
    
    const xpText = this.add.text(bug.x, bug.y, '+3 XP', {
        fontSize: '14px',
        fill: '#ffd700',
        fontFamily: 'Courier New',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
    }).setOrigin(0.5).setDepth(100);
    
    // Animate feedback
    this.tweens.add({
        targets: [fixedText, xpText, feedbackBg],
        y: '-=40',
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
            fixedText.destroy();
            xpText.destroy();
            feedbackBg.destroy();
        }
    });
    
    // Scale animation
    this.tweens.add({
        targets: [fixedText, xpText],
        scale: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
    });
}
