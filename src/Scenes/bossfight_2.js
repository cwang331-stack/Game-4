class bossfight_2 extends Phaser.Scene {
    constructor() {
        super("bossfight2");
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
                enemies: new Set()
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

    }
    create() {
        this.ppphysics = this.physics.add.group();
        this.epphysics = this.physics.add.group();
        this.ephysics = this.physics.add.group();
        // Tilemap & layers
        this.setupTilemap();
        // Player
        this.setupPlayer();
        //moving
        this.setupMoving();
        //boss
        this.setupBoss();
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
        // my.sprite.player = this.physics.add.sprite(3*18, 57*18, "platformer_characters", "tile_0000.png");
        let my = this.my;
        my.sprite.player = this.physics.add.sprite(18*18, 16*18, "platformer_characters", "tile_0000.png");

        my.sprite.player.setCollideWorldBounds(true);
        my.sprite.player.setDepth(10);

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

        let path = this.add.path(3*18, 23*18);
        let points = [3*18,23*18, 3*18,33*18];
        path.splineTo(points);
        let p = this.physics.add.sprite(3*18, 23*18, "platformer_characters", "tile_0012.png");
        p.setDepth(7);
        p.body.setSize(18,18);
        this.ephysics.add(p);
        this.physics.world.enable(p, Phaser.Physics.Arcade.STATIC_BODY);
        p.body.setAllowGravity(false);
        let mp = new PathMovable(this, p, 25, path, -1, 0.5, true, true);
        let enemyatk = () => {
            for (let j = -5; j <= 5; j++) {
                let new_particle = this.physics.add.sprite(p.x, p.y + 30, "bullet");
                new_particle.body.setSize(10,10);
                this.epphysics.add(new_particle);
                let mnp = new DirectionalMovable(this, new_particle, 100, 5, false, new Phaser.Math.Vector2(my.sprite.player.x, my.sprite.player.y));
                my.particles.eparticles.add(mnp)
            }
        }
        let a = new Agent(mp, 10, enemyatk, 25);
        p.agent = a;
        my.agents.enemies.add(a);        


        path = this.add.path(26*18, 47*18);
        points = [26*18,40*18, 26*18,47*18];
        path.splineTo(points);
        p = this.physics.add.sprite(26*18, 40*18, "platformer_characters", "tile_0012.png");
        p.setDepth(7);
        p.body.setSize(18,18);
        this.ephysics.add(p);
        this.physics.world.enable(p, Phaser.Physics.Arcade.STATIC_BODY);
        p.body.setAllowGravity(false);
        mp = new PathMovable(this, p, 25, path, -1, 0.5, true, true);
        enemyatk = () => {
            for (let j = -5; j <= 5; j++) {
                new_particle = this.physics.add.sprite(p.x, p.y + 30, "bullet");
                new_particle.body.setSize(10,10);
                this.epphysics.add(new_particle);
                mnp = new DirectionalMovable(this, new_particle, 100, 5, false, new Phaser.Math.Vector2(my.sprite.player.x, my.sprite.player.y));
                my.particles.eparticles.add(mnp)
            }
        }
        a = new Agent(mp, 10, enemyatk, 25);
        p.agent = a;
        my.agents.enemies.add(a);

        path = this.add.path(6*18, 56*18);
        points = [16*18,56*18, 6*18,56*18];
        path.splineTo(points);
        p = this.physics.add.sprite(6*18, 56*18, "platformer_characters", "tile_0012.png");
        p.setDepth(7);
        p.body.setSize(18,18);
        this.ephysics.add(p);
        this.physics.world.enable(p, Phaser.Physics.Arcade.STATIC_BODY);
        p.body.setAllowGravity(false);
        mp = new PathMovable(this, p, 25, path, -1, 0.5, true, true);
        enemyatk = () => {
            for (let j = -5; j <= 5; j++) {
                new_particle = this.physics.add.sprite(p.x, p.y + 30, "bullet");
                new_particle.body.setSize(10,10);
                this.epphysics.add(new_particle);
                mnp = new DirectionalMovable(this, new_particle, 100, 5, false, new Phaser.Math.Vector2(my.sprite.player.x, my.sprite.player.y));
                my.particles.eparticles.add(mnp)
            }
        }
        a = new Agent(mp, 10, enemyatk, 25);
        p.agent = a;
        my.agents.enemies.add(a);

    }
    setupBattle() {
        let my = this.my;
        this.attack = false;
        this.defense = false;
        my.sprite.sword = this.physics.add.sprite(my.sprite.player.x+2, my.sprite.player.y, "sword");
        my.sprite.sword.body.setAllowGravity(false);
        my.sprite.sword.setVisible(false);
        my.sprite.shield = this.physics.add.sprite(my.sprite.player.x-2, my.sprite.player.y, "shield");
        my.sprite.shield.body.setAllowGravity(false);
        my.sprite.shield.setVisible(false);
        console.log("a");
        if (this.attack == true){
            my.sprite.sword.setVisible(true);

        }
        if (this.defense == true){
            my.sprite.shield.setVisible(true);
            this.PARTICLE_VELOCITY = 15;

        }
        // group physics utilize loops internally
        // collision check between player and enemy particles
        if (my.sprite.player.y < 16){
            this.physics.add.overlap(my.sprite.player, this.epphysics, (obj1, obj2) => {
                obj2.destroy();
                if (hp <= 0){
                    my.agents.plr = null;
                    console.log("lost");
                }        
            });
            console.log("here");
            // group physics utilize loops internally
            //collision check between enemy and player particles
            this.physics.add.overlap(this.ephysics, this.ppphysics, (obj1, obj2) => {
                obj2.destroy();
                let hp = obj1.agent.subhp(1);
                if (hp <= 0) {
                    this.remaining -= 1;
                    my.agents.enemies.delete(obj1.agent);
                }
            });
        }
        console.log("123");
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
        // this.bgMusic = this.sound.add("backGround", { volume: 0.5, loop: true });
        // this.bgMusic.play();
    }
    setupKey() {
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.jKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.kKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    }
    finalCamera() {
        this.cameras.main.stopFollow();
        this.cameras.main.centerOn(15*18,9.5*18)
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
        if (this.jKey.isDown){
            this.attack = true;
        }
        else {
            this.attack = false;
        }
        if (this.kKey.isDown){
            this.defense = true;
        }
        else {
            this.defense = false;
        }
    }
}