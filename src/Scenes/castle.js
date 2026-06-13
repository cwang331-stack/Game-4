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
        this.load.image("forest_packed_image(2)", "tilemap_forest_packed(2).png");
        // Packed tilemap
        this.load.tilemapTiledJSON("castle", "castle.tmj");
        // Load the tilemap as a spritesheet
        this.load.spritesheet("forest_packed_sheet", "tilemap_forest_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("forest_packed_sheet(2)", "tilemap_forest_packed(2).png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("stone_packed_sheet", "stone_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

    }
    create() {
        // Tilemap & layers
        this.setupTilemap();
        // Player
        this.setupPlayer();
        //npc
        this.setupObject();
        //set up wall so the player won't fall of
        this.setupWall();
        // Camera
        this.setupCamera();
        // Colliders (must be created after all physics bodies exist)
        this.setupColliders();
        // Audio
        this.setupAudio();
        //key
        this.setupKey();
        //moving
        this.setupMoving();
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
        my.sprite.player = this.physics.add.sprite(0*18, 10*18, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
    }
    setupObject() {
        this.sword = this.map.createFromObjects("sword", {
            name: "sword",
            key: "forest_packed_sheet(2)",
            frame: 21
        });
        this.physics.world.enable(this.sword, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(my.sprite.player, this.sword, (obj1, obj2) => {
            console.log("put swoard");
        });
        
        this.shield = this.map.createFromObjects("shield", {
            name: "shield",
            key: "forest_packed_sheet(2)",
            frame: 21
        });
        this.physics.world.enable(this.shield, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.add.overlap(my.sprite.player, this.shield, (obj1, obj2) => {
            console.log("put shield");
        });
    }
    setupWall() {
        this.wall = this.map.createFromObjects("wall", {
            name: "wall",
            key: "forest_packed_sheet",
            frame: 6
        });

        this.physics.world.enable(this.wall, Phaser.Physics.Arcade.STATIC_BODY);
        this.wallGroup = this.add.group(this.wall);
        this.wallGroup.setVisible(false);
        this.wallCollider = this.physics.add.collider(my.sprite.player, this.wallGroup);
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
        this.tileset2 = this.map.addTilesetImage("tilemap_forest_packed(2)", "forest_packed_image(2)");
        this.tileset3 = this.map.addTilesetImage("stone_packed", "stone_packed_image");

        // this.backsheet = this.map.addTilesetImage("tilemap_backgrounds", "tilemap_backgrounds");
        // Create a layer
        this.groundLayer = this.map.createLayer(
                    "background",
                    ["tilemap_forest_packed", "tilemap_forest_packed(2)", "stone_packed"],
                    0,
                    0
                );        // this.backLayer = this.map.createLayer("back", this.backsheet, 0, 0);
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
    setupMoving() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });
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
        }
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }  
        if(my.sprite.player.body.blocked.down && this.spaceKey.isDown) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }
    }
}