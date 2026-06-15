class dialog extends Phaser.Scene {
    constructor() {
        super("dialog");
    }
    preload(){
        this.load.setPath("./assets/");
        this.load.image("forest_packed_image", "tilemap_forest_packed.png");
        // Packed tilemap
        this.load.tilemapTiledJSON("dialog", "dialog_1.tmj");   // Tilemap in JSON
        // Load the tilemap as a spritesheet
        this.load.spritesheet("forest_packed_sheet", "tilemap_forest_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });
        this.load.json("textdata","story.json");
    }
    init(location) {
        if (typeof(location) != "string") {
            this.location = "Forest1"
        } else {
            this.location = location;
        }
    }
    generateChoice(name) {
        let data = this.cache.json.get("textdata");
        let sceneloc = data.Location[this.location];
        let choice = sceneloc[name]
        if (this.txt != null) {
            this.txt.destroy()
        }
        for (let btn of this.buttons) {
            btn.destroy();
        }
        this.txt = this.add.text(this.map.widthInPixels/2, 100, choice.Body, {
            fontSize: "20px",
            color: "#ffffff",
            padding: {
                x: 10,
                y: 5
            },
            wordWrap: { width: 370 }
        });
        this.txt.setOrigin(0.5, 0);
        this.txt.setDepth(10);
        let ccount = 0
        for (let c of choice.Choices) {
            let button = this.add.text(this.map.widthInPixels/2, 280 + ccount * 30, c.Text, {
            fontSize: "15px",
            color: "#ffffff",
            backgroundColor: "#aaaaaa",
            padding: {
                    x: 10,
                    y: 5
                }
            });
            button.setOrigin(0.5, 0.5);
            button.setDepth(10);
            button.setInteractive();
            button.on("pointerdown", () => {
                if ("End" in c) {
                    this.scene.start(c.End);
                } else {
                    this.generateChoice(c.Target);
                }
            });
            this.buttons.add(button);
            ccount++;
        }
    }
    create(){
        let data = this.cache.json.get("textdata");
        let sceneloc = data.Location[this.location];
        let start = sceneloc.start
        // Tilemap & layers
        this.setupTilemap();
        // Background parallax
        this.setupCamera();

        this.txt = null;
        this.buttons = new Set();
        this.generateChoice(start);
        
        

        
    }
    setupTilemap() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("dialog", 18, 18, 30, 20);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        let tileset = this.map.addTilesetImage("tilemap_forest_packed", "forest_packed_image");
        // Create a layer
        let groundLayer = this.map.createLayer(
            "Tile Layer 1",
            ["tilemap_forest_packed"],
            0,
            0
        );
    }
    setupCamera() {
        // Simple camera to follow player
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(2.7);
        this.cameras.main.centerToBounds();

    }
    update(){
        
    }
}