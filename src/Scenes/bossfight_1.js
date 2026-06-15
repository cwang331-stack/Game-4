class bossfight_1 extends Phaser.Scene {
    constructor() {
        super("bossfight_1");
        this.xb = 800;
        this.yb = 600;
    }
    init() {
        // variables and settings
        this.ACCELERATION = 200;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1000;
        this.JUMP_VELOCITY = -400;
        this.PARTICLE_VELOCITY = 30;
        this.SCALE = 3.0;

        this.my = {
            particles: {
                pparticles: new Set(),
                eparticles: new Set()
            },
            agents: {
                enemies: new Set(),
                plr: null
            },
            sprite: {}
        };
        this.ppphysics;
        this.epphysics;
        this.ephysics;
        this.final = false;
    }
    preload(){
        this.load.setPath("./assets/");
        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
        // Load tilemap information
        this.load.image("marble_packed_image", "marble_packed.png");
        this.load.image("stone_packed_image", "stone_packed.png");
        this.load.image("sand_packed_image", "sand_packed.png");
        //Load weapon image
        this.load.image("sword", "sword.png");
        this.load.image("shield", "shield.png");
        this.load.image("bullet", "character_handPurple.png");


        // Packed tilemap
        this.load.tilemapTiledJSON("bossfight1", "bossfight1.tmj");   // Tilemap in JSON
        // Load the tilemap as a spritesheet
        this.load.spritesheet("marble_packed_sheet", "marble_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("stone_packed_sheet", "stone_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.spritesheet("sand_packed_sheet", "sand_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
        this.load.audio("backGround2", "battle_bgm.mp3");
        this.load.audio("got_hit", "got_hit_effect.mp3");
        this.load.audio("hit_eff", "hit_effect.mp3");

    }
    create() {
        this.ppphysics = this.physics.add.group();
        this.epphysics = this.physics.add.group();
        this.ephysics = this.physics.add.group();
        // Tilemap & layers
        this.setupTilemap();
        // Player
        this.setupPlayer();
        //object
        this.setupObject();
        //moving
        this.setupMoving();
        //battle
        this.setupBattle();
        // Camera
        this.setupCamera();
        // Colliders (must be created after all physics bodies exist)
        this.setupColliders();
        // // Audio
        this.setupAudio();
        //key
        this.setupKey();

    }
    setupTilemap() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("bossfight1", 18, 18, 30, 60);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }
    setupPlayer() {
        // set up player avatar
        let my = this.my;
        my.sprite.player = this.physics.add.sprite(5*18, 56*18, "platformer_characters", "tile_0000.png");
        //my.sprite.player = this.physics.add.sprite(3*18, 20*18, "platformer_characters", "tile_0000.png");
        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setDepth(10);
        let pa = new PlayerAgent(null, 5, null, 100);
        my.sprite.player.agent = pa;
        my.agents.plr = pa;

    }
    setupObject() {
        this.door = this.map.createFromObjects("door", {
            name: "door",
            key: "stone_packed_sheet",
            frame: 0
        });
        this.physics.world.enable(this.door, Phaser.Physics.Arcade.STATIC_BODY);
        this.doorGroup = this.add.group(this.door);
        this.doorGroup.setVisible(false);
        this.doorGroup.setDepth(9);

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
    setupBoss() {
        let my = this.my;

        let path = this.add.path(14*18, 5*18);
        let points = [5*18,11*18, 15*18,15*18, 14*18,12*18, 26*18,10*18];
        path.splineTo(points);
        let p = this.physics.add.sprite(15*18, 7*18, "platformer_characters", "tile_0008.png");
        p.setDepth(7);
        p.body.setSize(18*2,18*2);
        this.ephysics.add(p);
        this.physics.world.enable(p, Phaser.Physics.Arcade.STATIC_BODY);
        p.body.setAllowGravity(false);
        let mp = new PathMovable(this, p, 100, path, -1, 0.5, true, true);
        let enemyatk = () => {
            let new_particle = this.physics.add.sprite(p.x, p.y + 10, "bullet");
            new_particle.setScale(0.5);
            new_particle.body.setSize(10,10);            
            this.epphysics.add(new_particle);
            this.physics.world.enable(new_particle, Phaser.Physics.Arcade.STATIC_BODY);
            new_particle.body.setAllowGravity(false);
            let mnp = new DirectionalMovable(this, new_particle, 100, 5, false, new Phaser.Math.Vector2(my.sprite.player.x - p.x, my.sprite.player.y - p.y - 10));
            // let mnp = new DirectionalMovable(this, new_particle, 100, 5, false, new Phaser.Math.Vector2(0,-1));

            my.particles.eparticles.add(mnp)
        }
        let a = new Agent(mp, 0.5, enemyatk, 6);
        p.agent = a;
        my.agents.enemies.add(a);        
    }
    setupBattle() {
        let my = this.my;
        this.attack = false;
        this.defense = false;
        this.counter = false;
        this.countdown = 5;
        my.sprite.sword = this.physics.add.sprite(my.sprite.player.x+10, my.sprite.player.y, "sword");
        my.sprite.sword.body.setAllowGravity(false);
        my.sprite.sword.setDepth(11);
        my.sprite.sword.setVisible(false);

        my.sprite.shield = this.physics.add.sprite(my.sprite.player.x-10, my.sprite.player.y, "shield");
        my.sprite.shield.body.setAllowGravity(false);
        my.sprite.shield.setDepth(11);
        my.sprite.shield.setVisible(false);


        this.physics.add.overlap(my.sprite.player, this.ephysics, (obj1, obj2) => {
            if(this.counter == false && this.attack == true){
                let hp = obj2.agent.subhp(1);
                this.attack = false;
                this.counter = true;
                this.countdown = 5;
                if(hp <= 0){
                    this.battgMusic.stop();
                    this.scene.start("dialog","Castle")
                }
            }
        });
        
        this.physics.add.overlap(my.sprite.player, this.epphysics, (obj1, obj2) => {
            obj2.destroy();
            if(this.defense == false){
                let hp = obj1.agent.subhp(1);
                if (hp <= 0){
                    this.battgMusic.stop();
                    this.scene.start("dialog","bossfight1_lose")
                }
            }       
        });

        let kKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        kKey.on('down', (key, event) => {
            my.sprite.sword.setVisible(true);
            this.attack = true;
        });
        kKey.on('up', (key, event) => {
            my.sprite.sword.setVisible(false);
            this.attack = false;
        });
        let jKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        jKey.on('down', (key, event) => {
            my.sprite.shield.setVisible(true);
            this.defense = true;
            this.ACCELERATION = 50;
        });
        jKey.on('up', (key, event) => {
            my.sprite.shield.setVisible(false);
            this.defense = false;
            this.ACCELERATION = 200;

        });
    }
    setupCamera() {
        // Simple camera to follow player
        let my = this.my;
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
    }
    setupColliders() {
        let my = this.my;
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("marble_packed", "marble_packed_image");
        this.tileset2 = this.map.addTilesetImage("stone_packed", "stone_packed_image");
        this.tileset3 = this.map.addTilesetImage("sand_packed", "sand_packed_image");
        // this.backsheet = this.map.addTilesetImage("tilemap_backgrounds", "tilemap_backgrounds");
        // Create a layer
        this.groundLayer = this.map.createLayer(
            "background",
            ["marble_packed", "stone_packed", "sand_packed"],
            0, 
            0
        );
        // this.backLayer = this.map.createLayer("back", this.backsheet, 0, 0);
        // this.backLayer.setDepth(-1);
        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        })
        this.physics.add.collider(my.sprite.player, this.groundLayer, (obj1, obj2) => {
            // do nothing
        })
    }
    setupAudio() {
        this.battgMusic = this.sound.add("backGround2", { volume: 0.1, loop: true });
        this.battgMusic.play();
    }
    setupKey() {
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        
    }
    finalCamera() {
        this.cameras.main.stopFollow();
        this.cameras.main.centerOn(15*18,9.5*18);
        this.cameras.main.setZoom(this.SCALE);
    }
    update(time, delta) {
        let my = this.my;
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

        if (my.sprite.player.y < 17*18 && my.sprite.player.x > 17*18 && this.final == false) {
            this.final = true;
            this.finalCamera();
            this.doorGroup.setVisible(true);
            this.doorCollider = this.physics.add.collider(my.sprite.player, this.doorGroup);
            this.setupBoss();
        }
        // enemy movement
        for (let e of my.agents.enemies) {
            // console.log(e);
            if (e.sprite.active) {
                // console.log(e);
                e.update(time, delta);
            }
        }
        // enemy attack
        for (let e of my.agents.enemies) {
            if (e.sprite.active) {
                e.attack();
            }
        }
        let mpep = my.particles.eparticles;
        for (let particle of mpep) {
            if (particle.sprite.active) {
                particle.update(time, delta);
            } else {
                mpep.delete(particle);
            }
        }
        my.sprite.sword.x = my.sprite.player.x + 10;
        my.sprite.sword.y = my.sprite.player.y;

        my.sprite.shield.x = my.sprite.player.x - 10;
        my.sprite.shield.y = my.sprite.player.y + 5;
        if(this.counter == true) {
            this.countdown -= delta / 1000;
            if (this.countdown <= 0) {
                this.counter = false;
            }
        }
        
    }
}