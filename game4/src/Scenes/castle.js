class castle extends Phaser.Scene {
    constructor() {
        super("castle");
        this.xb = 800;
        this.yb = 600;
    }
    init() {
        // variables and settings
        this.ACCELERATION = 200;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1000;
        this.JUMP_VELOCITY = -300;
        this.PARTICLE_VELOCITY = 30;
        this.SCALE = 3.0;
    }
    preload(){
        this.load.setPath("./assets/");
        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        // Load tilemap information
        this.load.image("stone_packed_image", "stone_packed.png");
        this.load.image("forest_packed_image", "tilemap_forest_packed.png");
        this.load.image("forest_packed_image (2)", "tilemap_forest_packed (2).png");
        // Packed tilemap
        this.load.tilemapTiledJSON("castle", "castle.tmj");
        // Load the tilemap as a spritesheet
        this.load.spritesheet("forest_packed_sheet", "tilemap_forest_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("forest_packed_sheet (2)", "tilemap_forest_packed (2).png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("stone_packed_sheet", "stone_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
    }
    create() {
        // Tilemap & layers
        this.setupTilemap();
        // Player
        this.setupPlayer();
        //npc
        this.setupNpc();
        // Camera
        this.setupCamera();
        // Colliders (must be created after all physics bodies exist)
        this.setupColliders();
        // Audio
        this.setupAudio();
        //key
        this.setupKey();
        this.jumps = 0;
    }
    setupTilemap() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("castle", 18, 18, 30, 60);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }
    setupPlayer() {
        // set up player avatar
        my.sprite.player = this.physics.add.sprite(3*18, 15*18, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
    }
    setupNpc() {

    }
    setupCamera() {
        // Simple camera to follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
    }
    setupColliders() {
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tilemap_forest_packed", "forest_packed_image");
        this.tileset2 = this.map.addTilesetImage("tilemap_forest_packed (2)", "forest_packed_image (2)");
        this.tileset3 = this.map.addTilesetImage("stone_packed", "stone_packed_image");

        // this.backsheet = this.map.addTilesetImage("tilemap_backgrounds", "tilemap_backgrounds");
        // Create a layer
        this.groundLayer = this.map.createLayer("background", this.tileset, 0, 0);
        // this.backLayer = this.map.createLayer("back", this.backsheet, 0, 0);
        // this.backLayer.setDepth(-1);
        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        })
        this.physics.add.collider(my.sprite.player, this.groundLayer, (obj1, obj2) => {
            if(my.sprite.player.body.blocked.down) {
                this.jumps = 0;
            }
        })
    }
    setupAudio() {
        // this.bgMusic = this.sound.add("backGround", { volume: 0.5, loop: true });
        // this.bgMusic.play();
    }
    setupKey() {
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    }
    update() {
        if (this.dKey.isDown){
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
        }
        else if (this.aKey.isDown){
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
        }
        else {
            // Set acceleration to 0 and have DRAG take over
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            // TODO: have the vfx stop playing
        }
        if (this.spaceKey.isDown){
            my.sprite.player.anims.play('jump');

        }
    }
}